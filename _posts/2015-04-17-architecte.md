---
layout: post
title: Avant je voulais être architecte
excerpt: "Mais ça c'était avant"
tags: [architecture, agilité, gestion de projets]
modified: 2015-04-17
comments: true
---

Comme certains doivent déjà le savoir, cela fait désormais 8 ans que je travaille, et j'ai toujours été en Société de Service en Informatique Industrielle. Oui oui, il s'agit là des fameuses SSII, récemments renommées Entreprises de Services du Numérique ou ESN. C'est dire à quel point leur nom était connoté pour avoir besoin d'en changer. Je n'ai fait que deux entreprises en tant qu'employé de longue durée mais j'ai eu le loisir de changer de mission régulièrement et donc de voir un peu de pays.
On voit toujours du bon et du moins bon, on a tendance à focaliser sur le moins bon, ce que je dirai ici n'engage que moi et représentera surtout le côté sombre de la chose, pas la totalité de mon opinion.

### L'architecte

Je me suis vite aperçu que j'étais très intéressé par les aspects techniques et un peu obsédé par le refactoring. Ne sachant pas trop comment gérer cela vis à vis de mes collègues à l'époque, cela a parfois été à deux doigts de me jouer des tours.
J'avais du coup pris l'habitude de systématiquement demander avant de faire un refactoring qui me semblait important et qui allait impacter le code d'une des autres personnes[^1] de l'équipe. Les chefs de projet avaient alors tendance à refuser par manque de temps[^2]. Quand on me demandait ce que je voulais faire à l'époque, je répondais que je voulais devenir architecte sans sourciller.

[^1]: C'est marrant cette notion de propriété du code... Cela encourage à ne surtout pas montrer qu'on a fait du sale boulot, et à ne surtout pas toucher l'existant de peur de tout casser. C'est juste dangereux et contre productif.
[^2]: Alors que rétrospectivement, il n'y a rien de plus coûteux qu'une dette technique qui augmente fortement et empêche toute évolution de l'outil à terme.

J'ai d'ailleurs quitté ma boîte précédente parce qu'ils cherchaient à m'éloigner de mon travail quotidien en me poussant vers de la gestion de projet. Tout le monde le dit désormais, même si les directions ne semblent toujours pas avoir compris, mais gérer une équipe n'a rien à voir avec le développement d'une application.

En parlant d'architecte, l'un des rares que j'ai vraiment croisé m'a certifié qu'il falait toujours utiliser des associations eager plutôt que lazy sur des relations entre entités Hibernate. Mon opinion sur les architectes a complètement changé peu après ça. Attention, je ne dis pas qu'il ne faut pas d'architecte, mais à mon humble avis il y en a beaucoup trop. Un architecte doit être le garant du bon fonctionnement au niveau de l'entreprise, et devrait donc avoir en charge de définir ce qui doit être utilisé pour faire le pont entre les services, par exemple un ESB d'entreprise. Il ne devrait en aucun cas prendre les décisions  projet à la place de l'équipe de développement. Je m'explique : bien souvent, les architectes imposent des technos ou des architectures parce que sur le moment ça leur semble être la bonne solution. L'équipe se retrouve alors sur une solution qu'elle ne comprend pas, et ne peut que très difficilement proposer des améliorations, étant donné qu'une personne, à priori plus qualifiée qu'eux a déjà fait supposément les bons choix.

Et ça se gâte encore plus quand l'architecte en question n'a pas touché un clavier depuis un peu trop longtemps. Les solutions mises en place ne sont que très superficielles, ce n'est pas avec une mini maquette qu'on lève tous les problèmes qui seront rencontrés durant la vie du projet. Pour moi les décisions techniques devraient être prises de concert entre les membres de l'équipe de développement, jamais imposées. Et quand bien même elles étaient imposées, il faudrait qu'il y ait un vrai suivi et un accompagnement des équipes pour les former aux choix pris[^3].

[^3]: Et ça par contre, je ne l'ai jamais vu fait nulle part.

### Le chef de projet

Je ne vais pas refaire un long pamphlet contre eux, leurs oreilles sifflent déjà à longueur de journée. J'ai croisé de bons chefs de projet [^4], je suis persuadé qu'il y en a un certain nombre. Mais arrêtez de les prendre pour des managers, cela ne devrait rien avoir à voir. Un bon chef de projet est un chef de projet qui laisse les choix à son équipe, fait tout pour leur simplifier la tâche et les couvrir en cas de pépin. Cela ne devrait pas juste être celui qui remplit des MS Projects bidons avec des estimations au doigt mouillé complètement fausses et qui vous râle dessus quand vous êtes en retard, ou vous décourage d'être force de proposition et de vous soucier de la dette technique.

[^4]: Y ENNN A DES BIEEEEENS (merci Didier Super)

### Le coach agile

