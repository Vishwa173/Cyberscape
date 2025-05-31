import { generateMap } from "./mapGenerator.js";
import { Tower } from "../classes/tower.js";
import { Player } from "../classes/player.js";
import { Camera } from "../classes/camera.js";
import { Key } from '../classes/key.js';
import { LightBot } from '../classes/lightBot.js';
import { HeavyBot } from '../classes/heavyBot.js';
import { SniperBot } from '../classes/sniperBot.js';
import { HealthPack } from '../classes/healthPack.js';
import { invisibilityShield } from "../classes/invisibilityShield.js";
import { DataMine } from "../classes/datamine.js";
import { TeleportHub } from "../classes/teleportationHub.js";

const tileSize = 200;
const tileGap = 60;
const ROWS = 6;
const COLS = 10;
let systemHealth = 85;
let systemHealthTimer = 0;
const sysHealthInterval = 2000;
let keysCollected = 0;
let shardsDelivered = 0;
let lastTime = performance.now();
let mouseX = 0;
let mouseY = 0;
let botSpawnTimer = 0;
let botSpawnInterval = 30000;
let botFactoryGrowthRate = 0.97;
const minSpawnInterval = 2000;
const initialHealthPackCount = 5;
let isMouseDown = false;
let isPaused = false;
let showHubPopup = false;
let hasClosedHubPopup = false;
let showBasePopup = false;
let hasClosedBasePopup = false;
let showMarketPopup = false;
let score = 0;
let isMarketCloseHover = false;
let rifleButtonRect = { x: 0, y: 0, width: 0, height: 0 };
let shotgunButtonRect = { x: 0, y: 0, width: 0, height: 0 };
let isHoveringRifle = false;
let isHoveringShotgun = false;
let movementSpeedRect =  { x: 0, y: 0, width: 0, height: 0 };
let fireRateRect =  { x: 0, y: 0, width: 0, height: 0 };
let isHoveringSpeed = false;
let isHoveringFire = false;
let speedPrice = 1;
let firePrice = 1;
const fireUpgradeBonus = -0.01;
let isHoveringHealth = false;
let isHoveringShield = false;
let healthRect =  { x: 0, y: 0, width: 0, height: 0 };
let shieldRect =  { x: 0, y: 0, width: 0, height: 0 };
let isHoveringMine = false;
let isHoveringTeleportationHub = false;
let mineRect =  { x: 0, y: 0, width: 0, height: 0 };
let teleportationHubRect =  { x: 0, y: 0, width: 0, height: 0 };
let isGameOver = false;
let highScore = parseInt(localStorage.getItem("highScore")) || 0;

let buildingRects = [];
let keys = [];
const playerBullets = [];
const bots = [];
const botBullets = [];
const healthPacks = [];
const shields = [];
const dataMines = [];
const teleportHubs = [];
const Keys = {};
const portalFrames = [];
const weaponBaseFireRates = {
  handgun: 0.2,
  rifle: 0.15,
  shotgun: 0.18,
};

const map = generateMap();

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext("2d");

const keySprite = new Image();
keySprite.src = '../../sprites/rotatingKey/rotatingKey.png';

const mapWidth = COLS * tileSize + (COLS - 1) * tileGap;
const mapHeight = ROWS * tileSize + (ROWS - 1) * tileGap; 
//console.log(mapHeight);
//console.log(mapWidth);

let baseRow, baseCol;

for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    if (map[r][c].isSafeZone) {
      baseRow = r;
      baseCol = c;
      break;
    }
  }
  if (baseRow !== undefined) break;
}

const bulletImage = new Image();
bulletImage.src = "../../sprites/player/bullet.png";

const healthPackImage = new Image();
healthPackImage.src = "../../sprites/powerup/healthPack.png";

const shieldImage = new Image();
shieldImage.src = "../../sprites/powerup/invisibilityShield.png";

const marketIcon = new Image();
marketIcon.src = "../../sprites/market/market.png";

const rifleImg = new Image();
rifleImg.src = "../../sprites/market/rifle.png";

const shotgunImg = new Image();
shotgunImg.src = "../../sprites/market/shotgun.png";

const movementSpeedImg = new Image();
movementSpeedImg.src = "../../sprites/market/movementSpeed.png";

const fireRateImg = new Image();
fireRateImg.src = "../../sprites/market/fireRate.png";

const dataMineImg = new Image();
dataMineImg.src = "../../sprites/market/dataMine.png";

const teleportationHubImg = new Image();
teleportationHubImg.src = "../../sprites/market/teleportationHub.png";

const dataShardImg = new Image();
dataShardImg.src = "../../sprites/dataShard.png";

const mineImg = new Image();
mineImg.src = " ../../sprites/dataMine.png";

for (let i = 1; i < 8; i++) {
  const img = new Image();
  img.src = `../../sprites/portal/Frames/frame_${i}.png`;
  portalFrames.push(img);
}

const playerSize = 30;
const baseX = baseCol * (tileSize + tileGap) + (tileSize - playerSize) / 2;
const baseY = (baseRow * (tileSize + tileGap) + (tileSize - playerSize) / 2) ;

const player = new Player(baseX, baseY, playerSize, 2, playerBullets, bulletImage);
const camera = new Camera(canvas.width, canvas.height, mapWidth, mapHeight);
player.health = 100;

const towers = [];

const input = {
  left: false,
  right: false,
  up: false,
  down: false
};

const turretSprite = new Image();
turretSprite.src = '../../sprites/turret/turret.png';

const bullets = [];

function drawMap(){
    for (let row of map) {
        for (let tile of row) {
            tile.draw(ctx, tileSize, camera);
        }
    }
}

for (let row of map) {
  for (let tile of row) {
    for (let i = 0; i < tile.layout.length; i++) {
      const part = tile.layout[i];
      const worldX = tile.col * (tileSize + tileGap) + part.x;
      const worldY = tile.row * (tileSize + tileGap) + part.y;

      buildingRects.push({
        x: worldX,
        y: worldY,
        w: part.w,
        h: part.h,
        health: 5,
        tile,         
        layoutIndex: i 
      });
    }
  }
}

