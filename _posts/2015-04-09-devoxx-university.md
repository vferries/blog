---
layout: post
title: Devoxx University
excerpt: "Des ateliers pour se mettre en jambe le premier jour"
tags: [Devoxx France, Java, ateliers]
modified: 2015-04-09
comments: true
image:
  feature: devoxx.png
---

Me voila de retour pour ma 3ème édition consécutive de Devoxx France. J'étais speaker avec Antoine Vernois l'an dernier, me revoila simple participant. Cette fois, j'ai gagné ma place pour la conférence avec un petit jeu sur Twitter, écrire un poème avec uniquement des mots-clés Java. Je n'ai pas réussi à faire mieux que cette prose :

_Transient, volatile switch,_  
_Void if catch..._  
_Null return for abstract try._  
_FiNalLy, tHroW dEfaUlT CaSe._  

Merci encore au GenevaJug pour cette place, heureusement que j'ai été le seul à oser tenter le coup !

Me voila donc parti depuis ma petite province vers la capitale, le programme quasi définitif des conférences que je compte aller voir en poche. Il se peut que je le modifie en cours de route, au gré des rencontres.

Voici déjà le compte-rendu de ma première journée, attention, intitulés de conférences et ateliers à rallonge.

### Linux : arrêtez de bidouiller et créez vos packages !

Nous voila partis pour le premier atelier. Démarrage un peu difficile, pas évident de build avec des conteneurs docker dans une virtual box CentOS. Au moins, on a tous les mêmes bases.

J'aurais au moins appris comment on décrit et génère des packages rpm, c'est déjà beaucoup : définition des répertoires, builds temporaires, phase d'installation, dépendances entre paquets etc. L'utilisation de conteneurs docker spécifiques par distribution est parfaitement adapté à la génération simple des builds pour chaque version d'OS.

Si vous n'avez jamais vu de description de package rpm, ça ressemble à ça :

{% highlight spec %}
Name: devoxx-ex2
Version: 1.0.0	
Release: 1%{?dist}
Summary: a package with a dependency

Group:	Devoxx/Lab
License: NoLicense
Requires: devoxx-ex1

%description
This Package is an example package for Linux Packaging Lab in Devoxx France.
It provides nothing by itself, but has a dependency, i.e. Requires another package.

%install

%files

%changelog
* Wed Apr 8 2015 Vincent Ferries <vincent.ferries+junk@gmail.com>
 - v1.0.0: First release
{% endhighlight %}

C'est assez descriptif pour se passer de trop de commentaires.

