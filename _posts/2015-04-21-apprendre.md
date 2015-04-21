---
layout: post
title: Dur de rester à jour
excerpt: "Tout va toujours plus vite, petites astuces pour rester in"
tags: [apprendre, rester développeur]
modified: 2015-04-21
comments: true
image:
  feature: bouquins.jpg
---

Tout semble aller de plus en plus vite. Vous vous sentez débordés par les frameworks qui sortent tous les trois jours, vous n'avez pas le temps de vous intéresser à un que trois autres sont sortis entre temps. Comment peut-on arriver à assimiler tout ça ? Comment ne pas se décourager ? Y a-t-il vraiment un avenir pour les développeurs à 30, 40 ou 50 ans passés ?

### Garder les idées claires

Commencez par prendre un peu de recul. Les nouveaux frameworks et les nouvelles technos qui sortent sont souvent basées sur des concepts qui ont des années. Par exemple, la programmation fonctionnelle et ses concepts, tellement à la mode dernièrement avec Scala, JavaScript et autres n'est pas neuve du tout. Haskell a 25 ans, Ocaml 19, Erlang 18 ans... On reprend souvent de vieux concepts pour les recycler.

Pour aller un peu plus loin, les outils utilisés actuellement avec JavaScript sont des transpositions assez directes d'outils existants dans d'autres langages. En prenant le cas de Java, grunt, gulp, et broccholi ne sont que des outils de build un peu comme Ant. Npm et bower ne sont que des gestionnaires de dépendances comme Ivy, Maven et Gradle (même si ces deux derniers font beaucoup de choses). Yeoman pourrait être rapproché des archetypes Maven, ou d'outils comme JBoss Forge. Et on pourrait continuer ces correspondances encore longtemps. On s'est juste contentés de rapatrier côté client ce qu'on faisait jusque là côté serveur.

Côté front-end c'est exactement la même chose. Les frameworks modernes reprennent ce qu'on faisait en client lourd il n'y a pas si longtemps : du MVC la plupart du temps, ou du MVP, MVVM (du MV* quoi), même en Swing on voit ça, et c'est loin d'être le premier à avoir utilisé cela. J'ai bien ri quand j'ai entendu parler de [Flux](http://facebook.github.io/flux/docs/overview.html)[^1] , la grande théorie mise en place par React de découplage de l'affichage des données modèle en mémoire (dans des stores) en utilisant des événements. ExtJS fait ça depuis des années et c'est un pattern qu'on retrouve fréquemment. C'est quasi obligatoire d'en passer par là dès qu'on cherche à faire du [CQRS](http://martinfowler.com/bliki/CQRS.html). Là encore, pas grand chose de nouveau, reprise de vieux concepts et remise à la mode.

[^1]: Si le sujet vous intéresse beaucoup, il y a [cette présentation](http://facebook.github.io/react/blog/2014/05/06/flux.html) à regarder aussi.

Donc pas de stress. Ce que vous apprendrez aujourd'hui ne sera pas perdu demain ni dans trois ans. Les choses reviennent de façon cyclique. Le petit jeune tout juste sorti d'études n'aura pas tout ce background et aura plus de mal à s'adapter que vous vu que ce sont des choses que vous aurez déjà vues quelque part.

### Se maintenir à jour

On ne va pas se mentir, c'est un travail de tous les jours. Qui nous est demandé qui plus est. Donc prenez un peu sur votre temps de travail pour le faire, vous n'en serez que plus efficaces par la suite.

#### Langages

Essayez d'apprendre au moins un nouveau langage de programmation par an. C'est encore mieux quand ils reposent sur des paradigmes que vous ne maîtrisez pas sur le bout des doigts. Si vous êtes habitués à la programmation objet, jetez un coup d'oeil à des langages pûrement fonctionnels (Haskell ou Clojure par exemple). Si vous êtes habitués à faire uniquement du front-end, donnez sa chance à un langage très bas niveau comme Go. Pour cette année, personnellement, je viens de commander [7 languages in 7 weeks](https://pragprog.com/book/btlang/seven-languages-in-seven-weeks) après en avoir entendu beaucoup de bien.

#### Bouquins

Ca c'est ce que j'ai le plus de mal à tenir, mais j'essaie de lire 3 livres techniques par an. C'est important pour aller dans le fond d'un sujet et fait marcher des mécanismes différents dans le cerveau. Cela permet de prendre un peu de recul par rapport au fait de coder. Si vous êtes employés, faites vous les offrir par votre entreprise. Cela montrera votre implication personnelle, en général ils les achètent de bon coeur. Et puis comme ça, une fois lus, ils pourront servir à d'autres dans votre entreprise.

#### Katas

Prenez 5 à 10 minutes pour faire de petits exercices et vous mettre en jambe tous les matins. De nombreux sites vous proposent de quoi tenir pendant plusieurs années. Je vous conseille personnellement [CodeWars](http://www.codewars.com/), [Exercism](http://exercism.io/) et [CheckiO](http://www.checkio.org/). Les exercices n'ont pas besoin d'être difficiles, c'est la répétition qui importe. En plus, en regardant les solutions des autres participants, vous vous familiariserez avec les subtilités des différents langages (idiomatiques). Préférez l'entraînement sur des langages que vous connaissez un petit peu moins !

#### MOOC

__Tous__ les MOOC que j'ai suivis m'ont été utiles dans mon travail de tous les jours. Pas un n'a fait exception, et pourtant j'en ai fait un paquet. Visez ceux sur les sujets qui vous intéressent vraiment, et auxquels vous avez plus de chance de rester accrochés. Les MOOC sont des occasions assez uniques d'apprendre avec parmi les meilleurs professeurs sur un sujet donné. Par exemple, j'ai appris Scala avec Martin Odersky, Haskell avec Erci Meijster etc.

### Partager

Je pense que c'est le point le plus important. Seul, on n'apprend pas grand chose. C'est en montrant son code et en rencontrant des gens qu'on en apprend le plus. Encouragez les revues de code dans votre entreprise. Cela uniformisera la façon de coder entre vous sans avoir à imposer des _best practices_. Si vous pouvez faire un peu de pair programming c'est encore mieux. Pas besoin de faire ça à longueur de journée, mais si vous pouvez prendre une petite demi heure de moyenne par jour pour le faire c'est l'idéal.

Il y a deux autres façons de partager ses connaissance, et d'assimiler celles des autres :

* Vous pouvez donner des formations, des cours ou suivre des formations. Je donne quelques vacations en IUT depuis ce début d'année, c'est une expérience très enrichissante. Être en capacité d'enseigner à quelqu'un c'est d'abord se forcer à maîtriser son sujet.
* Proposez des sujets aux conférences, dans des BBL, dans vos User Groups locaux et assistez à ces trois types d'événements !

### Références

J'avais lancé de mon côté un repository sur GitHub où je listais tous les liens vers les sites où j'avais appris des choses. Depuis, on a centralisé ça dans [les repos du Software Craftsmanship Toulouse](https://github.com/dojo-toulouse/apprendre). N'hésitez surtout pas à ajouter vos bons plans et vos adresses préférées, cela servira à d'autres !
