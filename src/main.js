import Phaser from 'phaser'
import { GAME_CONFIG } from './config/gameConfig.js'
import { BootScene } from './scenes/BootScene.js'
import { PreloadScene } from './scenes/PreloadScene.js'
import { MenuScene } from './scenes/MenuScene.js'
import { TutorialScene } from './scenes/TutorialScene.js'
import { AboutScene } from './scenes/AboutScene.js'
import { GameScene } from './scenes/GameScene.js'
import { GameOverScene } from './scenes/GameOverScene.js'

const game = new Phaser.Game({
  ...GAME_CONFIG,
  type: Phaser.AUTO,
  scale: {
    ...GAME_CONFIG.scale,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, PreloadScene, MenuScene, TutorialScene, AboutScene, GameScene, GameOverScene]
})

if (import.meta.env.DEV) window.__PILAHYUK__ = game
