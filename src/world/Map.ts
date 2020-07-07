import { TileMap, Loadable, Cell, CellArgs, Random, TileSprite, Vector } from "excalibur";
import WeighedRandom from "../utils/WeighedRandom";

const GROUND_W = new WeighedRandom<number>();
GROUND_W.add(0, 100);
GROUND_W.add(1, 3);
GROUND_W.add(2, 1);
GROUND_W.add(3, 5);
GROUND_W.add(4, 2);

const groundRnd = new Random();

enum Direction {
    Up,
    Down,
    Left,
    Right,
}

// Well, Java-style enums with member functions would be nice here
function opposite(dir: Direction): Direction {
    switch(dir) {
        case Direction.Up:
            return Direction.Down;
        case Direction.Down:
            return Direction.Up;
        case Direction.Left:
            return Direction.Right;
        case Direction.Right:
            return Direction.Left;
    }
}

enum NoodleSpriteIDs {
    Horizontal = 0,
    Vertical = 1,
    LeftDown = 2,
    LeftUp = 3,
    RightUp = 4,
    RightDown = 5,
}

const DIR_BY_ANGLE = [
    Direction.Up,
    Direction.Right,
    Direction.Down,
    Direction.Left,
];

const OFFSET_BY_DIR = {
    [Direction.Up]: new Vector(0, -1),
    [Direction.Down]: new Vector(0, 1),
    [Direction.Left]: new Vector(-1, 0),
    [Direction.Right]: new Vector(1, 0),
};

const NOODLE_SPRITE_BY_DIRS = {
    [Direction.Up]: {
        [Direction.Up]: NoodleSpriteIDs.Vertical,
        [Direction.Down]: NoodleSpriteIDs.Vertical,
        [Direction.Left]: NoodleSpriteIDs.LeftDown,
        [Direction.Right]: NoodleSpriteIDs.RightDown,
    },
    [Direction.Down]: {
        [Direction.Up]: NoodleSpriteIDs.Vertical,
        [Direction.Down]: NoodleSpriteIDs.Vertical,
        [Direction.Left]: NoodleSpriteIDs.LeftUp,
        [Direction.Right]: NoodleSpriteIDs.RightUp,
    },
    [Direction.Left]: {
        [Direction.Up]: NoodleSpriteIDs.RightUp,
        [Direction.Down]: NoodleSpriteIDs.RightDown,
        [Direction.Left]: NoodleSpriteIDs.Horizontal,
        [Direction.Right]: NoodleSpriteIDs.Horizontal,
    },
    [Direction.Right]: {
        [Direction.Up]: NoodleSpriteIDs.LeftUp,
        [Direction.Down]: NoodleSpriteIDs.LeftDown,
        [Direction.Left]: NoodleSpriteIDs.Horizontal,
        [Direction.Right]: NoodleSpriteIDs.Horizontal,
    },
};

function manhattanDistance(a: Vector, b: Vector): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export class MapCell extends Cell {
    private _noodleInDir?: Direction;
    private _noodleOutDir?: Direction;

    constructor(args: CellArgs) {
        super(args);

        this.sprites = [
            new TileSprite('ground', GROUND_W.randomize(groundRnd)),
            new TileSprite('traps', -1),
            new TileSprite('noodle', -1),
        ];
    }

    update() {
        if(this._noodleInDir == undefined && this._noodleOutDir == undefined) {
            this.sprites[2].spriteId = -1;
        } else if(this._noodleInDir != undefined && this._noodleOutDir != undefined) {
            this.sprites[2].spriteId = NOODLE_SPRITE_BY_DIRS[this._noodleInDir][this._noodleOutDir];
        } else {
            var dir = this._noodleInDir;
            if(dir == undefined) {
                dir = this._noodleOutDir;
            }

            if(dir == Direction.Up || dir == Direction.Down) {
                this.sprites[2].spriteId = NoodleSpriteIDs.Vertical;
            } else {
                this.sprites[2].spriteId = NoodleSpriteIDs.Horizontal;
            }
        }
    }

    clearNoodle() {
        this._noodleInDir = undefined;
        this._noodleOutDir = undefined;
        this.update();
    }

    isNoodleConnected(that: MapCell): boolean {
        return this.hasNoodle && that.hasNoodle &&
            (this.noodleInDir == that.noodleOutDir 
                || this.noodleOutDir == that.noodleInDir
                || this.noodleInDir == opposite(that.noodleInDir!)
                || this.noodleOutDir == opposite(that.noodleOutDir!));
    }

    placeTrap(tier: number) {
        this.sprites[1].spriteId = tier;
    }

    removeTrap() {
        this.sprites[1].spriteId = -1;
    }

    get hasNoodle(): boolean {
        return this._noodleInDir != undefined || this._noodleOutDir != undefined;
    }

    get hasTrap(): boolean {
        return this.sprites[1].spriteId >= 0;
    }

    get noodleInDir(): Direction | undefined {
        if(this._noodleInDir == undefined) {
            return this._noodleOutDir;
        } else {
            return this._noodleInDir;
        }
    }
    set noodleInDir(dir: Direction | undefined) {
        this._noodleInDir = dir;
        this.update();
    }

    get noodleOutDir(): Direction | undefined {
        if(this._noodleOutDir == undefined) {
            return this._noodleInDir;
        } else {
            return this._noodleOutDir;
        }
    }
    set noodleOutDir(dir: Direction | undefined) {
        this._noodleOutDir = dir;
        this.update();
    }

    get tilePos(): Vector {
        return new Vector(
            Math.floor(this.x / this.width),
            Math.floor(this.y / this.height)
        );
    }
}

