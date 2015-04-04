---
layout: post
title: GWT et les architectures en couches
excerpt: "Point sur les lourdeurs inhérentes à GWT"
tags: [GWT, Dozer, Gilead]
modified: 2012-05-21
comments: true
---

Les problèmes présentés dans cet article ont été soulevés lors d’une assistance sur un projet GWT. Celui-ci est basé sur une architecture en couches (couche modèle Hibernate, avec Daos, services, Dtos, le tout relié par Spring).

### Axes d’étude pour des simplifications Modèle/GWT

Le problème principal vient de l’utilisation d’un grand nombre de couches et de l’absence quasi totale de discussion entre ces couches. Il nous est nécessaire de réécrire systématiquement des clones de nos objets métiers sous la forme de DTOs, et d’effectuer les conversions dans les deux sens.
On a identifié 3 approches pour le problème des DTO, au final seules deux sont viables : Gilead est en fait le “nouveau” nom d’Hibernate4Gwt. Cependant, ma recherche d’informations sur Gilead m’a poussé vers une 3ème solution.

#### Dozer

En ce qui concerne Dozer, il est toujours nécessaire d’écrire les objets DTO, mais en plus on doit écrire un fichier xml de mapping entre les deux. La plupart des propriétés de base seraient récupérées automatiquement, mais on rajouterait encore un fichier à écrire dans la plupart des cas. Il perd donc à mon sens grandement de son utilité étant donné qu’il aurait juste remplacé les quelques lignes de codes que l’on trouve dans chacun des services (sans même préciser qu’il faudrait configurer Dozer et lui indiquer où se trouvent ses fichiers de mapping). Je crains au final qu’en l’utilisant, on se retrouve à rajouter encore une couche alors qu’on estime déjà en avoir trop.

#### Gilead

Les classes du modèle métier doivent étendre LightEntity (pas très grave en soi).
Les services distants RPC doivent étendre PersistentRemoteService et non plus RemoteServiceServlet (là encore, ce n’est pas très impactant).
Mettre en place la configuration de l’HibernateUtil et l’utiliser dans les services.

Cela impliquerait quand même plusieurs choses en plus des petites configurations citées ci-dessus :

* supprimer tout le module DTO.
* modifier tous les services pour qu’ils retournent directement les objets du modèle et non plus ces objets convertis en DTOs.
* Changer côté webapp tous les objets utilisés par leurs équivalents dans le modèle métier.

Le gain serait non négligeable (surtout pour les développements futurs), mais le coût semble assez élevé.

De plus, Gilead est considéré comme inactif depuis près d’un ou deux ans. Ses sources restent ouvertes, mais le développeur principal ne travaillant plus sur ce type de technos avoue s’en désintéresser. Par contre, celui-ci pointe vers le RequestFactory intégré à GWT auquel je vais jeter un oeil.

#### RequestFactory

Cela semble être une approche totalement différente aux appels RPC (on passe par une autre Servlet pour les appels). Le tout est alors basé sur le modèle métier et non plus sur la notion de service.
Cela forcerait à repenser la quasi totalité de l’application…
Par contre, cette approche supporte la JSR303 (bean validation), ce qui permettrait de gérer les problèmes de validation d’objets directement sur les objets métier.
Dans ce cas aussi, il est nécessaire de passer par des DTOs, mais qui sont spécifiques à l’utilisation du RequestFactory.

[https://developers.google.com/web-toolkit/doc/latest/DevGuideRequestFactory](https://developers.google.com/web-toolkit/doc/latest/DevGuideRequestFactory)

Il faudrait lancer un chantier de grande ampleur si on voulait tirer bénéfice de cette approche.

### La problématique Google

Google vient de très récemment (appris à Devoxx) de faire basculer ses meilleurs développeurs de GWT vers DART.

[http://www.bizjournals.com/atlanta/blog/atlantech/2012/04/google-said-to-move-engineering-ops.html](http://www.bizjournals.com/atlanta/blog/atlantech/2012/04/google-said-to-move-engineering-ops.html)

La communauté GWT se pose des questions sur ce mouvement. Google va répondre à cette attente … bientot mais on ne connaît pas la nature de l’annonce :

[https://plus.google.com/u/0/+RayCromwell/posts/NnSqFaQRRJx](https://plus.google.com/u/0/+RayCromwell/posts/NnSqFaQRRJx)

### Conclusion

La véritable question qui se pose au final est celle de la lourdeur de l’utilisation de GWT pour ce type d’application.

GWT est parfaitement adapté à des applications où la composante IHM est très importante et demande beaucoup de flexibilité : drag & drop, IHM flexible, applications type GTalk.

Toutefois, cette technologie est assez verbeuse dans le cas de la manipulation d’un modèle métier telle que nous l’avons initié dans le projet (hibernate). Cette verbosité ne peut etre éliminée qu’en utilisant des frameworks additionnels : Gilead est le meilleure candidat, malheureusement, le développeur nous a indiqué qu’il ne maintiendrait plus ce Framework.

D’autres solutions possibles sont : Request Factory (REST : à valider), mais cela demande des investissements lourds.
La question de GWT sur le long terme se pose aussi : cf [news google d’Avril](http://www.bizjournals.com/atlanta/blog/atlantech/2012/04/google-said-to-move-engineering-ops.html).

GWT est toutefois un framework stable et efficace malgré sa lourdeur réélle.