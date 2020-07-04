import { Actor, Engine, Input, Vector } from "excalibur";
import Map from "../world/Map";

const SPEED = 24 * 7;

export default class PlayerActor extends Actor {
    private readonly map: Map;

    constructor(map: Map) {
        super(0, 0, 24, 24);

        this.map = map;
    }

    update(engine: Engine, delta: number) {
        this.vel.setTo(0, 0);

        if(engine.input.keyboard.isHeld(Input.Keys.W)) {
            this.vel.y -= 1;
        }
        if(engine.input.keyboard.isHeld(Input.Keys.S)) {
            this.vel.y += 1;
        }
        if(engine.input.keyboard.isHeld(Input.Keys.A)) {
            this.vel.x -= 1;
        }
        if(engine.input.keyboard.isHeld(Input.Keys.D)) {
            this.vel.x += 1;
        }
        
        if(this.vel.x != 0 || this.vel.y != 0) {
            this.vel = this.vel.normalize().scale(SPEED);
        }

        if(engine.input.keyboard.isHeld(Input.Keys.Space)) {
            this.map.placeNoodle(this.pos, this.vel);
        }

        super.update(engine, delta);
    }
}