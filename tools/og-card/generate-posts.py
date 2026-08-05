#!/usr/bin/env python3
"""Génère une OG card 1200×630 par billet et câble `header.og_image`.

Sans carte dédiée, Minimal Mistakes retombe sur `header.image` quand il existe
(des bandeaux en 900×230 ou 1849×39, inexploitables comme vignette de partage)
puis sur la carte générique `site.og_image`, identique pour les 46 billets.

Le rendu passe par generate.sh, qui reste la source de vérité : même template,
mêmes fontes. Les cartes générées (OG card et vignettes sans bandeau) sont
ensuite quantifiées en PNG8 — le visuel est plat, la perte est invisible et le
poids tombe d'environ 110 à 32 Ko. Les vignettes dérivées d'un bandeau, elles,
sont de vraies photos : PNG8 y créerait du dithering (déjà consigné dans
NEXT.md pour ce même bandeau Devoxx), donc JPEG (voir `derive_vignette`).

Usage :
    ./tools/og-card/generate-posts.py            # ne régénère que ce qui manque
    ./tools/og-card/generate-posts.py --force    # régénère tout
    ./tools/og-card/generate-posts.py --dry-run  # montre sans écrire
"""

import argparse
import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import urlencode

ROOT = Path(__file__).resolve().parents[2]
POSTS = ROOT / "_posts"
CARDS = ROOT / "images" / "og"
GENERATE = Path(__file__).parent / "generate.sh"

MOIS = ["janvier", "février", "mars", "avril", "mai", "juin",
        "juillet", "août", "septembre", "octobre", "novembre", "décembre"]

FILENAME = re.compile(r"^(\d{4})-(\d{2})-(\d{2})-(?P<slug>.+)\.md$")

# Le recadrage étant décidé à la génération (voir derive_vignette), un
# bandeau un peu large reste exploitable. Ce seuil n'écarte donc que les
# cas dégénérés, où il ne resterait aucun fragment lisible : geoloc.png
# fait 47:1, twitch-logo.svg 9:1.
RATIO_MAX = 5.0


def front_matter(texte):
    """Renvoie (lignes du front matter, reste du fichier), ou (None, texte)."""
    if not texte.startswith("---\n"):
        return None, texte
    fin = texte.find("\n---\n", 4)
    if fin == -1:
        return None, texte
    return texte[4:fin].split("\n"), texte[fin + 5:]


def champ(lignes, nom):
    """Valeur d'un champ de premier niveau, guillemets retirés."""
    for ligne in lignes:
        if ligne.startswith(f"{nom}:"):
            valeur = ligne[len(nom) + 1:].strip()
            if len(valeur) >= 2 and valeur[0] == valeur[-1] and valeur[0] in "\"'":
                valeur = valeur[1:-1]
            return valeur
    return None


def pose_dans_header(lignes, cle, valeur):
    """Ajoute (ou corrige) header.<cle>. Renvoie (lignes, modifié)."""
    entree = f"  {cle}: {valeur}"

    try:
        i = next(n for n, l in enumerate(lignes) if l.rstrip() == "header:")
    except StopIteration:
        return lignes + ["header:", entree], True

    # Parcourt le bloc indenté qui suit `header:`
    fin = i + 1
    while fin < len(lignes) and (lignes[fin].startswith((" ", "\t")) or not lignes[fin].strip()):
        fin += 1

    for n in range(i + 1, fin):
        if lignes[n].strip().startswith(f"{cle}:"):
            if lignes[n] == entree:
                return lignes, False
            lignes[n] = entree
            return lignes, True

    return lignes[:i + 1] + [entree] + lignes[i + 1:], True


def header_image(lignes):
    """Valeur de header.image, ou None. Ne confond pas avec og_image."""
    try:
        i = next(n for n, l in enumerate(lignes) if l.rstrip() == "header:")
    except StopIteration:
        return None

    n = i + 1
    while n < len(lignes) and (lignes[n].startswith((" ", "\t")) or not lignes[n].strip()):
        if lignes[n].strip().startswith("image:"):
            return lignes[n].split(":", 1)[1].strip()
        n += 1
    return None


def ratio(chemin):
    """Largeur / hauteur de l'image, ou None si elle est illisible."""
    try:
        mesure = subprocess.run(
            ["magick", "identify", "-format", "%[fx:w/h]", str(chemin)],
            check=True, capture_output=True, text=True,
        ).stdout.strip()
        return float(mesure)
    except (subprocess.CalledProcessError, FileNotFoundError, ValueError) as erreur:
        print(f"    ratio illisible pour {chemin} ({erreur}) — bascule sur une carte")
        return None


