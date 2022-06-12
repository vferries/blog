---
title: Introduction Service Workers
excerpt: "Ou comment combler le retard sur les applications natives"
tags: [web, front, service workers, push notifications]
modified: 2015-04-07
comments: true
---

Vous êtes vous déjà demandé pourquoi on utilisait surtout des applications natives sur les téléphones et quasiment jamais des applications web ? Les raisons sont assez nombreuses mais on peut citer les suivantes :

* Les applications natives sont plus rapides que les applications web.
* Il est très difficile de faire du offline-first
* Peu de contrôle sur le cache dans les applications web
* Pas de chargement en background ni de notifications

Effectivement, en regardant les applications que j'utilise le plus souvent, elles utilisent massivement les 3 derniers points, me servant les dernières données chargées par défaut et me notifiant quand quelque chose d'important s'est produit. Ce sont tous ces points que les service workers tentent d'adresser.
Pour le premier point, à ma connaissance seul React Native résoud ce problème, j'essaierai d'en parler plus tard.

### Enregistrement

Attention, on joue là avec des technologies expérimentales, qui n'ont pas encore fini d'être standardisées. Pour pouvoir les utiliser dans votre navigateur, il est donc nécessaire d'activer certains flags. Si vous utilisez Firefox, il vous faut vous rendre dans _about:config_ et activer l'option _dom.serviceWorkers.enabled_ avant de redémarrer votre navigateur. Si vous utilisez Chrome, rendez-vous dans _chrome://flags_ et activez l'option _experimental-web-platform-features_ avant de redémarrer.

Testons déjà si tout fonctionne en appelant la méthode _register_ pour enregistrer notre worker :

{% highlight javascript %}
if (navigator.serviceWorker) {
	navigator.serviceWorker.register('worker.js')
		.then(function(){
	        console.log("Worker valide.");
	    },
	    function(){
	        console.log("Echec d'enregistrement du Service Worker.");
	    });
} else {
	console.log("Votre navigateur vaut pas un clou, il ne supporte pas les Service Workers.");
}
{% endhighlight %}

Par défaut, le worker interceptera toutes les requêtes sur le domaine "/". On peut spécifier un scope en second paramètre (par exemple "/blog/" pour mon blog).

Si tout va bien, vous devriez avoir affiché que l'enregistrement a échoué. Mais pour quelle raison me direz-vous ?
Déjà, il faut que le fichier "worker.js" soit présent, mais en plus, il faut forcément qu'on utilise https. Oui, vous avez bien entendu, https forcément, donc pas de file:// cela va sans dire.

On peut quand même tester sur http en local pour le développement.
Mais si vous voulez quand même installer nginx et le paramétrer pour servir nos fichiers via https, suivez le guide.

* On commence par générer nos certificats dans /etc/nginx/ssl

~~~
sudo openssl genrsa -des3 -out server.key 2048
sudo openssl req -new -key server.key -out server.csr
# On fait sauter la passphrase
sudo cp server.key server.key.org
sudo openssl rsa -in server.key.org -out server.key
# On signe le certificat
sudo openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt
~~~

* On configure ensuite notre serveur https dans le fichier /etc/nginx/sites-enabled/default

~~~
server {
	listen 443;
	server_name localhost;

	root /var/www/;
	index index.html index.htm;

	ssl on;
	ssl_certificate ssl/server.crt;
	ssl_certificate_key ssl/server.key;

	ssl_session_timeout 5m;

	ssl_protocols TLSv1 TLSv1.1 TLSv1.2; # don't use SSLv3 ref: POODLE
	ssl_ciphers "HIGH:!aNULL:!MD5 or HIGH:!aNULL:!MD5:!3DES";
	ssl_prefer_server_ciphers on;

	location / {
		try_files $uri $uri/ =404;
	}
}
~~~

Plus qu'à rajouter un lien symbolique dans /var/www vers notre répertoire de travail.
Maintenant, en visitant la page, on arrive bien à enregistrer notre worker.

### Et j'en fais quoi de ce worker ?

Pour l'instant, notre fichier worker.js étant vide, il ne fait pas grand chose. On va tenter de l'enrichir un peu.

Je vole honteusement l'exemple de Jake Archibald pour vous montrer le cycle de vie du Service Worker :

{% highlight javascript %}
// The SW will be shutdown when not in use to save memory,
// be aware that any global state is likely to disappear
console.log("SW startup");

self.addEventListener('install', function(event) {
  console.log("SW installed");
});

self.addEventListener('activate', function(event) {
  console.log("SW activated");
});

self.addEventListener('fetch', function(event) {
  console.log("Caught a fetch!");
  event.respondWith(new Response("Hello world!"));
});
{% endhighlight %}

Quand on rafraîchit la page, "Hello world!" est affiché à la place de son contenu classique.
Aucune trace n'est visible dans la console.

Que s'est-il donc passé ?

### Debug

Il n'y a pas 50 façons d'aller dans les entrailles de notre Service Worker.
Lors de notre premier chargement de page, seul "Worker valide." a été affiché dans la console, notre Service Worker a juste été enregistré pour les visites futures. Il n'est donc pas exécuté au moment.

Lors du rechargement de la page, c'est le Service Worker qui s'exécute en premier lieu.
En accédant à la console de debug via chrome://serviceworker-internals/ sous Chrome, on peut voir la console du Service Worker, qui n'est donc pas la même que celle de notre page web.

Voici une trace de la console en question  :

~~~
Console: {"lineNumber":3,"message":"SW startup","message_level":1,"sourceIdentifier":3,"sourceURL":"http://localhost/serviceworker/worker.js"}
Console: {"lineNumber":6,"message":"SW installed","message_level":1,"sourceIdentifier":3,"sourceURL":"http://localhost/serviceworker/worker.js"}
Console: {"lineNumber":10,"message":"SW activated","message_level":1,"sourceIdentifier":3,"sourceURL":"http://localhost/serviceworker/worker.js"}
~~~

Au rechargement, la trace suivante s'ajoute :

~~~
Console: {"lineNumber":14,"message":"Caught a fetch!","message_level":1,"sourceIdentifier":3,"sourceURL":"http://localhost/serviceworker/worker.js"}
~~~

On a intercepté l'appel à l'index et retourné "Hello World!" à la place.
On est désormais capable d'intercepter tous les appels à des ressources web et de retourner ce qu'on veut.

Par la suite on verra à quoi cela peut bien servir et les grands cas d'utilisation de ces Service Workers.