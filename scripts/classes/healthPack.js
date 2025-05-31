export class HealthPack {
    constructor(x, y, image) {
        this.x = x;
        this.y = y;
        this.size = 64;
        this.image = image;
        this.collected = false;
    }

    draw(ctx, camX, camY) {
        if (this.collected) return;
        ctx.drawImage(this.image, this.x - camX, this.y - camY, this.size, this.size);
    }

    checkCollision(player) {
        if (this.collected) return;

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const collisionDistance = this.size / 2 + player.size;

        if (distance < collisionDistance) {
            this.collected = true;
            player.health = Math.min(player.health + 20, 100);
        }
    }
}
