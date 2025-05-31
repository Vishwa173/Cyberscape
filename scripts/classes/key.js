export class Key {
  constructor(x, y, spriteSheet) {
    this.x = x;
    this.y = y;
    this.spriteSheet = spriteSheet;
    this.width = 32;
    this.height = 32;

    this.totalFrames = 24;
    this.currentFrame = 0;
    this.frameTimer = 0;
    this.frameInterval = 8; 

    this.collected = false;
  }

  update() {
    if (this.collected) return;

    this.frameTimer++;
    if (this.frameTimer >= this.frameInterval) {
      this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
      this.frameTimer = 0;
    }
  }

  draw(ctx, cameraX, cameraY) {
    if (this.collected) return;

    //console.log(this.x, this.y);

    ctx.drawImage(
      this.spriteSheet,
      this.currentFrame * this.width, 0, 
      this.width, this.height,           
      this.x - cameraX, this.y - cameraY,
      this.width, this.height           
    );
  }

  checkCollision(playerX, playerY, playerWidth, playerHeight) {
    //console.log("Player:", playerX, playerY, playerWidth, playerHeight);
    //console.log("Key:", this.x, this.y, this.width, this.height);

    return !(
        playerX > this.x + this.width ||
        playerX + playerWidth < this.x ||
        playerY > this.y + this.height ||
        playerY + playerHeight < this.y
    );
  }
}
