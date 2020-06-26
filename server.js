var express = require('express');
var partials = require('express-partials');
var app = express();
var async = require('async');
var bodyParser = require('body-parser')
var favicon = require('serve-favicon');

global.title = 'respondo';

app.set('port', (process.env.PORT || 5000));

// views is directory for all template files
app.set('views', __dirname + '/app/web/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(partials());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// controllers
var home = require('./app/web/controllers/home.controller');
var triggersApi = require('./app/web/api/controllers/triggers.controller');

function parallel(middlewares) {
  return function (req, res, next) {
    async.each(middlewares, function (mw, cb) {
      mw(req, res, cb);
    }, next);
  };
}

app.use(parallel([
    express.static(__dirname + '/app/web/content'),
    favicon(__dirname + '/favicon.ico'),
    home,
    triggersApi
]));

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

module.exports = app;