import { DisplayMode, Engine } from 'excalibur';
import GameplayScene from './scenes/GameplayScene';
import GameoverScene from './scenes/GameoverScene';

const engine = new Engine({
    width: 800,
    height: 600,
    displayMode: DisplayMode.Fixed,
    suppressPlayButton: true,
});
engine.setAntialiasing(false);

engine.start().then(() => {
    engine.addScene('gameplay', new GameplayScene(engine));
    engine.addScene('gameover', new GameoverScene(engine));

    engine.goToScene('gameplay');
});
