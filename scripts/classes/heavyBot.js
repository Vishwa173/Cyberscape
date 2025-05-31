import { bot } from './bot.js';

export class HeavyBot extends bot {
  constructor(x, y) {
    super(x, y);
    this.speed = 0.5;
    this.hp = 170;
    this.detectionRadius = 120;
    this.shootingRange = 80;
    this.damage = 7;
    this.size = 15;
  }

  draw(ctx, camera) {
    const time = performance.now();

    const screenX = this.x - camera.x;
    const screenY = this.y - camera.y;

    const pulse = 12 + Math.sin(time / 150) * 8;
    const ringRadius = this.size + 6;
    const scanRadius = this.size + 8;
    const rotation = time / 600;
    const scanAngle = time / 400;

    const scanX = screenX + scanRadius * Math.cos(scanAngle);
    const scanY = screenY + scanRadius * Math.sin(scanAngle);

    ctx.save();

    ctx.shadowColor = "#FF073A";
    ctx.shadowBlur = pulse;

    ctx.fillStyle = "#FF073A";
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.size, 0, 2 * Math.PI);
    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.strokeStyle = "#FF073A88";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(screenX, screenY, ringRadius, rotation, rotation + Math.PI / 2);
    ctx.stroke();

    ctx.fillStyle = "#FF5555";
    ctx.shadowColor = "#FF5555";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(scanX, scanY, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0;

    const glitchCount = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < glitchCount; i++) {
      const offsetX = (Math.random() - 0.5) * 25;
      const offsetY = (Math.random() - 0.5) * 25;
      const length = 8 + Math.random() * 12;

      ctx.strokeStyle = "#FF3333";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(screenX + offsetX, screenY + offsetY);
      ctx.lineTo(screenX + offsetX + length, screenY + offsetY);
      ctx.stroke();
    }

    ctx.restore();
  }
}
