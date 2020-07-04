import { Engine, DisplayMode } from 'excalibur';
import GameplayScene from './scenes/GameplayScene';

const engine = new Engine({
    width: 800,
    height: 600,
    displayMode: DisplayMode.Fixed,
    suppressPlayButton: true,
});
engine.setAntialiasing(false);

engine.start().then(() => {
    engine.addScene('gameplay', new GameplayScene(engine));

    engine.goToScene('gameplay');
});