def _decoupe_flow(brut):
    """Découpe une liste YAML flow, sans casser sur une virgule entre guillemets."""
    valeurs, courant, quote = [], [], None
    for caractere in brut:
        if quote:
            if caractere == quote:
                quote = None
            else:
                courant.append(caractere)
        elif caractere in "\"'" and not "".join(courant).strip():
            # Une quote n'ouvre une valeur qu'en tête de celle-ci. Au milieu
            # d'un mot c'est une apostrophe littérale — « traitement d'images »
            # est un tag réel, et la traiter en délimiteur avalait la suite.
            quote = caractere
            courant = []
        elif caractere == ",":
            valeurs.append("".join(courant).strip())
            courant = []
        else:
            courant.append(caractere)
    valeurs.append("".join(courant).strip())
    return [v for v in valeurs if v]


def _decoupe_bloc(lignes, depart):
    """Les entrées `- x` indentées sous `lignes[depart]`, jusqu'au champ suivant."""
    valeurs = []
    for ligne in lignes[depart + 1:]:
        if not ligne.strip():
            continue
        if not ligne.startswith((" ", "\t")):
            break
        depouille = ligne.strip()
        if not depouille.startswith("- "):
            break
        valeurs.append(depouille[2:].strip().strip("\"'"))
    return valeurs


def tags(lignes, maximum=3):
    """Les premiers tags du front matter, joints par ' · '.

    Gère les trois écritures que Jekyll accepte : liste flow (`tags: [a, b]`,
    la seule employée par les 46 billets à ce jour), liste bloc (`- a` sur les
    lignes suivantes) et valeur simple (`tags: a`).

    Plafonné parce qu'un billet en porte jusqu'à 6 et que les assemblages
    complets atteignent 50 caractères, ce qui déborde la zone laissée libre
    par le titre masqué.
    """
    try:
        depart = next(n for n, l in enumerate(lignes) if l.startswith("tags:"))
    except StopIteration:
        return ""

    brut = lignes[depart][len("tags:"):].strip()
    if not brut:
        valeurs = _decoupe_bloc(lignes, depart)
    elif brut.startswith("[") and brut.endswith("]"):
        valeurs = _decoupe_flow(brut[1:-1])
    else:
        valeurs = [brut.strip("\"'")]

    return " · ".join(valeurs[:maximum])


def rend_carte(requete, sortie, dry_run):
    """Rend une carte via generate.sh puis la quantifie en PNG8."""
    if dry_run:
        print(f"    rendrait {sortie.relative_to(ROOT)}  ({requete})")
        return
    subprocess.run(
        [str(GENERATE), "-o", str(sortie), "-q", requete],
        check=True, capture_output=True, text=True,
    )
    # Le rendu est aplat : 64 couleurs suffisent, sans dithering visible.
    subprocess.run(
        ["magick", str(sortie), "-strip", "-colors", "64", f"PNG8:{sortie}"],
        check=True, capture_output=True, text=True,
    )


RATIO_VIGNETTE = 1200 / 630  # ratio cible ; le CSS impose l'aspect-ratio, pas les pixels


def derive_vignette(source, sortie):
    """Recadre un bandeau en vignette au ratio 1200:630, ancrée à l'ouest.

    Le recadrage est décidé ici plutôt que laissé à `object-fit: cover` :
    le centrage automatique mangeait les deux bords et coupait les mots de
    marque (`devoxx_fr_2016.jpg` rendait « OXX FRANCE 2 »). Ces bandeaux
    portent leur titre à gauche, donc on ancre à l'ouest.

    La boîte de recadrage est calculée ici, en Python, plutôt que déléguée à
    `-resize ...^` : ces bandeaux (610 à 1600 px de large) sont tous plus
    petits que 1200×630 dans leur dimension contraignante, et `-resize ...^`
    les agrandissait pour « remplir » la cible — jusqu'à ×3,94 pour le plus
    petit, avec un flou net à l'arrivée. On recadre donc au ratio à la
    résolution native, et on ne réduit que si le recadrage dépasse 1200 px
    de large.

    Sortie en JPEG, pas PNG8 : ce sont de vraies photos, la palette 64
    couleurs de `rend_carte` (pensée pour un rendu de carte aplat) y crée du
    dithering visible — déjà constaté sur ce même bandeau Devoxx (NEXT.md).
    """
    largeur, hauteur = (int(v) for v in subprocess.run(
        ["magick", "identify", "-format", "%w %h", str(source)],
        check=True, capture_output=True, text=True,
    ).stdout.split())

    if largeur / hauteur >= RATIO_VIGNETTE:
        crop_l, crop_h = round(hauteur * RATIO_VIGNETTE), hauteur
    else:
        crop_l, crop_h = largeur, round(largeur / RATIO_VIGNETTE)
    x, y = 0, (hauteur - crop_h) // 2

    commande = ["magick", str(source),
                "-crop", f"{crop_l}x{crop_h}+{x}+{y}", "+repage"]
    if crop_l > 1200:
        commande += ["-resize", "1200x"]
    commande += ["-strip", "-quality", "82", "-sampling-factor", "4:2:0",
                 f"JPEG:{sortie}"]
    subprocess.run(commande, check=True, capture_output=True, text=True)