Pour ceux que ça intéresse, les exemples utilisés sont trouvables sous Github aux adresses suivantes : [conteneurs docker](https://github.com/zepag/linuxrpm-docker) et [exemples](https://github.com/zepag/linuxrpm-examples). On y trouve notamment les scripts de build.

Des scripts sh "simples" permettent de tout lancer, plus qu'à aller fouiner dedans pour voir ce qui est fait en détail.

Mais c'est les discussions engagées avec le présentateur qui ont été les plus intéressantes, notamment au niveau de la comparaison avec d'autres outils type Chef ou Puppet. L'intérêt principal des rpm est par exemple de pouvoir installer plusieurs versions en parallèle d'un même outil ou pour la gestion des dépendances entre packages.

### Coder sans peur du changement, avec la "même pas mal !" architecture hexagonale

Celle là je l'avais repérée depuis un moment ! J'avais beaucoup apprécié la conférence de Cyrille Martaire l'an dernier sur l'[Extremist Programming](https://www.parleys.com/tutorial/extremist-programming-lart-de-samuser-avec-du-code) qui m'avait à la fois fait rire et poussé à tester des trucs idiots (ce blog et tous ces posts en découlent en quelque sorte). Je me reconnais beaucoup dans le mouvement Software Craftsmanship dont il est l'un des dignes représentants.

Petite intro avec un synthétiseur pour passer le temps, suivi de quelques "questions pièges" aux architectes dans la salle (du genre qui est architecte ? Vous ou votre équipe ?).

Mini introduction en lançant quelques noms pas tout à fait au hasard, notamment [Alistair Cockburn](http://alistair.cockburn.us/) (sur les use cases) et [Uncle Bob Martin](http://www.cleancoder.com), le chariant un peu au passage.

#### Et sinon, c'est quoi l'architecture hexagonale ?

Le principe de base est simple : un hexagone dans lequel on met le métier.  
__Une règle, pas de dépendance vers l'extérieur. I mean never !__  
On rajoute une petite couche de service applicatif et connexion au reste du monde avec des adapters (exemple du REST adapter, ou autre).
Les données dont on dépend sont en amont et les données qu'on produit sont en aval (producer/consumer).

Attention, pas de modélisme ! Juste le modèle utile pour le use case.
Mais alors comment qu'on fait pour appeler des données d'une base distante ?
On rajoute une interface dans le domaine, un adapter viendra ensuite l'appeler.
On applique donc massivement le DIP, ou Dependency Inversion Principle avec le [Pattern Repository](http://martinfowler.com/eaaCatalog/repository.html) (de [Martin Fowler](http://www.martinfowler.com/)) dans le DDD.

On commence par mettre un mock à la place de ce repository. Et on peut faire une démo rapidement.
Du coup on peut changer d'infrastructure sans avoir à casser le modèle. On peut par exemple faire un adapter depuis AWS, changer de BDD facilement etc. Si on rajoute un client, encore une fois, il suffit d'ajouter un adapter. On accueille aussi le changement de façon mieux veillante.

Le pattern a vite été renommé en Port/Adapter. Des discussions houleuses agitent les forums sur le sujet...

* Port = Techno existante qu'on ne va donc pas coder
* Adapter = Votre code, pas le pattern du GoF

Les différentes reprises du concept par des gens connus :

* Gros conseil de lecture, [Steve Freeman & Nat Pryce (GOOS)](http://www.informit.com/store/growing-object-oriented-software-guided-by-tests-9780321503626)
* [Vaugh Vernon (IDDD)](https://vaughnvernon.co/)
* [Jeffrey Palermo (Onion Architecture)](http://jeffreypalermo.com/blog/the-onion-architecture-part-1/)
* [PragProg](http://pragprog.com/magazines/2009-12/going-naked)

#### Faut bosser un peu

Petit exercice imposé du coup, formation de petits groupes pour dessiner le schéma d'architecture d'une application d'évaluation des sentiments exprimés dans une phrase.
Le kata en question est décrit sur [une application sur Heroku](http://archkatas.herokuapp.com/)

Plus de 60 dessins d'architecture ont été soumis et on les a passés en revue brièvement. En voila un petit exemple.

![Dessins]({{site.urk}}/images/sketch.jpg)

Les deux présentateurs nous ont ensuite montré une [petite application de démo](https://github.com/cyriux/hexagonal-sentimental) disponible sur le repository Github de Cyrille.

### Le taré du terminal : outil pour le développeur de l'extrême

Emmanuel Bernard qu'on ne présente plus nous a montré ce qu'il utilisait au quotidien dans ses lignes de commandes. Outre la license [WTFPL](http://fr.wikipedia.org/wiki/WTFPL) et les package managers (même cygwin sous Windows ou brew sous Mac) qui font gagner un temps précieux lors des installations, il nous a montré les utilisations de TMUX, qui permet de faire du multi-terminaux avec des sortes de bureaux composés de plusieurs terminaux.

Ce n'est que la première des N choses qu'il a présentées qui sont actuellement dans ma liste des trucs à apprendre forcément quand je trouverai le temps. Le second a suivi peu après : vim, un des éditeurs texte par excellence... Dur à appréhender mais sacrément puissant quand bien maîtrisé. De plus, des plugins existent pour en tirer profit même dans nos éditeurs préférés : Idea Vim pour InteliJIdea (encore un de ma __to learn list__), et Eclipse avec Vrapper.

Dans les petits plus, on peut citer les alias git (que beaucoup de gens utilisent) comme co pour commit, cb pour change branch, mais aussi des pull-request créées en une petite commande git !

Rsync  pour  les backups, c'est ce que j'ai déjà mis en place chez Genigraph il y a quelques années de cela, c'est terriblement efficace ! Je ne pousserai par contre pas l'extrémisme à aller lire mes mails avec MUTT et IRC en ligne de commande !

N'hésitez pas à aller voir [les slides](https://github.com/emmanuelbernard/command-line-nuts) de la présentation.

### TypeScript, le JavaScript statiquement typé

Cela fait pas mal de temps que j'observe TypeScript d'un peu loin, hésitant quelque peu à m'y lancer vraiment. J'avoue avoir été plutôt convaincu par la présentation.

Comme vous devez tous le savoir, TypeScript est un langage de programmation basé sur JavaScript mais qui ajoute le typage et les notions de classes. Parmi les choses intéressantes, on peut noter la présence d'interfaces, de type union (un type ou un autre comme avec Ceylon) et la présence de modules, mais attention il ne s'agit malheureusement pas (encore) des modules d'ES6.

Les annonces récentes comme quoi Angular 2 serait désormais basé sur TypeScript et non plus sur AtScript ont amené Microsoft a revoir un peu sa copie. Parmi ce à quoi on doit s'attendre pour TypeScript 1.5 :

 * RTTI : de l'introspection et la possibilité de conserver les vérifications de types au runtime, ce qui promet de meilleures traces mais des performances dégradées
 * des decorators, des annotations composables, un peu sur le principe des traits dans d'autres langages
 * des fonctionnalités supplémentaires d'ES6 tel que le destructuring assignment (comme en python ou ruby), les for of, les générateurs (avec yield)
 * les vrais modules ES6

Ce qu'on peut attendre pour TypeScript 2 :

* des templates String avancés
* les async/await d'ES7 (que [Dart a depuis peu]({{site.url}}/dart-ES7/))

En ce qui concerne les mauvais côtés du langage :

* YAC (Yet Another Compiler), qui plus est, un assez lent
* pas compatible JSX si vous faites du React
* fichiers de définition

Et du côté des bons :

* migration progressive possible dans un sens comme dans l'autre, renommer un .js en .ts marche le plus souvent et on peut facilement récupérer le code compilé et repartir dessus
* facile à apprendre
* Compatible avec ES6
* Refactoring simplifié par les types et leur gestion par les IDE

Une très bonne introduction en tout cas.

[Voila les slides](https://github.com/blemoine/typescript-slides) pour ceux que ça branche !

### Et si on arrêtait de se prendre la tête avec la documentation

Pour arrêter de se prendre la tête avec la documentation, faisons de la documentation... J'avoue n'être que moyennement convaincu. Le format est intéressant mais pas beaucoup plus que du Markdown à mon sens.
L'intégration possible de diagrammes via graphviz, plantuml et dita est un plus évident. Mais selon moi, cela reste de la documentation à maintenir, qui ne sera pas forcément à jour encore et toujours.
Par contre on peut utiliser différents plugins de build (maven, gradle entre autres) et différentes technos : ruby, java, Groovy, JS et exporter là aussi vers plusieurs formats de sortie.

###### PS :

On m'a vivement conseillé d'aller voir la présentation "A l'assaut d'une application réactive" dès qu'elle sera disponible sur [Parleys](https://www.parleys.com/).
