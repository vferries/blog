---
title: Introduction à Kubernetes
excerpt: "Une introduction aux grands concepts, avec un peu de phonétique dedans"
tags: [kubernetes, OPS]
modified: 2021-05-17
comments: true
---

![Kubernetes]({{site.url}}/images/kubernetes-logo.png)  

J'ai eu à développer des cron jobs sous Kubernetes récemment dans le cadre d'une de mes missions. J'ai dû en apprendre les bases et ai depuis quelque peu approfondi le sujet.  


Je vais tenter un axe d'approche un peu différent de celui qu'on trouve la plupart du temps, une sorte de guide de survie avec quelques trucs et astuces glânés dernièrement sur le sujet. Le but est donc de proposer une vue d'ensemble de ce qu'est Kubernetes, de comment il marche et de ce qu'il propose.

### Prononciations

Il y a plusieurs prononciations admises pour certains des outils qui gravitent autour de Kubernetes. On va juste en passer ici quelques unes en revue. Pas la peine de m'incendier, il en existe d'autres mais celles-ci sont communément admises, et vous permettront de briller en société.  


Sachez avant tout qu'on dit **koubernétis** (Koo-ber-neh-tees en anglais).
Pour **kubectl**, je vous laisse regarder [Le guide définitif de prononciation](https://www.youtube.com/watch?v=2wgAIvXpJqU). 3 minutes bien dépensées !  


Et quelques bonus pour la route :
- k8s  -> keits
- etcd -> etsi di
- kubelet -> koub let

### REST

Tous les objets manipulés par Kubernetes sont des ressources REST, au sens le plus pur du terme.  


Etcd est une sorte de base de données des objets déclarés dans votre cluster Kubernetes. Elle contient toutes les définitions des objets qu'on veut que Kubernetes instancie et gère. Ces données sont exposés au travers de l'API Server.  


kubectl, l'outil en ligne de commande fourni pour manipuler vos clusters Kubernetes ne fait qu'émettre des requêtes REST vers l'API Server. Certaines fonctionnalités de type watch utilisent en outre des websockets pour discuter avec l'API Server, on peut par exemple citer le watch sur les logs.

### Declaratif versus Impératif

Kubernetes est basé sur un modèle déclaratif plutôt qu'impératif. On déclare qu'on veut toujours avoir 3 instances d'un pod qui tournent, et non qu'on veut lancer 3 pods.  


La différence entre les deux est majeure. En cas d'erreur ou d'incohérence, il est alors capable de régler la plupart des problèmes lui-même. Il va par exemple relancer un pod qui aurait crashé, vous évitant de devoir vous lever à pas d'heure pour régler l'incident.  


Afin de conserver cet aspect déclaratif, il est fortement conseillé de déclarer les objets qu'on veut instancier dans des fichiers plutôt qu'en ligne de commande pour éviter qu'à la personne suivante qui passe on écrase des valeurs.  


Cela permet d'autres avantages comme de la gestion de configuration de ces fichiers (sous git), les relectures de code etc.  


Des Controllers effectuent ce qu'on appelle des boucles de contrôle.
Il vont en effet régulièrement interroger l'état du cluster (kubelet fournit ces infos pour chacun des noeuds) et comparer cet état avec celui qui a été demandé. Au besoin, il va demander l'instanciation de nouveaux objets kubernetes, par exemple des pods ou en tuer certains.  


Le scheduler se charge quand à lui de déterminer sur quels noeuds doivent être lancés les pods manquants.

### Types d'objets manipulés et leur utilité

#### Nodes

Il ne s'agit pas à proprement parler d'un objet directement manipulé par Kubernetes mais plutôt des différents éléments qui composent votre cluster. Ils représentent des machines (virtuelles ou pas) sur lesquelles Kubernetes va pouvoir déployer des pods.

#### Pod

Un Pod est la plus petite unité de déploiement gérée par Kubernetes. Il se base sur des images de containers (docker le plus souvent). Plusieurs containers peuvent tourner à la fois dans un même pod, généralement si ils ont un besoin impérieux de partager certaines ressources.

#### ReplicaSet

Permet de définir un nombre voulu de réplicats d'un pod à faire tourner dans le cluster. Il compare régulièrement le nombre de réplicats demandés et instancie ou détruit des pods si l'état courant du cluster n'est pas en adéquation.

#### Deployment

Surcouche des ReplicaSets qui permet de faire des montées de version sans downtime, soit en changeant le nombre de réplicats, soit en changeant la version des applications déployées.
Un Deployment va utiliser plusieurs ReplicaSets pour arriver à cet objectif, scalant simultanément le ReplicaSet de l'ancienne version et celui utilisé pour gérer les pods de la nouvelle.

#### StatefulSets

Les StatefulSets sont très proches des Deployment. Ils fournissent par contre en plus une identité fixe pour chacun des pods instanciés (numérotés de 0 à N-1). Cela permet notamment de déployer des logiciels dont les différentes parties ont besoin de se connaître, comme des bases de données distribuées, ou encore un Kafka.

#### DaemonSet

Assez similaire aux ReplicaSets et Deployments, mais pour faire tourner un pod sur chacun des noeuds du cluster. Cela permet notamment de rajouter certaines fonctionnalités à notre cluster. Un exemple peut être de l'aggrégation de logs ou du monitoring.

#### Service

Expose un ensemble de pods au sein du cluster. Définit le load balancing à appliquer sur ces pods.

#### Ingress

Définit l'accès depuis l'extérieur aux ressources du cluster. Le plus souvent via HTTP. L'implémentation d'Ingress est laissée à la charge des différents Cloud Providers, Kubernetes ne définit qu'un template.

#### Jobs

Ils sont de deux types : Jobs et CronJobs. Le premier est un processus à lancer de façon unitaire, une action de maintenance. Le second est un cron, qui va donc lancer une action de façon récurrente. On l'utilise souvent pour des tâches de nettoyage.

### Découplage avec labels et selectors

Kubernetes est basé sur les retours d'expérience des OPS chez Google. Un de leurs mantras est d'éviter un maximum les couplages forts.  


Pour ce faire, les liaisons entre la plupart des objets manipulés sont définies par des labels qu'on pose sur les éléments et des sélecteurs qu'on définit sur les objets qui les manipulent.  


Cela permet par exemple aux définitions de services de lister les pods qui les concernent, en définissant un sélecteur sur les labels des pods (le nom de l'application par exemple). Ce mécanisme est aussi utilisé afin de qualifier les noeuds sur lesquels un pod peut être déployé, par exemple en précisant qu'on veut que le noeud dispose d'un label ***ssd***.  


Ce couplage est donc faible et basé sur des conventions. Libre à nous de rajouter des labels et des mécanismes pour en tenir compte dans les fonctionnalités qu'on ajoute à un cluster.  

### Conseils de lecture

Les deux livres qui reviennent souvent quand on parle du sujet sont :

- [KubernetesUp & Running](https://www.oreilly.com/library/view/kubernetes-up-and/9781491935668/): Plutôt axé développeurs, il reprend toutes les bases nécessaires si vous développez des applications destinées à être livrées sur Kubernetes.
- [Managing Kubernetes](https://www.oreilly.com/library/view/managing-kubernetes/9781492033905/): Celui-ci est plus axé OPS. C'est un peu moins mon profil mais cela permet de creuser certains aspects du sujet.  

Je prévoie de refaire une liste de mes lectures récentes prochainement, stay tuned.  


Comme toujours, je tiens ma liste de livres en prêt ou échange à disposition [ici même](https://docs.google.com/spreadsheets/d/1XgL-d50Razma7f_8Q7vNHB8AT7LlEIqaTq1q2iOEMjQ/edit?usp=sharing).  


Ensuite, une fois les concepts de base acquis, je ne saurais que trop vous conseiller les [sketchnotes d'Aurélie Vache](https://scraly.com/#zine). Son travail sur le sujet est remarquable, elle fait des sketchnotes sur tous les concepts importants, en rajoutant des petites astuces au fil de l'eau. C'est un excellent complément aux documentations plus traditionnelles pour vous aider à condenser ces connaissances et vous en faire une représentation mentale.  


Pour ceux qui préfèrent les vidéos, je vous conseille les cours en ligne gratuits de VMWare, appelés [Kube Academy](https://kube.academy/) sur le sujet.

### Tips and tricks

L'alias ultime :

```alias k = 'kubectl $@'```  


Il vous fera gagner beaucoup de temps à taper vos commandes kubectl.  


Jetez aussi un coup d'oeil aux outils **kubens** et **kubectx** pour changer rapidement de contexte ou de namespace par défaut. Les commandes kubectl correspondantes sont assez pénibles, ces deux petits scripts vous faciliteront la vie dans votre vie de tous les jours.
