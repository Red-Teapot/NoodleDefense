import { Actor, Engine, Input, Vector } from "excalibur";
import GameplayScene from "../scenes/GameplayScene";

const SPEED = 170;

export default class PlayerActor extends Actor {
    private readonly gameplay: GameplayScene;
    private lastNoodleVel?: Vector;

    constructor(gameplay: GameplayScene) {
        super(0, 0, 24, 24);

        this.gameplay = gameplay;
    }

    onInitialize(engine: Engine) {
        engine.input.keyboard.on('press', (evt) => {
            if(evt.key == Input.Keys.E) {
                this.gameplay.placeTrap(this.pos, 0);
            }
        });
    }

    onPreUpdate(engine: Engine) {
        this.vel.setTo(0, 0);

        if(engine.input.keyboard.isHeld(Input.Keys.W)) {
            this.vel.y -= 1;
            this.setDrawing('walk_up');
        }
        if(engine.input.keyboard.isHeld(Input.Keys.S)) {
            this.vel.y += 1;
            this.setDrawing('walk_down');
        }
        if(engine.input.keyboard.isHeld(Input.Keys.A)) {
            this.vel.x -= 1;
            this.setDrawing('walk_left');
        }
        if(engine.input.keyboard.isHeld(Input.Keys.D)) {
            this.vel.x += 1;
            this.setDrawing('walk_right');
        }
        
        if(this.vel.x != 0 || this.vel.y != 0) {
            this.vel = this.vel.normalize().scale(SPEED);
        }

        if(engine.input.keyboard.isHeld(Input.Keys.Space)) {
            this.gameplay.map.placeNoodle(this.pos, this.vel ? this.vel : this.lastNoodleVel);

            this.lastNoodleVel = this.vel;
        }
    }
}