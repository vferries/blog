---
title: Devoxx , this is the end
excerpt: "Dernière journée de Devoxx"
tags: [Devoxx France, Java, ateliers]
modified: 2015-04-11
comments: true
header:
  image: /images/devoxx.png
---

Encore une fois la journée a été longue mais particulièrement plaisante. J'ai quelque peu changé d'avis sur mon programme et adapté en fonction, n'ai toujours eu qu'environ 2 minutes pour manger (quel dommage de ne pas pouvoir manger dans les salles...). Je vais essayer de retracer tout ça ici même.

### Un robot peut-il apprendre comme un enfant ?

[Pierre-Yves Oudeyer](http://www.pyoudeyer.com/), chercheur à l'Inria nous a présenté ses travaux en robotique développementale. Il essaie de reproduire les processus d'apprentissage des humains avec des robots. Cela va du fait d'apprendre les réactions de ses gestes à la création d'un langage sans intervention extérieure.

Voici un petit exemple de ce qu'il a mis en place.

<iframe width="420" height="315" src="https://www.youtube.com/embed/uAoNzHjzzys" frameborder="0" allowfullscreen></iframe>

Je connaissais déjà [InMoov](http://www.inmoov.fr/), voici venu [Poppy](https://www.poppy-project.org/), un autre projet open source de robot humanoïde imprimable en 3D. Il se veut modulaire, plus petit et moins cher, à suivre donc.

### The upcoming decentralisation singularity

Nous sommes des milliars à utiliser des systèmes centralisés qui datent des années 7O. Les usages ayant évolué, il convient de faire évoluer le médium.

>The Web's future relies on individuals owning their data __Tim Berners Lee__

C'est le problème que tente de résoudre [Ethereum](https://www.ethereum.org/), un projet promu par une organisation à but non lucratif. Il s'agit d'une plateforme avec une base de données décentralisée, basée sur [blockchain](http://en.wikipedia.org/wiki/Bitcoin#Block_chain), le système derrière la production de bitcoins.

### The end of server management: hosting have to become a commodity

Le point clé de cette présentation est qu'on devrait utiliser l'hébergement comme une simple ressource et qu'on ne devrait plus avoir à se préoccuper de comment ça se passe en dessous, laissant ça à ceux dont c'est le travail. L'analogie avec l'électricité était particulièrement bien trouvée, la citation suivante aussi :

> DevOps : dire à un développeur que tu seras d'astreinte quand même. __Quentin Adam__

L'argument comme quoi beaucoup de serveur ne sont pas à jour en terme de sécurité est tout à fait valable.
Cependant, le présentateur bossant chez CleverCloud, c'est son boulot de nous vendre du cloud. Mais quid des spécificités en terme d'infrastructure que notre application demande ? C'est quand même perdre la main sur les robinets d'alimentation, faire confiance à quelqu'un d'autre pour gérer les coûts des montées en charge. Je ne pense pas que ce soit adapté à tous les cas.

Le présentateur voudrait qu'on monte une vraie industrie, expliquant qu'on n'est plus des artisans. Je suis fondamentalement et farouchement opposé à cette déclaration : cela fait plus de 30 ans qu'on cherche à industrialiser notre métier sans vraiment y parvenir. On fait des choses différentes tout le temps, on a besoin d'une expertise certaine, d'années de pratique, d'idées innovantes. Il serait peut-être plutôt temps d'en tirer certaines conclusions et de changer le niveau de qualité de ce qui est livré aux clients plutôt que d'essayer de passer tout ça à la moulinette non ?

### Java, the next 20 years

Sympa de voir Brian Goetz sur scène nous parler de ce qu'il prévoit pour Java. Je me souviens de la keynote il y a deux ans si je ne m'abuse dont l'objet était de savoir si Java allait réussir le tournant et survivre ou le rater et se crasher. On est plutôt sur la bonne voie avec Java 8, qui a redonné un peu d'air.

En ce qui concerne Java 9, le projet Jigsaw de modularisation du JDK et de gestion des modules a bien sur été abordé.

Pour après, la priorité semble être de s'adapter aux changements profonds et rapides du hardware, notamment avec les ValueTypes, des structures de données immutables. On retrouve ces idées à travers deux projets : [Valhalla](http://openjdk.java.net/projects/valhalla/) (value types, specialized generics) et [Panama](http://openjdk.java.net/projects/panama/) (Foreign Function Interface, Data Layout Control).

### Plugin Gradle, prenez le contrôle de votre build !

Présentation intéressante mais pas évidente à retranscrire. Force est de constater que la création d'un plugin Gradle est plutôt aisée. Je vais tenter de l'utiliser plus souvent (malgré les avancées récentes de Maven).
Il faut quand même visiblement faire attention au cycle de vie des plugins et bien lire la documentation.

Si vous voulez en savoir plus, [les slides](https://docs.google.com/presentation/u/0/d/1llWSoa8KepAnYGFDE0HA4FtNmSdnVVHp7HPkQ5Ah94k/edit) sont disponibles.

### Ignite Talks, le retour

Manger c'est tricher, alors je suis de nouveau allé voir des Ignite Talks pendant la pause repas.

#### Devoir de conseil du consultant

La question de fond était "Y a-t-il quelque chose dans le droit qui nous force à dire au client quand on estime qu'il a tort ?" et la réponse : aucune idée. Mais ça invite à d'autres interrogation : Sommes nous des exécutants qui devons nous plier aux désirs du client ou des conseillers qui devraient lui dire quand il a tort. Qu'est-ce qui ferait que  notre parole ou opinion sur le sujet vaudrait mieux que la sienne ?

#### Démocratie participative

C'est un sujet qui ressort régulièrement depuis peu. On vote pour une poignée d'élites sortis de l'ENA, peut-on encore appeler cela une démocratie ? Pourquoi ne pas tirer au sort nos élus et leur donner une formation afin de pouvoir assurer leurs fonctions ? Il faut au moins leur laisser le choix dans leurs formateurs par contre.

#### Booster votre karma pro

Katia Aresti nous a retracé son parcours professionnel pour le moins intéressant. Elle a tout d'abord rejoint les Duchess qui lui ont donné l'envie de commencer à écrire des articles techniques et monter un groupe d'entraide pour le passage de certification JSCP. Cela lui a permis de décrocher une excellente mission, puis de devenir speaker grace à ses articles de blog, devenir MongoDB Master et avoir des bières de reconnaissance.
Faites des trucs, le karma vous le rendra bien.

#### Craftsmanship, the REAL thing

Assez marrant, il s'agissait là de travail du bois, pas de Stack Overflow pour trouver les réponses aux questions qu'on peut se poser.

#### Server web pour 4€

Basé sur la puce ESP8266. Un peu trop technique et rapide pour le format, le concept n'en reste pas moins intéressant.

### Les monoïdes démystifiés, en Java avec des verres de bière

Rarement déçu des présentations de Cyrille, je me dirige donc vers celle-ci. Le pitch : pas besoin de supra langages fonctionnels pour appliquer des principes de programmation fonctionnelle dans un langage orienté objet.

Tout est dans le [Domain Driven Design](http://www.amazon.fr/Domain-Driven-Design-Tackling-Complexity-Software/dp/0321125215) d'Eric Evans, le lire permet d'apprendre et de comprendre intuitivement (for free) les concepts utiles de la programmation fonctionnelle et ce que cela peut vous apporter pour améliorer la clarté et la testabilité de votre code.

Il a utilisé l'exemple de gobelets de bière pour expliquer les opérations dans l'ensemble, l'associativité ainsi que l'opération identité avec un élément neutre propres aux monoïdes. Les [groupes abéliens](http://fr.wikipedia.org/wiki/Groupe_ab%C3%A9lien) ne sont que des monoïdes avec opération commutative.

Quand on commence à comprendre comment ces curieuses bestioles marchent, on se met à en voir partout, et ça a pour conséquence de simplifier les opérations sur ces ensembles, d'abstraire une part de la complexité, de rendre le code plus facile à tester.

De nombreux frameworks et technologies modernes reposent sur ces concepts (Hadoop, Storm, Spark). Si on y rajoute l'immutabilité et des méthodes sans effets de bord, on obtient alors des ensembles autonomes simples, tel que dans le [pattern Quantity](http://martinfowler.com/eaaDev/quantity.html) de Martin Fowler.
Mais attendez, immutable et side-effect free, on ne parle pas là des value objects pour Java 10, ou encore de React ?

Petite idée sympa : des annotation à finalité de documentation du type @monoid, @abelianGroup etc.
Pour résumer en quelques mots : know your maths !

### Développement web, ce qui vous attend en 2015

#### ES6

ES6 est à nos portes, prévu pour le courant de l'année, cet été si tout va bien. N'hésitez surtout pas à utiliser des transpileurs entre temps, comme Traceur, la solution Google, ou encore mieux BabelJS, sorti plus récemment mais plus avancé.
En attendant l'adoption massive d'ES6 (ça risque de prendre un certain temps), votre code marchera sur tous les navigateurs récents.

Parmi les nouveautés on peut citer la notion de classes (simple sucre syntaxique), les string interpolations, les arrow functions, les boucles for of, les nouvelles promesses, les générateurs... Peut être l'objet d'un article futur.

#### Polymer

Ma marrote depuis quelques temps, les web components ont aussi le vent en poupe. Je vous en reparlerai ça c'est certain.

#### Angular 2

Angular 2 change radicalement de sa première version, et beaucoup de membres de la communauté s'en plaignent. Pour rappel, initialement prévu comme basé sur AtScript et suite à des accords passés avec Microsoft, il sortira finalement sur TypeScript. Une version alpha un peu buggée est déjà utilisable. La syntaxe change assez fortement de ce qui se faisait jusque là et elle n'est pas du tout définitive encore.

#### React

Ah, React... On en entend énormément parler dernièrement dans le milieu JavaScript. Il permet de gagner énormément en performance sur les manipulations appliquées au DOM, qui sont souvent coûteuses. Pour ce faire, il se base sur un concept de _Virtual DOM_ qu'il conserve en mémoire ne transmettant que les modifications vraiment utiles. Il fait du rendering sur des données immutables, donc son comportement est facilement reproductible.
A noter aussi, le JSX utilisé en lieu et place du templating HTML.

#### Ionic

Ionic est à suivre. Je l'utilise déjà sur des petits projets mobiles maison. Il s'agit en fait d'une surcouche à Yeoman (si vous ne connaissez pas encore, il va falloir vous y mettre) orientée développement mobile. Le code généré se base sur Cordova et AngularJS et intègre quelques directives spécifiques aux mobiles.

A priori, il est déjà prévu que la version 2 se base directement sur Angular 2.

#### Aurelia

Reprenons un peu d'historique, je ne sais pas si vous en avez entendu parler, mais un concurrent sérieux et discret d'AngularJS se nommait Durandal. Son concepteur a été recruté par les équipes de Google et a intégré l'équipe en charge de l'écriture d'Angular 2. Des désaccords ont animé l'équipe, notamment sur la syntaxe à adopter, les évolutions à prendre en considération, et Rob Eisenberg a finalement décidé de quitter l'équipe pour créer un nouveau framework du nom d'Aurelia.

D'après ses dires, celui-ci se veut plus proche des spécifications en cours, notamment celles des web components et d'ES6. Il est sorti en version béta.

En bonus, un [petit quizz](https://quizzie.io/quizzes/51200/devoxx-france-2015---developpement-web) pour voir si vous avez bien suivi.

### La révolution hors-ligne du web arrive avec les Service Workers

Après l'échec flagrant d'AppCache, voici enfin venu quelque chose de plus bas niveau et plus flexible : les Service Workers. Je m'intéressais déjà au sujet (voir [ici]({{site.url}}/service-workers/) et [là]({{site.url}}/service-workers2/)) depuis quelques temps, et espérais trouver quelques petits compléments. Et ce fut un peu le cas : en plus d'une présentation limpide, le problème de l'installation des applications web a été abordé. Je ne m'étais pas trop posé la question jusque là mais effectivement, personne ne va chercher dans les menus du navigateur l'option à activer pour rajouter le lien vers le site sur son bureau mobile...
J'ai donc découvert la notion de manifest pour application mobile de Chrome, qui propose ensuite un bandeau en bas des sites disposant d'un petit fichier json de description. Une bonne découverte, merci.

### "No one at Google uses MapReduce anymore" - Cloud Dataflow explained for dummies

Je vais faire simple : ils n'utilisent plus MapReduce, ils utilisent une surcouche à MapReduce qui optimise les requêtes MapReduce à faire. Le concept s'appelle FlumeJava.
En tout cas, l'utilisation en conjonction des autres technologies NoSQL et BigData de Google (BigTable nommément) est impressionnante : des milliers de serveur déjà provisionnés qui n'attendent que vos requêtes, des outils de visualisation en ligne en temps réel impressionnants, cela promet de bonnes grosses requêtes sur des bases de plusieurs Go en une petite seconde.

### Les Cast Codeurs Podcast : table ronde

Comme à leur habitude, les Cast Codeurs ont clôs la conférence. Des bières pour tout le monde et une bonne partie de déconnade.
Autant dire que cela a plus parlé des choses incongrues qui se sont produites pendant la conférence que de technique, parfait pour clôre en beauté 3 jours intenses de conférence.

Devoxx est une conférence qui me rebooste. Croiser plus d'un millier de personnes passionnées par leur métier, emmagasiner autant d'informations en si peu de temps, ce sont vraiment des choses qui me font un bien fou. En plus de cela, on rencontre des gens intéressants, des appuis potentiels pour essayer de faire bouger les lignes. Comme chaque fois que je vais dans une telle conférence j'essaierai d'en tirer le meilleur, en étant force de proposition, en faisant ce qu'il faut pour améliorer tout ce qui ne me plaît pas dans ma situation.

###### Bonus

Quelques liens vers les présentations compilés depuis Twitter :

* [Les slides](http://fr.slideshare.net/jpaumard/api-asynchrones-en-java-8-46851752) de la présentation de José Paumard sur les APIs asynchrones en Java 8.
* [API hypermedia](http://fr.slideshare.net/delirii/api-hypermedia-devoxx-fr)
* [JHipster](http://fr.slideshare.net/julien.dubois/jhipster-devoxx-2015) par Julien Dubois
* [Slides](https://speakerdeck.com/aheritier/quand-java-prend-de-la-vitesse-apache-maven-vous-garde-sur-les-rails) et [démos](https://github.com/MavenDevoxxFR2015/demos) sur Maven
* [Comprendre enfin JavaScript](http://tchatel.github.io/devoxx2015/devoxxfr2015-thierry-chatel-comprendre-enfin-javascript.pdf)
* [Tools in Action RxJava](https://github.com/dwursteisen/tools-in-action-rxjava-devoxx)
* Atelier Ionic, [les slides ici](http://fr.slideshare.net/loicknuchel/devoxx-2015-ionic-chat-46884464) et [le repository Github](https://github.com/loicknuchel/devoxx-2015-ionic-chat). Je n'y suis pas allé, je l'avais préparé en béta test auparavant.
* [Secure your product](http://dev.unhandledexpression.com/slides/devoxxfr-2015/security/) et [From API to protocol](http://dev.unhandledexpression.com/slides/devoxxfr-2015/protocols/)
* Slides [GitFlow in Action](http://fr.slideshare.net/cecilia_bossard/git-flow-in-action)