const usedGapCoords = new Set();
const botTypes = [LightBot, HeavyBot, SniperBot];
const botsPerType = 3;

function getGapCenter(row, col) {
  const x = col * (tileSize + tileGap) + tileSize / 2;
  const y = row * (tileSize + tileGap) + tileSize / 2;
  return { x, y };
}

function generateGapPatrolPoints(centerX, centerY) {
  const size = tileSize + tileGap;
  return [
    { x: centerX - size / 2, y: centerY - size / 2 },
    { x: centerX + size / 2, y: centerY - size / 2 },
    { x: centerX + size / 2, y: centerY + size / 2 },
    { x: centerX - size / 2, y: centerY + size / 2 }
  ];
}

for (const BotType of botTypes) {
  let count = 0;

  while (count < botsPerType) {
    const row = Math.floor(Math.random() * (ROWS - 1)); 
    const col = Math.floor(Math.random() * (COLS - 1));
    const gapKey = `${row},${col}`;

    if (!usedGapCoords.has(gapKey)) {
      usedGapCoords.add(gapKey);

      const { x: centerX, y: centerY } = getGapCenter(row, col);
      const bot = new BotType(centerX, centerY);
      bot.patrolPoints = generateGapPatrolPoints(centerX, centerY);
      bot.x = bot.patrolPoints[0].x;
      bot.y = bot.patrolPoints[0].y;
      bot.currentPatrolIndex = 1;

      bots.push(bot);
      count++;
    }
  }
}

function spawnBotFromFactory() {
  const factoryTiles = [];

  for (let row of map) {
    for (let tile of row) {
      if (tile.isBotFactory) {
        factoryTiles.push(tile);
      }
    }
  }

  const tile = factoryTiles[Math.floor(Math.random() * factoryTiles.length)];
  const spawnX = tile.col * (tileSize + tileGap) + tileSize / 2;
  const spawnY = tile.row * (tileSize + tileGap) + tileSize / 2;

  const rand = Math.random();
  let BotType = LightBot;
  if (rand < 0.4) BotType = LightBot;
  else if (rand < 0.75) BotType = SniperBot;
  else BotType = HeavyBot;

  const maxTries = 50;
  for (let tries = 0; tries < maxTries; tries++) {
    const patrolRow = Math.floor(Math.random() * (ROWS - 1));
    const patrolCol = Math.floor(Math.random() * (COLS - 1));
    const gapKey = `${patrolRow},${patrolCol}`;

    if (!usedGapCoords.has(gapKey)) {
      usedGapCoords.add(gapKey);

      const { x: patrolCenterX, y: patrolCenterY } = getGapCenter(patrolRow, patrolCol);
      const patrolPoints = generateGapPatrolPoints(patrolCenterX, patrolCenterY);

      const bot = new BotType(spawnX, spawnY);
      bot.patrolPoints = patrolPoints;
      bot.targetPatrolStart = patrolPoints[0];
      bot.mode = "traveling";

      bots.push(bot);
      return;
    }
  }
}

let hoveredButtonIndex = -1;

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  hoveredButtonIndex = -1;
  const buttons = [pauseButton, resetButton];
  for (let i = 0; i < buttons.length; i++) {
    const btn = buttons[i];
    if (
      mouseX >= btn.x &&
      mouseX <= btn.x + btn.width &&
      mouseY >= btn.y &&
      mouseY <= btn.y + btn.height
    ) {
      hoveredButtonIndex = i;
      break;
    }
  }
});

function spawnHealthPack() {
    const x = Math.random() * mapWidth;
    const y = Math.random() * mapHeight;
    healthPacks.push(new HealthPack(x, y, healthPackImage));
}

for (let i = 0; i < initialHealthPackCount; i++) {
    spawnHealthPack();
}

function spawnShield() {
    const x = Math.random() * mapWidth;
    const y = Math.random() * mapHeight;
    shields.push(new invisibilityShield(x, y, shieldImage));
}

for (let i = 0; i < initialHealthPackCount; i++) {
    spawnShield();
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  camera.canvasWidth = canvas.width;
  camera.canvasHeight = canvas.height;

  drawMap();
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas(); 

drawMap();

let pauseButton = { x: 10, y: canvas.height - 50, width: 100, height: 35 };
let resetButton = { x: 120, y: canvas.height - 50, width: 100, height: 35 };

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  if (
    mouseX >= pauseButton.x &&
    mouseX <= pauseButton.x + pauseButton.width &&
    mouseY >= pauseButton.y &&
    mouseY <= pauseButton.y + pauseButton.height
  ) {
    isPaused = !isPaused;
  }

  if (
    mouseX >= resetButton.x &&
    mouseX <= resetButton.x + resetButton.width &&
    mouseY >= resetButton.y &&
    mouseY <= resetButton.y + resetButton.height
  ) {
    location.reload();
  }
});

window.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft" || e.key === "a") input.left = true;
  if (e.key === "ArrowRight" || e.key === "d") input.right = true;
  if (e.key === "ArrowUp" || e.key === "w") input.up = true;
  if (e.key === "ArrowDown" || e.key === "s") input.down = true;
});

window.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft" || e.key === "a") input.left = false;
  if (e.key === "ArrowRight" || e.key === "d") input.right = false;
  if (e.key === "ArrowUp" || e.key === "w") input.up = false;
  if (e.key === "ArrowDown" || e.key === "s") input.down = false;
});

canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left + camera.x;
  mouseY = e.clientY - rect.top + camera.y;
});

canvas.addEventListener("mousedown", e => {
  if (e.button === 0) { 
    isMouseDown = true;
    player.isFiring = true;
  }
});

