---
layout: post
title: Ionic Material
excerpt: "Du material design sauce web"
tags: [aurelia, material design, ES6]
modified: 2015-04-22
comments: true
---

![Ionic]({{site.url}}/images/ionic.svg)

En attendant qu'Aurelia permette de packager proprement ses applications, les soucis d'intégration que j'ai eus avec des librairies JavaScript tierces font que je change mon fusil d'épaule et tente le coup avec Ionic Framework. Et plus précisément, Ionic-Material, sorti en alpha ce 21 avril. Ne voyez pas cela comme un abandon d'Aurelia, ce framework a vraiment de l'avenir à mes yeux, et j'y reviendrai très prochainement.

Retour donc à du Angular 1, toujours basé sur Cordova histoire de pouvoir être déployé sur téléphone. On va tester ça rapidement et voir ce que ça donne.

### Installation

Je me suis contenté de récupérer le [code du projet](https://github.com/zachsoft/Ionic-Material) et notamment leur application de démonstration. N'hésitez pas à y jeter un coup d'oeil, c'est quand même [plutôt joli](http://ionicmaterial.com/demo/). Cliquez sur le bouton pour voir Thronester.

J'ai ensuite commencé à l'adapter à mes besoins. Je le tiendrai à jour dans les semaines qui viennent sur le [repository GitHub suivant](https://github.com/vferries/fleurs).

### Ionic quoi qu'est-ce ?

Ionic c'est une surcouche à Cordova en ligne de commande. Elle rajoute du live reload, de la génération de ressources (pour les différents formats de devices), et surtout ce qui nous intéresse ici, les applications générées sont basées sur Angular, avec des directives spécifiques à Ionic.

Une sorte de combinaison de gulp (ou grunt ou autres fonction de ce que vous préférez), d'Angular et de Cordova. Pile ce que je recherchais.

### Material Design

Je suis particulièrement nul en design, comme beaucoup de développeurs même si j'essaie tant bien que mal de m'y sensibiliser et de me soigner. C'est pourquoi je cherchais de quoi implémenter les préconisations de Material Design dont je vous ai déjà parlé lors de mes mésaventures le plus simplement possible.

Le projet que j'ai trouvé est de loin le mieux que j'ai vu pour l'instant. Je sais qu'il en existe pour angular et React depuis quelques temps, mais l'adoption est quand même assez longue. J'avais été très déçu des solutions essayées jusque là : MaterializeCss, Mui et bootstrap-material.

### Ce que ça donne pour l'instant

![Catégories]({{site.url}}/images/fleurs.png)

### A suivre

Je n'ai aujourd'hui implémenté qu'une liste de catégories de fleurs servies depuis un service. Une toute petite modification du projet de démo. Dans les jours à venir, je compte bien épurer les pages de démo et ne plus avoir que les miennes. Le but est d'ajouter des sous-catégories, et une galerie d'images qui correspond aux catégories et sous-catégories choisies. Rien de très complexe mais quelque chose de fonctionnel.