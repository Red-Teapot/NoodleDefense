import { Actor } from "excalibur";
import Map, { MapCell } from "../world/Map";

const SPEED = 30;

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
    }

    eatNoodle(cell: MapCell) {
        // Perhaps someone has already eaten it
        if(!cell.hasNoodle) {
            this.moveToTarget();
        }

        cell.clearNoodle();

        // TODO Follow noodle chain
        this.actions.die();
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