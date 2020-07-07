import { Actor, Random } from "excalibur";
import Map, { MapCell } from "../world/Map";
import GameplayScene from "../scenes/GameplayScene";

const SPEED = 30;

const noodleRnd = new Random();

export default class MecharoachActor extends Actor {
    private readonly gameplay: GameplayScene;
    private readonly map: Map;

    private isEating = false;

    constructor(gameplay: GameplayScene) {
        super(0, 0, 24, 24);

        this.gameplay = gameplay;
        this.map = gameplay.map;

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

        if(cell.hasTrap && !this.isEating) {
            this.gameplay.onRoachTrapped(this);
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

        if(cell.hasTrap) {
            this.gameplay.onRoachTrapped(this);
        }

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
                this.gameplay.onRoachReachedTarget(this)
            });
    }
}