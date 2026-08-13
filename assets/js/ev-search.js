/* ============================================================
   En Veille — câblage de la recherche lunr, vanilla
   Port fidèle du lunr-en.js de Minimal Mistakes 4.28.0, sans jQuery
   (main.min.js n'est plus chargé, cf. footer_scripts dans _config.yml).
   Chargé par nav.js à la première ouverture du panneau, après
   lunr.min.js et lunr-store.js (globals `lunr` et `store`).
   Sémantique de requête et markup des résultats identiques à
   l'upstream ; le libellé vient du bloc fr de _data/ui-text.yml.
   ============================================================ */
(function () {
  'use strict';

  var input = document.getElementById('search');
  var resultdiv = document.getElementById('results');
  if (!input || !resultdiv || typeof lunr === 'undefined' || typeof store === 'undefined') {
    console.warn('[ev-search] prérequis manquants (input#search, #results, lunr ou store)');
    return;
  }

  var idx = lunr(function () {
    this.field('title');
    this.field('excerpt');
    this.field('categories');
    this.field('tags');
    this.ref('id');
    this.pipeline.remove(lunr.trimmer);
    for (var item in store) {
      this.add({
        title: store[item].title,
        excerpt: store[item].excerpt,
        categories: store[item].categories,
        tags: store[item].tags,
        id: item
      });
    }
  });

  input.addEventListener('keyup', function () {
    var query = input.value.toLowerCase();
    var result = idx.query(function (q) {
      query.split(lunr.tokenizer.separator).forEach(function (term) {
        q.term(term, { boost: 100 });
        if (query.lastIndexOf(' ') !== query.length - 1) {
          q.term(term, { usePipeline: false, wildcard: lunr.Query.wildcard.TRAILING, boost: 10 });
        }
        if (term !== '') {
          q.term(term, { usePipeline: false, editDistance: 1, boost: 1 });
        }
      });
    });
    var html = '<p class="results__found">' + result.length + ' Résultat(s) trouvé(s)</p>';
    result.forEach(function (r) {
      var doc = store[r.ref];
      html +=
        '<div class="list__item">' +
          '<article class="archive__item" itemscope itemtype="https://schema.org/CreativeWork">' +
            '<h2 class="archive__item-title" itemprop="headline">' +
              '<a href="' + doc.url + '" rel="permalink">' + doc.title + '</a>' +
            '</h2>' +
            (doc.teaser
              ? '<div class="archive__item-teaser"><img src="' + doc.teaser + '" alt="" loading="lazy"></div>'
              : '') +
            '<p class="archive__item-excerpt" itemprop="description">' +
              doc.excerpt.split(' ').splice(0, 20).join(' ') + '...</p>' +
          '</article>' +
        '</div>';
    });
    resultdiv.innerHTML = html;
  });
})();
