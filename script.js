

  console.clear()

var GAME_STATES

;(function(GAME_STATES) {
  GAME_STATES["ready"] = "READY"
  GAME_STATES["playing"] = "PLAYING"
  GAME_STATES["ended"] = "ENDED"
  GAME_STATES["paused"] = "PAUSED"
})(GAME_STATES || (GAME_STATES = {}))

var SOUND

;(function(SOUND) {
  SOUND["move"] = "move"
  SOUND["dead"] = "dead"
  SOUND["collect"] = "collect"
  SOUND["start"] = "start"
})(SOUND || (SOUND = {}))

class App {
  constructor() {
    this.setupUI()
    this.setupGame()
  }

  setupUI() {
    this.score = document.getElementById("score")
    this.container = document.getElementById("container")
    this.boardContainer = document.getElementById("board-container")
    let startButton = Rx.Observable.fromEvent(
      document.getElementById("start-button"),
      "click"
    )
    startButton.subscribe(e => {
      console.log("click")
      this.startGame()
    })
  }

  setupGame() {
    let board = document.getElementById("board")

    this.game = new Snake(board)
    this.game.score.subscribe(score => (this.score.innerHTML = String(score)))
    this.game.state.subscribe(state => {
      this.gameState = state
      this.container.setAttribute("class", state)
    })
    this.game.direction.subscribe(direction =>
      this.boardContainer.setAttribute("class", direction)
    )
    this.game.reset()
  }

  startGame() {
    if (
      this.gameState == GAME_STATES.ready ||
      this.gameState == GAME_STATES.ended
    ) {
      this.game.start()
    }
  }
}

class Snake {
  SETTINGS = {
    grid: { size: 10, rows: 20, columns: 28 },
    game: { scoreIncrement: 10 },
    snake: {
      startLength: 3,
      startSpeed: 300,
      speedIncrement: 10,
      minSpeed: 100,
      growBy: 2
    }
  }

  DIRECTION = {
    up: { name: "up", x: 0, y: -1 },
    down: { name: "down", x: 0, y: 1 },
    left: { name: "left", x: -1, y: 0 },
    right: { name: "right", x: 1, y: 0 }
  }

  states = {
    direction: this.DIRECTION.up,
    nextDirection: [this.DIRECTION.up],
    speed: 0,
    game: GAME_STATES.ready,
    timeStamp: 0,
    snakeLength: 0,
    score: 0
  }

  

