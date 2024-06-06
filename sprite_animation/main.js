window.onload = function() {
  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('2d');
  const image = new Image();
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

    function gameLoop(timestamp) {
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      context.clearRect(0, 0, canvas.width, canvas.height);
      sprite.update(deltaTime);
      sprite.draw(context, canvas.width / 2 - sprite.frameWidth / 2, canvas.height / 2 - sprite.frameHeight / 2);

      requestAnimationFrame(gameLoop);
    }

    console.log('Run loop');
    requestAnimationFrame(gameLoop);
  };

  image.onerror = function() {
    console.error('Failed to load image');
  };
}