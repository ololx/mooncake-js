//import { Vector2 } from 'math.js';

class GraphicParameters {

    constructor(size = { width: 0, height: 0 }) {
        this.size = size;
    }
}

class GraphicObject {

    constructor(render, position = Vector2.zero(), parameters = new GraphicParameters()) {
        this.render = render;
        this.position = position;
        this.parameters = parameters;
    }

    draw() {};
}

class Sprite extends GraphicObject {

    constructor(render, position = Vector2.zero(), parameters = new GraphicParameters(), texture) {
        super(render, position, parameters);
        this.texture = texture;
    }

    draw() {
        this.render.drawImage(
            this.texture,
            0, 0,
            this.parameters.size.width, this.parameters.size.height,
            this.position.x, this.position.y,
            this.parameters.size.width, this.parameters.size.height
        );
    }
}

class SpriteFrame {

    constructor(col, row, duration) {
        this.col = col;
        this.row = row;
        this.duration = duration;
    }
}

class SpriteAnimation {

    constructor(frames) {
        this.frames = frames;
        this.currentFrameIndex = 0;
        this.elapsedTime = 0.0;
    }

    update(deltaTime) {
        const currentFrame = this.frames[this.currentFrameIndex];
        this.elapsedTime += deltaTime;

        if (this.elapsedTime >= currentFrame.duration) {
            this.elapsedTime -= currentFrame.duration;
            this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length;
        }
    }

    getCurrentFrame() {
        return this.frames[this.currentFrameIndex];
    }
}

class AnimatedSprite extends Sprite {

    constructor(render, position = Vector2.zero(), parameters = new GraphicParameters(), texture, rows, cols, animations) {
        super(render, position, parameters, texture);
        this.rows = rows;
        this.cols = cols;
        this.frameWidth = parameters.size.width / cols;
        this.frameHeight = parameters.size.height / rows;
        this.animations = animations;
        this.currentAnimation = animations["idle"];
    }

    switchAnimation(key) {
        if (this.animations[key]) {
            this.currentAnimation = this.animations[key];
        } else {
            console.warn(`Animation ${key} does not exist`);
        }
    }

    update(deltaTime = 0) {
        if (this.currentAnimation) {
            this.currentAnimation.update(deltaTime);
        }
    }

    draw() {
        if (!this.currentAnimation) {
            return;
        }

        const frame = this.currentAnimation.getCurrentFrame();
        let frameX = frame.col * this.frameWidth;
        let frameY = frame.row * this.frameHeight;

        this.render.drawImage(
            this.texture,
            frameX, frameY,
            this.frameWidth, this.frameHeight,
            this.position.x, this.position.y,
            this.frameWidth, this.frameHeight,
        );
    }
}
