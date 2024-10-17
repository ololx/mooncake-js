class Frame {
    constructor(col, row, duration) {
        this.col = col;
        this.row = row;
        this.duration = duration;
    }
}

class Animation {
    constructor(frames) {
        this.frames = frames;
        this.currentFrameIndex = 0;
        this.elapsedTime = 0;
    }

    update(deltaTime) {
        const currentFrame = this.frames[this.currentFrameIndex];
        this.elapsedTime += deltaTime;

        if (this.elapsedTime > currentFrame.duration) {
            this.elapsedTime = 0;
            this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length;
        }
    }

    getCurrentFrame() {
        return this.frames[this.currentFrameIndex];
    }
}

class AnimatedSprite {
    constructor(image, rows, cols, animations) {
        this.image = image;
        this.textture = null;
        this.rows = rows;
        this.cols = cols;
        this.frameWidth = image.width / cols;
        this.frameHeight = image.height / rows;
        this.animations = animations;
        this.currentAnimation = null;
    }

    switchAnimation(key) {
        if (this.animations[key]) {
            this.currentAnimation = this.animations[key];
        } else {
            console.error(`Animation ${key} does not exist`);
        }
    }

    update(deltaTime) {
        if (this.currentAnimation) {
            this.currentAnimation.update(deltaTime);
        }
    }

    draw(context, x, y, dWidth, dHeight) {
        if (!this.currentAnimation) {
            return;
        }

        if (!this.textture) {
            this.textture = context.createTexture(this.image);
        }

        const frame = this.currentAnimation.getCurrentFrame();

        const sx = frame.col * this.frameWidth;
        const sy = frame.row * this.frameHeight;
        const sWidth = this.frameWidth;
        const sHeight = this.frameHeight;

        context.drawImage(this.textture, sx, sy, sWidth, sHeight, x, y, dWidth, dHeight);
    }
}
