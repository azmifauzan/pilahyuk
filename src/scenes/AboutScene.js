import Phaser from 'phaser'
import { SCENE_KEYS, GAME_WIDTH, GAME_HEIGHT, FONT } from '../config/gameConfig.js'

const SECTIONS = [
  {
    label: '🗑️ Apa itu PilahYuk?',
    text: 'Game edukasi pemilahan sampah gratis untuk warga Indonesia. Tanpa instal, langsung main di browser HP manapun.'
  },
  {
    label: '♻️ 3 Kategori Sampah',
    text: '🟢 Organik — sisa makanan, daun, kulit buah\n🟡 Anorganik — plastik, kaleng, kardus, kertas\n🔴 B3 — baterai, obat kadaluarsa, lampu bekas'
  },
  {
    label: '🏘️ Kenapa Perlu Pilah?',
    text: 'Sampah yang dipilah dari rumah mengurangi beban TPA dan memudahkan proses daur ulang serta komposting di komunitas.'
  },
  {
    label: '📱 Ajak Tetangga!',
    text: 'Bagikan skor tertinggimu ke grup WA warga. Bersama pilah sampah, wujudkan lingkungan RT bersih!'
  }
]

export class AboutScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.ABOUT)
  }

  create() {
    const cx = GAME_WIDTH / 2
    this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xf0fdf4)

    // Top strip
    const strip = this.add.graphics()
    strip.fillStyle(0x16a34a)
    strip.fillRect(0, 0, GAME_WIDTH, 6)

    // 1. Drifting Background Elements (Leaves & Recycling)
    const backgroundDecor = ['🍃', '♻️', '🍂', '🌱']
    backgroundDecor.forEach(emoji => {
      for (let i = 0; i < 2; i++) {
        const x = Phaser.Math.Between(40, GAME_WIDTH - 40)
        const y = Phaser.Math.Between(80, GAME_HEIGHT - 100)
        const floatText = this.add.text(x, y, emoji, { fontSize: '24px' }).setOrigin(0.5).setAlpha(0.08)

        this.tweens.add({
          targets: floatText,
          x: x + Phaser.Math.Between(-40, 40),
          y: y + Phaser.Math.Between(-40, 40),
          angle: Phaser.Math.Between(-180, 180),
          duration: Phaser.Math.Between(7000, 11000),
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        })
      }
    })

    // Title
    const titleText = this.add.text(cx, 52, 'Tentang PilahYuk!', {
      fontSize: '28px', color: '#064e3b', fontStyle: 'bold', fontFamily: FONT
    }).setOrigin(0.5)

    const div = this.add.graphics()
    div.lineStyle(1.5, 0xd1fae5)
    div.lineBetween(16, 82, GAME_WIDTH - 16, 82)

    // 2. Sections Container (With staggered slide-in animations)
    let y = 114
    SECTIONS.forEach((sect, idx) => {
      const cardContainer = this.add.container(cx, y)
      cardContainer.setAlpha(0)
      cardContainer.x = cx - 120 // start shifted left for slide effect

      // Card Background panel
      const panel = this.add.graphics()
      panel.fillStyle(0xffffff, 0.88)
      panel.fillRoundedRect(-(GAME_WIDTH - 32) / 2, -10, GAME_WIDTH - 32, 105, 16)
      panel.lineStyle(1.5, 0xd1fae5)
      panel.strokeRoundedRect(-(GAME_WIDTH - 32) / 2, -10, GAME_WIDTH - 32, 105, 16)
      
      const label = this.add.text(0, 12, sect.label, {
        fontSize: '16px', color: '#d97706', fontStyle: 'bold', fontFamily: FONT
      }).setOrigin(0.5)

      const text = this.add.text(0, 52, sect.text, {
        fontSize: '13px', color: '#374151', align: 'center',
        lineSpacing: 4,
        wordWrap: { width: GAME_WIDTH - 56 },
        fontFamily: FONT
      }).setOrigin(0.5)

      cardContainer.add([panel, label, text])

      // Staggered slide and fade-in tween
      this.tweens.add({
        targets: cardContainer,
        x: cx,
        alpha: 1,
        duration: 500,
        delay: idx * 150,
        ease: 'Back.easeOut'
      })

      y += 122
    })

    const bottomDiv = this.add.graphics()
    bottomDiv.lineStyle(1.5, 0xd1fae5)
    bottomDiv.lineBetween(16, GAME_HEIGHT - 90, GAME_WIDTH - 16, GAME_HEIGHT - 90)

    // 3. Premium 3D Pill Back Button
    const backBtnY = GAME_HEIGHT - 48
    const backBtnW = 240
    const backBtnH = 50

    const backContainer = this.add.container(cx, backBtnY)

    // Shadow
    const shadow = this.add.graphics()
    shadow.fillStyle(0x000000, 0.12)
    shadow.fillRoundedRect(-backBtnW / 2 + 2, -backBtnH / 2 + 4, backBtnW, backBtnH, 25)

    // Surface
    const surface = this.add.graphics()
    surface.fillStyle(0xf1f5f9)
    surface.fillRoundedRect(-backBtnW / 2, -backBtnH / 2, backBtnW, backBtnH, 25)
    surface.lineStyle(2, 0xd1d5db)
    surface.strokeRoundedRect(-backBtnW / 2, -backBtnH / 2, backBtnW, backBtnH, 25)

    const labelText = this.add.text(0, 0, '← Kembali ke Menu', {
      fontSize: '16px', color: '#374151', fontStyle: 'bold', fontFamily: FONT
    }).setOrigin(0.5)

    backContainer.add([shadow, surface, labelText])

    const hit = this.add.rectangle(0, 0, backBtnW, backBtnH, 0x000000, 0)
      .setInteractive({ useHandCursor: true })
    backContainer.add(hit)

    hit.on('pointerover', () => {
      this.tweens.add({ targets: backContainer, scaleX: 1.05, scaleY: 1.05, duration: 100 })
    })

    hit.on('pointerout', () => {
      this.tweens.add({ targets: backContainer, scaleX: 1.0, scaleY: 1.0, duration: 100 })
    })

    hit.on('pointerdown', () => {
      this.tweens.add({
        targets: backContainer,
        scaleX: 0.94, scaleY: 0.94,
        duration: 75,
        yoyo: true,
        onComplete: () => this.scene.start(SCENE_KEYS.MENU)
      })
    })
  }
}
