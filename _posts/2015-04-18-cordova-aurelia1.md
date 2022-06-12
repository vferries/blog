---
title: Application Cordova + Aurelia - premiers pas
excerpt: "Du multiplateformes sauce deluxe"
tags: [Cordova, Aurelia, BabelJS]
modified: 2015-04-18
comments: true
---

### Le concept

J'ai un petit projet pas très compliqué à mettre au point : une application mobile multiplateformes avec une galerie d'images par catégories. Je me suis dit que c'était l'occasion parfaite pour tester tout un tas de technos récentes dessus. Du Cordova pour commencer, parce que pour faire du multiplateformes, il n'y a pas 50 solutions, et puis du [Aurelia](http://aurelia.io/), le successeur de Durandal qui, au premier abord me tente énormément. Il vient de sortir, c'est le bon moment !

### Cordova

![logo Cordova]({{site.url}}/images/cordova_bot.png)

Si vous avez au moins entendu parler de PhoneGap, Cordova est le socle Open Source de chez Apache sur lequel il repose. L'application web produite est embarquée dans une WebView dans une application native différente pour chaque plateforme. Un système de plugins vient se greffer dessus pour permettre d'appeler en JavaScript des fonctionnalités natives de l'appareil. Je ne rentrerai pas ici dans tous les détails sur Cordova, c'est surtout un prétexte.

#### Installation

Si vous n'avez pas encore [NodeJS](https://nodejs.org/) installé (ça existe encore ?), c'est la première chose à faire. Vous aurez aussi besoin d'un client [git](http://git-scm.com/), qui est utilisé en interne par Cordova.

On installe ensuite Cordova via npm globalement :

~~~
sudo npm install -g cordova
~~~

#### Initialisation du projet

On se met ensuite dans le dossier où on stocke nos projets et on créé notre projet qu'on va appeler _gallery_ via la commande suivante :

~~~
cordova create gallery com.moonra.gallery Gallery
~~~

Le premier argument est le nom du répertoire généré, le second le package (notamment utilisé pour identifier l'appli sur Android) et le 3ème le nom de l'application. Il est possible de changer tout ça par la suite dans le fichier _config.xml_.

On se rend alors dans notre dossier de travail et on ajoute les plateformes qui nous intéressent. Vu que j'ai un smartphone Android, je n'ajoute que ça pour l'instant,  mais vous pouvez facilement utiliser ios, firefoxos etc.

~~~
cd gallery
cordova platform add android
~~~

On n'a plus qu'à construire et tester que l'application marche bien directement dans notre mobile :

~~~
cordova run android
~~~

Seulement pour l'instant on n'a qu'un squelette vilain d'application qui ne fait strictement rien. On va maintenant rajouter un vrai framework JavaScript pour construire une application complète.

### Aurelia

![logo Aurelia]({{site.url}}/images/aurelia.png)

J'ai déjà dit quelques mots sur Aurelia dans mes comptes-rendus sur Devoxx France. Il s'agit du successeur de Durandal et compétiteur d'Angular 2. Il est d'après moi plus proche de la philosophie des spécifications sur les WebComponents et des avancées futures de JavaScript.

#### Premier gros problème

Si vous utilisez le squelette d'application fourni par Aurelia, vous allez vous retrouver avec une application basée sur jspm et ça Cordova n'aime pas du tout. On va donc être obligé de gérer nos dépendances _à l'ancienne_ avec du RequireJS et bower. Cela va impacter notre code.

On commence par installer bower si ce n'est pas déjà le cas et initialiser notre projet dans un sous-répertoire _src_:

~~~
npm install -g bower
mkdir aurelia
cd aurelia
bower init
~~~

![Choix pour bower init]({{site.url}}/images/bower_init.png)

Cela nous initialise donc notre fichier _bower.json_ utilisé pour décrire les dépendances nécessaires.

#### Ajout des dépendances nécessaires

~~~
bower install requirejs --save
bower install webcomponentsjs --save
bower install aurelia-bootstrapper --save
bower install aurelia-http-client --save
~~~

Attention l'ordre est important, sinon aurelia bootstrapper ne s'intallera pas correctement.

On n'en a pas vraiment besoin, mais on va rajouter de quoi rendre le tout un peu joli. Poiur l'instant on va utiliser bootstrap. On essaiera peut être de faire du [Material Design](http://www.google.com/design/) un peu plus tard. On met aussi du fontawesome, manière de.

~~~
bower install bootstrap --save
bower install fontawesome --save
~~~

Note pour plus tard : proposer un correctif aux gens de materialize pour les belles fautes de français sur la page d'accueil.

#### Premiers fichiers Aurelia

Je ne vais pas vous mentir, on n'a toujours rien qui marche, mais pour cela il va falloir un peu prendre votre mal en patience. On a quand même fait toute la partie un peu chiante et préparé le terrain pour la suite. La suite dès demain !
