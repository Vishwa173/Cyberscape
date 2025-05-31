import { Tile } from "../classes/tiles.js";

const TILE_SIZE = 200;
const ROWS = 6;
const COLS = 10;

function getRandomLayout(tileSize = 200) {
    const squareSize = 80;
    const margin = 10; 
    const maxCount = 6;
    const minCount = 4;

    const layout = [];

    const count = minCount + Math.floor(Math.random() * (maxCount - minCount + 1));

    for (let i = 0; i < count; i++) {
        const x = margin + Math.floor(Math.random() * (tileSize - 2 * margin - squareSize));
        const y = margin + Math.floor(Math.random() * (tileSize - 2 * margin - squareSize));
        layout.push({ x, y, w: squareSize, h: squareSize });
    }

    return layout;
}


export function generateMap() {
    const map = [];

    for (let row = 0; row < ROWS; row++) {
        const rowTiles = [];
        for (let col = 0; col < COLS; col++) {
            const layout = getRandomLayout();
            rowTiles.push(new Tile(row, col, layout));
        }
        map.push(rowTiles);
    }

    const homeRow = Math.floor(Math.random() * ROWS);
    const homeCol = Math.floor(Math.random() * COLS);
    map[homeRow][homeCol].isHomeBase = true;

    let hubRow, hubCol;
    
    do {
        hubRow = Math.floor(Math.random() * ROWS);
        hubCol = Math.floor(Math.random() * COLS);
    } while (hubRow === homeRow && hubCol === homeCol);

    map[hubRow][hubCol].isHub = true;

    let safeZonesAdded = 0;
    while (safeZonesAdded < 3) {
        let r, c, tile;

        do{
            r = Math.floor(Math.random() * ROWS);
            c = Math.floor(Math.random() * COLS);
            tile = map[r][c];
        }while (tile.isHomeBase || tile.isHub || tile.isSafeZone);

        tile.isSafeZone = true;
        tile.layout = [];
        safeZonesAdded++;
    }

    let r, c, tile;
    do {
        r = Math.floor(Math.random() * ROWS);
        c = Math.floor(Math.random() * COLS);
        tile = map[r][c];
    }while (tile.isHomeBase || tile.isHub || tile.isSafeZone);

    tile.isBotFactory = true;
    tile.layout = []; 
    return map;
}
