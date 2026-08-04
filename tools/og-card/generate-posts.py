#!/usr/bin/env python3
"""Génère une OG card 1200×630 par billet et câble `header.og_image`.

Sans carte dédiée, Minimal Mistakes retombe sur `header.image` quand il existe
(des bandeaux en 900×230 ou 1849×39, inexploitables comme vignette de partage)
puis sur la carte générique `site.og_image`, identique pour les 46 billets.

Le rendu passe par generate.sh, qui reste la source de vérité : même template,
mêmes fontes. Les cartes sont ensuite quantifiées en PNG8 — le visuel est plat,
la perte est invisible et le poids tombe d'environ 110 à 32 Ko.

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


def pose_og_image(lignes, chemin):
    """Ajoute (ou corrige) header.og_image. Renvoie (lignes, modifié)."""
    entree = f"  og_image: {chemin}"

    try:
        i = next(n for n, l in enumerate(lignes) if l.rstrip() == "header:")
    except StopIteration:
        return lignes + ["header:", entree], True

    # Parcourt le bloc indenté qui suit `header:`
    fin = i + 1
    while fin < len(lignes) and (lignes[fin].startswith((" ", "\t")) or not lignes[fin].strip()):
        fin += 1

    for n in range(i + 1, fin):
        if lignes[n].strip().startswith("og_image:"):
            if lignes[n] == entree:
                return lignes, False
            lignes[n] = entree
            return lignes, True

    return lignes[:i + 1] + [entree] + lignes[i + 1:], True


def rend_carte(titre, date_fr, sortie, dry_run):
    """Rend la carte via generate.sh puis la quantifie en PNG8."""
    requete = urlencode({"eyebrow": "Billet", "title": titre, "tagline": date_fr})
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
            rend_carte(titre, date_fr, carte, args.dry_run)
            rendus += 1

        lignes, modifie = pose_og_image(lignes, f"/images/og/{slug}.png")
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
