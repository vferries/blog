---
layout: post
title: ARC Welder
excerpt: "Applications Android sous Chrome"
tags: [ARC welder, Android, Chrome OS]
modified: 2015-04-16
comments: true
image:
  feature: welder.jpg
---

ARC signifie Android Runtime for Chrome (Beta) et est un projet Google pour lire des fichiers apk (Android PacKage) sur Chrome OS. Mais en fait, on peut les lire sur n'importe quel système d'exploitation pour peu qu'on utilise le navigateur Chrome. Mac addicts, voici votre solution pour profiter enfin de nos millions d'applications !

### Getting started

Google fournit un [guide pour démarrer](https://developer.chrome.com/apps/getstarted_arc), qui pointe ensuite sur [ARC Welder](http://goo.gl/gAn0Xh) (notez le jeu de mot de folie : poste à souder à l'arc). Il s'agit d'une application Chrome qui est capable de transformer un apk en plugin Chrome.

### Gros plantages

Premiers tests de mon côté, j'essaie de lancer Welder sur mon PC, une Ubuntu 64 bits, en tant qu'application Chrome. Je sélectionne mon apk et le tout tourne en boucle, ça n'avance pas. Je le laisse plus d'une heure sans rien.
J'ai du coup demandé à un ami de tester, idem. Les traces de l'application nous font apparaître à tous les deux un message cryptique.

Le lendemain, je teste à tout hasard sur une autre session au travail sous Windows et là tout marche nickel. Je suis capable de lancer un apk depuis mon navigateur sans souci.

Petit doute et solution finalement trouvée après quelques tests : en fait le problème ne vient pas du système, le souci c'est que j'utilisais chromium et non pas chrome sous Linux... Sûrement encore un des plans machiavélique de Google pour mettre en avant ses solutions closed source.

### APK

Pour récupérer son apk, il y a plein de solutions. On peut se le compiler soi-même comme c'est mon cas avec mon petit pet project Android ([Maze Maker Duel](https://play.google.com/store/apps/details?id=com.quoridor)). On peut aussi utiliser une application d'extraction des APK qu'on a installés sur notre téléphone, ou encore utiliser le plugin Chrome [APK Downloader](https://chrome.google.com/webstore/detail/apk-downloader/cgihflhdpokeobcfimliamffejfnmfii). Celui-ci vous demandera votre Android Device ID, que vous pourrez trouver dans "A propos du téléphone" -> "Etat" -> "Numéro de série".

### Publication

Une fois l'apk sélectionné, ARC Welder lance votre application. Vous pouvez alors la tester et récupérer un zip contenant l'application compatible avec Chrome. La publication sur le store Chrome ressemble beaucoup à celle sur le Play Store : descriptions, screenshots, icônes à renseigner dans tous les sens... Attention, c'est payant (5$).

Du coup vous pouvez trouver l'application pour Chrome OS [juste là](https://chrome.google.com/webstore/detail/maze-maker-duel/jiikgaealdpcjacmbmhckiogkgfidemj). Par contre, il est visiblement impossible de l'installer sur autre chose que Chrome OS, je ne sais pas trop pourquoi. Si vous avez l'info manquante là dessus, je suis preneur. Par contre la génération via Welder me permet de l'utiliser sur mon poste à moi (elle apparaît dans chrome://apps).

Pour information, tous les service Google Play ne sont pas encore intégrés, mais c'est quand même le cas de la plupart d'entre eux. N'hésitez pas à vous référer à la documentation si vous avez un doute à ce sujet.

J'ai ouï dire que Microsoft comptait faire tourner les applications Android sur Windows 10. Je me demande par quel biais il compte y arriver, via une réécriture d'ARC ? En faisant une nouvelle machine virtuelle sous Windows, en portant Dalvik ou encore ART (Android Runtime) ?
Affaire à suivre !