  sfxLibrary = {
    start: {
      Frequency: {
        Start: 463.2977575242697,
        Slide: 0.4268311992714056,
        RepeatSpeed: 0.6870767779635416
      },
      Generator: { A: 0.015696072909390766 },
      Volume: { Sustain: 0.11353385475559997, Decay: 0.15242709930669884 }
    },
    collect1: {
      Frequency: {
        Start: 1183.9224793246758,
        ChangeSpeed: 0.12793431035602038,
        ChangeAmount: 4.8612434857196085
      },
      Volume: {
        Sustain: 0.011448880380128946,
        Decay: 0.3895997546965799,
        Punch: 0.4554389528366015
      }
    },
    collect2: {
      Frequency: {
        Start: 1070.9337014976563,
        ChangeSpeed: 0.1375978771153015,
        ChangeAmount: 5.9409661118536246
      },
      Volume: {
        Sustain: 0.04890791064198004,
        Decay: 0.3415421194668815,
        Punch: 0.46291381941601983
      }
    },
    dead: {
      Frequency: {
        Start: 194.70758491034655,
        Slide: -0.011628522004559189,
        ChangeSpeed: 0.6591296059731018,
        ChangeAmount: 2.6287197798189297
      },
      Generator: { Func: "noise" },
      Volume: {
        Sustain: 0.17655222296084297,
        Decay: 0.24077933399701645,
        Punch: 0.6485369099751499
      }
    },
    move1: {
      Frequency: { Start: 452, Slide: -0.04, Min: 30, DeltaSlide: -0.05 },
      Generator: {
        Func: "sine",
        A: 0.08999657142884616,
        ASlide: 0.3390436675524937
      },
      Filter: { HP: 0.10068425608105215 },
      Volume: {
        Sustain: 0,
        Decay: 0.041,
        Attack: 0.011,
        Punch: 0.04,
        Master: 0.18
      }
    },
    move2: {
      Frequency: { Start: 452, Slide: -0.01, Min: 30, DeltaSlide: -0.05 },
      Generator: {
        Func: "sine",
        A: 0.08999657142884616,
        ASlide: 0.3390436675524937
      },
      Filter: { HP: 0.26, LPResonance: 0, HPSlide: 0.35, LPSlide: 0.51, LP: 1 },
      Volume: {
        Sustain: 0.02,
        Decay: 0.001,
        Attack: 0.021,
        Punch: 0.05,
        Master: 0.18
      },
      Phaser: { Offset: -0.03, Sweep: -0.02 },
      Vibrato: { FrequencySlide: 0.04, Frequency: 14.01, Depth: 0.06 }
    },
    move3: {
      Frequency: { Start: 452, Slide: -0.01, Min: 30, DeltaSlide: -0.05 },
      Generator: {
        Func: "sine",
        A: 0.08999657142884616,
        ASlide: 0.3390436675524937
      },
      Filter: { HP: 0.26, LPResonance: 0, HPSlide: 0.35, LPSlide: 0.51, LP: 1 },
      Volume: {
        Sustain: 0.02,
        Decay: 0.001,
        Attack: 0.021,
        Punch: 0.05,
        Master: 0.18
      },
      Phaser: { Offset: -0.03, Sweep: -0.02 },
      Vibrato: { FrequencySlide: 0.04, Frequency: 14.01, Depth: 0.16 }
    },
    move4: {
      Frequency: { Start: 452, Slide: -0.01, Min: 30, DeltaSlide: -0.05 },
      Generator: {
        Func: "sine",
        A: 0.08999657142884616,
        ASlide: 0.3390436675524937
      },
      Filter: { HP: 0.26, LPResonance: 0, HPSlide: 0.35, LPSlide: 0.51, LP: 1 },
      Volume: {
        Sustain: 0.02,
        Decay: 0.001,
        Attack: 0.021,
        Punch: 0.05,
        Master: 0.18
      },
      Phaser: { Offset: -0.03, Sweep: -0.02 },
      Vibrato: { FrequencySlide: 0.04, Frequency: 14.01, Depth: 0.27 }
    }
  }

  player = jsfx.Sounds(this.sfxLibrary)

  sounds = {
    collect: ["collect1", "collect2"],
    dead: ["dead"],
    start: ["start"],
    move: ["move1", "move2", "move3", "move4"]
  }

  grid = []
  snake = []

  

  state = new Rx.Subject()
  score = new Rx.Subject()
  direction = new Rx.Subject()

  constructor(boardElement) {
    this.board = boardElement

    

    this.board.style.setProperty("--grid-size", String(this.SETTINGS.grid.size))
    this.board.style.setProperty(
      "--grid-columns",
      String(this.SETTINGS.grid.columns)
    )
    this.board.style.setProperty("--grid-rows", String(this.SETTINGS.grid.rows))

    let count = this.SETTINGS.grid.columns * this.SETTINGS.grid.rows
    for (let i = 0; i < count; i++) {
      let sq = document.createElement("div")
      this.grid.push(sq)
      this.board.appendChild(sq)
    }

    

    this.input = new Input(document.body)

    this.keyPress = Rx.Observable.fromEvent(document, "keydown")
      .filter(
        e =>
          ["arrowright", "arrowleft", "arrowup", "arrowdown"].indexOf(
            e.key.toLowerCase()
          ) >= 0
      )
      .map(e => {
        e.preventDefault()
        return e.key.toLowerCase().replace("arrow", "")
      })

    let onEnter = Rx.Observable.fromEvent(document, "keydown").filter(
      e => ["enter"].indexOf(e.key.toLowerCase()) >= 0
    )

    this.touchStartSubscription = this.input.starts.subscribe(position => {
      this.touchStartPosition = position
    })

    this.touchEndSubscription = this.input.ends.subscribe(position => {
      let hDiff = this.touchStartPosition.x - position.x
      let hDiffAbs = Math.abs(hDiff)
      let vDiff = this.touchStartPosition.y - position.y
      let vDiffAbs = Math.abs(vDiff)

      if (hDiffAbs > 10 || vDiffAbs > 10) {
        if (hDiffAbs > vDiffAbs) {
          if (hDiff < 0) this.setDirection(this.DIRECTION["right"])
          else this.setDirection(this.DIRECTION["left"])
        } else {
          if (vDiff < 0) this.setDirection(this.DIRECTION["down"])
          else this.setDirection(this.DIRECTION["up"])
        }
      }
    })

    this.keyPressSubscription = this.keyPress.subscribe(key => {
      if (this.states.game == GAME_STATES.playing) {
        this.setDirection(this.DIRECTION[key])
      }
    })

    this.keyRestartSubscription = onEnter.subscribe(e => this.start())
  }

