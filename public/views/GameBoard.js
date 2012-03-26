define( [ "underscore"
        , "views/View"
        , "text!views/GameBoard.html"
        , "views/Cell"
        ],
       
function (_
        , View
        , template
        , CellView
        ) {

    return View.extend({
        template: template,

        initialize: function () {
            $(window).resize(_.bind(this.resize, this))

            this.reset()
        },

        render: function () {
            var state = this.model.states[this.currentTurn]
            this.$el.css("background-size", this.scale)

            for (var i = 0; i < state.mines.length; i++) {
                this.renderEntity("mine", state.mines[i])
            }
            this.renderEntity("finish", {x: state.target.x, y: state.target.y, id: "finish"})
            this.renderEntity("player", {x: state.player.x, y: state.player.y, id: "player"})
        },

        renderEntity: function (type, entityModel) {
            if (!this.entitiesById[entityModel.id]) {
                this.addEntity(type, entityModel)
            }
            else {
                var entity = this.entitiesById[entityModel.id]
                entity.updateModel(entityModel)
            }
        },

        addEntity: function (type, entityModel) {
            var entity = new CellView(entityModel, type)
            this.$el.append(entity.$el)

            entity.setScale(this.scale)

            this.entitiesById[entityModel.id] = entity
            this.cells.push(entity)
        },

        updateCellScales: function () {
            for (var i = 0; i < this.cells.length; i++) {
                this.cells[i].setScale(this.scale)
            }
        },

        resize: function () {
            if (!this.model) return
            this.calculateScale()
            this.updateCellScales()
            this.render()
        },

        calculateScale: function () {
            var height = this.$el.height()

            this.scale = Math.floor(height / this.model.state.size.h)
            this.$el.width(this.scale * this.model.state.size.w + 1)
        },

        play: function () {
            if (this.interval) return
            this.interval = setInterval(_.bind(this.tick, this), 2000)
        },

        stop: function () {
            clearInterval(this.interval)
            this.interval = null
        },

        tick: function () {
            if (this.model.states[this.currentTurn + 1]) {
                this.currentTurn++
                this.render()
            }
            else {
                this.stop()
            }
        },

        playGame: function (gameId) {
            var self = this
            this.reset()

            $.get("/minefield/games/" + gameId, function (game) {
                self.model = game
                self.resize()
                self.play()
                self.render()
            })
        },

        reset: function () {
            this.stop()

            if (this.cells) {
                for (var i = 0; i < this.cells.length; i++) {
                    this.cells[i].destroy()
                }
            }

            this.cells = []
            this.currentTurn = 0
            this.entitiesById = {}
        }
    })
})
