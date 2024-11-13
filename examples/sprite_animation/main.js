import { Vector2 } from '../../math.js';
import { SpriteFrame, AnimatedSprite, SpriteAnimation, WebGlContext } from '../../rendering.js';
import { ResourceManager, ResourceLoader, Resource, ResourceType} from '../../assets.js';

window.onload = async function() {
  const canvas = document.getElementById('canvas');
  const context = new WebGlContext(canvas);
  const resources = new ResourceManager(canvas.getContext('webgl2'));
  resources.importResource('cake.png', 'image')
  const resourcess = new ResourceLoader(canvas.getContext('webgl2'))
  const ff = await resourcess.loadResource(ResourceType.IMAGE, 'cake.png');

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

  const cake = await resources.loadResource('cake.png');

  const sprite = new AnimatedSprite(context, Vector2.of((canvas.width / 2) - 102, (canvas.height / 2) + 102), Vector2.of(1020, 204), cake, 1, 5, animations);
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