  playSound(type) {
    let options = this.sounds[type]
    let selected = options[Math.floor(Math.random() * options.length)]
    this.player[selected]()
  }

  checkDirection(setDirection, newDirection) {
    return setDirection.x != newDirection.x && setDirection.y != newDirection.y
  }

  setDirection(direction) {
    let queueable = false

    if (this.states.direction.name != this.states.nextDirection[0].name) {
      
      if (
        this.states.nextDirection.length == 1 &&
        this.checkDirection(this.states.nextDirection[0], direction)
      ) {
        queueable = true
      }
    }

    if (
      queueable &&
      this.checkDirection(this.states.nextDirection[0], direction)
    ) {
      this.states.nextDirection.push(direction)
      this.playSound(SOUND.move)
    } else if (this.checkDirection(this.states.direction, direction)) {
      this.states.nextDirection = [direction]
      this.playSound(SOUND.move)
    }
  }

  reset() {
    this.updateGameState(GAME_STATES.ready)

    this.snake = []
    this.states.direction = this.DIRECTION.up
    this.states.nextDirection = [this.DIRECTION.up]
    this.states.snakeLength = this.SETTINGS.snake.startLength
    this.updateScore(0)
    let center = {
      x: Math.round(this.SETTINGS.grid.columns / 2),
      y: Math.round(this.SETTINGS.grid.rows / 2)
    }

    for (let i = 0; i < this.states.snakeLength; i++) {
      let snakePart = {
        position: { x: center.x, y: center.y + i * 1 },
        direction: this.DIRECTION.up
      }

      this.snake.unshift(snakePart)
    }

    this.placeFood()

    this.draw()
  }

  draw() {
    
    for (let i = 0; i < this.grid.length; i++) this.grid[i].className = ""

    
    for (let i = 0; i < this.snake.length; i++) {
      let classes = ["snake"]
      if (this.states.game == GAME_STATES.ended) classes.push("dead")
      if (i == 0) classes.push("tail")
      if (i == this.snake.length - 1) classes.push("head")
      let snakePart = this.snake[i]
      let nextSnakePart = this.snake[i + 1] ? this.snake[i + 1] : null

      if (
        nextSnakePart &&
        snakePart.direction.name != nextSnakePart.direction.name
      ) {
        classes.push("turn-" + nextSnakePart.direction.name)
      }

      if (i == 0 && nextSnakePart) {
        classes.push(nextSnakePart.direction.name)
      } else {
        classes.push(snakePart.direction.name)
      }
      let gridIndex = this.getIndexFromPosition(snakePart.position)
      this.grid[gridIndex].className = classes.join(" ")
    }

    

    let foodSquare = this.grid[this.getIndexFromPosition(this.food)]
    foodSquare.className = "food"
  }

  getIndexFromPosition(position) {
    return position.x + position.y * this.SETTINGS.grid.columns
  }

  getPositionFromIndex(index) {
    let y = Math.floor(index / this.SETTINGS.grid.columns)
    let x = Math.floor(index % this.SETTINGS.grid.columns)
    return { x: x, y: y }
  }

  eatFood() {
    this.addScore()
    this.playSound(SOUND.collect)
    this.states.snakeLength += this.SETTINGS.snake.growBy
    this.states.speed -= this.SETTINGS.snake.speedIncrement
    if (this.states.speed < this.SETTINGS.snake.minSpeed)
      this.states.speed = this.SETTINGS.snake.minSpeed
    this.placeFood()
  }

  updateGameState(newState) {
    this.states.game = newState
    this.state.next(this.states.game)
  }

  addScore() {
    this.updateScore(this.states.score + this.SETTINGS.game.scoreIncrement)
  }

