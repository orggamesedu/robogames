


PORT = process.env.PORT || 2663
MONGODB_HOST = process.env.MONGODB_HOST || "localhost"

express = require 'express'
connectLess = require 'connect-less'
mongo = require 'mongodb-wrapper'

# games
Games = require('./games').Model
minefield = require './games/minefield'

exports.createServer = ->


    app = express.createServer()
    app.use express.bodyParser()
    app.use connectLess({ src: __dirname + '/public' })
    app.use express.static(__dirname + "/public")
    

    # mongo connection
    db = mongo.db MONGODB_HOST, 27017, "robogames"
    db.collection 'games'

    # games
    games = new Games(db.games)




    # BROWSER #############################################################





    # PLAY THE GAME #######################################################


    # Minefield
    # State {mode: "play|dead|won", size: {w, h}, player: {x, y}, target: {x, y}, mines: [{x, y, id}]}

    # Create a game
    # If you retry a level with the same player, it will erase the old game
    # body: Player {username, email, link}
    # ret: {gameId, state: State} (see above)
    app.post "/minefield/levels/:level/games", (req, res) ->
        level = req.param "level"
        player = req.body
        games.play minefield, level, player, (err, game) ->
            if err? then return res.send err, 500
            res.send game



    # makes a move, and returns the new game state
    # body: Move {action: "right|left|down|up"} 
    # ret: State (see above)
    app.post "/minefield/:gameId/moves", (req, res) ->
        gameId = req.param "gameId"
        move = req.body
        games.move minefield, gameId, move, (err, state) ->
            if err? then return res.send err, 500
            res.send state



    # ADMIN / VIEWER ######################################################

    # ret: ["levelId"]
    app.get "/minefield/levels", (req, res) ->
        res.send minefield.levels()

    # ret: ["gameId"]
    app.get "/minefield/levels/:level/games", notImplemented

    # returns a game, with latest state and all states
    # ret: Game {gameId, level, name, player: Player, state: State, states: [State]}
    app.get "/games/:gameId", (req, res) ->
        games.fetch req.param('gameId'), (err, game) ->
            if err? then return res.send err, 500
            if !game then return res.send 404
            res.send game

    # returns only the latest state for a game
    # ret: State
    app.get "/games/:gameId/state", (req, res) ->
        games.fetch req.param('gameId'), (err, game) ->
            if err? then return res.send err, 500
            if !game then return res.send 404
            res.send game.state

    # ret: ["gameId"]
    app.get "/players/:username/games", notImplemented


    app


notImplemented = (req, res) ->
    res.send "Not Implemented", 501


if module == require.main
    app = exports.createServer()
    console.log "Started on " + PORT
    app.listen PORT