canvas.addEventListener("mouseup", e => {
  if (e.button === 0) {
    isMouseDown = false;
    player.isFiring = false;
  }
});

function closeHubPopup() {
  showHubPopup = false;
  isPaused = false;
}

canvas.addEventListener("click", (e) => {
  if (showHubPopup) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (
      mx >= closeHubButton.x &&
      mx <= closeHubButton.x + closeHubButton.width &&
      my >= closeHubButton.y &&
      my <= closeHubButton.y + closeHubButton.height
    ) {
      showHubPopup = false;
      isPaused = false;
      hasClosedHubPopup = true;
      //console.log("popup closed.");
    }
  }
});

document.addEventListener("keydown", (e) => {
  if (showHubPopup && e.key.toLowerCase() === "e") {
    const shardsToAdd = Math.floor(keysCollected / 3);
    if (shardsToAdd > 0) {
      player.dataShards = (player.dataShards || 0) + shardsToAdd;
      keysCollected -= shardsToAdd * 3;
    }
    closeHubPopup();
  }
});

function closeBasePopup() {
  showBasePopup = false;
  isPaused = false;
}

canvas.addEventListener("click", (e) => {
  if (showBasePopup) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (
      mx >= closeBaseButton.x &&
      mx <= closeBaseButton.x + closeBaseButton.width &&
      my >= closeBaseButton.y &&
      my <= closeBaseButton.y + closeBaseButton.height
    ) {
      showBasePopup = false;
      isPaused = false;
      hasClosedBasePopup = true;
      //console.log("popup closed.");
    }
  }
});

document.addEventListener("keydown", (e) => {
  //console.log(showBasePopup);
  if (showBasePopup && e.key.toLowerCase() === "e") {
    //console.log("convert");
    const shards = player.dataShards
    if (shards > 0) {
      score += shards;
      let sysHealthInc = shards * 8;
      systemHealth = Math.min(systemHealth + sysHealthInc, 100);
      shardsDelivered += shards;
      player.dataShards = 0
    }
    closeBasePopup();
  }
});

for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 10; c++) {
        const tile = map[r][c];
        if (!tile.isHub && !tile.isHomeBase && !tile.isSafeZone && !tile.isBotFactory) {
            towers.push(new Tower(
                r,               
                c,               
                tileSize,     
                turretSprite,   
                bullets,       
                player 
            ));
        }
    }
}

keySprite.onload = () => {
  for (let i = 0; i < 25; i++) {
    const x = Math.random() * (mapWidth - 32);
    const y = Math.random() * (mapHeight - 32);
    keys.push(new Key(x, y, keySprite));
  }
};

function checkGameEnd() {
  if (isGameOver) return;

  if (player.health == 0 || systemHealth == 0) {
    endGame(false);
  } else if (systemHealth == 100) {
    endGame(true);
  }
}

function endGame(didWin) {
  isGameOver = true;

  const popup = document.getElementById("endgamePopup");
  const msg = document.getElementById("endgameMessage");
  const scoreText = document.getElementById("scoreDisplay");
  const highNote = document.getElementById("highScoreNote");

  const score = shardsDelivered;
  const isNewHigh = score > highScore;

  if (isNewHigh) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
    highNote.textContent = "New High Score!";
  } else {
    highNote.textContent = "";
  }

  msg.textContent = didWin ? " Mission Accomplished!" : "Game Over";
  scoreText.textContent = `Shards Delivered: ${shardsDelivered}`;
  popup.style.display = "block";
}

window.restartGame = function () {
  location.reload();
};

const marketIconSize = 48;
const marketIconX = canvas.width - marketIconSize - 10;
const marketIconY = 10;

function drawMarketIcon() {
  ctx.drawImage(marketIcon, marketIconX, marketIconY, marketIconSize, marketIconSize);
}

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  if (
    mx >= marketIconX &&
    mx <= marketIconX + marketIconSize &&
    my >= marketIconY &&
    my <= marketIconY + marketIconSize
  ) {
    showMarketPopup = true;
    isPaused = true;
  }
});

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  isCloseHover =
    showMarketPopup &&
    mx >= closeMarketButton.x &&
    mx <= closeMarketButton.x + closeMarketButton.width &&
    my >= closeMarketButton.y &&
    my <= closeMarketButton.y + closeMarketButton.height;
});

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  if (
    showMarketPopup &&
    mx >= closeMarketButton.x &&
    mx <= closeMarketButton.x + closeMarketButton.width &&
    my >= closeMarketButton.y &&
    my <= closeMarketButton.y + closeMarketButton.height
  ) {
    showMarketPopup = false;
    isPaused = false;
  }
});

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  if (showMarketPopup && closeMarketButton) {
    isMarketCloseHover = (
      mouseX >= closeMarketButton.x &&
      mouseX <= closeMarketButton.x + closeMarketButton.width &&
      mouseY >= closeMarketButton.y &&
      mouseY <= closeMarketButton.y + closeMarketButton.height
    );
  } else {
    isMarketCloseHover = false;
  }
});

let closeMarketButton = null;

function drawCloseButton(x, y) {
  const width = 100;
  const height = 40;
  closeMarketButton = { x, y, width, height };

  ctx.fillStyle = isMarketCloseHover ? "#00ffff" : "#003f4f";
  ctx.fillRect(x, y, width, height);

  ctx.fillStyle = isMarketCloseHover ? "#000" : "#00ffff";
  ctx.font = "18px 'Orbitron', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Close", x + width / 2, y + height / 2);
}

function drawPrice(x, y, price) {
  ctx.font = "16px 'Orbitron', monospace";
  ctx.fillStyle = "#00ffff";
  ctx.fillText(`${price}`, x + 20, y + 13);
  ctx.drawImage(dataShardImg, x, y, 16, 16);
}

function drawPriceOrMax(x, y, price, currentLevel, maxLevel) {
  if (currentLevel >= maxLevel) {
    ctx.font = "16px 'Orbitron', monospace";
    ctx.fillStyle = "#00ffff";
    ctx.fillText("MAX", x, y + 16);
  } else {
    drawPrice(x, y, price);
  }
}

