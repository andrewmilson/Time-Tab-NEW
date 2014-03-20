
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var app = express();
var passport = require('passport');
var stylus = require('stylus')
var nib = require('nib');
//var mongoose = require('mongoose');

//mongoose.connect('mongodb://localhost/tt');

function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .set('compress', true)
    .use(nib());
}

// all environments
app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({ secret: 'SECRET' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(stylus.middleware({src: path.join(__dirname, 'public'), compile: compile}));
  app.use(express.static(path.join(__dirname, 'public')));

  // development only
  if ('development' == app.get('env')) {
    app.use(express.errorHandler());
  }

  app.get('/slider', routes.index);
  app.get('/users', user.list);
});

// var testData = mongoose.model('test', new mongoose.Schema({
//   username: String
// }), 'test');

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
