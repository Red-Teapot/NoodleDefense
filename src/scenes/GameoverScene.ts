import { Scene, Engine, Label, TextAlign, Color } from "excalibur";
import GameplayScene from "./GameplayScene";

export default class GameoverScene extends Scene {
    private engine?: Engine;

    onInitialize(engine: Engine) {
        this.engine = engine;

        const cx = engine.canvasWidth / 2;
        const cy = engine.canvasHeight / 2;

        const gameoverLbl = new Label('Game over!');
        gameoverLbl.textAlign = TextAlign.Center;
        gameoverLbl.pos.setTo(cx, cy);
        gameoverLbl.fontSize = 40;
        gameoverLbl.color = Color.White;

        const restartLbl = new Label('Press any key to restart');
        restartLbl.textAlign = TextAlign.Center;
        restartLbl.pos.setTo(cx, cy + 40);
        restartLbl.fontSize = 20;
        restartLbl.color = Color.White;
        
        this.addScreenElement(gameoverLbl);
        this.addScreenElement(restartLbl);
    }

    onActivate() {
        this.engine!.input.keyboard.once('press', () => {
            // FIXME
            this.engine!.scenes['gameplay'] = new GameplayScene(this.engine!);
            this.engine!.goToScene('gameplay');
        });
    }
}