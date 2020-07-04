import { Scene, Texture, SpriteSheet, TileMap, Engine, Loader, TileSprite, Random } from "excalibur";
import PlayerActor from "../actors/PlayerActor";
import WeighedRandom from "../utils/WeighedRandom";

const GROUND_W = new WeighedRandom<number>();
GROUND_W.add(0, 100);
GROUND_W.add(1, 3);
GROUND_W.add(2, 1);

export default class GameplayScene extends Scene {
    private readonly groundTex = new Texture('assets/tex/ground.png');
    private readonly trapsTex = new Texture('assets/tex/traps.png');
    private readonly playerTex = new Texture('assets/tex/player.png');

    private readonly groundSheet = new SpriteSheet(this.groundTex, 5, 5, 24, 24);
    private readonly trapsSheet = new SpriteSheet(this.trapsTex, 5, 5, 24, 24);

    private readonly tilemap = new TileMap(0, 0, 24, 24, 100, 100);
    private readonly player = new PlayerActor();

    private readonly groundRnd = new Random();

    onInitialize(engine: Engine) {
        const loader = new Loader([
            this.groundTex,
            this.trapsTex,
            this.playerTex,
        ]);
        loader.logo = '';
        
        engine.start(loader).then(() => this.onLoaded());
    }

    onLoaded() {
        this.tilemap.registerSpriteSheet('ground', this.groundSheet);
        this.tilemap.registerSpriteSheet('traps', this.trapsSheet);

        for(var i = 0; i < this.tilemap.data.length; ++i) {
            const cell = this.tilemap.getCellByIndex(i);

            cell.pushSprite(new TileSprite('ground', GROUND_W.randomize(this.groundRnd)));
        }
        
        this.addTileMap(this.tilemap);

        const centerX = this.tilemap.cols * this.tilemap.cellWidth / 2;
        const centerY = this.tilemap.rows * this.tilemap.cellHeight / 2;

        this.camera.pos.setTo(centerX, centerY - 100);
        this.camera.zoom(2);
        this.camera.strategy.elasticToActor(this.player, 0.07, 0.001);

        this.player.addDrawing(this.playerTex);
        this.player.pos.setTo(centerX, centerY);
        this.add(this.player);
    }
}