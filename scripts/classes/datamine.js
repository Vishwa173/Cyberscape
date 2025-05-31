export class DataMine {
  constructor(x, y, image) {
    this.x = x;
    this.y = y;
    this.image = image;

    this.width = 64;
    this.height = 64;

    this.isActive = false;
    this.buildTime = 10000;
    this.activationTime = Date.now() + this.buildTime;

    this.shardsStored = 0;
    this.productionInterval = 5000;
    this.capacity = 10;

    this.productionProgress = 0;
    this.lastUpdateTime = Date.now();

    this.showPopup = false;
  }

  update(player, keys) {
    const now = Date.now();

    if (!this.isActive && now >= this.activationTime) {
      this.isActive = true;
      this.lastUpdateTime = now;
    }

    if (this.isActive && this.shardsStored < this.capacity) {
      const elapsed = now - this.lastUpdateTime;
      this.productionProgress += elapsed;

      while (this.productionProgress >= this.productionInterval && this.shardsStored < this.capacity) {
        this.shardsStored += 1;
        this.productionProgress -= this.productionInterval;
      }

      this.lastUpdateTime = now;
    }

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    this.showPopup = dist < 50;

    if (this.showPopup && keys["e"]) {
      player.dataShards += this.shardsStored;
      this.shardsStored = 0;
    }
  }

  draw(ctx, cameraX, cameraY) {
    const screenX = this.x - cameraX - this.width / 2;
    const screenY = this.y - cameraY - this.height / 2;

    ctx.drawImage(this.image, screenX, screenY, this.width, this.height);

    if (!this.isActive) {
      ctx.fillStyle = "rgba(255, 255, 0, 0.3)";
      ctx.fillRect(screenX, screenY, this.width, this.height);
    }

    if (this.showPopup) {
      this.drawPopup(ctx, screenX + this.width / 2, screenY);
    }
  }

  drawPopup(ctx, centerX, aboveY) {
    const boxWidth = 200;
    const boxHeight = 50;
    const x = centerX - boxWidth / 2;
    const y = aboveY - 60;

    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.fillRect(x, y, boxWidth, boxHeight);

    ctx.strokeStyle = "#00ffff";
    ctx.strokeRect(x, y, boxWidth, boxHeight);

    ctx.font = "14px Orbitron";
    ctx.fillStyle = "#00ffff";
    ctx.fillText(`Shards: ${this.shardsStored}`, x + 10, y + 20);
    ctx.fillText("Press E to collect", x + 10, y + 40);
  }
}