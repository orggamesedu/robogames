(function() {
  var Games, MONGODB_HOST, PORT, app, connectLess, debug, express, minefield, mongo, notImplemented, textualize;

  PORT = process.env.PORT || 2663;

  MONGODB_HOST = process.env.MONGODB_HOST || "localhost";

  express = require('express');

  connectLess = require('connect-less');

  mongo = require('mongodb-wrapper');

  Games = require('./games').Model;

  debug = require('./games/debug');

  minefield = require('./games/minefield');

  exports.createServer = function() {
    var app, db, games;
    app = express.createServer();
    app.use(express.bodyParser());
    app.use(connectLess({
      src: __dirname + '/public'
    }));
    app.use(express.static(__dirname + "/public"));
    db = mongo.db(MONGODB_HOST, 27017, "robogames");
    db.collection('games');
    games = new Games(db.games);
    app.post("/minefield/levels/:level/games", function(req, res) {
      var level, player;
      level = req.param("level");
      player = req.body;
      return games.play(minefield, level, player, function(err, game) {
        if (err != null) return res.send(err, 500);
        return res.send(game);
      });
    });
    app.post("/minefield/:gameId/moves", function(req, res) {
      var gameId, move;
      gameId = req.param("gameId");
      move = req.body;
      return games.move(minefield, gameId, move, function(err, state) {
        if (err != null) return res.send(err, 500);
        return res.send(state);
      });
    });
    app.get("/minefield/levels", function(req, res) {
      return res.send(minefield.levels());
    });
    app.get("/minefield/levels/:level/games", notImplemented);
    app.get("/games/:gameId", function(req, res) {
      return games.fetch(req.param('gameId'), function(err, game) {
        if (err != null) return res.send(err, 500);
        if (!game) return res.send(404);
        return res.send(game);
      });
    });
    app.get("/games/:gameId/state", function(req, res) {
      return games.fetch(req.param('gameId'), function(err, game) {
        if (err != null) return res.send(err, 500);
        if (!game) return res.send(404);
        return res.send(game.state);
      });
    });
    app.get("/games/:gameId/state.txt", function(req, res) {
      return games.fetch(req.param('gameId'), function(err, game) {
        if (err != null) return res.send(err, 500);
        if (!game) return res.send(404);
        res.contentType(".txt");
        return res.send(textualize(game.state));
      });
    });
    app.get("/games/:gameId/state/:n.txt", function(req, res) {
      var gameId, n;
      gameId = req.param('gameId');
      n = parseInt(req.param('n'), 10);
      return games.fetchStateAtTurn(gameId, n, function(err, state) {
        if (err != null) return res.send(err, 500);
        if (!state) return res.send(404);
        res.contentType(".txt");
        return res.send(textualize(state));
      });
    });
    app.get("/games/:gameId/state/:n", function(req, res) {
      var gameId, n;
      gameId = req.param('gameId');
      n = parseInt(req.param('n'), 10);
      return games.fetchStateAtTurn(gameId, n, function(err, state) {
        if (err != null) return res.send(err, 500);
        if (!state) return res.send(404);
        return res.send(state);
      });
    });
    app.get("/players/:username/games", notImplemented);
    return app;
  };

  textualize = function(s) {
    return debug.dump(debug.toRows(s));
  };

  notImplemented = function(req, res) {
    return res.send("Not Implemented", 501);
  };

  if (module === require.main) {
    app = exports.createServer();
    console.log("Started on " + PORT);
    app.listen(PORT);
  }

}).call(this);
