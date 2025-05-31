import { bot } from './bot.js';

export class LightBot extends bot {
  constructor(x, y) {
    super(x, y);

    this.speed = 1;
    this.hp = 50;
    this.detectionRadius = 120;
    this.shootingRange = 80;
    this.damage = 5;

    this.colour = 'yellow';
    this.size = 7;
  }

  draw(ctx, camera) {
    const time = performance.now();

    const screenX = this.x - camera.x;
    const screenY = this.y - camera.y;

    const pulse = 10 + Math.sin(time / 100) * 10;
    const ringRadius = this.size + 4;
    const scanRadius = this.size + 6;
    const rotation = time / 500;
    const scanAngle = time / 300;

    const scanX = screenX + scanRadius * Math.cos(scanAngle);
    const scanY = screenY + scanRadius * Math.sin(scanAngle);

    ctx.save();

    ctx.shadowColor = "#FFA500";
    ctx.shadowBlur = pulse;

    ctx.fillStyle = "#FFA500";
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.size, 0, 2 * Math.PI);
    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.strokeStyle = "#FFA50088";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(screenX, screenY, ringRadius, rotation, rotation + Math.PI / 2);
    ctx.stroke();

    ctx.fillStyle = "#FFFF66";
    ctx.shadowColor = "#FFFF66";
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(scanX, scanY, 3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.lineWidth = 1;
    const glitchCount = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < glitchCount; i++) {
      const offsetX = (Math.random() - 0.5) * 20;
      const offsetY = (Math.random() - 0.5) * 20;
      const length = 5 + Math.random() * 15;

      ctx.strokeStyle = "#FFEA00";
      ctx.beginPath();
      ctx.moveTo(screenX + offsetX, screenY + offsetY);
      ctx.lineTo(screenX + offsetX + length, screenY + offsetY);
      ctx.stroke();
    }

    ctx.restore();
  }
}
