---
layout: post
title: Application Cordova + Aurelia - la base
excerpt: "On continue en définissant une application qui marche"
tags: [architecture, agilité, gestion de projets]
modified: 2015-04-19
comments: true
---

Ce billet est la suite de [celui d'hier]({{site.url}}/cordova-aurelia1). Vous devriez pouvoir suivre sans avoir vu l'autre, vous pouvez aussi télécharger l'état du début sur [le repository GitHub suivant](https://github.com/vferries/gallery/releases/tag/0.0.1).

### Mise en place du build

Histoire de pouvoir tester indépendamment de cordova, on va installer un build avec gulp. J'ai modifié celui fourni par défaut avec l'application squelette afin de l'adapter à notre configuration.
On déclare déjà nos dépendances npm pour le build :

{% highlight json %}
{
  "name": "gallery-aurelia-cordova",
  "version": "0.0.1",
  "description": "First complete working version.",
  "keywords": [
    "aurelia",
    "cordova",
    "gulp"
  ],
  "license": "MIT",
  "author": "Vincent Ferries",
  "devDependencies": {
    "aurelia-tools": "git://github.com/aurelia/tools.git",
    "browser-sync": "^1.8.1",
    "conventional-changelog": "0.0.11",
    "del": "^1.1.0",
    "gulp": "^3.8.10",
    "gulp-babel": "^5.1.0",
    "gulp-bump": "^0.1.11",
    "gulp-changed": "^1.1.0",
    "gulp-jshint": "^1.9.0",
    "gulp-plumber": "^0.6.6",
    "gulp-protractor": "^0.0.12",
    "gulp-yuidoc": "^0.1.2",
    "jasmine-core": "^2.1.3",
    "jshint-stylish": "^1.0.0",
    "karma": "^0.12.28",
    "karma-babel-preprocessor": "^5.1.0",
    "karma-chrome-launcher": "^0.1.7",
    "karma-jasmine": "^0.3.2",
    "karma-jspm": "^1.0.1",
    "object.assign": "^1.0.3",
    "run-sequence": "^1.0.2",
    "vinyl-paths": "^1.0.0"
  }
}
{% endhighlight %}

Oui, ça en fait pas mal. On n'utilise pas encore Babel (conversion de code ES6 en ES5), on verra plus tard si on peut le câbler efficacement malgré le fait qu'on utilise RequireJS et non les modules ES6 et jspm (pas compatibles avec Cordova).
On rajoute aussi à la racine du projet le fichier _gulpfile.js_ qui sera utilisé pour le build de notre application :

{% highlight javascript %}
var gulp = require('gulp');
var runSequence = require('run-sequence');
var del = require('del');
var vinylPaths = require('vinyl-paths');
//var babel = require('gulp-babel');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var yuidoc = require("gulp-yuidoc");
var changelog = require('conventional-changelog');
var assign = Object.assign || require('object.assign');
var fs = require('fs');
var bump = require('gulp-bump');
var browserSync = require('browser-sync');
var changed = require('gulp-changed');
var plumber = require('gulp-plumber');
var tools = require('aurelia-tools');
var protractor = require("gulp-protractor").protractor;
var webdriver_update = require('gulp-protractor').webdriver_update;

var path = {
  source:'src/**/*.js',
  html:'src/**/*.html',
  style:'src/**/*.css',
  output:'www/',
  doc:'./doc',
  e2eSpecsSrc: 'test/e2e/src/*.js',
  e2eSpecsDist: 'test/e2e/dist/'
};

var compilerOptions = {
  filename: '',
  filenameRelative: '',
  blacklist: [],
  whitelist: [],
  modules: '',
  sourceMap: true,
  sourceMapName: '',
  sourceFileName: '',
  sourceRoot: '',
  moduleRoot: '',
  moduleIds: false,
  runtime: false,
  experimental: false,
  format: {
    comments: false,
    compact: false,
    indent: {
      parentheses: true,
      adjustMultilineComment: true,
      style: "  ",
      base: 0
    }
  }
};

var jshintConfig = {esnext:true};

gulp.task('clean', function() {
 return gulp.src([path.output])
    .pipe(vinylPaths(del));
});

gulp.task('build-css', function () {
  return gulp.src(path.style)
    .pipe(changed(path.output, {extension: '.css'}))
    .pipe(gulp.dest(path.output));
});

gulp.task('build-system', function () {
  return gulp.src(path.source)
    .pipe(plumber())
    .pipe(changed(path.output, {extension: '.js'}))
//    .pipe(babel(assign({}, compilerOptions, {modules:'amd'})))
    .pipe(gulp.dest(path.output));
});

gulp.task('build-html', function () {
  return gulp.src(path.html)
    .pipe(changed(path.output, {extension: '.html'}))
    .pipe(gulp.dest(path.output));
});

gulp.task('lint', function() {
  return gulp.src(path.source)
    .pipe(jshint(jshintConfig))
    .pipe(jshint.reporter(stylish));
});

gulp.task('doc-generate', function(){
  return gulp.src(path.source)
    .pipe(yuidoc.parser(null, 'api.json'))
    .pipe(gulp.dest(path.doc));
});

gulp.task('doc', ['doc-generate'], function(){
  tools.transformAPIModel(path.doc);
});

gulp.task('bump-version', function(){
  return gulp.src(['./package.json'])
    .pipe(bump({type:'patch'})) //major|minor|patch|prerelease
    .pipe(gulp.dest('./'));
});

gulp.task('changelog', function(callback) {
  var pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

  return changelog({
    repository: pkg.repository.url,
    version: pkg.version,
    file: path.doc + '/CHANGELOG.md'
  }, function(err, log) {
    fs.writeFileSync(path.doc + '/CHANGELOG.md', log);
  });
});

gulp.task('build', function(callback) {
  return runSequence(
    'clean',
    ['build-css', 'build-system', 'build-html'],
    callback
  );
});

gulp.task('webdriver_update', webdriver_update);

gulp.task('build-e2e', function () {
  return gulp.src(path.e2eSpecsSrc)
    .pipe(plumber())
//    .pipe(babel())
    .pipe(gulp.dest(path.e2eSpecsDist));
});

gulp.task('e2e', ['webdriver_update', 'build-e2e'], function(cb) {
  return gulp.src(path.e2eSpecsDist + "/*.js")
  .pipe(protractor({
      configFile: "protractor.conf.js",
      args: ['--baseUrl', 'http://127.0.0.1:9000']
  }))
  .on('error', function(e) { throw e; });
});

gulp.task('update-own-deps', function(){
  tools.updateOwnDependenciesFromLocalRepositories();
});

gulp.task('build-dev-env', function () {
  tools.buildDevEnv();
});

gulp.task('serve', ['build'], function(done) {
  browserSync({
    open: false,
    port: 9000,
    server: {
      baseDir: ['www/'],
      middleware: function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
      }
    }
  }, done);
});

