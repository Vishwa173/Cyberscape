export class Bullet {
    constructor(x, y, targetX, targetY, speed = 15, damage = 10, passThroughWalls = false) {
        this.x = x;
        this.y = y;

        const dx = targetX - x;
        const dy = targetY - y;
        const dist = Math.hypot(dx, dy);

        this.dx = (dx / dist) * speed;
        this.dy = (dy / dist) * speed;

        this.width = 32;
        this.height = 32;

        this.hit = false;
        this.frame = 0;
        this.spriteSheet = document.querySelector("#bullet-sprite");
        this.damage = damage;

        this.passThroughWalls = passThroughWalls;
    }

    update(player, buildingRects) {
        if (!this.hit) {
            this.x += this.dx;
            this.y += this.dy;

            if (!this.passThroughWalls) {
                for (const rect of buildingRects) {
                    if (
                        this.x < rect.x + rect.w &&
                        this.x + this.width > rect.x &&
                        this.y < rect.y + rect.h &&
                        this.y + this.height > rect.y
                    ) {
                        this.hit = true;
                        return;
                    }
                }
            }

            if (this.checkCollision(player)) {
                this.hit = true;
                player.health -= this.damage;
                if (player.health < 0) player.health = 0;
            }
        }
    }

    draw(ctx, camera) {
        ctx.drawImage(
            this.spriteSheet,
            this.frame * 32, 0,
            32, 32,
            this.x - camera.x - 16,
            this.y - camera.y - 16,
            32, 32
        );
    }

    checkCollision(player) {
        return (
            this.x < player.x + player.size &&
            this.x + this.width > player.x &&
            this.y < player.y + player.size &&
            this.y + this.height > player.y
        );
    }
}