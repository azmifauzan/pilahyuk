import Phaser from 'phaser'
import { SCENE_KEYS } from '../config/gameConfig.js'

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.BOOT)
  }

  create() {
    this.scene.start(SCENE_KEYS.PRELOAD)
  }
}
