---
layout: post
title: Agile Tour Toulouse 2011
excerpt: "Mon tout premier Agile Tour"
tags: [Agilité, Lean]
modified: 2011-10-25
comments: true
---

![Agile Tour Toulouse 2011]({{site.url}}/images/agilii_logo.jpg)

[L’Agile Tour Toulouse](http://at2011.agiletour.org/en/at2011_toulouse.html) s’est tenu le mercredi 19 octobre à Diagora à Toulouse-Labège. Il a rassemblé plus de 400 personnes.
Cette manifestation fait partie d’une [tournée de plus de 100 dates](http://at2011.agiletour.org/), autour des méthodes agiles de développement.
Pour chaque tranche horaire, 4 séances différentes étaient proposées, je ne rendrais donc compte ici que de celles auxquelles il m’a été donné d’assister.
J’ai choisi, pour ma première à cet évènement, un parcours axé sur l’ingénierie, en concluant par une partie critique vis à vis de Scrum.

Si vous ne connaissez pas Scrum, c’est la base de toutes les présentations qui suivent, je vous conseille vivement de lire le [guide suivant](http://www.scrum.org/storage/scrumguides/Scrum%20Guide%20-%20FR.pdf) (en 18 pages).

### Intro/Keynote

L’introduction, donnée par Alexandre Boutin, tournait autour du jeu dans la formation et dans l’apprentissage des méthodes agiles.
Le jeu était en quelque sorte le fil conducteur de la plupart des présentations, des séances autour du jeu étaient organisées pour chaque tranche horaire.
C’est en effet un formidable moyen d’éveiller les sens des auditeurs et de rendre les informations apprises durables.
Il peut aussi servir de facilitateur de prises de décisions (Poker Planning par exemple).
Parmi les bienfaits du jeu on peut citer :

* un apprentissage cognitif (en participant)
* la possibilité d’utiliser des récompenses pour impliquer encore plus les gens (engagement, dépassement de soi, concours)
* la surprise
* développe l’esprit d’équipe

Les serious games (jeux fortement réalistes) sont eux aussi en forte croissance et de plus en plus utilisés dans de nombreux domaines : pilotage, entraînement aux opérations etc…

La partie difficile consiste en fait à concevoir un jeu fonction d’objectifs donnés.
Il faut tout d’abord adresser le problème, par exemple le manque de communication entre les membres de l’équipe, la non compréhension du rôle et du contenu des réunions de feedback d’un sprint Scrum. Pour cela :

* définir un nombre restreint d’objectifs
* choisir le cadre, l’ambiance, la logistique, la valeur d’apprentissage
* inventer à proprement parler (le plus dur à faire, il vous faudra du courage, de l’inspiration et réussir à garder votre jeu le plus simple possible)

En tant que formateur les points importants sont de ne pas prendre part en tant que joueur mais de faciliter le jeu des autres.
Vous apprendrez autant que les personnes qui jouent, et leurs retours seront pour vour de précieuses informations.

Pour aller plus loin sur les jeux adaptés à l’agile : [TastyCupCakes](http://tastycupcakes.org/)

### Si t’es pas SOLID t’es pas agile

Cette présentation, donnée par Olivier Azeau, avait pour but de présenter les principaux concepts de SOLID.
Là encore, l’intervenant s’est appuyé sur un jeu de son invention, qui consistait à résoudre des problèmes de conception, en se basant sur quelques règles simples.
Les personnes présentes représentaient des composants logiciels, à qui on confiait certaines tâches.
Le principe était particulièrement intéressant, malheureusement,  la présentation a eu un peu de mal à démarrer.
Pour rappel,les principes SOLID sont :

* __S__ ingle Responsability Principle : chaque composant est responsable d’une tâche
* __O__ pen/Closed : ouvert aux extensions, fermé aux modifications
* __L__ iskov substitution : polymorphisme
* __I__ nterface Segregation : un seul contrat par interface
* __D__ ependency injection : comme son nom l’indique

### Pilotage par les tests

L’exposé suivant de Jérôme Avoustin portait sur les différentes stratégies de développement basés sur les tests :

#### TDD : Test Driven Development

Les principes essentiels sont la validation de code, le fait que l’application reste centrée sur le besoin, et le refactoring intensif qui mène à une application facile à maintenir.
L’aspect refactoring est malheureusement souvent laissé de côté, le développeur ayant l’habitude de considérer avoir fini son itération une fois que les tests passent.
On peut ainsi considérer le cycle suivant :
Red -> Green -> Refactor -> Red -> Green -> Refactor -> …
On rédige les tests pendant la phase rouge, on écrit ensuite le code et on effectue le refactoring.

#### ATDD : Acceptance TDD

L’ATTD permet d’intégrer le client dans le processus, de réduire l’interprétabilité. Ce procédé aboutit à des spécifications par l’exemple qui ont l’avantage d’être exécutables.
On peut schématiser cette approche par : Vision -> User Stories -> Critères d’acceptance

#### BDD : Behaviour Driven Development

On décrit des comportements en associant un critère d’acceptance à chacun.
On utilise pour cela un DSL (Domain Specific Language) nomme le Gherkin, qui s’exprime sous la forme __Given__ _contexte_ __When__ _action_ __Then__ _resultat_

En définitive, les approches basées sur les tests demandent légèrement plus de temps, mais permettent d’avoir un code plus sûr, et d’éviter que le coût de développement d’une fonctionnalité n’augmente au fur et à mesure de l’avancement du projet.
Le refactoring est un point réellement important et le changement de culture n’est pas évident. Il ne faut pas chercher les 100% de couverture de code, certaines choses, comme les interfaces utilisateur sont difficiles à tester notamment.

Pour aller plus loin : [Le blog de Martin Fowler](http://martinfowler.com/)

### Prototypage agile

La présentation de Philippe Chaurand a démarré fort, avec la preuve par l’exemple du prototypage agile mis en place par David Guetta pour la conception de ses chansons, avec définition rapide d’un but pour la chanson, composition brouillonne dans la voiture, tests avec son ami, développement dans l’avion d’un prototype complet et tests utilisateurs le soir même dans une grande boîte. Tout pour faire un tube !

Place à la présentation plus exhaustive des différentes étapes pour un projet informatique.

#### Créer de la valeur

La proposition de valeur doit être définie avec le client, on peut pour cela utiliser des personnas (personnalisation des différents profils utilisateur) et définir des scénarios en les utilisant.
Le mieux reste encore de les tester lors d’entretiens et d’analyser les réactions.

Le prototype alors créé (souvent avec 3 bouts de papier) peut alors servir pour communiquer, récolter des fonds plus facilement, se rendre compte des difficultés techniques et vérifier l’intérêt. Les utilisateurs finaux seront vos meilleurs vendeurs !

#### Créer utile et réutilisable

On définit le MVP (Minimum Viable Product) à partir des User Stories priorisées. On lance alors des itérations de prototypage et développements. Le but dans un premier temps est de faire fonctionner le prototype, s’ensuit alors une phase de structuration de l’information, suivis par des prototypes d’interfaces (papier ou avec des outils) et enfin l’application d’un design visuel. N’hésitez pas à tester et lancer de nouvelles itérations en prenant en compte les retours et les points restants.

Pour aller plus loin : [The elements of Graphic Design](http://www.amazon.com/Elements-Graphic-Design-Space-Architecture/dp/1581152507) (pour ceux pas trop doués pour créer des interfaces graphiques), et en bonus les photos de l’évènement sur [Sharypic](http://att11.sharypic.com/)

### DDD et XP

Cette session nous a été présentée par Jean Baptiste Dusseaut et Fabien Bézagu.
DDD signifie Domain-Driven Design. On s’appuie donc sur une définition très claire du modèle métier et on fait en sorte de séparer le code métier du code technique.
Les relations avec le client sont cruciales, mais l’avantage est qu’on peut résumer la complexité de l’application à celle du métier.
TDD et DDD se couplent très bien et sont même assez complémentaires. L’eXtreme Programming apporte encore plus d’agilité à cette approche. Par XP, on entend bien entendu entre autre : programmation par paires, TDD, conception incrémentale…

Pour aller plus loin : [Le livre DDD d’Eric Evans](http://books.google.com/books/about/Domain_driven_design.html?id=7dlaMs0SECsC)

### Lorsque Scrum ne marche pas

Place encore une fois aux jeux d’Alexandre Boutin pour essayer d’expliquer les cas où “Scrum ne marche pas”. Ou plutôt, pour essayer de comprendre ce qui a fait qu’un projet basé sur Scrum a pu ne pas marcher.
L’assemblée a rapidement du se mettre d’accord afin de pouvoir “acheter” certains sujets au choix parmi une liste de sujets proposés.
Les sujets retenus furent :

* Les poules : parfois, certaines personnes ne se sentent pas impliquées dans le projet et ne tiennent pas leur rôle supposé de cochon (pigs Scrum). Les problèmes ne remontent alors plus et cela peut amener à de gros dysfonctionnements de l’équipe, de plus une reprise en main trop brutale de l’équipe risquerait de désintéresser les derniers restants…
* Les Geeks : Il faut des gens ouverts sur le domaine métier, et pas uniquement sur la technique.
* Casting du Product Owner : Le PO doit être le décisionnaire côté client.
* Contrat Agile : Scrum n’est pas adapté si le but premier est de faire un maximum de marge. Ainsi, il vaut mieux éviter pour du near ou off-shore. La contractualisation est un problème majeur. Il est conseillé de faire un contrat d’assistance technique pour les 3 ou 4 premières itérations, qui permettent de calibrer l’équipe et de se rendre compte de son rendement. Un forfait est alors fixé sur un nombre d’itérations et de points à traiter.

En définitive, dans tous les exemples présentés, ce n’est pas Scrum en lui-même qui n’a pas marché. Soit le fait d’avoir choisi Scrum n’était pas adapté au contexte, soit les principes n’ont pas été respectés.

### Agilité et rugby

La journée a été conclue par Patrice Lagisquet (ancien international de rugby et actuel entraîneur du Biarritz Olympique) et Olivier Flebus qui ont dressé un parallèle entre les valeurs prônées par les méthodes Agiles et le rugby. Les similitudes sont particulièrement frappantes, on comprend bien mieux pourquoi Scrum et ses concepts portent de tels noms !

Vous l’aurez compris, j’ai trouvé la journée particulièrement intéressante, j’espère avoir donné envie à quelques uns de m’y retrouver l’an prochain !

Encore Merci aux organisateurs !