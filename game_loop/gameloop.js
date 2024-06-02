const Status = Object.freeze({
    RUNNING: 'RUNNING',
    STOPPED: 'STOPPED'
});

class FpsCounter {
    #lastFpsUpdateTime = Date.now();
    #fpsUpdateIntervalMS = 1000;
    #currentFrames = 0;
    #fps = 0;
    #renderCallback;

    constructor(renderCallback = (fps) => {}) {
        this.#renderCallback = renderCallback;
    }

    update() {
        const currentTime = Date.now();

        if (currentTime - this.#lastFpsUpdateTime >= this.#fpsUpdateIntervalMS) {
            this.#fps = this.#currentFrames;
            this.#currentFrames = 0;
            this.#lastFpsUpdateTime = currentTime;
        }

        this.#currentFrames++;
    }

    render() {
        this.#renderCallback(this.#fps);
    }
}

class GameLoop {
    #targetFPS;
    #frameDuration;
    #status;
    #ball;
    #previousTime = null;
    #lag = 0;
    #requestId = null;
    #fpsCounter;

    constructor(maxFPS, ball, fpsCounter) {
        this.#status = Status.STOPPED;
        this.#targetFPS = maxFPS;
        this.#frameDuration = 1000 / maxFPS;
        this.#ball = ball;
        this.#fpsCounter = fpsCounter;
    }

    run() {
        this.#status = Status.RUNNING;
        this.#previousTime = Date.now();
        this.#gameLoop();
    }

    stop() {
        this.#status = Status.STOPPED;
        cancelAnimationFrame(this.#requestId);
    }

    isGameRunning() {
        return this.#status === Status.RUNNING;
    }

    processInput() {
    }

    updateFPS() {
        this.#fpsCounter.update();
    }

    #gameLoop() {
        if (!this.isGameRunning()) {
            return;
        }

        const currentTime = Date.now();
        const elapsedTime = currentTime - this.#previousTime;

        if (elapsedTime >= this.#frameDuration) {
            this.#previousTime = currentTime - (elapsedTime % this.#frameDuration);
            this.#lag += elapsedTime;

            this.processInput();

            while (this.#lag >= this.#frameDuration) {
                this.#ball.update(this.#frameDuration);
                this.#lag -= this.#frameDuration;
            }

            this.#ball.render();
            this.#fpsCounter.update();
            this.#fpsCounter.render();
        }

        this.#requestId = requestAnimationFrame(this.#gameLoop.bind(this));
    }
}
