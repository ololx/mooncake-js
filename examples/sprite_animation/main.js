import { Vector2 } from '../../math.js';
import { SpriteFrame, AnimatedSprite, SpriteAnimation, WebGlContext } from '../../rendering.js';
import { Assets, Asset, AssetTypes} from '../../assets.js';

window.onload = async function() {
  const canvas = document.getElementById('canvas');
  const context = new WebGlContext(canvas);
  const cake = await Assets.loadSpriteSheet('cake.png');

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

  let texture = context.createTexture(cake.content);

  const sprite = new AnimatedSprite(context, Vector2.of((canvas.width / 2) - 102, (canvas.height / 2) + 102), Vector2.of(1020, 204), texture, 1, 5, animations);
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

  requestAnimationFrame(gameLoop);
}