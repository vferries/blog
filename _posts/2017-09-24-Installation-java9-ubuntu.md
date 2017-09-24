---
layout: post
title: Installer Java 9 sur Ubuntu
excerpt: "Permiers pas dans le monde merveilleux de Java 9"
tags: [java 9, ubuntu]
modified: 2017-09-24
comments: true
image:
  feature: devoxx_fr_2016.png
---

Cela fait plus d'un an que je n'ai plus rien écrit ici, il est temps de s'y remettre.
J'ai pas mal à vous présenter d'ici peu, notamment au sujet d'Angular (4 bientôt 5), de ngrx, d'Android, de Kotlin de lancement en indépendant. Le travail a été riche et varié depuis la création de ma petiiite entreprise.

### Java 9

Je ne vais pas vous mentir, je ne l'attendais pas avec la plus grande des impatiences, ayant goûté à Kotlin entre temps. Mais Java reste Java et je ne peux pas vraiment non plus le désavouer. Alors me voila en train d'installer la nouvelle version du JDK sortie le 21 septembre 2017. Je voulais voir et tester rapidement les nouveautés, notamment Jigsaw afin de pouvoir faire les choses proprement sur mes futurs projets en Java.
Tout ne s'est pas exactement passé comme prévu alors je me permets de poser ici les solutions glânées ça et là.

### Installation via apt sous Ubuntu

La procédure d'installation est toute simple:

{% highlight bash %}
sudo add-apt-repository ppa:webupd8team/java
sudo apt update
sudo apt install oracle-java9-installer
{% endhighlight %}

On ajoute un repository, on met à jour la liste des packages dispos et on installe Java 9.
Seulement, visiblement les gars de webupd8team, qui font un super boulot pour simplifier les installations du JDK Oracle sous Ubuntu n'ont visiblement pas encore tout à fait mis à jour avec les changements d'urls côté Oracle.

Le plus simple, c'est juste de rentrer les lignes suivantes dans votre terminal :

{% highlight bash %}
cd /var/lib/dpkg/info
sudo sed -i 's|SHA256SUM_TGZ="2ef49c97ddcd5e0de20226eea4cca7b0d7de63ddec80eff8291513f6474ca0dc"|SHA256SUM_TGZ="1c6d783a54fcc0673ed1f8c5e8650b1d8977ca3e856a03fba0090198e0f16f6d"|' oracle-java9-installer.*
sudo sed -i 's|JAVA_VERSION_MINOR=181|JAVA_VERSION_MINOR=181|' oracle-java9-installer.*
sudo sed -i 's|FILENAME=jdk-${JAVA_VERSION_MAJOR}+${JAVA_VERSION_MINOR}_linux-${dld}_bin.tar.gz|FILENAME=jdk-${JAVA_VERSION_MAJOR}_linux-${dld}_bin.tar.gz|' oracle-java9-installer.*
sudo sed -i 's|PARTNER_URL=http://download.java.net/java/jdk${JAVA_VERSION_MAJOR}/archive/${JAVA_VERSION_MINOR}/binaries/$FILENAME|PARTNER_URL=http://download.oracle.com/otn-pub/java/jdk/${JAVA_VERSION_MAJOR}+${JAVA_VERSION_MINOR}/$FILENAME|' oracle-java9-installer.*
{% endhighlight %}

Plus qu'à relancer un apt install et le tour est joué.

### Vérification de la version

Il ne vous reste plus qu'à lancer un petit :

{% highlight bash %}
java -version
{% endhighlight %}

S'il vous parle de Java 9, tout va bien, sinon, il ne vous reste plus qu'à faire :

{% highlight bash %}
sudo apt install oracle-java9-set-default
{% endhighlight %}

Je vous parlerai bientôt de ce que vous pourrez faire de beau avec !
