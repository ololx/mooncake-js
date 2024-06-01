class GameLoop {
  
  static GameStatus = {
    RUNNING: 'RUNNING',
    STOPPED: 'STOPPED'
  };

  #targetFPS;
  #frameDuration;

  constructor(maxFPS, ball) {
    this.status = GameLoop.GameStatus.STOPPED;
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
    this.status = GameLoop.GameStatus.RUNNING;
    this.previousTime = Date.now();
    this.gameLoop();
  }

  stop() {
    this.status = GameLoop.GameStatus.STOPPED;
    cancelAnimationFrame(this.requestId);
  }

  isGameRunning() {
    return this.status === GameLoop.GameStatus.RUNNING;
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
}
