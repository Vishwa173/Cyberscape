export class Camera {
  constructor(canvasWidth, canvasHeight, mapWidth, mapHeight) {
    this.x = 0;
    this.y = 0;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
  }

  update(player) {
    this.x = player.x + player.size / 2 - this.canvasWidth / 2;
   this.y = player.y + player.size / 2 - this.canvasHeight / 2;

    this.x = Math.max(0, Math.min(this.x, this.mapWidth - this.canvasWidth));
    this.y = Math.max(0, Math.min(this.y, this.mapHeight - this.canvasHeight));
  }
}