function updatePlayerFireRate(player) {
  const baseFireRate = weaponBaseFireRates[player.currentWeapon] || 0.2;
  player.fireRate = Math.max(0.05, baseFireRate + player.fireRateLevel * fireUpgradeBonus);
}

function drawSectionTitle(title, x, y) {
  ctx.font = "24px 'Orbitron', monospace";
  ctx.fillStyle = "#00ffff";
  ctx.textAlign = "left";
  ctx.fillText(title, x, y);
}

function drawUpgradeBar(x, y, currentLevel, maxLevel) {
  const barWidth = 60;
  const barHeight = 10;
  const segmentWidth = barWidth / maxLevel;

  for (let i = 0; i < maxLevel; i++) {
    ctx.fillStyle = i < currentLevel ? "#00ffff" : "#444";
    ctx.fillRect(x + i * segmentWidth, y, segmentWidth - 2, barHeight);
  }
}

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  if (showMarketPopup) {
    isHoveringRifle = rifleButtonRect &&
      mx >= rifleButtonRect.x && mx <= rifleButtonRect.x + rifleButtonRect.width &&
      my >= rifleButtonRect.y && my <= rifleButtonRect.y + rifleButtonRect.height;

    isHoveringShotgun = shotgunButtonRect &&
      mx >= shotgunButtonRect.x && mx <= shotgunButtonRect.x + shotgunButtonRect.width &&
      my >= shotgunButtonRect.y && my <= shotgunButtonRect.y + shotgunButtonRect.height;
  }
});

function drawWeaponItems(x, y) {
  const itemSpacing = 550;

  rifleButtonRect = { x: x - 50, y: y, width: 228, height: 128};
  ctx.fillStyle = isHoveringRifle ? "#00ffff44" : "#00000044";
  ctx.fillRect(rifleButtonRect.x, rifleButtonRect.y, rifleButtonRect.width, rifleButtonRect.height);
  ctx.drawImage(rifleImg, x, y, 128, 128);
  drawPrice(x + 20, y + 100, 6);

  shotgunButtonRect = { x: x + itemSpacing - 50, y: y, width: 228, height: 128 };
  ctx.fillStyle = isHoveringShotgun ? "#00ffff44" : "#00000044";
  ctx.fillRect(shotgunButtonRect.x, shotgunButtonRect.y, shotgunButtonRect.width, shotgunButtonRect.height);
  ctx.drawImage(shotgunImg, x + itemSpacing - 70, y, 250, 128);
  drawPrice(x + itemSpacing + 20, y + 100, 5);
}

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  if (showMarketPopup) {
    isHoveringSpeed = movementSpeedRect &&
      mx >= movementSpeedRect.x && mx <= movementSpeedRect.x + movementSpeedRect.width &&
      my >= movementSpeedRect.y && my <= movementSpeedRect.y + movementSpeedRect.height;

    isHoveringFire = fireRateRect &&
      mx >= fireRateRect.x && mx <= fireRateRect.x + fireRateRect.width &&
      my >= fireRateRect.y && my <= fireRateRect.y + fireRateRect.height;
  }
});

function drawUpgradeItems(x, y) {
  const itemSpacing = 550;

  movementSpeedRect = { x: x - 70, y: y - 10, width: 228, height: 128};
  ctx.fillStyle = isHoveringSpeed ? "#00ffff44" : "#00000044";
  ctx.fillRect(movementSpeedRect.x, movementSpeedRect.y, movementSpeedRect.width, movementSpeedRect.height);
  ctx.drawImage(movementSpeedImg, x, y, 64, 64);
  drawUpgradeBar(x + 5, y + 70, player.movementSpeedLevel, 3);
  drawPriceOrMax(x + 20, y + 90, speedPrice, player.movementSpeedLevel, 3);

  fireRateRect = { x: x + itemSpacing - 70, y: y, width: 228, height: 128 };
  ctx.fillStyle = isHoveringFire ? "#00ffff44" : "#00000044";
  ctx.fillRect(fireRateRect.x, fireRateRect.y, fireRateRect.width, fireRateRect.height);
  ctx.drawImage(fireRateImg, x + itemSpacing, y, 64, 64);
  drawUpgradeBar(x + itemSpacing + 5, y + 70, player.fireRateLevel, 3);
  drawPriceOrMax(x + itemSpacing + 20, y + 90, firePrice, player.fireRateLevel, 3);
}

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  if (showMarketPopup) {
    isHoveringHealth = healthRect &&
      mx >= healthRect.x && mx <= healthRect.x + healthRect.width &&
      my >= healthRect.y && my <= healthRect.y + healthRect.height;

    isHoveringShield = shieldRect &&
      mx >= shieldRect.x && mx <= shieldRect.x + shieldRect.width &&
      my >= shieldRect.y && my <= shieldRect.y + shieldRect.height;
  }
});

function drawUtilityItems(x, y) {
  const itemSpacing = 550;

  healthRect = { x: x - 70, y: y - 10, width: 228, height: 128};
  ctx.fillStyle = isHoveringHealth ? "#00ffff44" : "#00000044";
  ctx.fillRect(healthRect.x, healthRect.y, healthRect.width, healthRect.height);
  ctx.drawImage(healthPackImage, x, y, 64, 64);
  drawPrice(x + 7, y + 60, 2);

  shieldRect = { x: x + itemSpacing - 70, y: y - 10, width: 228, height: 128 };
  ctx.fillStyle = isHoveringShield ? "#00ffff44" : "#00000044";
  ctx.fillRect(shieldRect.x, shieldRect.y, shieldRect.width, shieldRect.height);
  ctx.drawImage(shieldImage, x + itemSpacing, y, 64, 64);
  drawPrice(x + itemSpacing + 7, y + 60, 2);
}

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  if (showMarketPopup) {
    isHoveringMine = mineRect &&
      mx >= mineRect.x && mx <= mineRect.x + mineRect.width &&
      my >= mineRect.y && my <= mineRect.y + mineRect.height;

    isHoveringTeleportationHub = teleportationHubRect &&
      mx >= teleportationHubRect.x && mx <= teleportationHubRect.x + teleportationHubRect.width &&
      my >= teleportationHubRect.y && my <= teleportationHubRect.y + teleportationHubRect.height;
  }
});

