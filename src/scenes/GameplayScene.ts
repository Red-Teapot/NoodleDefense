import { Scene, Texture, SpriteSheet, Engine, Loader } from "excalibur";
import PlayerActor from "../actors/PlayerActor";
import Map from "../world/Map";
import MecharoachActor from "../actors/MecharoachActor";

export default class GameplayScene extends Scene {
    private readonly groundTex = new Texture('assets/tex/ground.png');
    private readonly trapsTex = new Texture('assets/tex/traps.png');
    private readonly noodleTex = new Texture('assets/tex/noodle.png');
    private readonly playerTex = new Texture('assets/tex/player.png');
    private readonly mecharoachTex = new Texture('assets/tex/mecharoach.png');

    private readonly groundSheet = new SpriteSheet(this.groundTex, 5, 5, 24, 24);
    private readonly trapsSheet = new SpriteSheet(this.trapsTex, 5, 5, 24, 24);
    private readonly noodleSheet = new SpriteSheet(this.noodleTex, 5, 5, 24, 24);

    private readonly map = new Map();
    private readonly player = new PlayerActor(this.map);

    onInitialize(engine: Engine) {
        const loader = new Loader([
            this.groundTex,
            this.trapsTex,
            this.noodleTex,
            this.playerTex,
            this.mecharoachTex,
        ]);
        loader.logo = '';
        
        engine.start(loader).then(() => this.onLoaded(engine));
    }

    onLoaded(engine: Engine) {
        this.map.registerSpriteSheet('ground', this.groundSheet);
        this.map.registerSpriteSheet('traps', this.trapsSheet);
        this.map.registerSpriteSheet('noodle', this.noodleSheet);
        
        this.addTileMap(this.map);

        const mapCenter = this.map.center;

        this.camera.pos = mapCenter.clone();
        this.camera.pos.y -= 100;
        this.camera.zoom(2);
        this.camera.strategy.elasticToActor(this.player, 0.07, 0.001);

        this.player.addDrawing(this.playerTex);
        this.player.pos = mapCenter;
        this.add(this.player);
        this.player.setZIndex(100);

        engine.input.pointers.primary.on('down', (evt) => {
            this.spawnMecharoach(evt.worldPos.x, evt.worldPos.y);
        });
    }

    spawnMecharoach(x: number, y: number) {
        const roach = new MecharoachActor(this.map);
        roach.pos.setTo(x, y);
        roach.addDrawing(this.mecharoachTex);
        this.add(roach);
        roach.setZIndex(50);
    }
}