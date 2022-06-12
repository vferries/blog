---
title: Streaming de code sur Twitch
excerpt: "Je me suis lancé il y a quelques semaines, je vous livre mes premiers retours"
tags: [streaming, twwitch, katas]
modified: 2021-04-22
comments: true
header:
  image: /images/twitch-logo.svg
---

Je me suis lancé, il y a désormais quelques semaines de cela dans un nouvel exercice : streamer du contenu autour du code de façon régulière.

Après une première émission en duo, j'ai mis au point mon planning actuel, à savoir deux sessions "du matin" et une en fin d'après-midi par semaine.

Cela fait désormais un bon mois que j'ai commencé, et, à part quelques empêchements (que je signale dans le planning quand cela se produit), je me tiens à mon programme.

Vous pourrez donc me retrouver le mardi et vendredi matin de 8h à 9h et accompagné le jeudi à 18h [sur Twitch](https://www.twitch.tv/enveillecode).

Je mets aussi ces vidéos en ligne en replay sur [ma chaîne Youtube](https://www.youtube.com/c/VincentFerries/playlists) dans des playlists dédiées.

Je voulais livrer ici par écrit quelques pistes et idées que j'ai en tête pour la suite.

### Pourquoi ?

Il y a plusieurs objectifs à cela : je voulais avant tout me forcer à faire des exercices d'entraînement, plus communément appelés katas.
C'est quelque chose que je pratique beaucoup, mais de façon assez peu régulière.

Je suis donc souvent présent sur [https://www.codewars.com/](Codewars), [check.io](https://checkio.org/), l'[advent of code](https://adventofcode.com/), le [projet Euler](https://projecteuler.net/) (pour ne citer que mes préférés) et plein d'autres que j'ai eu le plaisir de découvrir au fil du temps.
De plus, c'est un super moyen de se créer des routines positives et un peu d'interaction sociale.

### Comment ?

Me lancer de la sorte m'a permis de m'essayer à pas mal d'outils au fil de l'eau. Ce n'est qu'une petite ébauche, je pense que la liste s'étoffera au fil du temps. N'hésitez pas à me signaler en commentaire si vous connaissez des outils plus adaptés.
Pour information, je streame actuellement sous Linux. Certains outils plus simples disponibles sous Windows ne sont pas disponibles, mais on trouve des alternatives très sympas.

- [OBS Studio](https://obsproject.com) Est l'outil principal que j'utilise pour streamer mon contenu. Il inclut une table de mixage sonore et permet de définir des scènes, ainsi que des transitions entre ces scènes. Les scènes permettent de composer des fenêtres, de rajouter les flux caméras, etc. C'est un outil très complet, qui demande un peu de prise en main. Je rajoute et créée des extensions au fur et à mesure de mon apprentissage, et la création d'overlays sera sûrement à l'ordre du jour lors de certains streams.
- [DaVinci Resolve](https://www.blackmagicdesign.com/fr/products/davinciresolve/) j'ai découvert ce logiciel il y a peu, et je dois bien avouer être tombé sous le charme ! L'ergonomie est bien pensée, il tourne aussi bien sur Windows que sous Linux et permet de faire des montages vidéos vraiment très pro. Mixage audio, corrections de couleur, effets spéciaux, on peut tout faire avec ! Le tutoriel présent dans la section [Formation](https://www.blackmagicdesign.com/fr/products/davinciresolve/training) est particulièrement bien fait et complet. Si vous ne connaissez pas encore, je vous encourage vivement à apprendre à vous en servir, ne serait-ce que pour vos vidéos persos.
- [Discord](https://discord.com/) pour tous ce qui est multi-intervenants, on utilise Discord, sans le moindre souci pour l'instant. Le partage d'écran marche bien, le son aussi. Je m'en sers surtout pour récupérer la caméra de mes invités et l'intégrer à ma scène OBS.
- mon IDE favori : IntelliJ IDEA ou l'une de ses versions spécialisées pour un langage comme Webstorm par exemple. Les premiers streams ont été faits sur la version preview afin de profiter de la fonctionnalité Code With Me, désormais intégrée aux versions 2021.1. Cet outil très pratique permet de code à plusieurs dans le même IDE (à la fois ou en suivant l'autre). Cela marche plutôt bien. On a aussi essayé un équivalent sur Code appelé CodeTogether, mais j'ai été moins convaincu : quelques artéfacts à l'écran, et des soucis avec le formatage automatique du code.

### Quoi ?

L'idée de base c'est de faire des katas. Donc il y en aura pas mal.
Plusieurs formats sont possibles, de petits exercices courts sur des katas faciles sur CodeWars, à des katas plus compliqués.
Les premiers ont l'avantage de ne pas exclure ceux qui rejoindraient le stream en cours. Les seconds permettent d'approfondir et d'avoir des exercices plus intéressants et complets.
J'ai fait un certain nombre de katas "faciles" en stream le matin, ça permet de se mettre dans de bonnes conditions pour démarrer la journée de travail sur la bonne lancée.

Nous avons aussi testé avec un ami, Balkoth, des katas plus complexes : le [kata task-list](https://github.com/codurance/task-list) de Codurance, et un kata 1 kyu (difficulté maximale sur Codewars) qui nous ont quand même pris plus de 10 heures à eux deux.

J'aime bien aussi l'idée des Koans pour la découverte de nouveaux languages de programmation. J'ai donc aussi fait une première série sur Rust, qui est un langage qui m'intéresse parce qu'il a l'air d'apporter de nouveaux concepts intéressants.

Je pense aussi faire des petits duels de rapidité de résolution de katas simples.

L'étape suivante mettra en avant du live code. Cela demande plus de préparation, mais je pense qu'en terme de temps investi/choses apprises, c'est probablement plus intéressant pour les spectateurs.

### Et ensuite ?

Les idées à tester ne manquent pas, en voici quelques unes en vrac :
- inviter des gens à venir coder avec moi ou pour des discussions, ou encore présenter leurs travaux ou ce qu'ils font
- faire des mini conférences sur des sujets précis. Des sortes de meetups ou de préparations avant de donner un meetup.
- comment faire de beaux overlays, des appels d'APIs Twitch, du montage etc
- lancer des discussions sur le métier de développeur, pourquoi il est important de parler à des conférences, sur le cloud, tous les outils qu'on utilise aujourd'hui dans un pipeline de livraison
- Algorithmie, on a un sujet en cours sur un jeu de plateau, avec pour l'instant un algorithme A* amélioré qu'on aimerait encore tunner. Pourquoi pas tester des réseaux de neurone dessus voir qui s'en tire le mieux ?

### Appel à Contributions

La chaîne manque encore un peu de traction, mais le nombre d'abonnés monte doucement. Plus il y a de monde pour intéragir, plus cela devient intéressant.
J'aimerais bien faire plus de duos, faire du coaching en live, que ce soit pour des préparations de présentations en conférence, ou encore de la résolution de problèmes.
Si ces sujets vous intéressent, n'hésitez pas à vous manifester.
Je suis aussi ouvert si certains veulent streamer sur la chaîne.
