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
    const step = this.speed * elapsedTime;
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

let canvas = document.getElementById('canvas');
let fpsInput = document.getElementById('fpsInput');
let speedInput = document.getElementById('speedInput');
let ball = new Ball(canvas, 20, parseInt(speedInput.value, 10));
let gameController = new GameController([ball]);
let fpsCounter = new FpsCounter((fps) => {document.getElementById('fps').innerText = fps;});
let gameLoop;

function startGame() {
  if (gameLoop && gameLoop.isActive()) {
    gameLoop.stop();
  }

  ball.setSpeed(parseInt(speedInput.value, 10));
  gameLoop = new GameLoop(parseInt(fpsInput.value, 10), gameController, fpsCounter);

  gameLoop.start();
}

function stopGame() {
  if (gameLoop) {
    gameLoop.stop();
  }
}
