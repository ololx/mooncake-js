const GameStatus = {
  RUNNING: 'RUNNING',
  STOPPED: 'STOPPED'
};

class Ball {
  constructor(canvas, radius, speed) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.radius = radius;
    this.speed = speed;
    this.x = radius;
    this.y = canvas.height / 2;
    this.direction = 1;
  }

  update(elapsedTime) {
    const step = this.speed * elapsedTime / 1000;
    this.x += step * this.direction;
    if (this.x + this.radius >= this.canvas.width || this.x - this.radius <= 0) {
      this.direction *= -1;
    }
  }

  render() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.beginPath();
    this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    this.context.fillStyle = 'black';
    this.context.fill();
    this.context.closePath();
  }

  setSpeed(speed) {
    this.speed = speed;
  }
}

class GameLoop {
  constructor(maxFPS, ball) {
    this.logger = console;
    this.status = GameStatus.STOPPED;
    this.targetFPS = maxFPS;
    this.frameDuration = 1000 / maxFPS;
    this.ball = ball;
    this.previousTime = null;
    this.lag = 0;
    this.requestId = null;

    this.frames = 0;
    this.fps = 0;
    this.lastFPSUpdate = Date.now();
    this.fpsInterval = 1000;
  }

  run() {
    this.status = GameStatus.RUNNING;
    this.previousTime = Date.now();
    this.gameLoop();
  }

  stop() {
    this.status = GameStatus.STOPPED;
    cancelAnimationFrame(this.requestId);
  }

  isGameRunning() {
    return this.status === GameStatus.RUNNING;
  }

  processInput() {}

  updateFPS() {
    const currentTime = Date.now();
    if (currentTime - this.lastFPSUpdate >= this.fpsInterval) {
      this.fps = this.frames;
      this.frames = 0;
      this.lastFPSUpdate = currentTime;
      document.getElementById('fps').innerText = this.fps;
    }
    this.frames++;
  }

  gameLoop() {
    if (!this.isGameRunning()) {
      return;
    }

    const currentTime = Date.now();
    const elapsedTime = currentTime - this.previousTime;

    if (elapsedTime >= this.frameDuration) {
      this.previousTime = currentTime - (elapsedTime % this.frameDuration);
      this.lag += elapsedTime;

      this.processInput();

      while (this.lag >= this.frameDuration) {
        this.ball.update(this.frameDuration);
        this.lag -= this.frameDuration;
      }

      this.ball.render();
      this.updateFPS();
    }

    this.requestId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  setMaxFPS(maxFPS) {
    this.targetFPS = maxFPS;
    this.frameDuration = 1000 / maxFPS;
  }
}

let canvas = document.getElementById('canvas');
let fpsInput = document.getElementById('fpsInput');
let speedInput = document.getElementById('speedInput');
let ball = new Ball(canvas, 20, parseInt(speedInput.value, 10));
let gameLoop = new GameLoop(parseInt(fpsInput.value, 10), ball);

function startGame() {
  if (gameLoop.isGameRunning()) {
    gameLoop.stop();
  }

  ball.setSpeed(parseInt(speedInput.value, 10));
  gameLoop.setMaxFPS(parseInt(fpsInput.value, 10));
  
  gameLoop.run();
}

function stopGame() {
  if (gameLoop) {
    gameLoop.stop();
  }
}
