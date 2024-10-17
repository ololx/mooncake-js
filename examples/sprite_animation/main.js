window.onload = function() {
  const canvas = document.getElementById('canvas');
  const context = new WebGlContext(canvas);
  const image = new Image();
  //image.crossOrigin = "anonymous";
  image.src = 'cake.png';

  image.onload = function() {
    console.log('Image loaded successfully');

    const idleFrames = [
      new Frame(0, 0, 150),
      new Frame(1, 0, 100),
      new Frame(2, 0, 150),
      new Frame(3, 0, 100),
      new Frame(4, 0, 150)
    ];

    const animations = {
      idle: new Animation(idleFrames)
    };

    const sprite = new AnimatedSprite(image, 1, 5, animations);
    sprite.switchAnimation('idle');
    console.log('Create sprite');

    let lastTime = performance.now();
    let tileSize = Math.min(canvas.width / 30, canvas.height / 20);
    function gameLoop(timestamp) {
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      context.clear(0, 0, canvas.width, canvas.height);
      sprite.update(deltaTime);
      sprite.draw(context,
          100,
          200,
          200, 200
      );

      requestAnimationFrame(gameLoop);
    }

    console.log('Run loop');
    requestAnimationFrame(gameLoop);
  };

  image.onerror = function() {
    console.error('Failed to load image');
  };
}