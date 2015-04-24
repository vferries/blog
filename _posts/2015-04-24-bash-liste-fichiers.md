---
layout: post
title: Traitement d'une arborescence de fichiers en bash
excerpt: "Avec compression d'images au passage"
tags: [bash, traitement d'images, optimisation]
modified: 2015-04-24
comments: true
---

Pour un projet perso, j'ai quelques milliers d'images à traiter par lots. Les problèmes sont multiples, j'ai des fichiers avec des noms qui comportent des accents et décrivent assez finement le contenu de mes images. J'ai besoin de garder ces noms quelque part, mais étant donné que j'embarque ces images dans une application web, j'ai besoin de les compresser assez fortement.

### Liste des fichiers avec find

Premier petit problème, mes fichiers contiennent des espaces. Et par défaut, en bash, une boucle for sur un find itère entre les espaces. C'est lié au fait que l'IFS (Internal Field Separator) est par défaut défini à n'importe quel caractère d'espacement, c'est à dire les espaces, les tabulations ainsi que les retours à la ligne.

Petite feinte donc, il nous faut temporairement modifier sa valeur, effectuer notre boucle for et enfin, remettre sa valeur initiale.

{% highlight bash %}
OLDIFS=$IFS
IFS=`echo -en '\n\b'`

...

IFS=$OLDIFS
{% endhighlight %}

Premier souci réglé !

### Remplacement des caractères accentués

Ensuite, comme je le disais, on veut conserver à la fois l'ancien nom de nos fichiers avec les accents, mais aussi le nouveau.
Pour supprimer les accents, on va utiliser la commande __unaccent__, en y passant l'encoding. On en profite pour faire un petit coup de __sed__ en remplaçant les espaces par des underscores. Du coup, avec tout ça mis en commun et un petit __mv__ pour renommer les fichiers on obtient le script suivant :

{% highlight bash %}
#!/bin/bash

DIR="."
 
# save and change IFS 
OLDIFS=$IFS
IFS=`echo -en '\n\b'`
 
# use for loop read all filenames
for i in `find $DIR -type f`;do
  echo "$i"
  newName=`echo $i | unaccent utf8 | sed 's/ /_/g'`
  echo $newName
  mv `echo $i | sed 's/ /\\ /g'` $newName
done

# restore it 
IFS=$OLDIFS
{% endhighlight %}

On met le tout dans un script bash qu'on lance dans le répertoire qui nous intéresse en redirigeant la sortie standard vers un fichier.

### Compression des images

On prend les mêmes et on recommence. La base du script est la même, on applique juste à chacun des fichiers __jpegoptim__.

{% highlight bash %}
#!/bin/bash

DIR="."
 
# save and change IFS 
OLDIFS=$IFS
IFS=`echo -en '\n\b'`
 
# use for loop read all filenames
for i in `find $DIR -type f`;do
  echo "$i"
	# On réoriente et on compresse un peu pour jpegoptim
	mogrify -auto-orient -quality 80 $i

	# On redimensionne les images en 1024×800 par exemple
	mogrify -resize 1024x800 $i

	# Compression des jpeg à 80 Ko environ
	jpegoptim -S80 $i
done

# restore it 
IFS=$OLDIFS
{% endhighlight %}

Et voila ! Je suis passé de 6Go d'images à 100Mo !