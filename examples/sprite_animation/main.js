import { Vector2 } from '../../math.js';
import { GraphicParameters, SpriteFrame, AnimatedSprite, SpriteAnimation } from '../../graphic_object.js';

window.onload = function() {
  const canvas = document.getElementById('canvas');
  const context = new WebGlContext(canvas);
  const image = new Image();
  //image.crossOrigin = "anonymous";
  image.src = 'cake.png';

  image.onload = function() {
    console.log('Image loaded successfully');

    const idleFrames = [
      new SpriteFrame(0, 0, 150),
      new SpriteFrame(1, 0, 100),
      new SpriteFrame(2, 0, 150),
      new SpriteFrame(3, 0, 100),
      new SpriteFrame(4, 0, 150)
    ];

    const animations = {
      idle: new SpriteAnimation(idleFrames)
    };

    const sprite = new AnimatedSprite(context, Vector2.of((canvas.width / 2) - 102, (canvas.height / 2) + 102), new GraphicParameters({width: 1020, height: 204}), context.createTexture(image), 1, 5, animations);
    sprite.switchAnimation('idle');
    console.log('Create sprite');

    let lastTime = performance.now();
    let tileSize = Math.min(canvas.width / 30, canvas.height / 20);
    function gameLoop(timestamp) {
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      context.clear(0, 0, canvas.width, canvas.height);
      sprite.update(deltaTime);
      sprite.draw();

      requestAnimationFrame(gameLoop);
    }

    console.log('Run loop');
    requestAnimationFrame(gameLoop);
  };

  image.onerror = function() {
    console.error('Failed to load image');
  };
}