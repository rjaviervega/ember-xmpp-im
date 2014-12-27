/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');

var app = new EmberApp();

// Use `app.import` to add additional libraries to the generated
// output files.
//
// If you need to use different assets in different
// environments, specify an object as the first parameter. That
// object's keys should be the environment name and the values
// should be the asset to use in that environment.
//
// If the library that you are including contains AMD or ES6
// modules that you would like to import into your application
// please specify an object with the list of modules as keys
// along with the exports of each module as its value.


// JS
app.import('bower_components/x2js/xml2json.js');
app.import('bower_components/strophe/strophe.js');
app.import('bower_components/ember-addons.bs_for_ember/dist/js/bs-core.max.js');
app.import('bower_components/ember-addons.bs_for_ember/dist/js/bs-button.max.js');
app.import('bower_components/ember-addons.bs_for_ember/dist/js/bs-list-group.max.js');

// CSS
app.import('bower_components/bootstrap/dist/css/bootstrap.css')
app.import('bower_components/bootstrap/dist/css/bootstrap-theme.css')
app.import('app/styles/xmpp-im.css');
app.import('bower_components/ember-addons.bs_for_ember/dist/css/bs-growl-notifications.min.css');

app.import('bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.woff', {
  destDir: 'fonts'
});

app.import('bower_components/bootstrap/dist/css/bootstrap.css.map', {
  destDir: 'assets'
});

app.import('bower_components/bootstrap/dist/css/bootstrap-theme.css.map', {
  destDir: 'assets'
});

module.exports = app.toTree();
