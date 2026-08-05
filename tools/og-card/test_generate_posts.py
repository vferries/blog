#!/usr/bin/env python3
"""Tests du générateur de vignettes.

    python3 tools/og-card/test_generate_posts.py

Stdlib uniquement (unittest) — le repo n'a pas de runner et n'en gagne pas un
pour trois fonctions. Les fixtures images sont fabriquées à la volée par
ImageMagick, déjà requis par le générateur lui-même.
"""

import importlib.util
import re
import subprocess
import tempfile
import unittest
from pathlib import Path

ICI = Path(__file__).resolve().parent

# Le module a un tiret dans son nom : pas importable par `import`.
_spec = importlib.util.spec_from_file_location("generate_posts", ICI / "generate-posts.py")
gp = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(gp)


def fabrique(chemin, largeur, hauteur, bande_ouest=False):
    """Crée un PNG uni ; avec `bande_ouest`, ses 4 colonnes de gauche sont rouges."""
    commande = ["magick", "-size", f"{largeur}x{hauteur}", "xc:#007DA5"]
    if bande_ouest:
        commande += ["-fill", "#FF0000", "-draw", f"rectangle 0,0 3,{hauteur}"]
    commande.append(str(chemin))
    subprocess.run(commande, check=True, capture_output=True)


def dimensions(chemin):
    sortie = subprocess.run(
        ["magick", "identify", "-format", "%w %h", str(chemin)],
        check=True, capture_output=True, text=True,
    ).stdout.split()
    return int(sortie[0]), int(sortie[1])


def pixel(chemin, x, y):
    return subprocess.run(
        ["magick", str(chemin), "-format", f"%[pixel:p{{{x},{y}}}]", "info:"],
        check=True, capture_output=True, text=True,
    ).stdout.strip()


class TestTags(unittest.TestCase):
    """`tags()` lit le front matter d'un billet."""

    def test_style_flow(self):
        self.assertEqual(gp.tags(["tags: [java, devoxx]"]), "java · devoxx")

    def test_style_bloc(self):
        lignes = ["title: Un billet", "tags:", "  - java", "  - devoxx", "categories: [dev]"]
        self.assertEqual(gp.tags(lignes), "java · devoxx")

    def test_style_bloc_avec_guillemets(self):
        lignes = ["tags:", '  - "service workers"', "  - 'push'"]
        self.assertEqual(gp.tags(lignes), "service workers · push")

    def test_virgule_a_l_interieur_d_un_tag_quote(self):
        self.assertEqual(gp.tags(['tags: ["Devoxx, France", java]']), "Devoxx, France · java")

    def test_apostrophe_au_milieu_d_un_tag(self):
        """Ligne réelle de 2015-04-24-bash-liste-fichiers.md : l'apostrophe de
        « d'images » est littérale, elle n'ouvre pas une valeur quotée."""
        lignes = ["tags: [bash, traitement d'images, optimisation]"]
        self.assertEqual(gp.tags(lignes), "bash · traitement d'images · optimisation")

    def test_plafonne_au_maximum(self):
        self.assertEqual(gp.tags(["tags: [a, b, c, d, e]"]), "a · b · c")

    def test_absent(self):
        self.assertEqual(gp.tags(["title: Sans tags"]), "")

    def test_liste_vide(self):
        self.assertEqual(gp.tags(["tags: []"]), "")

    def test_valeur_simple_non_liste(self):
        self.assertEqual(gp.tags(["tags: java"]), "java")

    def test_le_bloc_s_arrete_au_champ_suivant(self):
        lignes = ["tags:", "  - java", "categories:", "  - dev"]
        self.assertEqual(gp.tags(lignes), "java")


