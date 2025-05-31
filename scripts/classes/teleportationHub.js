export class TeleportHub {
  constructor(x, y, frames, id) {
    this.x = x;
    this.y = y;
    this.frames = frames;
    this.currentFrame = 0;
    this.frameTimer = 0;
    this.frameInterval = 100;

    this.width = 64;
    this.height = 64;

    this.id = id;
    this.wasPlayerOnHub = false;
  }

  update(deltaTime, player, allHubs) {
  this.frameTimer += deltaTime * 1000;
  if (this.frameTimer >= this.frameInterval) {
    this.currentFrame = (this.currentFrame + 1) % this.frames.length;
    this.frameTimer = 0;
  }

  const dx = player.x - this.x;
  const dy = player.y - this.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const playerIsOnHub = dist < 50;

  if (playerIsOnHub && !this.wasPlayerOnHub) {
    const popup = document.getElementById("teleportPopup");
    const input = document.getElementById("teleportInput");

    popup.style.display = "flex";
    input.value = "";
    input.focus();

    input.onkeydown = (e) => {
      if (e.key === "Enter") {
        const targetID = input.value.trim();
        const targetHub = allHubs.find(h => h.id === targetID && h !== this);

        if (targetHub) {
          player.x = targetHub.x + targetHub.width / 2;
          player.y = targetHub.y + targetHub.height / 2;
        } else {
          alert("No portal found with that ID.");
        }

        popup.style.display = "none";
      }
    };
  }
  
  if (!playerIsOnHub && this.wasPlayerOnHub) {
    document.getElementById("teleportPopup").style.display = "none";
  }

  this.wasPlayerOnHub = playerIsOnHub;
}


  draw(ctx, camX, camY) {
    const frame = this.frames[this.currentFrame];
    ctx.drawImage(frame, this.x - camX, this.y - camY, this.width, this.height);
  }
}
