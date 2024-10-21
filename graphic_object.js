import { Vector2 } from './math.js';

export class GraphicObject {

    _position;

    _size;

    constructor(render, position = Vector2.zero(), size = Vector2.zero()) {
        this._render = render;
        this._position = position;
        this._size = size;
    }

    get position() {
        return this._position;
    }

    set position(position) {
        this._position = position;
    }

    get size() {
        return this._size;
    }

    set size(position) {
        this._size = size;
    }

    draw() {};
}

export class Sprite extends GraphicObject {
    
    constructor(render, position = Vector2.zero(), size = Vector2.zero(), texture) {
        super(render, position, size);
        this.texture = texture;
    }

    draw() {
        this._render.drawImage(
            { source: this.texture, width: this.size.x, height: this.size.y },
            0, 0,
            this.size.x, this.size.y,
            this.position.x, this.position.y,
            this.size.x, this.size.y
        );
    }
}

export class AnimatedSprite extends Sprite {

    constructor(render, position = Vector2.zero(), size = Vector2.zero(), texture, rows, cols, animations) {
        super(render, position, size, texture);
        this.rows = rows;
        this.cols = cols;
        this.frameWidth = size.x / cols;
        this.frameHeight = size.y / rows;
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

        this._render.drawImage(
            { source: this.texture, width: this.size.x, height: this.size.y },
            frameX, frameY,
            this.frameWidth, this.frameHeight,
            this.position.x, this.position.y,
            this.frameWidth, this.frameHeight
        );
    }
}

export class SpriteFrame {
    
    constructor(col, row, duration) {
        this.col = col;
        this.row = row;
        this.duration = duration;
    }
}

export class SpriteAnimation {

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
