---
layout: post
title: Utilisation Service Workers
excerpt: "Les cas d'application des Service Workers"
tags: [web, front, service workers, push notifications]
modified: 2015-04-07
comments: true
---

On a vu ensemble dans la partie [introduction]({{site.url}}/service-workers/) comment enregistrer un Service Worker et comment on pouvait intercepter les requêtes effectuées par la page. Nous allons désormais nous intéresser à ce à quoi cela va bien pouvoir nous servir dans nos applications web.

### Exploitation du cache

Le Service Worker est supposé venir avec un système de gestion de cache intégré. Celui-ci, présent pour l'instant uniquement dans Chrome Canary ne semble pas encore vraiment fonctionnel. C'est pourquoi vous pouvez utiliser [ce polyfill](https://github.com/coonsta/cache-polyfill) en attendant.

On peut ajouter des ressources en cache au moment de l'installation du service worker :
Si on met par défaut en cache les fichiers CSS et JS minimaux pour le bon fonctionnement du site, l'application sera utilisable même en mode complètement hors ligne. On n'aura alors plus qu'à mettre à jour les données une fois la connexion revenue.

{% highlight javascript %}
var CACHE_NAME = 'my-site-cache-v1';
var urlsToCache = [
  '/',
  '/styles/main.css',
  '/script/main.js'
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});
{% endhighlight %}

On peut aussi, par défaut retourner les données présentes si on les a en cache et même aller plus loin, si on ne les a pas encore en cache, on les rajoute une fois qu'on les a récupérées.

Et encore plus loin : on peut servir en premier lieu ce qu'on a en cache et faire l'appel quand même au serveur pour récupérer les données à jour. Une fois ces données reçues, on n'a plus qu'à rafraîchir les informations nécessaires.

Au final, on finirait avec un exemple comme celui-ci :

{% highlight javascript %}
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Si on l'a en cache on le retourne directement
        if (response) {
          return response;
        }

        // IMPORTANT : On clone la requête. Une requête est un stream
        // et ne peut être consommée qu'une seule fois.
        // Etant donné qu'on souhaite l'utiliser une fois pour le cache
        // et une autre pour lancer la requête, on a besoin de cloner la réponse.
        var fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function(response) {
            // Si la réponse n'est pas valide, on la retourne
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Si on a bien un code 200 on le clone et l'ajoute en cache
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            // Et on retourne enfin la réponse
            return response;
          }
        );
      })
    );
});
{% endhighlight %}

### Mais on peut aller encore plus loin

D'autres spécifications sont fortement reliées aux Service Workers, on peut par exemple citer les spécifications sur le [Push](http://w3c.github.io/push-api/), le [Background-Sync](https://github.com/slightlyoff/BackgroundSync) et encore le [Geofencing](https://github.com/slightlyoff/Geofencing). Je suis sûr que de petites étincelles viennent de s'allumer dans votre cervelle : on peut donc faire en sorte que notre service worker aille vérifier de temps en temps si on a eu de nouvelles données dans notre flux Twitter et précharger les images associées, histoire qu'on ait déjà tout de dispo dans le métro, privé de toute connexion.
Les notifications push permettent de notifier les utilisateurs d'un éventuel message dans votre application web.

Les possibilités sont énormes et on devrait se rapprocher très rapidement de ce qui fait le sel des applications natives à l'heure actuelle.

Pour information, pour toutes ces tâches en background, c'est votre navigateur qui décidera quand la tâche doit se lancer. Pourquoi pas précharger tous vos flux d'actualité tous les matins pendant que vous dormez ?

### Pour aller plus loin

Cet article est un honteux pompage et condensé d'une poignée d'articles sur le sujet.
Si vous voulez en savoir  plus, vous trouverez plus d'informations dans les articles suivants :

* [Service Workers are awesome](http://blog.donnywals.com/service-workers-are-awesome/)
* [Service Workers Explainer](https://github.com/slightlyoff/ServiceWorker/blob/master/explainer.md)
* [Using Service Worker Today](http://jakearchibald.com/2014/using-serviceworker-today/) par Jake Archibald et sa [présentation fabuleuse](https://www.youtube.com/watch?v=SmZ9XcTpMS4)
* La [documentation MDN](https://developer.mozilla.org/fr/docs/Web/API/ServiceWorker_API/Using_Service_Workers)
* Un [article sur HTML5 Rocks](http://www.html5rocks.com/en/tutorials/service-worker/introduction/?redirect_from_locale=fr)