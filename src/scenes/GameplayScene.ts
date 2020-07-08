import { Scene, Texture, SpriteSheet, Engine, Loader, Animation, Random, Vector, Actor } from "excalibur";
import PlayerActor from "../actors/PlayerActor";
import Map from "../world/Map";
import MecharoachActor from "../actors/MecharoachActor";

const mecharoachRnd = new Random();

export default class GameplayScene extends Scene {
    private readonly groundTex = new Texture('assets/tex/ground.png');
    private readonly trapsTex = new Texture('assets/tex/traps.png');
    private readonly noodleTex = new Texture('assets/tex/noodle.png');
    private readonly playerTex = new Texture('assets/tex/player.png');
    private readonly mecharoachTex = new Texture('assets/tex/mecharoach.png');

    private readonly hintsTex = new Texture('assets/tex/hints.png');

    private readonly groundSheet = new SpriteSheet(this.groundTex, 5, 5, 24, 24);
    private readonly trapsSheet = new SpriteSheet(this.trapsTex, 5, 5, 24, 24);
    private readonly noodleSheet = new SpriteSheet(this.noodleTex, 5, 5, 24, 24);

    private readonly mecharoachSheet = new SpriteSheet(this.mecharoachTex, 2, 1, 32, 32);
    private readonly playerSheet = new SpriteSheet(this.playerTex, 4, 2, 24, 24);
    private mecharoachAnim?: Animation;
    private playerWalkU?: Animation;
    private playerWalkD?: Animation;
    private playerWalkL?: Animation;
    private playerWalkR?: Animation;

    readonly map = new Map();
    private readonly player = new PlayerActor(this);

    private mecharoachSpawnChance = 0.15;

    onInitialize(engine: Engine) {
        const loader = new Loader([
            this.groundTex,
            this.trapsTex,
            this.noodleTex,
            this.playerTex,
            this.mecharoachTex,
            this.hintsTex,
        ]);
        loader.logo = '';
        
        engine.start(loader).then(() => this.onLoaded(engine));
    }

    onLoaded(engine: Engine) {
        this.mecharoachAnim = this.mecharoachSheet.getAnimationForAll(engine, 100);
        this.playerWalkU = this.playerSheet.getAnimationByIndices(engine, [1, 5], 200);
        this.playerWalkD = this.playerSheet.getAnimationByIndices(engine, [0, 4], 200);
        this.playerWalkL = this.playerSheet.getAnimationByIndices(engine, [3, 7], 200);
        this.playerWalkR = this.playerSheet.getAnimationByIndices(engine, [2, 6], 200);

        this.map.registerSpriteSheet('ground', this.groundSheet);
        this.map.registerSpriteSheet('traps', this.trapsSheet);
        this.map.registerSpriteSheet('noodle', this.noodleSheet);

        const mapCenter = this.map.center;

        this.camera.pos = mapCenter.clone();
        this.camera.pos.y -= 100;
        this.camera.zoom(2);
        this.camera.strategy.elasticToActor(this.player, 0.07, 0.001);

        this.player.addDrawing('walk_up', this.playerWalkU);
        this.player.addDrawing('walk_down', this.playerWalkD);
        this.player.addDrawing('walk_left', this.playerWalkL);
        this.player.addDrawing('walk_right', this.playerWalkR);
        this.player.setDrawing('walk_down');
        this.player.pos = mapCenter;

        const hints = new Actor({
            x: mapCenter.x + 30,
            y: mapCenter.y - 30,
        });
        hints.addDrawing(this.hintsTex);
        hints.actions.delay(20 * 1000).fade(0, 1000).die();

        engine.input.pointers.primary.on('down', (evt) => {
            // FIXME Remove this
            this.spawnMecharoach(evt.worldPos.x, evt.worldPos.y);
        });

        this.addTileMap(this.map);
        this.add(hints);
        this.add(this.player);
        this.player.setZIndex(100);
    }

    onPreUpdate(engine: Engine) {
        // Spawn mecharoach
        if(mecharoachRnd.floating(0, 100) < this.mecharoachSpawnChance) {
            const angle = mecharoachRnd.floating(0, 2 * Math.PI);
            const distance = mecharoachRnd.floating(400, 1000);
            const pos = new Vector(distance, 0).rotate(angle).add(this.map.center);
            
            this.spawnMecharoach(pos.x, pos.y);
            console.log('Mecharoach spawned');
        }
    }

    onRoachReachedTarget(roach: MecharoachActor) {
        roach.kill();
        this.camera.shake(10, 10, 150);
        // TODO HP calc, etc.
    }

    onRoachTrapped(roach: MecharoachActor) {
        roach.kill();
    }

    spawnMecharoach(x: number, y: number) {
        const roach = new MecharoachActor(this);
        roach.pos.setTo(x, y);
        roach.addDrawing('walk', this.mecharoachAnim!);
        this.add(roach);
        roach.setZIndex(50);

        if(this.mecharoachSpawnChance < 0.4) {
            this.mecharoachSpawnChance += 0.001;
        }
    }
}