export default class Map extends TileMap {
    private oldNoodleTile?: Vector;

    readonly center: Vector;
    readonly size: Vector;

    constructor() {
        const data: MapCell[] = [];

        for(var y = 0; y < 100; ++y) {
            for(var x = 0; x < 100; ++x) {
                data.push(new MapCell({
                    x: x * 24,
                    y: y * 24,
                    width: 24,
                    height: 24,
                    index: y * 100 + x
                }));
            }
        }

        super({
            x: 0,
            y: 0,
            cellWidth: 24,
            cellHeight: 24,
            cols: 100,
            rows: 100,
            data: data,
        });

        this.size = new Vector(
            this.cols * this.cellWidth,
            this.rows * this.cellHeight
        );
        this.center = new Vector(this.x, this.y).add(this.size.scale(0.5));
    }

    placeNoodle(worldPos: Vector, vel?: Vector): boolean {
        const tilePos = new Vector(
            Math.floor(worldPos.x / this.cellWidth),
            Math.floor(worldPos.y / this.cellHeight)
        );
        const curCell = this.getCellByVecTilePos(tilePos);

        if(curCell.hasNoodle) {
            return false;
        }

        if(vel == undefined) {
            curCell.noodleInDir = Direction.Right;
        } else {
            const angle = Math.floor((vel.toAngle() + Math.PI / 4) * 2 / Math.PI) + 1;
            curCell.noodleInDir = DIR_BY_ANGLE[angle];
        }

        if(this.oldNoodleTile != undefined) {
            const mDist = manhattanDistance(tilePos, this.oldNoodleTile);
            const diagonal = mDist == 2 && tilePos.x != this.oldNoodleTile.x && tilePos.y != this.oldNoodleTile.y;
            const adjacent = mDist == 1;

            if(diagonal) {
                this.placeNoodle(new Vector(
                    tilePos.x * this.cellWidth + 2,
                    this.oldNoodleTile.y * this.cellHeight + 2), tilePos.sub(this.oldNoodleTile))
                || this.placeNoodle(new Vector(
                    this.oldNoodleTile.x * this.cellWidth + 2,
                    tilePos.y * this.cellHeight + 2), tilePos.sub(this.oldNoodleTile));
            }

            if(diagonal || adjacent) {
                const delta = tilePos.sub(this.oldNoodleTile);
                const oldCell = this.getCellByVecTilePos(this.oldNoodleTile);

                if(delta.x == 1) {
                    oldCell.noodleOutDir = Direction.Right;
                    curCell.noodleInDir = Direction.Right;
                } else if(delta.x == -1) {
                    oldCell.noodleOutDir = Direction.Left;
                    curCell.noodleInDir = Direction.Left;
                } else if(delta.y == 1) {
                    oldCell.noodleOutDir = Direction.Down;
                    curCell.noodleInDir = Direction.Down;
                } else if(delta.y == -1) {
                    oldCell.noodleOutDir = Direction.Up;
                    curCell.noodleInDir = Direction.Up;
                } else {
                    console.log('Wrong delta:', delta);
                    throw 'This should never happen';
                }
            }
        }

        this.oldNoodleTile = tilePos;
        return true;
    }

    getNextNoodle(current: MapCell): MapCell[] {
        const result: MapCell[] = [];

        const checkAndAddCell = (dir?: Direction) => {
            if(dir != undefined) {
                const offset = OFFSET_BY_DIR[dir];
                const pos = current.tilePos.add(offset);
                const next = this.getCell(pos.x, pos.y);

                if(next.hasNoodle && current.isNoodleConnected(next)) {
                    result.push(next);
                }
            }
        };

        if(current.noodleInDir != undefined) {
            checkAndAddCell(opposite(current.noodleInDir));
        }
        checkAndAddCell(current.noodleOutDir);

        return result;
    }

    placeTrap(worldPos: Vector, tier: number) {
        const cell = this.getCellByPoint(worldPos.x, worldPos.y);
        if(cell.hasTrap) {
            return;
        }

        cell.placeTrap(tier);
    }

    getCell(x: number, y: number): MapCell {
        return super.getCell(x, y) as MapCell;
    }

    getCellByIndex(idx: number): MapCell {
        return super.getCellByIndex(idx) as MapCell;
    }

    getCellByPoint(x: number, y: number): MapCell {
        return super.getCellByPoint(x, y) as MapCell;
    }

    getCellByVecTilePos(tilePos: Vector): MapCell {
        return this.getCell(tilePos.x, tilePos.y) as MapCell;
    }
}