  updateScore(newScore) {
    this.states.score = newScore
    this.score.next(this.states.score)
  }

  placeFood() {
    let takenSpaces = []
    for (let i = 0; i < this.snake.length; i++) {
      let index = this.getIndexFromPosition(this.snake[i].position)
      takenSpaces.push(index)
    }

    let availableSpaces = []
    for (let i = 0; i < this.grid.length; i++) {
      if (takenSpaces.indexOf(i) < 0) availableSpaces.push(i)
    }

    let i = Math.floor(Math.random() * availableSpaces.length)
    this.food = this.getPositionFromIndex(availableSpaces[i])
  }

  tick(timeStamp) {
    if (this.states.game == GAME_STATES.playing) {
      if (
        !this.states.timeStamp ||
        timeStamp - this.states.timeStamp > this.states.speed
      ) {
        this.states.timeStamp = timeStamp
        if (this.states.nextDirection.length > 1) {
          this.states.direction = this.states.nextDirection.shift()
        } else {
          this.states.direction = this.states.nextDirection[0]
        }
        this.direction.next(
          this.states.nextDirection[this.states.nextDirection.length - 1].name
        )

        let snakeHead = this.snake[this.snake.length - 1]
        let newPosition = {
          x: snakeHead.position.x + this.states.direction.x,
          y: snakeHead.position.y + this.states.direction.y
        }

        

        if (
          newPosition.x < 0 ||
          newPosition.x > this.SETTINGS.grid.columns - 1 ||
          newPosition.y < 0 ||
          newPosition.y > this.SETTINGS.grid.rows - 1
        ) {
          return this.end()
        }

        

        for (let i = 0; i < this.snake.length; i++) {
          if (
            this.snake[i].position.x == newPosition.x &&
            this.snake[i].position.y == newPosition.y
          ) {
            return this.end()
          }
        }

        

        let newSnakeHead = {
          position: newPosition,
          direction: this.DIRECTION[this.states.direction.name]
        }
        this.snake.push(newSnakeHead)

        while (this.snake.length > this.states.snakeLength) {
          this.snake.shift()
        }

        

        if (
          newSnakeHead.position.x == this.food.x &&
          newSnakeHead.position.y == this.food.y
        ) {
          this.eatFood()
        }

        this.draw()
      }

      window.requestAnimationFrame(time => this.tick(time))
    }
  }

  start() {
    this.reset()
    this.playSound(SOUND.start)
    this.states.speed = this.SETTINGS.snake.startSpeed
    this.updateGameState(GAME_STATES.playing)
    this.tick(0)
    window.focus()
  }

  end() {
    console.warn("GAME OVER")
    this.playSound(SOUND.dead)
    this.updateGameState(GAME_STATES.ended)
    this.direction.next("")
    this.draw()
  }
}


class Input {
  constructor(element) {
    this.mouseDowns = Rx.Observable.fromEvent(element, "mousedown").map(
      this.mouseEventToCoordinate
    )
    this.mouseMoves = Rx.Observable.fromEvent(window, "mousemove").map(
      this.mouseEventToCoordinate
    )
    this.mouseUps = Rx.Observable.fromEvent(window, "mouseup").map(
      this.mouseEventToCoordinate
    )

    this.touchStarts = Rx.Observable.fromEvent(element, "touchstart").map(
      this.touchEventToCoordinate
    )
    this.touchMoves = Rx.Observable.fromEvent(element, "touchmove").map(
      this.touchEventToCoordinate
    )
    this.touchEnds = Rx.Observable.fromEvent(window, "touchend").map(
      this.touchEventToCoordinate
    )

    this.starts = this.mouseDowns.merge(this.touchStarts)
    this.moves = this.mouseMoves.merge(this.touchMoves)
    this.ends = this.mouseUps.merge(this.touchEnds)
  }

  mouseEventToCoordinate = mouseEvent => {
    mouseEvent.preventDefault()
    return {
      x: mouseEvent.clientX,
      y: mouseEvent.clientY
    }
  }

  touchEventToCoordinate = touchEvent => {
    
    return {
      x: touchEvent.changedTouches[0].clientX,
      y: touchEvent.changedTouches[0].clientY
    }
  }
}

let app = new App()




