import { Actor, Random } from "excalibur";
import Map, { MapCell } from "../world/Map";

const SPEED = 30;

const noodleRnd = new Random();

export default class MecharoachActor extends Actor {
    private readonly map: Map;

    private isEating = false;

    constructor(map: Map) {
        super(0, 0, 24, 24);

        this.map = map;

        this.moveToTarget();
    }

    onPreUpdate() {
        const cell = this.map.getCellByPoint(this.pos.x, this.pos.y);

        if(cell.hasNoodle && !this.isEating) {
            this.isEating = true;

            const target = cell.center;
            this.actions.clearActions();
            this.actions.moveTo(target.x, target.y, SPEED)
                .callMethod(() => this.eatNoodle(cell));
        }

        if(this.vel.x != 0 || this.vel.y != 0) {
            this.rotation = this.vel.toAngle();
        }
    }

    eatNoodle(cell: MapCell) {
        // Perhaps someone has already eaten it
        if(!cell.hasNoodle) {
            this.moveToTarget();
        }

        const next = this.map.getNextNoodle(cell);

        cell.clearNoodle();

        if(next.length == 0) {
            this.isEating = false;
            this.moveToTarget();
        } else {
            // TODO Maybe select closest to the goal direction
            const targetCell = noodleRnd.pickOne(next);
            const target = targetCell.center;
            this.actions.moveTo(target.x, target.y, SPEED)
                .callMethod(() => this.eatNoodle(targetCell));
        }
    }

    moveToTarget() {
        this.actions.moveTo(this.map.center.x, this.map.center.y, SPEED)
            .callMethod(() => {
                // TODO Shake camera, decrease HP, etc.
                console.log('TARGET REACHED');
            })
            .die();
    }
}