class TestRatio(unittest.TestCase):
    """`ratio()` mesure une image sans dépendre du délégué SVG d'ImageMagick."""

    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.tmp = Path(self._tmp.name)

    def tearDown(self):
        self._tmp.cleanup()

    def ecrit_svg(self, nom, contenu):
        chemin = self.tmp / nom
        chemin.write_text(contenu, encoding="utf-8")
        return chemin

    def test_bitmap(self):
        chemin = self.tmp / "bandeau.png"
        fabrique(chemin, 800, 200)
        self.assertAlmostEqual(gp.ratio(chemin), 4.0, places=3)

    def test_svg_avec_viewbox_seule(self):
        chemin = self.ecrit_svg("v.svg", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100"/>')
        self.assertAlmostEqual(gp.ratio(chemin), 4.0, places=3)

    def test_svg_avec_dimensions_en_px(self):
        chemin = self.ecrit_svg("d.svg", '<svg xmlns="http://www.w3.org/2000/svg" width="400px" height="100px"/>')
        self.assertAlmostEqual(gp.ratio(chemin), 4.0, places=3)

    def test_svg_en_pourcentages_retombe_sur_la_viewbox(self):
        chemin = self.ecrit_svg("p.svg", '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 400 100"/>')
        self.assertAlmostEqual(gp.ratio(chemin), 4.0, places=3)

    def test_svg_illisible_renvoie_none(self):
        chemin = self.ecrit_svg("casse.svg", "<svg><pas-ferme>")
        self.assertIsNone(gp.ratio(chemin))

    def test_svg_sans_aucune_dimension_renvoie_none(self):
        chemin = self.ecrit_svg("nu.svg", '<svg xmlns="http://www.w3.org/2000/svg"/>')
        self.assertIsNone(gp.ratio(chemin))

    def test_fichier_absent_renvoie_none(self):
        self.assertIsNone(gp.ratio(self.tmp / "fantome.png"))


class TestDeriveVignette(unittest.TestCase):
    """`derive_vignette()` recadre un bandeau au ratio 1200:630, ancré à l'ouest."""

    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.tmp = Path(self._tmp.name)
        self.sortie = self.tmp / "vignette.jpg"

    def tearDown(self):
        self._tmp.cleanup()

    def test_source_plus_large_que_la_cible(self):
        source = self.tmp / "large.png"
        fabrique(source, 1600, 400)
        gp.derive_vignette(source, self.sortie)
        largeur, hauteur = dimensions(self.sortie)
        self.assertEqual(hauteur, 400, "la hauteur native doit être conservée")
        self.assertAlmostEqual(largeur / hauteur, gp.RATIO_VIGNETTE, places=2)

    def test_source_plus_haute_que_la_cible(self):
        """La branche qui n'était exercée par aucun bandeau du repo."""
        source = self.tmp / "haute.png"
        fabrique(source, 800, 600)
        gp.derive_vignette(source, self.sortie)
        largeur, hauteur = dimensions(self.sortie)
        self.assertEqual(largeur, 800, "la largeur native doit être conservée")
        self.assertAlmostEqual(largeur / hauteur, gp.RATIO_VIGNETTE, places=2)

    def test_n_agrandit_jamais_la_source(self):
        source = self.tmp / "petite.png"
        fabrique(source, 610, 200)
        gp.derive_vignette(source, self.sortie)
        largeur, _ = dimensions(self.sortie)
        self.assertLessEqual(largeur, 610, "un bandeau étroit ne doit pas être agrandi")

    def test_reduit_au_dela_de_1200_px(self):
        source = self.tmp / "enorme.png"
        fabrique(source, 4000, 1000)
        gp.derive_vignette(source, self.sortie)
        largeur, _ = dimensions(self.sortie)
        self.assertEqual(largeur, 1200)

    def test_ancre_le_recadrage_a_l_ouest(self):
        """Centré, le recadrage démarrerait à x=419 sur cette source et le pixel
        échantillonné serait bleu. La tolérance absorbe le JPEG, qui rend la
        bande rouge en srgb(255,1,1)."""
        source = self.tmp / "bande.png"
        fabrique(source, 1600, 400, bande_ouest=True)
        gp.derive_vignette(source, self.sortie)
        rouge, vert, bleu = (int(v) for v in re.search(
            r"\((\d+),\s*(\d+),\s*(\d+)", pixel(self.sortie, 1, 200)).groups())
        self.assertGreater(rouge, 200)
        self.assertLess(max(vert, bleu), 60)

    def test_sort_bien_en_jpeg(self):
        source = self.tmp / "large.png"
        fabrique(source, 1600, 400)
        gp.derive_vignette(source, self.sortie)
        format_reel = subprocess.run(
            ["magick", "identify", "-format", "%m", str(self.sortie)],
            check=True, capture_output=True, text=True,
        ).stdout.strip()
        self.assertEqual(format_reel, "JPEG")


if __name__ == "__main__":
    unittest.main(verbosity=2)
