import { Bullet } from './bullet.js';

export class Tower {
    constructor(row, col, tileSize, turretSprite, bulletsArray, playerRef) {
        this.row = row;
        this.col = col;
        this.tileSize = tileSize;

        this.x = col * (tileSize + 60) + tileSize / 2;
        this.y = row * (tileSize + 60) + tileSize / 2;

        this.angle = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() * 0.001 + 0.007);
        this.visionRange = tileSize * 0.65;
        this.visionAngle = Math.PI / 3;

        this.spriteSheet = turretSprite;
        this.totalFrames = 10;
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.frameInterval = 4;

        this.bullets = bulletsArray;
        this.player = playerRef;

        this.cooldown = 60;
        this.cooldownTimer = 0;
        this.detected = false;
        this.dx = 0;
        this.dy = 0;
        this.dist = 0;
    }

    circularAngleDiff(a1, a2) {
        const diff = Math.atan2(Math.sin(a2 - a1), Math.cos(a2 - a1));
        return Math.abs(diff);
    }

    update(player) {
        this.angle += this.rotationSpeed;
        if (this.angle > Math.PI * 2) this.angle -= Math.PI * 2;

        if(!player.isInvisible){ 
            this.dx = this.player.x + this.player.size / 2 - this.x;
            this.dy = this.player.y + this.player.size / 2 - this.y;
            this.dist = Math.hypot(this.dx, this.dy);
            const angleToPlayer = Math.atan2(this.dy, this.dx);
            const angleDiff = this.circularAngleDiff(this.angle, angleToPlayer);

            this.detected = this.dist < this.visionRange && angleDiff < this.visionAngle / 2;
            this.cooldownTimer++;
        }else{
            this.detected = false;
        }

        if (this.detected) {
            this.frameTimer++;
            if (this.frameTimer >= this.frameInterval) {
                this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
                this.frameTimer = 0;
            }
            if (this.cooldownTimer >= this.cooldown || this.cooldownTimer === 0) {
                const dirX = this.dx / this.dist;
                const dirY = this.dy / this.dist;
                this.bullets.push(new Bullet(this.x, this.y, this.player.x + this.player.size / 2, this.player.y + this.player.size / 2, 15, 10, true));
                this.cooldownTimer = 0;
            }
        } else {
            this.currentFrame = 0;
            this.frameTimer = 0;
        }
    }

    draw(ctx, camera) {
        const cx = this.x - camera.x;
        const cy = this.y - camera.y;

        ctx.save();
        ctx.translate(this.x - camera.x, this.y - camera.y);
        ctx.rotate(this.angle);
        ctx.drawImage(
            this.spriteSheet,
            0, this.currentFrame * 32,
            32, 32,
            -16, -16,
            32, 32
        );
        ctx.restore();

        ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, this.visionRange, this.angle - this.visionAngle / 2, this.angle + this.visionAngle / 2);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 0, 0, 1)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    normalizeAngle(angle) {
        return ((angle + Math.PI * 2) % (Math.PI * 2));
    }
}
