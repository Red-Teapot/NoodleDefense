import { TileMap, Loadable, Cell, CellArgs, Random, TileSprite, Vector } from "excalibur";
import WeighedRandom from "../utils/WeighedRandom";

const GROUND_W = new WeighedRandom<number>();
GROUND_W.add(0, 100);
GROUND_W.add(1, 3);
GROUND_W.add(2, 1);

const groundRnd = new Random();

enum Direction {
    Up,
    Down,
    Left,
    Right,
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

class MapCell extends Cell {
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
        if(this._noodleInDir != undefined && this._noodleOutDir != undefined) {
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

    get hasNoodle(): boolean {
        return this._noodleInDir != undefined || this._noodleOutDir != undefined;
    }

    get noodleInDir(): Direction | undefined {
        return this._noodleInDir;
    }
    set noodleInDir(dir: Direction | undefined) {
        this._noodleInDir = dir;
        this.update();
    }

    get noodleOutDir(): Direction | undefined {
        return this._noodleOutDir;
    }
    set noodleOutDir(dir: Direction | undefined) {
        this._noodleOutDir = dir;
        this.update();
    }
}

export default class Map extends TileMap {
    private oldNoodleTile?: Vector;

    constructor() {
        const data: MapCell[] = [];

        for(var x = 0; x < 100; ++x) {
            for(var y = 0; y < 100; ++y) {
                data.push(new MapCell({
                    x: x,
                    y: y,
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

    getCellByVecTilePos(tilePos: Vector): MapCell {
        return this.getCell(tilePos.x, tilePos.y) as MapCell;
    }

    get center(): Vector {
        return this.size.scale(0.5);
    }

    get size(): Vector {
        return new Vector(
            this.cols * this.cellWidth,
            this.rows * this.cellHeight
        );
    }
}