function drawSpecialItems(x, y) {
  const itemSpacing = 550;

  mineRect = { x: x - 70, y: y - 20, width: 228, height: 128};
  ctx.fillStyle = isHoveringMine ? "#00ffff44" : "#00000044";
  ctx.fillRect(mineRect.x, mineRect.y, mineRect.width, mineRect.height);
  ctx.drawImage(dataMineImg, x, y, 64, 64);
  drawPrice(x, y + 70, 8);

  teleportationHubRect = { x: x + itemSpacing - 70, y: y - 20, width: 228, height: 128 };
  ctx.fillStyle = isHoveringTeleportationHub ? "#00ffff44" : "#00000044";
  ctx.fillRect(teleportationHubRect.x, teleportationHubRect.y, teleportationHubRect.width, teleportationHubRect.height);
  ctx.drawImage(teleportationHubImg, x + itemSpacing, y, 64, 64);
  drawPrice(x + itemSpacing, y + 70, 6);
}

function drawMarketPopup() {
  ctx.save();
  const popupWidth = canvas.width * 0.95;
  const popupHeight = canvas.height * 0.95;
  const popupX = (canvas.width - popupWidth) / 2;
  const popupY = (canvas.height - popupHeight) / 2;

  ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
  ctx.fillRect(popupX, popupY, popupWidth, popupHeight);

  ctx.strokeStyle = "#00ffff";
  ctx.lineWidth = 4;
  ctx.strokeRect(popupX, popupY, popupWidth, popupHeight);

  drawPrice(popupX + popupWidth - 180, popupY + 20, player.dataShards);

  let sectionY = popupY + 20;
  const sectionSpacing = 175;

  drawSectionTitle("Weapons", popupX + popupWidth / 2.25, sectionY + 15);
  drawWeaponItems(popupX + 400, sectionY + 30);
  sectionY += sectionSpacing;

  drawSectionTitle("Upgrades", popupX + popupWidth / 2.25, sectionY);
  drawUpgradeItems(popupX + 400, sectionY + 30);
  sectionY += sectionSpacing;

  drawSectionTitle("Utilities", popupX + popupWidth / 2.25, sectionY);
  drawUtilityItems(popupX + 400, sectionY + 30);
  sectionY += sectionSpacing;

  drawSectionTitle("Special Items", popupX + popupWidth / 2.25, sectionY);
  drawSpecialItems(popupX + 400, sectionY + 30);

  drawCloseButton(popupX + popupWidth - 110, popupY + popupHeight - 60);
  ctx.restore();
}

canvas.addEventListener("click", (e) => {
  if (!showMarketPopup) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (
    x >= rifleButtonRect.x && x <= rifleButtonRect.x + rifleButtonRect.width &&
    y >= rifleButtonRect.y && y <= rifleButtonRect.y + rifleButtonRect.height
  ) {
    console.log(player.ownedWeapons);
    if (!player.ownedWeapons.includes("rifle") && player.dataShards >= 6) {
      console.log("buy");
      player.dataShards -= 6;
      player.ownedWeapons.push("rifle");
      player.currentWeapon = "rifle";
      updatePlayerFireRate(player);
      player.reloadWeaponSprites();
    }
  }

  if (
    x >= shotgunButtonRect.x && x <= shotgunButtonRect.x + shotgunButtonRect.width &&
    y >= shotgunButtonRect.y && y <= shotgunButtonRect.y + shotgunButtonRect.height
  ) {
    if (!player.ownedWeapons.includes("shotgun") && player.dataShards >= 5) {
      player.dataShards -= 5;
      player.ownedWeapons.push("shotgun");
      player.currentWeapon = "shotgun";
      updatePlayerFireRate(player);
      player.reloadWeaponSprites();
    }
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Shift") {
    const currentIndex = player.ownedWeapons.indexOf(player.currentWeapon);
    const nextIndex = (currentIndex + 1) % player.ownedWeapons.length;
    player.currentWeapon = player.ownedWeapons[nextIndex];
    player.reloadWeaponSprites();

    updatePlayerFireRate(player);
  }
});

canvas.addEventListener("click", (e) => {
  if (!showMarketPopup) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (
    movementSpeedRect &&
    x >= movementSpeedRect.x && x <= movementSpeedRect.x + movementSpeedRect.width &&
    y >= movementSpeedRect.y && y <= movementSpeedRect.y + movementSpeedRect.height
  ) {
    const level = player.movementSpeedLevel;
    const price = level;
    if (level < 3 && player.dataShards >= price) {
      player.dataShards -= price;
      player.movementSpeedLevel++;
      player.speed += 0.5;
      speedPrice++;
    }
  }

  if (
    fireRateRect &&
    x >= fireRateRect.x && x <= fireRateRect.x + fireRateRect.width &&
    y >= fireRateRect.y && y <= fireRateRect.y + fireRateRect.height
  ) {
    const level = player.fireRateLevel;
    const price = level;
    if (level < 3 && player.dataShards >= price) {
      player.dataShards -= price;
      player.fireRateLevel++;
      updatePlayerFireRate(player);
      player.fireRate -= 0.02;
      firePrice++;
    }
  }
});

