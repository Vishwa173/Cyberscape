import { PlayerBullet } from './playerBullet.js';

function isColliding(circle, rect) {
  const distX = Math.abs(circle.x - (rect.x + rect.w / 2));
  const distY = Math.abs(circle.y - (rect.y + rect.h / 2));

  if (distX > (rect.w / 2 + circle.r)) return false;
  if (distY > (rect.h / 2 + circle.r)) return false;

  if (distX <= (rect.w / 2)) return true;
  if (distY <= (rect.h / 2)) return true;

  const dx = distX - rect.w / 2;
  const dy = distY - rect.h / 2;
  return (dx * dx + dy * dy <= circle.r * circle.r);
}

export class Player {
  constructor(x, y, size, speed, bulletsArray, bulletImg) {
    this.x = x;
    this.y = y;
    this.size = size
    this.width = 36;
    this.height = 30;
    this.speed = speed;
    this.health = 100;
    this.ownedWeapons = ["handgun"];
    this.currentWeapon = "handgun";
    this.currentAction = "idle";
    this.frameIndex = 0;
    this.frameTimer = 0;
    this.frameInterval = 100;
    this.angle = 0; 
    this.renderScale = 2;
    this.playerBullets = bulletsArray;
    this.isFiring = false;
    this.fireCooldown = 0;
    this.fireRate = 0.2;
    this.inSafeZone = false;
    this.isInvisible = false;
    this.dataShards = 0;
    this.movementSpeedLevel = 1;
    this.fireRateLevel = 1;
    this.shieldCount = 0;
    this.mineCount = 0;
    this.teleportationHubCount = 0;

    this.animations = {
      idle: [],
      move: [],
      shoot: []
    };

    this.frameCounts = {
      idle: 20,
      move: 20,
      shoot: 3
    };

    this.loadFrames();
  }

  loadFrames() {
    ["idle", "move", "shoot"].forEach(action => {
      for (let i = 0; i < this.frameCounts[action]; i++) {
        const img = new Image();
        img.src = `../../sprites/player/${this.currentWeapon}/${action}/survivor-${action}_${this.currentWeapon}_${i}.png`;
        this.animations[action].push(img);
      }
    });
  }

  reloadWeaponSprites() {
    this.animations = {
      idle: [],
      move: [],
      shoot: []
    };
    this.loadFrames();
  }

  shoot(mouseX, mouseY, camera) {
    const bullet = new PlayerBullet(
      this.x + this.width / 2,
      this.y + this.height / 2,
      mouseX,
      mouseY
    );
    this.playerBullets.push(bullet);

    this.currentAction = "shoot";
    this.frameIndex = 0;
    this.frameTimer = 0;
    this.angle = Math.atan2(mouseY, mouseX);
  }

  move(input, mapWidth, mapHeight, buildingRects) {
    let dx = 0;
    let dy = 0;

    if (input.left) dx -= 1;
    if (input.right) dx += 1;
    if (input.up) dy -= 1;
    if (input.down) dy += 1;

    const moving = dx !== 0 || dy !== 0;

    if (this.currentAction !== "shoot") {
      this.currentAction = moving ? "move" : "idle";
    }

    const magnitude = Math.hypot(dx, dy);
    if (magnitude > 0) {
      dx /= magnitude;
      dy /= magnitude;

      const moveX = dx * this.speed;
      const moveY = dy * this.speed;

      const futureCircle = {
        x: this.x + moveX + this.width / 2,
        y: this.y + moveY + this.height / 2,
        r: Math.min(this.width, this.height) / 2 * 0.8,
      };

      const collides = buildingRects.some(rect => isColliding(futureCircle, rect));

      if (!collides) {
        this.x += moveX;
        this.y += moveY;

        this.x = Math.max(0, Math.min(this.x, mapWidth - this.width));
        this.y = Math.max(0, Math.min(this.y, mapHeight - this.height));

        this.angle = Math.atan2(dy, dx);
      }
    }
  }

  update(deltaTime, mouseX, mouseY, camera) {
    this.frameTimer += deltaTime;

    if (this.frameTimer >= this.frameInterval) {
      this.frameTimer = 0;
      this.frameIndex++;

      if (this.frameIndex >= this.frameCounts[this.currentAction]) {
        this.frameIndex = 0;
        if (this.currentAction === "shoot" && !this.isFiring) {
          this.currentAction = "idle";
        }
      }
    }

    if (this.isFiring) {
      this.fireCooldown -= deltaTime;
      if (this.fireCooldown <= 0) {
        this.fireCooldown = this.fireRate;
        this.shoot(mouseX, mouseY, camera);
     }
    }
  }

  draw(ctx, camX, camY) {
    const frame = this.animations[this.currentAction][this.frameIndex];
    const drawWidth = this.width * this.renderScale;
    const drawHeight = this.height * this.renderScale;

    if (frame && frame.complete) {
      ctx.save();

      const drawX = this.x - camX;
      const drawY = this.y - camY;

      ctx.translate(drawX, drawY);
      ctx.rotate(this.angle); 

      if (this.isInvisible) {
        ctx.globalAlpha = 0.4;
      }

      ctx.drawImage(frame, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

      ctx.restore();

      if (this.isInvisible) {
        ctx.globalAlpha = 1.0;
      }
    }
  }
}
