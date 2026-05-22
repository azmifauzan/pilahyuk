import Phaser from 'phaser'
import QRCode from 'qrcode'
import { SCENE_KEYS, GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js'
import { saveHighScore, loadHighScore } from '../game/highscore.js'

const GAME_URL = 'https://pilahyuk.aspriai.my.id'

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.GAME_OVER)
  }

  init(data) {
    this.summary = data?.summary ?? {
      score: 0, maxCombo: 0, correctCount: 0,
      wrongCount: 0, missCount: 0, accuracy: 0
    }
  }

  create() {
    const cx = GAME_WIDTH / 2
    const newHigh = saveHighScore(this.summary.score)
    const isNewRecord = this.summary.score > 0 && this.summary.score >= newHigh

    this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0f172a)

    // header
    this.add.text(cx, 70, 'Waktu Habis!', {
      fontSize: '38px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5)

    // score
    this.add.text(cx, 140, `${this.summary.score}`, {
      fontSize: '56px', color: '#fde047', fontStyle: 'bold'
    }).setOrigin(0.5)
    this.add.text(cx, 185, 'poin', {
      fontSize: '18px', color: '#94a3b8'
    }).setOrigin(0.5)

    if (isNewRecord) {
      const rec = this.add.text(cx, 220, '🏆 REKOR BARU!', {
        fontSize: '22px', color: '#22c55e', fontStyle: 'bold'
      }).setOrigin(0.5)
      this.tweens.add({
        targets: rec, scaleX: 1.06, scaleY: 1.06,
        duration: 500, yoyo: true, repeat: -1
      })
    } else {
      const hs = loadHighScore()
      if (hs > 0) {
        this.add.text(cx, 220, `Rekor: ${hs}`, {
          fontSize: '17px', color: '#94a3b8'
        }).setOrigin(0.5)
      }
    }

    // stats grid
    const stats = [
      ['✅ Benar', this.summary.correctCount],
      ['❌ Salah', this.summary.wrongCount],
      ['💨 Lewat', this.summary.missCount],
      ['🔥 Combo max', this.summary.maxCombo],
      ['🎯 Akurasi', `${Math.round(this.summary.accuracy * 100)}%`]
    ]
    const statY = 258
    stats.forEach(([label, value], i) => {
      const row = Math.floor(i / 2)
      const col = i % 2
      const sx = col === 0 ? cx - 90 : cx + 90
      const sy = statY + row * 40
      this.add.text(sx, sy, label, {
        fontSize: '13px', color: '#64748b'
      }).setOrigin(0.5)
      this.add.text(sx, sy + 18, `${value}`, {
        fontSize: '18px', color: '#e2e8f0', fontStyle: 'bold'
      }).setOrigin(0.5)
    })

    // action buttons
    const restartBtn = this.add.rectangle(cx, 450, 260, 64, 0x22c55e)
      .setStrokeStyle(4, 0x166534)
      .setInteractive({ useHandCursor: true })
    this.add.text(cx, 450, 'MAIN LAGI', {
      fontSize: '24px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5)
    restartBtn.on('pointerdown', () =>
      this.tweens.add({ targets: restartBtn, scaleX: 0.95, scaleY: 0.95, duration: 80, yoyo: true })
    )
    restartBtn.on('pointerup', () => this.scene.start(SCENE_KEYS.GAME))

    const menuBtn = this.add.rectangle(cx, 530, 200, 50, 0x334155)
      .setStrokeStyle(3, 0x475569)
      .setInteractive({ useHandCursor: true })
    this.add.text(cx, 530, 'Menu', {
      fontSize: '19px', color: '#ffffff'
    }).setOrigin(0.5)
    menuBtn.on('pointerup', () => this.scene.start(SCENE_KEYS.MENU))

    // WhatsApp share button
    const waBtn = this.add.rectangle(cx, 608, 260, 54, 0x25D366)
      .setStrokeStyle(3, 0x128C7E)
      .setInteractive({ useHandCursor: true })
    this.add.text(cx, 608, '📱 Bagikan ke WhatsApp', {
      fontSize: '16px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5)
    waBtn.on('pointerup', () => {
      const text = `Saya dapat skor ${this.summary.score} di PilahYuk! Game edukasi pilah sampah Indonesia 🗑️♻️\nCoba kamu: ${GAME_URL}`
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    })

    // QR code
    this.add.text(cx, 660, 'Scan untuk share ke teman:', {
      fontSize: '13px', color: '#64748b'
    }).setOrigin(0.5)

    this._generateQR(cx, 755)
  }

  _generateQR(cx, y) {
    const offscreen = document.createElement('canvas')
    QRCode.toCanvas(offscreen, GAME_URL, {
      width: 130,
      margin: 1,
      color: { dark: '#ffffffff', light: '#0f172aff' }
    })
      .then(() => {
        const key = 'qr-pilahyuk'
        if (this.textures.exists(key)) this.textures.remove(key)
        const tex = this.textures.addCanvas(key, offscreen)
        if (tex) {
          this.add.image(cx, y, key).setDisplaySize(120, 120)
        }
      })
      .catch(() => {
        this.add.text(cx, y, GAME_URL, {
          fontSize: '12px', color: '#475569', align: 'center'
        }).setOrigin(0.5)
      })
  }
}