canvas.addEventListener("click", (e) => {
  if (!showMarketPopup) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (
    x >= healthRect.x && x <= healthRect.x + healthRect.width &&
    y >= healthRect.y && y <= healthRect.y + healthRect.height
  ) {
    if (player.health < 100 && player.dataShards >= 2) {
      player.dataShards -= 2;
      player.health = Math.min(100, player.health + 20);
    }
  }

  if (
    x >= shieldRect.x && x <= shieldRect.x + shieldRect.width &&
    y >= shieldRect.y && y <= shieldRect.y + shieldRect.height
  ) {
    if (player.dataShards >= 2) {
      player.dataShards -= 2;
      player.shieldCount = (player.shieldCount || 0) + 1;
    }
  }
});

canvas.addEventListener("click", (e) => {
  if (!showMarketPopup) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (
    x >= mineRect.x && x <= mineRect.x + mineRect.width &&
    y >= mineRect.y && y <= mineRect.y + mineRect.height
  ) {
    if (player.dataShards >= 8) {
      player.dataShards -= 8;
      player.mineCount = (player.mineCount || 0) + 1;
    }
  }

  if (
    x >= teleportationHubRect.x && x <= teleportationHubRect.x + teleportationHubRect.width &&
    y >= teleportationHubRect.y && y <= teleportationHubRect.y + teleportationHubRect.height
  ) {
    if (player.dataShards >= 6) {
      player.dataShards -= 6;
      player.teleportationHubCount = (player.teleportationHubCount || 0) + 1;
    }
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "r" || e.key === "R") {
    if (player.shieldCount > 0 && !player.isInvisible) {
      player.shieldCount--;
      player.isInvisible = true;

      setTimeout(() => {
        player.isInvisible = false;
      }, 10000);
    }
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "f" || e.key === "F") {
    if (player.mineCount > 0) {
      const mine = new DataMine(player.x, player.y, mineImg);
      dataMines.push(mine);
      player.mineCount--;
    }
  }
});

const teleportInput = document.createElement("input");
teleportInput.id = "teleportInput";
teleportInput.placeholder = "Enter destination portal ID";
teleportInput.style.position = "absolute";
teleportInput.style.top = "50%";
teleportInput.style.left = "50%";
teleportInput.style.transform = "translate(-50%, -50%)";
teleportInput.style.zIndex = 1000;
teleportInput.style.display = "none";
document.body.appendChild(teleportInput);

window.addEventListener("keydown", (e) => {
  if (e.key === "t") {
    const newId = prompt("Enter a unique ID for this portal:");
    if (!newId) return;

    const exists = teleportHubs.some(hub => hub.id === newId);
    if (exists) {
      alert("Portal ID already exists!");
      return;
    }

    const hub = new TeleportHub(
      Math.floor(player.x),
      Math.floor(player.y),
      portalFrames,
      newId
    );
    teleportHubs.push(hub);
  }
});

document.addEventListener("keydown", (e) => {
  Keys[e.key.toLowerCase()] = true;
});

document.addEventListener("keyup", (e) => {
  Keys[e.key.toLowerCase()] = false;
});

function drawScorecard() {
  const padding = 10;
  const width = 200;
  const height = 120;
  const x = 10;
  const y = 10;

  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(x, y, width, height);

  ctx.strokeStyle = "#00ffff";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, width, height);

  ctx.font = "16px 'Orbitron', monospace";
  ctx.fillStyle = "#00ffff";
  const lineHeight = 20;
  const lines = [
    `Player Health: ${player.health}`,
    `System Health: ${systemHealth}`,
    `Keys: ${keysCollected}`,
    `Shards Delivered: ${shardsDelivered}`,
    `High Score: ${highScore}`,
  ];

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x + 10, y + 25 + i * lineHeight);
  }
}

function drawControls() {
  const buttonWidth = 120;
  const buttonHeight = 40;
  const spacing = 30;

  pauseButton = {
    width: buttonWidth,
    height: buttonHeight,
    x: canvas.width / 2 - buttonWidth - spacing / 2,
    y: canvas.height - buttonHeight - 15,
  };

  resetButton = {
    width: buttonWidth,
    height: buttonHeight,
    x: canvas.width / 2 + spacing / 2,
    y: canvas.height - buttonHeight - 15,
  };

  const buttons = [pauseButton, resetButton];
  const labels = [isPaused ? "Resume" : "Pause", "Reset"];

  for (let i = 0; i < buttons.length; i++) {
    const btn = buttons[i];

    ctx.fillStyle = hoveredButtonIndex === i ? "rgba(0, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(btn.x, btn.y, btn.width, btn.height);

    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(btn.x, btn.y, btn.width, btn.height);

    ctx.font = "16px 'Orbitron', monospace";
    ctx.fillStyle = "#00ffff";
    const textWidth = ctx.measureText(labels[i]).width;
    ctx.fillText(labels[i], btn.x + (btn.width - textWidth) / 2, btn.y + 25);
  }
}

let closeHubButton = null;
let isCloseHover = false;

canvas.addEventListener("mousemove", (e) => {
  if (!showHubPopup) {
    isCloseHover = false;
    canvas.style.cursor = "default";
    return;
  }
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  if (
    closeHubButton &&
    mx >= closeHubButton.x &&
    mx <= closeHubButton.x + closeHubButton.width &&
    my >= closeHubButton.y &&
    my <= closeHubButton.y + closeHubButton.height
  ) {
    isCloseHover = true;
    canvas.style.cursor = "pointer";
  } else {
    isCloseHover = false;
    canvas.style.cursor = "default";
  }
});

