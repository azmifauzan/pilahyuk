import Phaser from 'phaser'
import { SCENE_KEYS, GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js'

const STEPS = [
  {
    title: 'Cara Main (1/3)',
    body: 'Sampah bergerak di conveyor dari kanan ke kiri selama 90 detik.\n\nJangan biarkan sampah keluar layar!',
    badge: '📦 Miss = -3 skor'
  },
  {
    title: 'Cara Main (2/3)',
    body: 'Tap tombol kategori yang tepat sebelum sampah melewati layar.\n\n🟢 Organik  🟡 Anorganik  🔴 B3',
    badge: '✅ Benar +10  ❌ Salah -5'
  },
  {
    title: 'Cara Main (3/3)',
    body: '5 pilah benar berturut-turut = COMBO BONUS!\nKecepatan conveyor naik setiap 30 detik.',
    badge: '🔥 Combo x5 = +25 bonus'
  }
]

const BELT_Y = 540
const BELT_H = 56

export class TutorialScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.TUTORIAL)
  }

  init(data) {
    this.step = data?.step ?? 0
  }

  create() {
    const cx = GAME_WIDTH / 2
    const s = STEPS[this.step]

    this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0f172a)

    // progress dots
    STEPS.forEach((_, i) => {
      this.add.circle(cx + (i - 1) * 28, 48, 8, i <= this.step ? 0x22c55e : 0x334155)
    })

    this.add.text(cx, 90, s.title, {
      fontSize: '22px', color: '#22c55e', fontStyle: 'bold'
    }).setOrigin(0.5)

    this.add.text(cx, 210, s.body, {
      fontSize: '17px', color: '#e2e8f0', align: 'center',
      lineSpacing: 6,
      wordWrap: { width: GAME_WIDTH - 64 }
    }).setOrigin(0.5)

    this.add.rectangle(cx, 340, GAME_WIDTH - 48, 50, 0x1e293b)
      .setStrokeStyle(2, 0x334155)
    this.add.text(cx, 340, s.badge, {
      fontSize: '15px', color: '#fde047', align: 'center'
    }).setOrigin(0.5)

    this._drawDemo()

    const isFirst = this.step === 0
    const isLast = this.step === STEPS.length - 1

    if (!isFirst) {
      const bx = cx - 90
      const backBtn = this.add.rectangle(bx, GAME_HEIGHT - 90, 155, 54, 0x334155)
        .setStrokeStyle(3, 0x475569)
        .setInteractive({ useHandCursor: true })
      this.add.text(bx, GAME_HEIGHT - 90, '← Kembali', {
        fontSize: '17px', color: '#94a3b8'
      }).setOrigin(0.5)
      backBtn.on('pointerup', () =>
        this.scene.start(SCENE_KEYS.TUTORIAL, { step: this.step - 1 })
      )
    }

    const nx = isFirst ? cx : cx + 90
    const nw = isFirst ? 220 : 155
    const nextBtn = this.add.rectangle(nx, GAME_HEIGHT - 90, nw, 54, 0x22c55e)
      .setStrokeStyle(3, 0x166534)
      .setInteractive({ useHandCursor: true })
    this.add.text(nx, GAME_HEIGHT - 90, isLast ? 'MAIN SEKARANG!' : 'Lanjut →', {
      fontSize: '17px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5)
    nextBtn.on('pointerup', () => {
      if (isLast) this.scene.start(SCENE_KEYS.GAME)
      else this.scene.start(SCENE_KEYS.TUTORIAL, { step: this.step + 1 })
    })
  }

  _drawDemo() {
    switch (this.step) {
      case 0: this._demoConveyor(); break
      case 1: this._demoButtons(); break
      case 2: this._demoCombo(); break
    }
  }

  _demoConveyor() {
    const cx = GAME_WIDTH / 2
    this.add.rectangle(cx, BELT_Y, GAME_WIDTH - 32, BELT_H, 0x334155)
      .setStrokeStyle(2, 0x0f172a)
    this.add.text(24, BELT_Y, '❌', { fontSize: '18px', color: '#ef4444' }).setOrigin(0.5)

    const item = this.add.text(GAME_WIDTH - 50, BELT_Y, '🍌', { fontSize: '28px' }).setOrigin(0.5)
    this.tweens.add({
      targets: item,
      x: 24,
      duration: 2200,
      repeat: -1,
      onRepeat: () => { item.x = GAME_WIDTH - 50 }
    })
    this.add.text(cx, BELT_Y + BELT_H / 2 + 18, 'sampah keluar = miss!', {
      fontSize: '13px', color: '#94a3b8'
    }).setOrigin(0.5)
  }

  _demoButtons() {
    const cx = GAME_WIDTH / 2
    const btnW = (GAME_WIDTH - 64) / 3
    const colors = [0x22c55e, 0xeab308, 0xef4444]
    const labels = ['Organik', 'Anorganik', 'B3']
    colors.forEach((c, i) => {
      const bx = 16 + btnW / 2 + i * (btnW + 16)
      this.add.rectangle(bx, BELT_Y + 10, btnW, 52, c).setStrokeStyle(2, 0x0f172a)
      this.add.text(bx, BELT_Y + 10, labels[i], {
        fontSize: '13px', color: '#fff', fontStyle: 'bold'
      }).setOrigin(0.5)
    })
    this.add.text(cx, BELT_Y - 30, '🍌 Kulit Pisang = ?', {
      fontSize: '20px', color: '#fde047'
    }).setOrigin(0.5)
    // pulse highlight on Organik button
    const ox = 16 + btnW / 2
    const hl = this.add.rectangle(ox, BELT_Y + 10, btnW, 52, 0xffffff, 0).setStrokeStyle(3, 0xffffff)
    this.tweens.add({
      targets: hl, alpha: 0.35, duration: 600, yoyo: true, repeat: -1
    })
  }

  _demoCombo() {
    const cx = GAME_WIDTH / 2
    const comboText = this.add.text(cx, BELT_Y - 20, '🔥 COMBO x5', {
      fontSize: '32px', color: '#fde047', fontStyle: 'bold'
    }).setOrigin(0.5)
    this.tweens.add({
      targets: comboText, scaleX: 1.08, scaleY: 1.08,
      duration: 500, yoyo: true, repeat: -1
    })
    const bonus = this.add.text(cx, BELT_Y + 30, '+25 BONUS!', {
      fontSize: '22px', color: '#22c55e', fontStyle: 'bold'
    }).setOrigin(0.5).setAlpha(0)
    this.tweens.add({
      targets: bonus, alpha: 1, duration: 500, yoyo: true,
      repeat: -1, delay: 300
    })
  }
}