def main():
    parseur = argparse.ArgumentParser(description=__doc__)
    parseur.add_argument("--force", action="store_true",
                         help="régénère les cartes déjà présentes")
    parseur.add_argument("--dry-run", action="store_true",
                         help="affiche ce qui serait fait, sans rien écrire")
    args = parseur.parse_args()

    if not GENERATE.is_file():
        sys.exit(f"generate.sh introuvable : {GENERATE}")

    if not args.dry_run:
        CARDS.mkdir(parents=True, exist_ok=True)

    rendus = cables = ignores = 0

    for post in sorted(POSTS.glob("*.md")):
        nom = FILENAME.match(post.name)
        if not nom:
            print(f"  ignoré (nom non daté) : {post.name}")
            ignores += 1
            continue

        annee, mois, jour, slug = nom.group(1), nom.group(2), nom.group(3), nom.group("slug")

        # read_text applique les newlines universelles et réécrirait un billet
        # CRLF entier en LF : on décode nous-mêmes et on retient la convention
        # d'origine pour la restituer à l'écriture.
        brut = post.read_bytes().decode("utf-8")
        crlf = "\r\n" in brut
        lignes, corps = front_matter(brut.replace("\r\n", "\n"))

        if lignes is None:
            print(f"  ignoré (pas de front matter) : {post.name}")
            ignores += 1
            continue

        titre = champ(lignes, "title")
        if not titre:
            print(f"  ignoré (pas de titre) : {post.name}")
            ignores += 1
            continue

        carte = CARDS / f"{slug}.png"
        quantieme = "1er" if int(jour) == 1 else str(int(jour))
        date_fr = f"{quantieme} {MOIS[int(mois) - 1]} {annee}"

        if args.force or not carte.exists():
            print(f"  {slug}")
            rend_carte(urlencode({"eyebrow": "Billet", "title": titre,
                                  "tagline": date_fr}), carte, args.dry_run)
            rendus += 1

        # Vignette de grille : toujours une image dédiée sous images/og/, au
        # ratio 1200:630. Dérivée du bandeau quand il y en a un d'exploitable
        # (JPEG, voir derive_vignette), carte teaser sinon (PNG8, comme les
        # autres cartes générées — rendu plat, pas de perte visible). Le
        # bandeau du billet, lui, ne bouge pas.
        bandeau = header_image(lignes)
        derivable = False
        if bandeau:
            forme = ratio(ROOT / bandeau.lstrip("/"))
            if forme is None:
                print("    bandeau écarté (illisible)")
            elif forme > RATIO_MAX:
                print(f"    bandeau écarté ({forme:.1f}:1 > {RATIO_MAX}:1)")
            else:
                derivable = True

        ext = "jpg" if derivable else "png"
        teaser = CARDS / f"teaser-{slug}.{ext}"
        # Un changement de nature (carte <-> dérivée) change l'extension :
        # l'orpheline de l'autre famille est nettoyée plus bas, mais
        # seulement après coup — jamais avant la génération.
        orpheline = CARDS / f"teaser-{slug}.{'png' if derivable else 'jpg'}"

        if args.force or not teaser.exists():
            if derivable:
                print(f"    vignette dérivée de {bandeau}")
                if not args.dry_run:
                    derive_vignette(ROOT / bandeau.lstrip("/"), teaser)
            else:
                rend_carte(urlencode({"variant": "teaser", "eyebrow": "Billet",
                                      "tags": tags(lignes), "tagline": date_fr}),
                           teaser, args.dry_run)
            rendus += 1

            # Nettoyage après coup seulement : si la génération ci-dessus a
            # levé (source corrompue, disque plein...), l'exception non
            # rattrapée interrompt le script avant d'arriver ici, et
            # l'ancienne vignette reste en place — au pire une vignette
            # obsolète, jamais un header.teaser qui pointe dans le vide.
            if orpheline.exists():
                if args.dry_run:
                    print(f"    supprimerait {orpheline.relative_to(ROOT)} (orpheline)")
                else:
                    orpheline.unlink()
        vignette = f"/images/og/teaser-{slug}.{ext}"

        lignes, modifie_og = pose_dans_header(lignes, "og_image", f"/images/og/{slug}.png")
        lignes, modifie_teaser = pose_dans_header(lignes, "teaser", vignette)
        modifie = modifie_og or modifie_teaser
        if modifie:
            cables += 1
            if args.dry_run:
                print(f"    câblerait header.og_image dans {post.name}")
            else:
                sortie = "---\n" + "\n".join(lignes) + "\n---\n" + corps
                if crlf:
                    sortie = sortie.replace("\n", "\r\n")
                post.write_bytes(sortie.encode("utf-8"))

    print(f"\n{rendus} carte(s) rendue(s), {cables} front matter câblé(s), "
          f"{ignores} billet(s) ignoré(s)")


if __name__ == "__main__":
    main()
