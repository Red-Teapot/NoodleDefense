import { TileMap, TileSprite, Random, Vector } from "excalibur";
import WeighedRandom from "../utils/WeighedRandom";

const GROUND_W = new WeighedRandom<number>();
GROUND_W.add(0, 100);
GROUND_W.add(1, 3);
GROUND_W.add(2, 1);

function manhattanDistance(a: Vector, b: Vector): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export default class Map {
    readonly tilemap = new TileMap(0, 0, 24, 24, 100, 100);

    private oldTilePos?: Vector = undefined;

    constructor() {
        const groundRnd = new Random();

        for(var i = 0; i < this.tilemap.data.length; ++i) {
            const cell = this.tilemap.getCellByIndex(i);

            cell.sprites = [
                new TileSprite('ground', GROUND_W.randomize(groundRnd)),
                new TileSprite('traps', -1),
                new TileSprite('noodle', -1),
            ];
        }
    }

    placeNoodle(pos: Vector, vel?: Vector) {
        const tilePos = new Vector(
            Math.floor(pos.x / this.tilemap.cellWidth),
            Math.floor(pos.y / this.tilemap.cellHeight)
        );
        const curCell = this.tilemap.getCell(tilePos.x, tilePos.y);

        // Already have a noodle here
        if(curCell.sprites[2].spriteId != -1) {
            return;
        }

        // No old tile known, guess the direction
        if(this.oldTilePos == undefined) {
            curCell.sprites[2].spriteId = this.guessNoodleSprite(pos, vel);
            this.oldTilePos = tilePos;
            return;
        }

        const mDist = manhattanDistance(tilePos, this.oldTilePos);

        // Not connected at all, guess again
        if(mDist > 2) {
            curCell.sprites[2].spriteId = this.guessNoodleSprite(pos, vel);
            this.oldTilePos = tilePos;
            return;
        }

        // TODO Connect it

        this.oldTilePos = tilePos;
    }

    private guessNoodleSprite(pos: Vector, vel?: Vector): number {
        var id = 0;

        if(vel && Math.abs(vel.x) < Math.abs(vel.y)) {
            id = 1;
        }

        return id;
    }

    get center(): Vector {
        return this.size.scale(0.5);
    }

    get size(): Vector {
        return new Vector(
            this.tilemap.cols * this.tilemap.cellWidth,
            this.tilemap.rows * this.tilemap.cellHeight
        );
    }
}