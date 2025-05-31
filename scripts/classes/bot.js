import { Bullet } from './bullet.js';

export class bot{
  constructor(x, y){
    this.x = x;
    this.y = y;

    this.speed = 1;
    this.hp = 100;
    this.detectionRadius = 150;
    this.shootoingRadius = 70;

    this.state = 'patrol';
    this.patrolPoints = [];
    this.currentPatrolIndex = 0;
    this.lastShotTime = 0;
    this.lastKnownPlayerPos = null;
    this. size = 15
    this.cityAlert = false;
  }

  update(player, buildingRects, botBullets) {
    if (player.inSafeZone) {
      this.state = 'patrol';
    }

    if(!player.isInvisible){ 
      if(!this.cityAlert){ 
        switch (this.state) {
          case 'travel':
            if (this.detectPlayer(player)) {
              this.state = 'chase';
              break;
            }
            this.moveTowards(this.targetPatrolStart.x, this.targetPatrolStart.y, buildingRects);

            const dx = this.x - this.targetPatrolStart.x;
            const dy = this.y - this.targetPatrolStart.y;
            if (Math.hypot(dx, dy) < 5) {
              this.state = 'patrol';
              this.currentPatrolIndex = 1;
              this.x = this.targetPatrolStart.x;
              this.y = this.targetPatrolStart.y;
            }
            break;
          case 'patrol':
            this.patrol(buildingRects);
            if (this.detectPlayer(player)) {
              this.state = 'chase';
            }
            break;
          case 'chase':
            this.chasePlayer(player, buildingRects);
            if (!this.isPlayerInDetection(player)) {
              this.state = 'patrol';
              this.lastKnownPlayerPos = null;
            } else if (this.isPlayerInRange(player)) {
              this.state = 'attack';
            }
            break;
          case 'attack':
            this.shootPlayer(player, botBullets);
            const inRange = this.isPlayerInRange(player);
            const canSeePlayer = this.isPlayerInDetection(player);

            if (!canSeePlayer) {
              this.state = 'patrol';
            }else if (!inRange) {
              this.state = 'chase';
            }else {
              this.moveTowards(player.x, player.y, buildingRects);
            }
          break;
        }
      }else{
        this.lastKnownPlayerPos = { x: player.x, y: player.y };
        this.moveTowards(this.lastKnownPlayerPos.x, this.lastKnownPlayerPos.y, buildingRects);
        if (this.isPlayerInRange(player)) {
          this.shootPlayer(player, botBullets);
        }
      }
    }else{
      if(this.state == 'chase' || this.state == 'attack'){
        this.state = 'patrol';
      }

      switch (this.state){
        case 'travel' :
          this.moveTowards(this.targetPatrolStart.x, this.targetPatrolStart.y, buildingRects);

          const dx = this.x - this.targetPatrolStart.x;
          const dy = this.y - this.targetPatrolStart.y;
          if (Math.hypot(dx, dy) < 5) {
            this.state = 'patrol';
            this.currentPatrolIndex = 1;
            this.x = this.targetPatrolStart.x;
            this.y = this.targetPatrolStart.y;
          }
          break;
        case 'patrol' :
          this.patrol(buildingRects);
          break;
      }
    }
  }

  detectPlayer(player) {
    return this.isPlayerInDetection(player);
  }

  isPlayerInDetection(player) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    return Math.sqrt(dx * dx + dy * dy) <= this.detectionRadius;
  }

  isPlayerInRange(player) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    return Math.sqrt(dx * dx + dy * dy) <= this.shootingRange;
  }

  chasePlayer(player, buildingRects) {
    if (this.isPlayerInDetection(player)) {
      this.lastKnownPlayerPos = { x: player.x, y: player.y };
    }

    if (this.lastKnownPlayerPos) {
      this.moveTowards(this.lastKnownPlayerPos.x, this.lastKnownPlayerPos.y, buildingRects);
    }
  }

  patrol(buildingRects) {
    if (this.patrolPoints.length === 0) return;

    const target = this.patrolPoints[this.currentPatrolIndex];
    const reached = this.moveTowards(target.x, target.y, buildingRects);

    if (reached) {
      this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
    }
  }

  moveTowards(targetX, targetY, buildingRects) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return true;

    const nx = dx / distance;
    const ny = dy / distance;

    const moveX = nx * Math.min(this.speed, distance);
    const moveY = ny * Math.min(this.speed, distance);

    const tryMove = (offsetX, offsetY) => {
      const nextX = this.x + offsetX;
      const nextY = this.y + offsetY;
      if (!this.collidesWithBuildings(nextX, nextY, buildingRects)) {
        this.x = nextX;
        this.y = nextY;
        return true;
      }
      return false;
    };

    if (tryMove(moveX, moveY)) return false;
    if (tryMove(moveX, 0)) return false;
    if (tryMove(0, moveY)) return false;

     return false;
  }

  collidesWithBuildings(x, y, buildingRects) {
    const botRect = { x: x - 8, y: y - 8, width: 20, height: 20 };
    return buildingRects.some(b =>
      botRect.x < b.x + b.w &&
      botRect.x + botRect.width > b.x &&
      botRect.y < b.y + b.h &&
      botRect.y + botRect.height > b.y
    );
  }

  shootPlayer(player, botBullets) {
    const now = performance.now();
    const cooldown = 800;

    if (!this.lastShotTime || now - this.lastShotTime > cooldown) {
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const bulletSpeed = 15;
      const bulletOffset = 20;

      const spawnX = this.x + (dx / distance) * bulletOffset;
      const spawnY = this.y + (dy / distance) * bulletOffset;

      const bullet = new Bullet(spawnX, spawnY, player.x, player.y, bulletSpeed, this.damage || 1);

      botBullets.push(bullet);
      this.lastShotTime = now;
    }
  }

  setPatrolPath(path) {
    this.patrolPoints = path;
  }
}