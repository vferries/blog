---
title: "Vie privée"
excerpt: "Ce que ce site sait — ou ne sait pas — de toi."
sitemap: false
permalink: /privacy
---

Pas de tracker maison, pas d'analytics, pas de pub. Mais ce site n'est pas hermétique pour autant — autant être clair sur ce qui passe par où.

## Ce qu'on charge depuis ailleurs

- **Polices Google Fonts** (`fonts.googleapis.com`, `fonts.gstatic.com`) sur toutes les pages. Google reçoit ton IP et le `User-Agent` au chargement.
- **Commentaires Disqus** sur les billets du blog uniquement (`/blog/`, billets individuels). Disqus dépose ses propres cookies dès que la zone de commentaires se charge, et collecte ce qu'il faut pour fonctionner. La landing (`/`) et `/about/` n'ont pas de commentaires, donc pas de Disqus.
- **Hébergement GitHub Pages** : GitHub voit forcément les requêtes HTTP qui arrivent sur `enveille.info`, comme n'importe quel hébergeur.

## Ce qu'on ne fait pas

- Pas de Google Analytics, pas de Plausible, pas de pixel Meta, pas de tag Manager.
- Pas de cookie de session : il n'y a rien à connecter, rien à personnaliser côté serveur.
- Pas de newsletter, donc pas de liste d'emails.

## Si tu veux limiter la casse

Bloquer Google Fonts au niveau du navigateur (uBlock Origin, NoScript) fait basculer le rendu sur les polices système — le site reste lisible. Bloquer Disqus rend la zone de commentaires invisible, le reste de la page fonctionne.

## Une question, une remarque ?

[vincent.ferries@gmail.com](mailto:vincent.ferries@gmail.com) — direct, sans formulaire intermédiaire.
