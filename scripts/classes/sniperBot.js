import { bot } from './bot.js';

export class SniperBot extends bot {
  constructor(x, y) {
    super(x, y);
    this.speed = 0.7;
    this.hp = 80;
    this.detectionRadius = 300;
    this.shootingRange = 250;
    this.damage = 15;
    this.size = 12;
  }

  draw(ctx, camera) {
    const time = performance.now();
    const screenX = this.x - camera.x;
    const screenY = this.y - camera.y;

    const pulse = 6 + Math.sin(time / 200) * 4;
    const rotation = time / 700;

    ctx.save();

    ctx.shadowColor = "#8A2BE2";
    ctx.shadowBlur = pulse;

    ctx.fillStyle = "#8A2BE2";
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.size, 0, 2 * Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = "#8A2BE288";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.size + 5, rotation, rotation + Math.PI / 1.5);
    ctx.stroke();

    const scanOffset = Math.sin(time / 300) * this.size;
    ctx.strokeStyle = "#B57FFF";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(screenX - this.size, screenY + scanOffset);
    ctx.lineTo(screenX + this.size, screenY + scanOffset);
    ctx.stroke();

    if (Math.random() < 0.2) {
      const glitchX = screenX + (Math.random() - 0.5) * 30;
      const glitchY = screenY + (Math.random() - 0.5) * 30;
      const glitchLength = 6 + Math.random() * 8;

      ctx.strokeStyle = "#D8BFFF";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(glitchX, glitchY);
      ctx.lineTo(glitchX + glitchLength, glitchY);
      ctx.stroke();
    }

    ctx.restore();
  }
}
