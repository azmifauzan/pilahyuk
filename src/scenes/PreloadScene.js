import Phaser from 'phaser'
import { SCENE_KEYS, GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js'

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.PRELOAD)
  }

  preload() {
    const label = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Memuat…', {
      fontSize: '28px',
      color: '#ffffff'
    }).setOrigin(0.5)
    this.load.on('complete', () => label.destroy())
  }

  create() {
    this.scene.start(SCENE_KEYS.MENU)
  }
}
