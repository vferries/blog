---
title: Le jeu de la vie en Haskell
excerpt: "Comment l'approche fonctionnelle peut simplifier certains problèmes"
tags: [game of life, haskell, programmation fonctionnelle]
modified: 2015-04-12
comments: true
---

![Haskel]({{site.url}}/images/Haskell-Logo.svg)

J'ai découvert le Jeu de la vie lors de mon premier Code Retreat, il y a quelques années de cela. Il est fait de 4 règles simples :

* Une cellule qui a moins de 2 voisins meurt de sous-population
* Une cellule qui a plus de 3 voisins meurt de sur-population
* Une cellule qui a 2 ou 3 voisins reste en vie
* Si à un endroit donné, il y a 3 voisins, une cellule naît spontanément

L'énoncé, bien que simpliste cache en fait une grande complexité en terme de choix d'implémentation. Doit-on représenter l'univers ? Avec une grille ? Une map ? L'univers est-il fini ? La grande question sur la vie, l'univers et le reste donc.

### Genèse

J'ai déjà fait des comptes rendus de [mes Code Retreats]({{site.url}}/code-retreat-2011/) précédemment, mais la seule fois où j'ai réussi à venir à bout du problème était lors de la dernière session (fin 2014 donc). J'étais alors en binôme avec Gilles Debunne et on a décidé de prendre une approche purement fonctionnelle et de tenter le coup en Haskell.

Lui n'en avait jamais fait, moi un peu, mais je n'étais pas à l'aise avec l'écriture de tests unitaires en Haskell. Malheureusement, la solution à laquelle on est arrivé pendant les 45 minutes imparties ne comportait donc pas de tests unitaires. Je compte bien y remédier pour une prochaine fois, mais ce n'est pas là  l'objet de mon propos. Le fait est qu'on en est réellement arrivé à une implémentation fonctionnelle et la relecture du code m'a paru assez agréable pour vous la partager.

### Pas à pas

Le but était d'avoir une approche purement fonctionnelle, tout serait donc fonction. Pour avancer d'un jour dans notre univers, on a créé une fonction next qui prend en entrée un monde et nous retourne le monde modifié avec un jour de plus, voici donc sa signature :

{% highlight haskell %}
next :: World -> World
{% endhighlight %}

On a défini ensuite deux états pour nos cellules, Alive et Dead qu'on a regroupés sous le nom State.
Afin de pouvoir tester l'égalité, on les fait dériver de Eq.

{% highlight haskell %}
data State = Alive | Dead
	deriving Eq
{% endhighlight %}

On a considéré qu'une position était constituée de deux entiers, la position en X et la position en Y. Si on voilait passer notre solution en 3D, c'est tout ce qu'on aurait à modifier.

{% highlight haskell %}
type Pos = (Int, Int)
{% endhighlight %}

Du coup, un monde, c'est une fonction qui prend une Pos en paramètre et nous retourne l'état de la cellule à cette position.

{% highlight haskell %}
type World = Pos -> State
{% endhighlight %}

On a fini de définir tous les types dont on aura besoin.
On rajoute vite fait deux méthodes qui nous serviront.

Une première retourne la liste des positions voisines d'une position.
La seconde comptera le nombre de voisins en vie d'une position pour un monde donné.

{% highlight haskell %}
neighbours :: Pos -> [Pos]
countNeighbours :: World -> Pos -> Int
{% endhighlight %}

### Implémentation

Maintenant qu'on a tout notre système de types en place, il est temps de se concentrer sur le corps de ces méthodes.
Commençons par la liste des positions voisines :

{% highlight haskell %}
neighbours (x, y) = [(x+a, y+b) | a <- [-1..1], b <- [-1..1], a /= 0 || b /= 0]
{% endhighlight %}

Facile, on itère sur les positions voisines et on évite la position actuelle. Notez qu'en Haskell, le symbole différent s'écrit _/=_. La for comprehension est assez classique, même dans d'autres langages.

On peut désormais facilement écrire la méthode qui compte les voisins. Il suffit de filtrer dans cette liste les positions pour lesquelles le monde actuel retourne Alive :

{% highlight haskell %}
countNeighbours world pos = length (filter alive (neighbours pos))
    where alive pos = world pos == Alive
{% endhighlight %}

Enfin, on peut désormais écrire la méthode qui calculera le monde suivant à partir du monde actuel :

{% highlight haskell %}
next world pos = case countNeighbours world pos of
    3 -> Alive
    2 -> world pos
    _ -> Dead
{% endhighlight %}

Un bel exemple de pattern matching pour finir.
La solution parle d'elle-même non ? Le tout en une dizaine de lignes de code, déclaration des signatures incluses.

### Utilisation

C'est bien beau mais comment on s'en sert après ?
On peut en fait très facilement utiliser de nouveau du pattern matching pour créer un monde :


{% highlight haskell %}
myWorld :: World
myWorld (0,1) = Alive
myWorld (1,1) = Alive
myWorld (2,1) = Alive
myWorld _ = Dead
{% endhighlight %}

La même solution serait réalisable en Java 8, JavaScript, Python et j'en passe. Mais la déclaration de types d'Haskell rend vraiment la chose magnifique et simple vous ne trouvez pas ?

Promis la prochaine fois ça sera fait en TDD. Je vous conseille [le cours d'Erik Meijer](https://www.edx.org/course/introduction-functional-programming-delftx-fp101x-0) si Haskell vous tente.
