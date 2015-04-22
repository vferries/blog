---
layout: post
title: Les Web Components
excerpt: "Rappel des bases et actualité"
tags: [web components, Polymer, X-Tag, VannillaJS]
modified: 2015-04-23
comments: true
---

Je m'intéresse aux WebComponents depuis bien plus d'un an maintenant. Bien avant les annonces en grande pompe lors de la Google I/O. J'ai donné quelques conférences, notamment un atelier à l'Eclipse Con l'été dernier dessus et quelques [BBL]({{site.url}}/BBL/). Au départ avec Dart, ensuite en JavaScript. Et aujourd'hui, je n'y crois plus qu'à moitié, laissez-moi vous expliquer pourquoi.

### Les spécifications JavaScript pures

![Web Components]({{site.url}}/images/webcomponents.svg)

Les Web Components ne sont pas une spécification, mais quatre ! Elles sont supposées indépendantes, mais prennent tout leur sens utilisées conjointement. Laissez moi vous les présenter très rapidement.

Tous les exemples présentés ici sont détaillés dans le répertoire examples dans le [repository GitHub](https://github.com/vferries/bbl_webcomponents) associé.

#### Custom Elements

Les Custom Elements est simplement une spécification qui permet de définir de nouveaux éléments HTML. Il faut par contre respecter une règle simple : le nom du nouvel élément doit comporter un '-'.

Niveau syntaxe ça se passe comme ça :

{% highlight javascript %}
var Proto = Object.create(HTMLElement.prototype);
registerElement('a-name', Proto);
{% endhighlight %}

On étend un des éléments HTMLElement et on appelle _registerElement_ en passant le nom et notre prototype. On n'a alors plus qu'à appeler notre balise `<a-name></a-name>`.

On peut aussi étendre un élément existant pour lui rajouter des comportements, en prenant un bouton ça donne ça :

{% highlight javascript %}
document.createElement('button', 'mega-button');
{% endhighlight %}

Il faut ensuite appeler l'élément surchargé avec `<button is="mega-button"></button>`.
La balise `<content>` permet de récupérer le contenu qui a été mis dans le DOM à l'intérieur de notre élément Html. On peut en plus filtrer le contenu qu'on y met (que les éléments li avec la class "active" par exemple).

#### Templates

Les templates permettent de définir un bout de code inerte qu'on peut utiliser ensuite comme base pour l'injecter dans le DOM à la demande.

{% highlight html %}
<template>
	...
</template>
{% endhighlight %}

Le corps est alors contenu dans la balise template.

{% highlight javascript %}
var template = document.querySelector('#tpl');
var clone = document.importNode(template.content, true);
{% endhighlight %}

Pour l'instancier, il faut cloner le contenu du template. Etant inerte, il n'est pas considéré comme étant dans le DOM. _document.querySelector_ ne le remontera donc pas.
L'un des autres avantages vient du fait que le CSS défini dans un template voit sa portée limitée au template.

#### Shadow DOM

Le shadow DOM permet de masquer la complexité interne d'un élément en les masquant par défaut dans le DOM. C'est déjà ce qui est fait avec les balises `<video>` dans les navigateurs modernes. Pour voir le contenu, il y a l'option Shadow DOM à activer dans votre navigateur préféré, par défaut ils sont masqués.

Pour les créer ça se passe comme ça :

{% highlight javascript %}
var shadow = document.querySelector('#whatever').createShadowRoot();
shadow.appendChild(something);
{% endhighlight %}

On peut empiler les shadow DOMs les uns sur les autres et les dépiler avec la balise `<shadow>`. Les CSS sont encapsulées et il y a de nouveaux sélections /deep/ et :host pour descendre ou monter dans l'arborescence.

#### HTML Imports

La dernière des spécifications sur les Web Components, celle-ci permet d'importer un fichier HTML comme on le fait pour les CSS et les fichiers JavaScript.

{% highlight html %}
<link rel="import" href="import.html">
{% endhighlight %}

On voit facilement comment on peut mixer ces différents bouts : on définit un template dans un fichier html qu'on importe avec un JavaScript qui définit un nouvel élément. On injecte le contenu du template dans le shadow dom qu'on définit sur le custom élément et en avant, on a un composant complet utilisable tel quel.

### Les implémentations

Les navigateurs traînent un peu des pieds. FireFox a repoussé son support des imports HTML (des conflits avec d'autres spécifications sur les imports, JS et Html). IE reste IE. Mais par contre il existe des polyfills, regroupés dans une librairie nommée _webcomponents.js_. Attention, ils sont assez coûteux en performances.

#### Polymer

Polymer est l'implémentation Google des WebComponents. C'est à la fois du sucre syntaxique pour la déclaration des éléments, du data binding (bidirectionnel), et tout une librairie de composants tout prêts. Je vous conseille de jouer un peu avec [le Polymer Designer](https://polymer-designer.appspot.com/).

#### X-Tags / Bosonic

La même mais côté FireFox. Le projet a l'air moins vivace.
Bosonic est fait par Raphaël Rougeron, un Toulousain. Par contre, pas grand chose dessus dernièrement aux dernières nouvelles non plus.

#### Les autres

Tous les frameworks qui ont le vent en poupe en ce moment côté Front-End sont basés sur des principes très proches. C'est le cas d'Aurelia (qui utilise _webcomponents.js_ en sous-main). Les directives d'Angular peuvent être vues comme des composants. Côté React aussi, le concept est assez proche.

### Ce que j'en pense

Je suis ravi qu'une spécification soit en cours sur ce point. Cependant, je la trouve assez lourde et pas super intuitive. En outre cela pose des problèmes en terme de gestion des versions, des téléchargements multiples d'un même composant, du fait qu'on se retrouve avec plein de fichiers à charger via Http (oui je sais qu'il y a [Vulcanize](https://github.com/polymer/vulcanize)) et j'en  passe.

Je pense que Polymer et Aurelia sont des approches plus adaptées, abstrayant la complexité de la spécification. Par contre malheureusement rien n'a été fait pour que toutes ces technos intéragissent facilement ensemble, ce qui serait bien plus dans l'esprit qu'on voudrait pour des composants...

Ceci étant dit, ça reste l'avenir du web, il va falloir vous y faire !