C'est fête, approchez, il y en aura pour tout le monde ! Voila un rôle que j'ai du mal à comprendre et à apprécier. C'est très certainement lié à l'application actuelle de l'agilité dans beaucoup d'entreprises. Je vais me baser ici, comme beaucoup l'ont déjà fait avant moi sur le manifeste agile. C'est marrant, ça me fait penser aux interprétations par certains fanatiques de textes _saints_. Trève de bavardages, je commence.

Prenons les phrases du [manifeste agile](http://agilemanifesto.org/iso/fr/) :

* `Les individus et leurs interactions plus que les processus et les outils`. Quand on me parle d'agilité et que je demande de quoi il s'agit, 9 fois sur 10 on me répond : on fait du Scrum. Qu'est-ce que c'est que Scrum si ce n'est _Yet Another Process_ ? Pourquoi avoir besoin d'un cadre supposément si rigide pour appliquer des concepts qui selon moi tiennent du bon sens ? Encourager la discussion dans l'équipe, oui, clairement. Considérer l'autre comme une aide et non un concurrent, prendre en considération les désirs même changeants du client, je ne m'y opposerai pas, mais pourquoi vouloir à tout prix encadrer ça dans un processus avec whatmille bouquins écrits sur le sujet ?
* `Des logiciels opérationnels plus qu’une documentation exhaustive` donc des trucs branlants qui marchent, jusqu'à la prochaine modification. Après tout s'écroule, comme ça on vend plein de TMA.
* `La collaboration avec les clients plus que la négociation contractuelle`, allez dire ça à mes responsable, à mon commercial et aux services achat. Il y a vraiment un problème pour vendre l'agilité à un client, c'est indéniable.
* `L’adaptation au changement plus que le suivi d’un plan` donc les spécifications vous allez vous asseoir dessus, il va vous falloir deviner ce dont on a besoin. Ah au fait, il n'y aura personne sur le sujet de notre côté pour les 3 prochains mois.

L'aversion que j'ai pour les coachs est très certainement liée au rapport financier qui lie le coach et le coaché. Un coach n'a par définition aucun intérêt à ce que votre situation s'améliore vraiment sinon vous n'aurez plus besoin de lui. Je suis méfiant vis à vis des dentifrices conseillés par les dentistes, ou de ce qu'essaie de me vendre un pharmacien comme médicament. Alors vous me répondrez certainement qu'ils sont là pour aider à la transition, pour que ce soit moins douloureux. Il ne faut pas oublier que ce type de transition est particulièrement violent pour un certain nombre des employés qui n'y trouveront pas leur compte. Des fois, je vois le passage à l'agilité comme une nouvelle forme de plans sociaux. Je n'ai pas non plus une très bonne opinion des gens embauchés juste pour en débaucher d'autres. J'imagine qu'il y a des cas où ça a dû être nécessaire, mais je considère ça comme un _sale boulot_.

Du coup, l'idéal serait que tout soit posé en amont, que le contrat soit clair d'entrée de jeu. Pourquoi ne pas forker l'entreprise à ce compte là ? En créant de plus petites entreprises soutenues financièrement par la grosse entité et où il serait clair d'emblée que la hiérarchie est applatie ?

### Et moi dans tout ça ?

Moi je suis sûrement encore plus extrémiste que les gens que je critique dans ce billet. Vous avez bien entendu un droit de réponse, en commentaire. Ou encore mieux, je serais ravi d'en discuter avec vous autour d'une bonne bière. Parce qu'il n'y a pas de point de vue qui ne puisse être débattu. Notre métier est en pleine redéfinition et j'en suis ravi. Les opportunités sont nombreuses, j'espère qu'on arrivera à en faire quelque chose de bien.

### Problèmes de focus

Je ne pense pas être le seul, mais je ne suis capable de vraiment me concentrer sur un sujet pendant toute une journée que si le sujet me passionne. Et très honnêtement, au travail cela ne m'est pas arrivé souvent du tout. Pour tout avouer, je travaille effectivement sur les tâches qui me sont assignées moins de 50% de mon temps. Cela peut sembler extrêmement faible à certains, ou énorme pour d'autres. J'imagine que personne n'est à la même enseigne vis à vis de cette capacité de focus, mais j'estime important d'entendre que vous n'êtes pas les seuls. Je me suis souvent posé la question, s'il y avait quelque chose qui clochait avec moi, si j'étais juste incapable de bosser vraiment à ce qu'on me demandait. J'ai fini par comprendre que c'était ma façon de prendre du recul sur les soucis que je rencontrais et que c'était au fond ce qui m'était demandé dans mon travail de conseil.

Attention, cela ne veut pas dire que je passe ma journée à jouer à Candy Crush, ou à traîner sur les réseaux sociaux. En bon apprenti craftsman qui se respecte j'affute mes outils : je fais de la veille technologique, j'apprends des choses qui me permettront par la suite d'être plus rapide dans mon travail, d'avoir une ouverture d'esprit et un recul plus grands sur les problèmes que je rencontre. Et jusqu'ici, j'ai plutôt l'impression que cela ne marche pas trop mal.
