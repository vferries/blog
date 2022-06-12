---
title: Websockets avec Kaazing
excerpt: "Séminaire didactique : Web et mobile temps réel avec HTML5 et Kaazing"
tags: [Websockets, HTML5, Kaazing]
modified: 2011-11-29
comments: true
---

![HTML5 Kaazing]({{site.url}}/images/kaazing.png)

Ce séminaire s’est tenu ce jeudi 24 novembre au soir à [La Cantine](http://lacantine-toulouse.org/), endroit privilégié du co-working sur Toulouse. Cette soirée était présentée par Bert Poller et Thomas Nicholis de chez ekito et le consultant Graham Gear de chez Kaazing qui a pris la relève en anglais en deuxième partie de soirée pour rentrer plus en détail dans les parties techniques.
Les questions furent nombreuses durant la soirée, et je me suis permis d’intégrer directement les réponses à ce post.

### Etat de l’art du web actuel

Comme vous le savez certainement, l’internet actuel est basé sur le protocole HTTP (Hyper Text Transfer Protocol). Le web est statique par essence, il repose sur un système de requêtes : le client interroge un serveur au moyen d’une requête GET ou POST (il en existe 5 autres mais si rarement utilisées qu’elles ne seront pas abordées ici), ce serveur répond alors en renvoyant une page HTML statique. L’impression de dynamisme apportée par les pages web provient du fait de la construction dynamique des pages avant leur retour côté serveur.

De plus, le web est stateless : il ne conserve pas d’état correspondant au client. Par défaut, rien ne relie deux requêtes envoyées à un serveur qui n’est donc pas sensé savoir vos actions passées. Des contournement ont vite été mis en place pour conserver un état sur le serveur, à savoir les sessions http ou les passages de paramètres. On utilise des méthodes diverses et variées (cookies notamment) pour s’identifier vis à vis du serveur. Cependant, cela implique de retransmettre à chaque requête des données d’identification dans les en-têtes de requêtes http envoyées. Celles-ci sont désormais assez lourdes et encombrent quelque peu le réseau. La plupart des en-têtes http font désormais entre 1 et 2ko, si on multiplie par le nombre de requêtes envoyées, cela peut vite représenter un encombrement non négligeable du réseau.

Ces contraintes ont donc poussé les développeurs web à imaginer des mécanismes de contournement assez complexes, et mal adaptés à une montée en charge. Les architectures machines et logicielles nécessaires ne sont plus vraiment adaptées aux problématiques qui ont émergé et aux usages actuels, plus nomades et riches que par le passé.

### Émergence de nouveaux besoins

Internet est devenu de plus en plus dynamique pour aboutir à ce que l’on appelle aujourd’hui le web 2.0. Cette interactivité a bien souvent du être “simulée” en l’absence de réel standard sur lequel se baser. Les applications RIA (Rich Internet Applications) qui se sont multipliées permettent de faire de plus en plus de choses, mais ont leurs limites et contraintes. Les communications, comme nous l’avons vu précédemment sont toujours initialisées par le client, et le serveur se contente d’y répondre. Comment faire si l’on veut être prévenu par le serveur si celui-ci dispose d’une nouvelle information à nous transmettre ? Doit-on demander régulièrement si des informations ont changé au serveur ? Cela ne risque-t-il pas d’engendrer du trafic réseau non nécessaire ?

De plus, avec l’émergence de gros groupes sur internet et une compétitivité accrue, les contraintes temps réel dans ces domaines sont désormais de l’ordre de la milliseconde. Pour vous donner un ordre d’idée, Amazon estime perdre 1% de ses ventes pour une latence de 100ms et Google évalue à 20% la perte de trafic qu’engendreraient des réponses de plus de 0.5 secondes aux requêtes.

De nombreuses solutions techniques ont vu le jour pour répondre à ce problème. La plus connue et efficace est certainement le long-polling : le client demande au serveur une information, si celle-ci est disponible, le serveur la retourne directement, s’il n’a rien a transmettre, il attend d’avoir une nouvelle information avant de transmettre sa réponse. Le client redemande alors directement de nouvelles informations au serveur et ainsi de suite. Cela contourne quelque peu le problème mais requiert d’utiliser des solutions propriétaires (les plus connues étant sans doute basées sur Ajax/Comet).

Les autres contraintes à êtres nées sont liées au développement des plateformes mobiles, que ce soit pour les smartphones, ou encore les tablettes etc. Les besoin en terme de portabilité des applications grandissent continuellement, les systèmes d’exploitation se multipliant. Internet répond parfaitement à ces contraintes si on met de côté ses problèmes évoqués précédemment. Si ces contraintes sont comblées, il constitue une excellente alternative pour bon nombre d’applications lourdes.
La dernière contrainte concerne les coûts de mise en œuvre des solutions et de l’architecture hardware à mettre en place.

### HTML5

HTML5 essaie de répondre à ces problématiques, et apporte quelques autres améliorations. On peut citer par exemple un meilleur support multimédia : plus besoin de passer pas un conteneur flash pour intégrer une vidéo ou de la musique à vos pages web! Tout ceci sera désormais géré nativement par votre navigateur. On se passera donc volontiers plus souvent des solutions propriétaires qui ne répondent qu’à leurs propres standards.

Il est aussi dorénavant possible de stocker un certain nombre de données en local. Il est donc possible de créer des applications en mode semi-connecté, avec de la synchronisation entre vos données locales et distantes. Cela évitera un certain nombre de pertes d’informations dans le cas où votre connexion au réseau viendrait à être coupée.

Le drag & drop (glisser/déposer pour les puristes de la langue française) est désormais géré nativement lui aussi, les webworkers permettent de lancer des tâches en parallèle (à la manière des threads Java).

Mais ce qui nous intéresse vraiment ici pour répondre aux problématiques que nous avons soulevées s’appelle les websockets !

### Websockets

#### Full-duplex

Les connexions websocket sont basées sur l’utilisation d’un socket TCP (Transmission Control Protocol). Elles sont bidirectionnelles et full-duplex. Ils sont prévus principalement pour les navigateurs et les serveurs web, mais peuvent potentiellement aussi être utilisés par n’importe quel type d’application. Le principal intérêt de cette solution est que c’est une amélioration de la connexion http utilisée, et qu’on passe donc toujours par le port 80, classiquement ouvert dans les firewalls.

#### Handshake

Les ouvertures de connexion websocket sont négociées au moyen d’une requête qui ressemble fortement à une requête HTTP (mais n’en est pas tout à fait une).
Cette négociation est effectuée par défaut sur le port 80 (ou 443 dans le cas du protocole https) et ne posera donc normalement pas de problème aux proxys (sauf peut-être à des reverse proxys vraiment trop rigoureux).
Cependant, il faudra certainement attendre la mise en conformité des routeurs/reverse proxys du marché au fur et à mesure pour que les websockets HTML5 soient pleinement supportés.

Nous allons voir ici un exemple de cette négociation.
Le client demande tout d’abord à mettre à jour la connexion en utilisant un websocket :

~~~
GET /ws HTTP/1.1
Host: pmx
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Version: 6
Sec-WebSocket-Origin: http://pmx
Sec-WebSocket-Extensions: deflate-stream
Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==
~~~

Le serveur y répond alors :

~~~
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: HSmrc0sMlYUkAGmm5OPpG2HaGWk=
~~~

Comme on peut facilement le voir dans cet appel, la communication peut être basée sur une clé de cryptage. Les données transmises peuvent être facilement sécurisées en passant par le TLS (Transport Layer Security).

#### Des messages très légers

Un gros avantage par rapport à l’envoie de requêtes http est la réduction conséquente des en-têtes. On passe d’en-têtes de plusieurs milliers d’octets (2 ou 3ko bien souvent) à des en-têtes de 6 à 10 octets.

Il faut aussi noter que ce mode push où le serveur peut transmettre directement des informations à ses clients permet d’économiser les précieuses batteries des téléphones et autres tablettes. Côté serveur, un thread aura en charge une multitude de sockets, ce qui permet de conserver une infrastructure simple et légère et de ne pas surcharger inutilement les ressources pour chaque websocket ouvert. Dans le cas d’un rechargement de page, ou d’une fermeture d’onglet ou de page, le navigateur a à sa charge de fermer les connexions websocket précédemment ouvertes (et d’en rouvrir une nouvelle si nécessaire). Cela permet de ne pas conserver inutilement des sockets qui ne seraient plus utilisés.

### Ce que Kaazing apporte de plus

Kaazing est une startup américaine, basée dans la Silicon Valley et fondée en 2007 par d’anciens experts réseau d’Oracle. Ils ont contribué grandement à la mise en place du standard websockets dans la spécification HMTL5. Ils en proposent une implémentation sous licence (petits portefeuilles s’abstenir) intégrant un grand nombre de solutions à différentes problématiques.

Cette solution est déclinée en 4 offres, basées sur 4 technologies différentes côté serveur : HTML5, JMS ([Java Message Service](http://java.sun.com/developer/technicalArticles/Ecommerce/jms/)), AMQP ([Advanced Message Queuing Protocol](http://www.amqp.org/))et XMPP ([Extensible Messaging and Presence Protocol](http://xmpp.org/)). Libre à vous donc de choisir celle qui correspond le mieux à vos utilisations habituelles.
Kaazing a été conçu pour le temps réel, les performances sont donc sensées avoir spécialement été pensées. L’architecture est simplifiée, ce qui facilite la mise en clusters.

Une librairie JavaScript est fournie pour la partie cliente afin de permettre d’utiliser des substituts en cas de client non compatible avec les standards HTML5. Tous les navigateurs sont ainsi supportés, même si les performances sont moindres sur ceux qui ne supportent pas les websockets.

Enfin, Kaazing est la 1ère implémentation de Kerberos sur WebSockets sur les websockets.

### Est-ce que cela existe aussi en Open Source ?

Oui et non, des solutions Open Source existent pour la plupart des points soulevés, mais pas pour tous à la fois.
Les solutions tardent quelque peu à voir le jour mais on peut citer :

* [APE (Ajax Push Engine)](http://www.ape-project.org/)
* [socket.io](http://socket.io/)
Il y en a sûrement plein d’autre mais j’avoue ne pas en avoir encore connaissance, n’hésitez pas à rajouter un commentaire pour que nous en ajoutions.

### Les différentes démos

La soirée a été ponctuée de démos en direct live. Celles-ci sont pour la quasi totalité présentes sur le site web de Kaazing, et je vous invite à aller [les tester par vous-même](http://kaazing.com/demo) !

La première à nous avoir été présentée était l’application Trader. Il s’agit d’une plateforme de trading, pour suivre en direct l’évolution de cours de la bourse et pouvoir passer des ordres d’achat ou de vente en direct live. Ce type d’applications n’est pour l’instant mis en pratique que dans des applications lourdes du fait de la réactivité nécessaire. Les websockets permettent de mettre à jour toutes les valeurs de telles applications en temps réel, à des fréquences de l’ordre de la milliseconde.
De nouvelles portes s’ouvrent définitivement aux applications web !

La seconde démo, encore plus sexy consistait à piloter une voiture modélisée en 3D dans la fenêtre du navigateur du présentateur au moyen d’un iPhone 4, en se connectant directement à une url. Les temps de réponse semblaient réellement très faibles.

Enfin d’autres démos ont montré la possibilité d’appliquer les principes des topics JMS avec les websockets.
Les clients peuvent alors s’enregistrer directement auprès du serveur pour recevoir les informations en temps réel.
Le serveur se contente ensuite simplement de publier des informations qui sont alors transmises à l’ensemble des clients à l’écoute.

Merci donc aux organisateurs pour cette soirée pour le moins intéressante.