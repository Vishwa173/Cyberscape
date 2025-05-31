export class Tile {
    constructor(row, col, layout) {
        this.row = row;
        this.col = col;
        this.layout = layout;
        this.isHomeBase = false;
        this.isHub = false;
        this.isSafeZone = false;
        this.isBotFactory = false
    }

    draw(ctx, tileSize, camera) {
        const time = performance.now();
        const x = this.col * (tileSize + 60) - camera.x;
        const y = this.row * (tileSize + 60) - camera.y;

        ctx.save();

        let baseColor = "lime";
        let glowColor = "lime";

        if (this.isHomeBase) {
            baseColor = "#00FFFF";
            glowColor = "#00FFFF";
        } else if (this.isHub) {
            baseColor = "orange";
            glowColor = "orange";
        } else if (this.isSafeZone) {
            baseColor = "#00CED1";
            glowColor = "#00CED1";
        } else if (this.isBotFactory) {
            baseColor = "#FF00FF";
            glowColor = "#FF00FF";
        }

        if (glowColor) {
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 20;
        }

        ctx.fillStyle = baseColor;
        ctx.fillRect(x, y, tileSize, tileSize);

        ctx.shadowBlur = 0;

        if (this.isSafeZone) {
            const scanY = y + (time / 10 % tileSize);
            ctx.strokeStyle = "#FFFFFF44";
            ctx.beginPath();
            ctx.moveTo(x, scanY);
            ctx.lineTo(x + tileSize, scanY);
            ctx.stroke();
        }

        if (this.isBotFactory) {
            for (let i = 0; i < 50; i++) {
                const offsetY = Math.random() * tileSize;
                ctx.strokeStyle = "#FF66FFAA";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x, y + offsetY);
                ctx.lineTo(x + tileSize, y + offsetY);
                ctx.stroke();
            }
        }

        ctx.fillStyle = "black";
        for (let part of this.layout) {
            ctx.fillRect(x + part.x, y + part.y, part.w, part.h);
        }

        const centerX = x + tileSize / 2;
        const centerY = y + tileSize / 2;
        const timeOffset = performance.now();

        if (this.isHomeBase) {
            const pulse = 8 + Math.sin(timeOffset / 150) * 4;
            const rotation = timeOffset / 400;

            ctx.shadowColor = "#00FFFF";
            ctx.shadowBlur = 20;
            ctx.fillStyle = "#00FFFF";
            ctx.beginPath();
            ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.strokeStyle = "#00FFFF88";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(centerX, centerY, pulse + 6, rotation, rotation + Math.PI / 2);
            ctx.stroke();
        }

        if (this.isHub) {
            const pulse = 8 + Math.sin(timeOffset / 100) * 3;
            const rotation = timeOffset / 300;

            ctx.shadowColor = "orange";
            ctx.shadowBlur = 15;
            ctx.fillStyle = "orange";
            ctx.beginPath();
            ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.strokeStyle = "#FFA50088";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, pulse + 5, rotation, rotation + Math.PI / 3);
            ctx.stroke();
        }       

        ctx.strokeStyle = "green";
        ctx.lineWidth = 2.5;

        if (this.row < 5) {
            ctx.beginPath();
            ctx.moveTo(x, y + tileSize + 30);
            ctx.lineTo(x + tileSize + 60, y + tileSize + 30);
            ctx.stroke();
        }

        if (this.col < 9) {
            ctx.beginPath();
            ctx.moveTo(x + tileSize + 30, y);
            ctx.lineTo(x + tileSize + 30, y + tileSize + 60);
            ctx.stroke();
        }

        ctx.restore();
    }
}
