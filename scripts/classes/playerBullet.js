function isColliding(cx, cy, r, rx, ry, rw, rh) {
  const closestX = Math.max(rx, Math.min(cx, rx + rw));
  const closestY = Math.max(ry, Math.min(cy, ry + rh));

  const dx = cx - closestX;
  const dy = cy - closestY;

  return dx * dx + dy * dy < r * r;
}

function destroyTower(row, col, towers) {
  for (let i = 0; i < towers.length; i++) {
    const tower = towers[i];
    if (tower.row === row && tower.col === col) {
      towers.splice(i, 1);
      break;
    }
  }
}

export class PlayerBullet {
    constructor(x, y, targetX, targetY) {
        this.x = x;
        this.y = y;

        const dx = targetX - x;
        const dy = targetY - y;
        const length = Math.hypot(dx, dy); 

        const speed = 500; 
        this.vx = (dx / length) * speed;
        this.vy = (dy / length) * speed;

        this.radius = 6;
        this.lifetime = 7;
    }

    reflect(rect) {
        const closestX = Math.max(rect.x, Math.min(this.x, rect.x + rect.w));
        const closestY = Math.max(rect.y, Math.min(this.y, rect.y + rect.h));

        let nx = this.x - closestX;
        let ny = this.y - closestY;

        let length = Math.hypot(nx, ny);

        if (length === 0) {
            this.vx = -this.vx * 0.6;
            this.vy = -this.vy * 0.6;
            return;
        }

        nx /= length;
        ny /= length;

        const dot = this.vx * nx + this.vy * ny;
        const e = 0.6;

        this.vx = this.vx - (1 + e) * dot * nx;
        this.vy = this.vy - (1 + e) * dot * ny;

        const overlap = this.radius - length;
        if (overlap > 0) {
            this.x += nx * overlap;
            this.y += ny * overlap;
        }
    }  

    update(deltaTime, buildingRects, towers, bots) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        for (let i = 0; i < buildingRects.length; i++) {
            const rect = buildingRects[i];

            if (isColliding(this.x, this.y, this.radius, rect.x, rect.y, rect.w, rect.h)) {
                this.reflect(rect);
                rect.health--;

                if (rect.health <= 0) {
                    rect.tile.layout.splice(rect.layoutIndex, 1);

                    buildingRects.splice(i, 1);
                    i--;

                    for (let j = i + 1; j < buildingRects.length; j++) {
                        if (buildingRects[j].tile === rect.tile && buildingRects[j].layoutIndex > rect.layoutIndex) {
                            buildingRects[j].layoutIndex--;
                        }
                    }
                destroyTower(rect.tile.row, rect.tile.col, towers);
            }
            break;
            }
        }

        for (let i = bots.length - 1; i >= 0; i--) {
            const bot = bots[i];
    
            const botSize = bot.size;
            const botX = bot.x - botSize / 2;
            const botY = bot.y - botSize / 2;

            if (isColliding(this.x, this.y, this.radius, botX, botY, botSize, botSize)) {
                bot.hp -= 40;
                this.lifetime = 0;

                if (bot.hp <= 0) {
                    bots.splice(i, 1);
                }
                break;
            }
        }

        this.lifetime -= deltaTime;
    }


    draw(ctx, camX, camY) {
        const screenX = this.x - camX;
        const screenY = this.y - camY;

        ctx.save();

        ctx.shadowColor = "#FFFFFF";
        ctx.shadowBlur = 20;

        const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, this.radius);
        gradient.addColorStop(0, "#FFFFFF");
        gradient.addColorStop(1, "#AAAAAA");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