function drawHubPopup() {
  const w = canvas.width / 2;
  const h = canvas.height / 2;
  const x = canvas.width / 4;
  const y = canvas.height / 4;

  ctx.save();

  ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
  ctx.fillRect(x, y, w, h);

  ctx.strokeStyle = "#00ffff";
  ctx.lineWidth = 4;
  ctx.shadowColor = "#00ffff";
  ctx.shadowBlur = 20;
  ctx.strokeRect(x, y, w, h);
  ctx.shadowBlur = 0;

  if (dataShardImg.complete && dataShardImg.naturalWidth !== 0) {
    const imgX = x + w / 2 - 64;
    const imgY = y + 20;
    ctx.drawImage(dataShardImg, imgX, imgY, 128, 128);
  }

  ctx.fillStyle = "#00ffff";
  ctx.font = "24px 'Orbitron', monospace";
  ctx.textBaseline = "top";

  ctx.textAlign = "left";
  ctx.fillText(`Keys: ${keysCollected}`, x + 40, y + 170);

  ctx.textAlign = "right";
  const shardsPossible = Math.floor(keysCollected / 3);
  ctx.fillText(`Decryptable Shards: ${shardsPossible}`, x + w - 40, y + 170);

  ctx.font = "20px 'Orbitron', monospace";
  ctx.textAlign = "center";
  ctx.fillText("Press E to use keys to decrypt", x + w / 2, y + 250);

  const btnW = 100;
  const btnH = 40;
  const btnX = x + w - btnW - 10;
  const btnY = y + h - btnH - 10;

  closeHubButton = { x: btnX, y: btnY, width: btnW, height: btnH };

  ctx.fillStyle = isCloseHover ? "#00ffff" : "#003f4f";
  ctx.fillRect(btnX, btnY, btnW, btnH);

  ctx.fillStyle = isCloseHover ? "#000" : "#00ffff";
  ctx.font = "18px 'Orbitron', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Close", btnX + btnW / 2, btnY + btnH / 2);

  ctx.restore();
}

const aurexImg = new Image();
aurexImg.src = "../../sprites/aurex.png";

let closeBaseButton = null;
let isCloseBaseHover = false;

canvas.addEventListener("mousemove", (e) => {
  if (!showBasePopup) {
    isCloseBaseHover = false;
    canvas.style.cursor = "default";
    return;
  }
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  if (
    closeBaseButton &&
    mx >= closeBaseButton.x &&
    mx <= closeBaseButton.x + closeBaseButton.width &&
    my >= closeBaseButton.y &&
    my <= closeBaseButton.y + closeBaseButton.height
  ) {
    isCloseBaseHover = true;
    canvas.style.cursor = "pointer";
  } else {
    isCloseBaseHover = false;
    canvas.style.cursor = "default";
  }
});

function drawBasePopup() {
  const w = canvas.width / 2;
  const h = canvas.height / 2;
  const x = canvas.width / 4;
  const y = canvas.height / 4;

  ctx.save();

  ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
  ctx.fillRect(x, y, w, h);

  ctx.strokeStyle = "#00ffff";
  ctx.lineWidth = 4;
  ctx.shadowColor = "#00ffff";
  ctx.shadowBlur = 20;
  ctx.strokeRect(x, y, w, h);
  ctx.shadowBlur = 0;

  if (aurexImg.complete && aurexImg.naturalWidth !== 0) {
    const imgX = x + w / 2 - 64;
    const imgY = y + 20;
    ctx.drawImage(aurexImg, imgX, imgY, 128, 128);
  }

  ctx.fillStyle = "#00ffff";
  ctx.font = "24px 'Orbitron', monospace";
  ctx.textBaseline = "top";

  ctx.textAlign = "center";
  ctx.fillText(`Decrypted shards: ${player.dataShards}`, x + w / 2, y + 170);

  ctx.font = "20px 'Orbitron', monospace";
  ctx.textAlign = "center";
  ctx.fillText("Press E to use the decrypted shards to recover AUREX", x + w / 2, y + 250);

  const btnW = 100;
  const btnH = 40;
  const btnX = x + w - btnW - 10;
  const btnY = y + h - btnH - 10;

  closeBaseButton = { x: btnX, y: btnY, width: btnW, height: btnH };

  ctx.fillStyle = isCloseBaseHover ? "#00ffff" : "#003f4f";
  ctx.fillRect(btnX, btnY, btnW, btnH);

  ctx.fillStyle = isCloseBaseHover ? "#000" : "#00ffff";
  ctx.font = "18px 'Orbitron', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Close", btnX + btnW / 2, btnY + btnH / 2);

  ctx.restore();
}