function reportChange(event){
  console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
}

gulp.task('watch', ['serve'], function() {
  gulp.watch(path.source, ['build-system', browserSync.reload]).on('change', reportChange);
  gulp.watch(path.html, ['build-html', browserSync.reload]).on('change', reportChange);
  gulp.watch(path.style, ['build-css', browserSync.reload]).on('change', reportChange);
});

gulp.task('prepare-release', function(callback){
  return runSequence(
    'build',
    'lint',
    'bump-version',
    'doc',
    'changelog',
    callback
  );
});
{% endhighlight %}

### Application

On commence par créer un fichier _index.html_ dans notre répertoire _gallery_ dans lequel on importe nos feuilles de style. La méthode de bootstrap préconisée dans les documentations d'Aurelia ne nous étant pas disponible dans notre cas, on se contente de mettre l'attribut __aurelia-app="app"__ et es5 sur notre tag body. Ce tag permet de dire à Aurelia que le composant principal de notre application s'appellera "app" et donc de charger les fichiers app.html et app.js correspondants à l'intérieur de notre élément, ici body.

{% highlight html %}
<!doctype html>
<html>
<head>
  <link rel="stylesheet" type="text/css" href="bower_components/bootstrap/dist/css/bootstrap.min.css">
  <link rel="stylesheet" type="text/css" href="bower_components/fontawesome/css/font-awesome.min.css">
  <link rel="stylesheet" type="text/css" href="styles/styles.css">
</head>

<body aurelia-app="app" es5>
  <script src="bower_components/core-js/client/core.js "></script>
  <script src="bower_components/requirejs/require.js" data-main="main"></script>
</body>
</html>
{% endhighlight %}

Il ne nous reste plus qu'à faire le lien avec nos dépendances précédemment installées. On charge donc core-js et requireJS en précisant que nos dépendances seront décrites dans le fichier _main.js_.

#### Initialisation

Vu qu'on n'utilise pas jspm dans notre cas, on définit toutes nos dépendances require et on appelle le bootstrap d'Aurelia et de bootstrap à la fin de notre fichier _main.js_ :

