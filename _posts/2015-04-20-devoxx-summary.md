---
layout: post
title: Devoxx 2015
excerpt: "Et sinon, Devoxx c'est toujours aussi bien ?"
tags: [architecture, agilité, gestion de projets]
modified: 2015-04-20
comments: true
image:
  feature: bandeau_devoxx.jpg
  credit: Devoxx Team - gros flag
---

La rédaction des posts sur Aurelia me prend beaucoup de temps, bien plus que je ne l'avais prévu, j'en profite pour prendre un peu de recul et faire le point sur les quelques jours passés à Paris la semaine dernière.

Je vous ai déjà détaillé tout ce que j'avais vu lors de mon Devoxx France 2015, mais pas vraiment ce que j'en avais pensé globalement et ce que je pense des technos de demain. Il y a du bon et du moins bon, cette année n'a pas été aussi magique pour moi que les deux précédentes : mon tout premier Devoxx il y a deux ans et mon premier Devoxx en tant que speaker l'an dernier.

### Le scandale des sacs biodégradables

Pour commencer, parlons d'une des choses auxquelles je suis le plus sensible : la nourriture. Un salad bar ainsi que des petits sacs biodégradables étaient à notre disposition tous les midis en plus du petit déjeuner au moment de l'arrivée. C'était plutôt bon, mais les rations étaient quelque peu serrées à mon goût. Et malheureusement pas grand chose de consistant à se mettre sous la dent entre les conférences. Un peu dommage donc que les petits-déjeuners soient pliés si vite et que les exposants n'aient pas prévu un peu plus de nourriture consistante ici et là. On a quand même eu droit à des bonbons, des barbes à papa et du popcorn mais c'est à peu près tout.

Je suis bien loin d'être le premier à en parler, mais les repas étaient servis dans des sacs en toile et j'ai été horrifié de voir tant de sacs biodégradables partir ainsi à la poubelle sans être recyclés. Pour tout vous dire, j'en ai récupéré pour les garder, ils étaient plutôt mignons et ça fera ça de moins à la poubelle.

Je ne suis pas un ultra défenseur de l'écologie, j'essaie juste de faire un peu attention à ne pas gaspiller pour rien. Je ne suis pas végétarien, me déplace souvent en voiture, mais voir des double ou triple emballages m'horrifie. Du genre un emballage individuel pour des bananes, des sachets pour la cuisson du riz ou autres bétises du genre. Et là j'ai été servi.

### Impression générale

Peut être que c'est lié au fait que je vieillis, peut être aussi qu'au 3ème Devoxx qu'on fait on se lasse de certaines choses, mais j'ai trouvé globalement le niveau des présentations auxquelles j'ai assisté moins bon que les fois précédentes.

Cela peut vraiment s'expliquer de multiples façons. J'ai peut être fait des choix assez mauvais liés au fait que le niveau de difficulté des présentations et des sessions n'était pas indiqué sur les programmes papier, ni sur Voxxrin que j'utilisais pour faire mon planning. J'ai donc assisté à beaucoup de présentations où je n'ai pas appris énormément de choses, mais je mets ça sur le fait qu'elles devaient s'adresser à des novices sur des technos dont je connaissais un peu les fondements.

J'ai été aussi particulièrement désagréablement surpris sur deux sessions, la première où le présentateur, bien qu'ayant proposé un titre assez générique, nous a surtout parlé d'à quel point son produit propriétaire était mieux que les solutions Open Source concurrentes, et d'un atelier qui ne correspondait pas du tout à sa description.

### Java

On entre dans un an et demi à deux ans qui s'annoncent assez pauvres côté Java et Java EE. Il y a bien la programmation réactive et Java 8 qui commence à peine à rentrer dans les moeurs et dans les entreprises mais rien de très brillant à l'horizon. Java 9 n'est pas prévu avant 2016 notamment.

Côté Java EE j'ai l'impression que c'est encore pire. Cela fait quelques temps que j'ai commencé à faire des applications Jave EE 6, puis Java EE 7 avant de finalement lâcher le morceau et basculer sur Spring. Aucun serveur d'application Java EE avec support n'implémente Java EE 7, comme si aucune entreprise ne demandait de support là dessus. Il y a bien JBoss Wildfly 8, la version communautaire qui tourne, mais pas de nouvelle d'un éventuel JBoss EAP 7. Côté Websphere ils en sont encore au JDK 6 par défaut alors bon... Avant de passer à Java 8 et Java EE 7, autant dire que de l'eau risque de couler sous les ponts. Et là je ne parle même pas de JSF. Déjà qu'il allait pas super bien, je le pense mort et enterré.

Le renouveau est donc plutôt côté Spring, avec Spring Boot et de nouvelles approches comme JHipster avec son générateur d'applications basé sur Yeoman. Oui oui, vous avez bien entendu, maintenant c'est les développeurs JavaScript, après avoir récupéré et copié tout l'éco-système et les outils qu'on avait côté Java qui nous donnent des leçons. J'en suis ravi !

Le deuxième point qui fait qu'à mon humble avis les serveurs d'application vont y passer c'est l'adoption assez massive de Docker et ses conteneurs. Ceux-ci font le travail d'isolation qu'avaient à charge les serveurs d'application. Il suffit alors de lancer un jar, même pas besoin de conteneur de servlets ! J'ai bien aimé le fait que David Gageot dise en substance, je n'ai plus les mots exacts, que Docker était déjà passé plus ou moins dans les moeurs et qu'il devait être désormais considéré comme un acquis pour les développeurs.

Tout ce qui tourne autour du BigData a encore le vent en poupe. Et Java a encore un bon pied là dedans, c'est rassurant.

### Web

Le web par contre est en plein bouillonnement. JavaScript a évolué en 5 ans plus que tous les autres langages en 10 ou 15 ans. C'est un terrain de jeu formidable, même s'il n'est effectivement pas toujours évident de détecter les technologies qui seront pérennes de celles qui vont y passer dans d'atroces souffrances.

Avec l'arrivée cet été d'ES6, la nouvelle génération de frameworks pointe le bout de son nez (Angular 2, Aurelia, React). Les frameworks de développement d'applications web pour le mobile montent aussi en puissance (React Native, Ionic framework), l'année risque d'être chargée de ce côté.

Côté spécifications ça avance aussi, notamment avec les webcomponents (les nouveaux frameworks reprennent d'ailleurs fortement ces concepts) ou encore les service workers.

### Conclusion

Je tenais quand même à dire un petit merci pour  les Ignite Talks, j'adore ce format assez rafraichissant, ça fait du bien de changer un peu d'angle et de type de talks.

Il va vraiment y avoir encore du boulot cette année pour se tenir à jour, notamment côté web. Mais qu'y a-t-il de plus excitant dans notre métier ? Devoxx reste quand même l'occasion de croiser plein de monde, de voir qu'on n'est pas le seul dans ce bateau. Ca redonne l'envie de faire et de changer plein de choses.

Merci à toute l'organisation pour le boulot abattu, ça reste une référence comme conférence. La gestion de la montée en charge à 2500 personnes s'est plutôt bien faite, même si on se retrouve encore avec des salles bondées 15 minutes avant le début des sessions.

A l'an prochain là bas j'espère !