function gameLoop() {
  const currentTime = performance.now();
  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!isPaused) {
    systemHealthTimer += deltaTime * 1000;
    if (systemHealthTimer >= sysHealthInterval) {
      systemHealth = Math.max(0, systemHealth - 1);
      systemHealthTimer = 0;
    }

    player.inSafeZone = false;
    for (let row of map) {
      for (let tile of row) {
        if (tile.isSafeZone) {
          const tileX = tile.col * (tileSize + tileGap);
          const tileY = tile.row * (tileSize + tileGap);
          const tileRect = { x: tileX, y: tileY, w: tileSize, h: tileSize };
          const playerRect = {
            x: player.x - player.size,
            y: player.y - player.size,
            w: player.size * 2,
            h: player.size * 2,
          };

          const overlaps = (
            playerRect.x < tileRect.x + tileRect.w &&
            playerRect.x + playerRect.w > tileRect.x &&
            playerRect.y < tileRect.y + tileRect.h &&
            playerRect.y + playerRect.h > tileRect.y
          );

          if (overlaps) {
            player.inSafeZone = true;
            for (const bot of bots) bot.cityAlert = false;
            break;
          }
        }
      }
      if (player.inSafeZone) break;
    }

    let inHubTile = false;
    for (let row of map) {
      for (let tile of row) {
        if (tile.isHub) {
          const tileX = tile.col * (tileSize + tileGap);
          const tileY = tile.row * (tileSize + tileGap);

          const tileRect = { x: tileX, y: tileY, w: tileSize, h: tileSize };
          const playerRect = {
            x: player.x - player.size,
            y: player.y - player.size,
            w: player.size * 2,
            h: player.size * 2,
          };

          const overlaps =
            playerRect.x < tileRect.x + tileRect.w &&
            playerRect.x + playerRect.w > tileRect.x &&
            playerRect.y < tileRect.y + tileRect.h &&
            playerRect.y + playerRect.h > tileRect.y;

          if (overlaps) {
            inHubTile = true;

            if (!showHubPopup && !hasClosedHubPopup) {
              showHubPopup = true;
              isPaused = true;
            }
            break;
          }
        }
      }
      if (inHubTile) break;
    }

    if (!inHubTile) {
      hasClosedHubPopup = false;
    }

    let inBaseTile = false;
    for (let row of map) {
      for (let tile of row) {
        if (tile.isHomeBase) {
          const tileX = tile.col * (tileSize + tileGap);
          const tileY = tile.row * (tileSize + tileGap);

          const tileRect = { x: tileX, y: tileY, w: tileSize, h: tileSize };
          const playerRect = {
            x: player.x - player.size,
            y: player.y - player.size,
            w: player.size * 2,
            h: player.size * 2,
          };

          const overlaps =
            playerRect.x < tileRect.x + tileRect.w &&
            playerRect.x + playerRect.w > tileRect.x &&
            playerRect.y < tileRect.y + tileRect.h &&
            playerRect.y + playerRect.h > tileRect.y;

          if (overlaps) {
            inBaseTile = true;

            if (!showBasePopup && !hasClosedBasePopup) {
              showBasePopup = true;
              isPaused = true;
            }
            break;
          }
        }
      }
      if (inBaseTile) break;
    }

    if (!inBaseTile) {
      hasClosedBasePopup = false;
    }

    botSpawnTimer += deltaTime * 1000;
    if (botSpawnTimer >= botSpawnInterval) {
      spawnBotFromFactory();
      botSpawnTimer = 0;
      botSpawnInterval = Math.max(minSpawnInterval, botSpawnInterval * botFactoryGrowthRate);
    }

    camera.update(player);
    player.move(input, mapWidth, mapHeight, buildingRects);

    for (const mine of dataMines) {
      mine.update(player, Keys);
    }

    for (const hub of teleportHubs) {
      hub.update(deltaTime, player, teleportHubs);
    }
  }

  drawMap();

  for (let tower of towers) {
    if (!isPaused) tower.update(player);
    tower.draw(ctx, camera);
  }

  const playerCenterX = player.x + 1;
  const playerCenterY = player.y + 1;

  for (let i = keys.length - 1; i >= 0; i--) {
    const key = keys[i];
    if (!isPaused) key.update();
    key.draw(ctx, camera.x, camera.y);

    if (
      !isPaused &&
      !key.collected &&
      key.checkCollision(playerCenterX, playerCenterY, player.size, player.size)
    ) {
      key.collected = true;
      keysCollected++;
      for (const bot of bots) bot.cityAlert = true;

      const x = Math.random() * (mapWidth - 32);
      const y = Math.random() * (mapHeight - 32);
      keys.push(new Key(x, y, keySprite));
    }
  }
  keys = keys.filter(key => !key.collected);

  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    if (!isPaused) bullet.update(player, buildingRects);
    bullet.draw(ctx, camera);

    if (
      bullet.hit ||
      bullet.x < 0 || bullet.x > mapWidth ||
      bullet.y < 0 || bullet.y > mapHeight
    ) {
      bullets.splice(i, 1);
    }
  }

  for (let i = playerBullets.length - 1; i >= 0; i--) {
    if (!isPaused) playerBullets[i].update(deltaTime, buildingRects, towers, bots);
    if (playerBullets[i].lifetime <= 0) playerBullets.splice(i, 1);
  }
  for (const bullet of playerBullets) {
    bullet.draw(ctx, camera.x, camera.y);
  }

  for (const bot of bots) {
    if (!isPaused) bot.update(player, buildingRects, botBullets);
    bot.draw(ctx, camera);
  }

  for (let i = botBullets.length - 1; i >= 0; i--) {
    const bullet = botBullets[i];
    if (!isPaused) bullet.update(player, buildingRects);
    bullet.draw(ctx, camera);

    if (
      bullet.hit ||
      bullet.x < 0 || bullet.x > mapWidth ||
      bullet.y < 0 || bullet.y > mapHeight
    ) {
      botBullets.splice(i, 1);
    }
  }

  if (!isPaused) player.update(deltaTime, mouseX, mouseY, camera);
  player.draw(ctx, camera.x, camera.y);

  for (let i = healthPacks.length - 1; i >= 0; i--) {
    const pack = healthPacks[i];
    if (!isPaused) pack.checkCollision(player);
    pack.draw(ctx, camera.x, camera.y);

    if (pack.collected) {
      healthPacks.splice(i, 1);
      setTimeout(spawnHealthPack, 10000);
    }
  }

  for (let i = shields.length - 1; i >= 0; i--) {
    const shield = shields[i];
    if (!isPaused) shield.checkCollision(player);
    shield.draw(ctx, camera.x, camera.y);

    if (shield.collected) {
      shields.splice(i, 1);

      if (!player.isInvisible) {
        player.isInvisible = true;
        setTimeout(() => { player.isInvisible = false; }, 10000);
      }
      setTimeout(spawnShield, 10000);
    }
  }

  for (const mine of dataMines) {
    mine.draw(ctx, camera.x, camera.y);
  }

  for (const hub of teleportHubs) {
    hub.draw(ctx, camera.x, camera.y);
  }

  drawScorecard();
  drawControls();

  if (isPaused && !showHubPopup && !showBasePopup && !showMarketPopup) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = "40px 'Orbitron', monospace";
    ctx.fillStyle = "#00ffff";
    ctx.fillText("PAUSED", canvas.width / 2 - 80, canvas.height / 2);
  }

  if (showHubPopup) {
    drawHubPopup();
  }

  if (showBasePopup) {
    drawBasePopup();
  }

  if (showMarketPopup) {
    drawMarketPopup();
  } else {
    drawMarketIcon();
  }

  checkGameEnd();

  if (isGameOver) return;

  requestAnimationFrame(gameLoop);
}

gameLoop();