{% highlight javascript %}
require.config({
  baseUrl : '',

  paths: {
    'aurelia-bootstrapper': 'bower_components/aurelia-bootstrapper/dist/amd/index',
    'aurelia-loader-default': 'bower_components/aurelia-loader-default/dist/amd/index',
    'aurelia-loader': 'bower_components/aurelia-loader/dist/amd/index',
    'aurelia-path': 'bower_components/aurelia-path/dist/amd/index',
    'aurelia-task-queue': 'bower_components/aurelia-task-queue/dist/amd/index',
    'aurelia-logging': 'bower_components/aurelia-logging/dist/amd/index',
    'aurelia-logging-console': 'bower_components/aurelia-logging-console/dist/amd/index',
    'aurelia-history': 'bower_components/aurelia-history/dist/amd/index',
    'aurelia-history-browser': 'bower_components/aurelia-history-browser/dist/amd/index',
    'aurelia-event-aggregator': 'bower_components/aurelia-event-aggregator/dist/amd/index',
    'jquery' : 'bower_components/jquery/dist/jquery',
    'bootstrap' : 'bower_components/bootstrap/dist/js/bootstrap'
  },
  shim : {
    'bootstrap' : {
      'deps' : ['jquery']
    }
  },
  packages : [
   {
     name: 'aurelia-framework',
     location: 'bower_components/aurelia-framework/dist/amd',
     main : 'index'
   },
   {
     name: 'aurelia-metadata',
     location: 'bower_components/aurelia-metadata/dist/amd',
     main : 'index'
   },
   {
     name: 'aurelia-binding',
     location: 'bower_components/aurelia-binding/dist/amd',
     main : 'index'
   },
   {
     name: 'aurelia-templating',
     location: 'bower_components/aurelia-templating/dist/amd',
     main : 'index'
   },
   {
     name: 'aurelia-dependency-injection',
     location: 'bower_components/aurelia-dependency-injection/dist/amd',
     main : 'index'
   },
   {
     name: 'aurelia-router',
     location: 'bower_components/aurelia-router/dist/amd',
     main : 'index'
   },
   {
     name: 'aurelia-templating-binding',
     location: 'bower_components/aurelia-templating-binding/dist/amd',
     main : 'index'
   },
   {
     name: 'aurelia-templating-resources',
     location: 'bower_components/aurelia-templating-resources/dist/amd',
     main : 'index'
   },
   {
     name: 'aurelia-templating-router',
     location: 'bower_components/aurelia-templating-router/dist/amd',
     main : 'index'
   },
   {
     name: 'aurelia-route-recognizer',
     location: 'bower_components/aurelia-route-recognizer/dist/amd',
     main : 'index'
   },
   {
     name: 'aurelia-http-client',
     location: 'bower_components/aurelia-http-client/dist/amd',
     main : 'index'
   }]

});

require(['aurelia-bootstrapper']);
require(['jquery', 'bootstrap']);
{% endhighlight %}

C'est un peu long, mais au moins on n'aura plus à y toucher.
La dernière ligne n'est pas présente dans les builds de démo d'Aurelia (navigation-app) et le menu sur résolutions faibles n'est donc pas utilisable en l'état.

### Aurelia

Si vous vous attendiez à ce que je décrive finement le fonctionnement interne d'Aurelia, il faudra attendre encore un peu.
Surtout qu'on utilise là la syntaxe ES5, qui est quand même moins agréable à lire que celle d'ES6 il faut bien l'avouer.

### Lancement

Depuis [mon repo GitHub](https://github.com/vferries/gallery/releases/tag/0.0.2), vous pouvez récupérer l'archive de cette étape qui contient aussi les fichiers du squelette d'application modifiés pour utiliser requireJS et ES5 au lieu de 6.

~~~
npm install
~~~

Cela installe toutes vos dépendances utilies à gulp.
Si ce n'a pas été fait dans l'étape précédente, vous pouvez récupérer les dépendances bower du projet en allant dans le répertoire src et en tapant :

~~~
bower install
~~~

On peut ensuite :

* Lancer l'application sur un serveur local avec `gulp watch`
* Lancer l'application sur smartphone avec `gulp build` puis `cordova run`

Pour décrire un peu ce qui se passe, la tâche _build_ de gulp copie nos sources dans le répertoire _www_ alors servi par Cordova.
Tout marche enfin sur notre mobile de bout en bout, menu de navigation compris !

### Librairies CSS étudiées

J'ai passé de nombreuses heures à essayer de tout mettre ensemble. Ma plus grosse perte de temps a été pour l'intégration des librairies Material Design existantes, notamment :

* MUI CSS -> Pas assez complet, intéressant mais il manque quelques exemples d'utilisation et une documentation plus précise.
* Materialize -> Sympa mais pas réussi l'intégration malgré de très nombreuses tentatives. Pas adapté pour l'instant aux gestionnaires de dépendances JavaScript.
* bootstrap-material-design -> Celui là j'avais essayé mais quand la version actuelle ne marchait pas, cela sera peut être la prochaine étape.

###### PS

* [Un article intéressant sur Aurelia](http://ilikekillnerds.com/2015/01/aurelia-vs-angularjs-round-one-fight/)
* [Une interview récente](http://www.peteonsoftware.com/index.php/2015/02/02/podcast-episode-33-rob-eisenberg-on-aurelia-js) de Rob Eisenberg, créateur du framework.
* [Une heure et demi de conférence](https://www.youtube.com/watch?v=6Pd53umA5wc) encore plus récente.

Encore une fois, vous pouvez récupérer l'avancement actuel [sur GitHub](https://github.com/vferries/gallery/releases/tag/0.0.2).