import Phaser from 'phaser'
import { SCENE_KEYS, GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js'
import { loadHighScore } from '../game/highscore.js'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.MENU)
  }

  create() {
    const cx = GAME_WIDTH / 2

    this.add.text(cx, 110, '🗑️ PilahYuk!', {
      fontSize: '54px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5)

    this.add.text(cx, 175, 'Pilah sampah, selamatkan lingkungan!', {
      fontSize: '16px', color: '#94a3b8'
    }).setOrigin(0.5)

    this.add.rectangle(cx, 210, GAME_WIDTH - 32, 2, 0x334155)

    this.add.text(cx, 250, 'Cara main:', {
      fontSize: '18px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5)

    const rules = [
      '• Sampah bergerak di conveyor selama 90 detik',
      '• Tap kategori: 🟢 Organik / 🟡 Anorganik / 🔴 B3',
      '• Benar +10 · Salah -5 · Lewat -3',
      '• Combo 5x berturut-turut → bonus +25'
    ]
    rules.forEach((line, i) => {
      this.add.text(cx, 285 + i * 26, line, {
        fontSize: '15px', color: '#e2e8f0'
      }).setOrigin(0.5)
    })

    const highScore = loadHighScore()
    if (highScore > 0) {
      this.add.text(cx, 410, `🏆 Rekor: ${highScore}`, {
        fontSize: '20px', color: '#fde047', fontStyle: 'bold'
      }).setOrigin(0.5)
    }

    // MAIN button
    const playBtn = this.add.rectangle(cx, 500, 280, 72, 0x22c55e)
      .setStrokeStyle(4, 0x166534)
      .setInteractive({ useHandCursor: true })
    this.add.text(cx, 500, 'MAIN', {
      fontSize: '30px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5)
    playBtn.on('pointerup', () => this.scene.start(SCENE_KEYS.GAME))

    // Tutorial button
    const tutBtn = this.add.rectangle(cx, 590, 200, 52, 0x1e3a5f)
      .setStrokeStyle(3, 0x3b82f6)
      .setInteractive({ useHandCursor: true })
    this.add.text(cx, 590, '📖 Cara Main', {
      fontSize: '18px', color: '#93c5fd'
    }).setOrigin(0.5)
    tutBtn.on('pointerup', () => this.scene.start(SCENE_KEYS.TUTORIAL, { step: 0 }))

    // About button
    const aboutBtn = this.add.rectangle(cx, 658, 200, 52, 0x1e293b)
      .setStrokeStyle(3, 0x475569)
      .setInteractive({ useHandCursor: true })
    this.add.text(cx, 658, 'ℹ️ Tentang', {
      fontSize: '18px', color: '#94a3b8'
    }).setOrigin(0.5)
    aboutBtn.on('pointerup', () => this.scene.start(SCENE_KEYS.ABOUT))

    this.add.text(cx, GAME_HEIGHT - 30, 'Open source · MIT License', {
      fontSize: '12px', color: '#475569'
    }).setOrigin(0.5)
  }
}
