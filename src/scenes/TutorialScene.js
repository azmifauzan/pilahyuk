import Phaser from 'phaser'
import { SCENE_KEYS, GAME_WIDTH, GAME_HEIGHT, FONT } from '../config/gameConfig.js'

const STEPS = [
  {
    title: 'Cara Main (1/3)',
    body: 'Sampah bergerak di conveyor dari kiri ke kanan selama 60 detik.\n\nJangan biarkan sampah keluar layar!',
    badge: '📦 Lewat (Miss) = -3 skor'
  },
  {
    title: 'Cara Main (2/3)',
    body: 'Tap kategori yang tepat sebelum sampah melewatinya.\n🟢 Organik  🟡 Anorganik  🔴 B3\n\n(Catatan: Anorganik mencakup Daur Ulang & Residu seperti popok & sachet!)',
    badge: '✅ Benar +10  ❌ Salah: -1 nyawa  (kamu punya 3)'
  },
  {
    title: 'Cara Main (3/3)',
    body: '5 pemilahan benar beruntun = COMBO BONUS!\nKecepatan conveyor bertambah naik setiap 20 detik.',
    badge: '🔥 Combo x5 = +25 bonus'
  }
]

const BELT_Y = 540
const BELT_H = 110

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

    this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xf0fdf4)

    // Top strip
    const strip = this.add.graphics()
    strip.fillStyle(0x16a34a)
    strip.fillRect(0, 0, GAME_WIDTH, 6)

    // Progress dots
    STEPS.forEach((_, i) => {
      this.add.circle(cx + (i - 1) * 28, 48, 8, i <= this.step ? 0x16a34a : 0xe5e7eb)
    })

    this.add.text(cx, 90, s.title, {
      fontSize: '22px', color: '#064e3b', fontStyle: 'bold', fontFamily: FONT
    }).setOrigin(0.5)

    this.add.text(cx, 210, s.body, {
      fontSize: '16px', color: '#374151', align: 'center',
      lineSpacing: 6,
      wordWrap: { width: GAME_WIDTH - 64 },
      fontFamily: FONT
    }).setOrigin(0.5)

    const badgeBg = this.add.graphics()
    badgeBg.fillStyle(0xfef3c7)
    badgeBg.fillRoundedRect(cx - (GAME_WIDTH - 48) / 2, 315, GAME_WIDTH - 48, 50, 12)
    badgeBg.lineStyle(2, 0xfbbf24)
    badgeBg.strokeRoundedRect(cx - (GAME_WIDTH - 48) / 2, 315, GAME_WIDTH - 48, 50, 12)

    this.add.text(cx, 340, s.badge, {
      fontSize: '15px', color: '#92400e', align: 'center', fontFamily: FONT, fontStyle: 'bold'
    }).setOrigin(0.5)

    this._drawDemo()

    const isFirst = this.step === 0
    const isLast = this.step === STEPS.length - 1

    // Back button: to Menu scene on step 0, otherwise to step - 1
    const bx = cx - 90
    const backBg = this.add.graphics()
    backBg.fillStyle(0xf1f5f9)
    backBg.fillRoundedRect(bx - 77, GAME_HEIGHT - 117, 155, 54, 27)
    backBg.lineStyle(2, 0xd1d5db)
    backBg.strokeRoundedRect(bx - 77, GAME_HEIGHT - 117, 155, 54, 27)

    this.add.text(bx, GAME_HEIGHT - 90, isFirst ? '← Menu Utama' : '← Kembali', {
      fontSize: isFirst ? '15px' : '17px', color: '#4b5563', fontFamily: FONT, fontStyle: 'bold'
    }).setOrigin(0.5)

    const backBtn = this.add.rectangle(bx, GAME_HEIGHT - 90, 155, 54, 0x000000, 0)
      .setInteractive({ useHandCursor: true })
    backBtn.on('pointerdown', () => {
      this.tweens.add({ targets: backBg, scaleX: 0.95, scaleY: 0.95, duration: 75, yoyo: true })
    })
    backBtn.on('pointerup', () => {
      if (isFirst) {
        this.scene.start(SCENE_KEYS.MENU)
      } else {
        this.scene.start(SCENE_KEYS.TUTORIAL, { step: this.step - 1 })
      }
    })

    // Next Button (Always on the right now!)
    const nx = cx + 90
    const nw = 155
    const nextBg = this.add.graphics()
    nextBg.fillStyle(0x16a34a)
    nextBg.fillRoundedRect(nx - nw / 2, GAME_HEIGHT - 117, nw, 54, 27)
    
    // Depth shadow
    const nextShadow = this.add.graphics()
    nextShadow.fillStyle(0x000000, 0.12)
    nextShadow.fillRoundedRect(nx - nw / 2 + 2, -117 + GAME_HEIGHT + 4, nw, 54, 27)

    this.add.text(nx, GAME_HEIGHT - 90, isLast ? 'MAIN SEKARANG!' : 'Lanjut →', {
      fontSize: '17px', color: '#ffffff', fontStyle: 'bold', fontFamily: FONT
    }).setOrigin(0.5)

    const nextBtn = this.add.rectangle(nx, GAME_HEIGHT - 90, nw, 54, 0x000000, 0)
      .setInteractive({ useHandCursor: true })
    nextBtn.on('pointerdown', () => {
      this.tweens.add({ targets: nextBg, scaleX: 0.95, scaleY: 0.95, duration: 75, yoyo: true })
    })
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

  // Left-to-Right conveyor belt demo with spinning rollers and miss effect (styled like gameplay)
  _demoConveyor() {
    const cx = GAME_WIDTH / 2
    const beltW = GAME_WIDTH - 48
    
    // Conveyor belt Shadow & Body
    const beltBg = this.add.graphics()
    // Shadow
    beltBg.fillStyle(0x000000, 0.14)
    beltBg.fillRect(24 - 2 + 5, BELT_Y - BELT_H / 2 + 6, beltW + 4, BELT_H)

    // Body
    beltBg.fillStyle(0x1e293b)
    beltBg.fillRect(24, BELT_Y - BELT_H / 2, beltW, BELT_H)
    beltBg.lineStyle(4, 0x0f172a)
    beltBg.strokeRect(24, BELT_Y - BELT_H / 2, beltW, BELT_H)

    // Vertical stripes (12 stripes)
    for (let i = 0; i < 12; i++) {
      const sx = 24 + (i + 0.5) * (beltW / 12)
      this.add.rectangle(sx, BELT_Y, 3, BELT_H - 14, 0x334155).setAlpha(0.7)
    }

    // Direction arrows pointing right (▶)
    for (let i = 1; i <= 3; i++) {
      const ax = 24 + i * (beltW / 4)
      this.add.text(ax, BELT_Y, '▶', { fontSize: '20px', color: '#475569' })
        .setOrigin(0.5).setAlpha(0.4)
    }

    // Miss cross indicator (elevated depth)
    const missCross = this.add.text(GAME_WIDTH - 42, BELT_Y, '❌', { fontSize: '24px' }).setOrigin(0.5).setAlpha(0.3).setDepth(5)

    // Rollers on belt ends (detailed clockwise spinning rollers)
    const rR = BELT_H / 2 + 4
    const leftRx = 24
    const rightRx = GAME_WIDTH - 24

    const createTutorialRoller = (rx, ry) => {
      const container = this.add.container(rx, ry).setDepth(2)
      // Outer rim
      const rim = this.add.circle(0, 0, rR, 0x0f172a).setStrokeStyle(3.5, 0x475569)
      // Spinner spokes/dots
      const spokes = this.add.graphics()
      spokes.fillStyle(0x334155)
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 3) {
        const dx = Math.cos(angle) * (rR - 14)
        const dy = Math.sin(angle) * (rR - 14)
        spokes.fillCircle(dx, dy, 5)
      }
      // Center axle
      const axle = this.add.circle(0, 0, 9, 0x1e293b).setStrokeStyle(2.5, 0x64748b)
      
      container.add([rim, spokes, axle])
      return container
    }

    const rollerL = createTutorialRoller(leftRx, BELT_Y)
    const rollerR = createTutorialRoller(rightRx, BELT_Y)

    this.tweens.add({
      targets: [rollerL, rollerR],
      angle: 360,
      duration: 3000,
      repeat: -1
    })

    // Moving banana skin (LTR) wrapped inside a white circle badge with gray border (just like gameplay circle!)
    const itemContainer = this.add.container(36, BELT_Y).setDepth(4)
    const bg = this.add.circle(0, 0, 32, 0xffffff).setStrokeStyle(2.5, 0x94a3b8)
    const emojiText = this.add.text(0, 0, '🍌', { fontSize: '32px' }).setOrigin(0.5)
    itemContainer.add([bg, emojiText])
    
    this.tweens.add({
      targets: itemContainer,
      x: GAME_WIDTH - 36,
      duration: 2500,
      repeat: -1,
      onRepeat: () => {
        itemContainer.x = 36
        missCross.setScale(1).setColor('#ff0000')
      },
      onUpdate: (tween, target) => {
        if (target.x > GAME_WIDTH - 70) {
          // Pulse the X when item approaches
          const scale = 1.0 + 0.5 * ((target.x - (GAME_WIDTH - 70)) / 34)
          missCross.setScale(scale).setAlpha(0.9)
        } else {
          missCross.setScale(1).setAlpha(0.3)
        }
      }
    })

    this.add.text(cx, BELT_Y + BELT_H / 2 + 18, 'sampah keluar di kanan = miss!', {
      fontSize: '13px', color: '#6b7280', fontFamily: FONT
    }).setOrigin(0.5)
  }

  // Revamped button demo with modern 3D pill buttons and a pulsing pointer finger
  _demoButtons() {
    const cx = GAME_WIDTH / 2
    const btnW = (GAME_WIDTH - 64) / 3
    const colors = [0x16a34a, 0xd97706, 0xef4444]
    const borders = [0x15803d, 0xb45309, 0xb91c1c]
    const labels = ['Organik', 'Anorganik', 'B3']
    
    let organikX = 0

    colors.forEach((c, i) => {
      const bx = 16 + btnW / 2 + i * (btnW + 16)
      if (i === 0) organikX = bx

      // Shadow
      const shadow = this.add.graphics()
      shadow.fillStyle(0x000000, 0.12)
      shadow.fillRoundedRect(bx - btnW / 2 + 2, BELT_Y - 16 + 4, btnW, 46, 23)

      // Button surface
      const bg = this.add.graphics()
      bg.fillStyle(c)
      bg.fillRoundedRect(bx - btnW / 2, BELT_Y - 16, btnW, 46, 23)
      bg.lineStyle(2.5, borders[i])
      bg.strokeRoundedRect(bx - btnW / 2, BELT_Y - 16, btnW, 46, 23)

      this.add.text(bx, BELT_Y + 7, labels[i], {
        fontSize: '13px', color: '#fff', fontStyle: 'bold', fontFamily: FONT
      }).setOrigin(0.5)
    })

    // Question
    this.add.text(cx, BELT_Y - 38, '🍌 Kulit Pisang = ?', {
      fontSize: '20px', color: '#0f766e', fontStyle: 'bold', fontFamily: FONT
    }).setOrigin(0.5)

    // Pulsing tap highlight outline on Organik button
    const hl = this.add.graphics()
    hl.lineStyle(3, 0xffffff, 0.8)
    hl.strokeRoundedRect(organikX - btnW / 2 - 2, BELT_Y - 18, btnW + 4, 50, 25)
    this.tweens.add({ targets: hl, alpha: 0.2, duration: 600, yoyo: true, repeat: -1 })

    // Bouncing tapping finger pointing to Organik button
    const finger = this.add.text(organikX, BELT_Y + 48, '👆', { fontSize: '32px' }).setOrigin(0.5)
    this.tweens.add({
      targets: finger,
      y: BELT_Y + 60,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }

  // Animated combo scene with star/fire particles exploding periodically
  _demoCombo() {
    const cx = GAME_WIDTH / 2
    
    const comboText = this.add.text(cx, BELT_Y - 24, '🔥 COMBO x5', {
      fontSize: '34px', color: '#d97706', fontStyle: 'bold', fontFamily: FONT
    }).setOrigin(0.5)
    
    this.tweens.add({
      targets: comboText, 
      scaleX: 1.1, scaleY: 1.1,
      duration: 400, 
      yoyo: true, 
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    const bonus = this.add.text(cx, BELT_Y + 28, '+25 BONUS!', {
      fontSize: '24px', color: '#16a34a', fontStyle: 'bold', fontFamily: FONT
    }).setOrigin(0.5).setAlpha(0)

    this.tweens.add({
      targets: bonus, 
      alpha: 1, 
      duration: 500, 
      yoyo: true,
      repeat: -1, 
      delay: 250
    })

    // Confetti firework timer
    const spawnSparkles = () => {
      if (!this.sys.isActive()) return
      const colors = [0xf59e0b, 0xef4444, 0x10b981, 0x3b82f6, 0xfbbf24]
      
      for (let i = 0; i < 10; i++) {
        const color = Phaser.Utils.Array.GetRandom(colors)
        const size = Phaser.Math.Between(4, 8)
        const spark = this.add.circle(cx + Phaser.Math.Between(-80, 80), BELT_Y - 20, size, color)
        
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2)
        const dist = Phaser.Math.Between(30, 90)
        
        this.tweens.add({
          targets: spark,
          x: spark.x + Math.cos(angle) * dist,
          y: spark.y + Math.sin(angle) * dist,
          alpha: 0,
          scaleX: 0.3,
          scaleY: 0.3,
          duration: 800,
          onComplete: () => spark.destroy()
        })
      }
    }

    this.time.addEvent({
      delay: 1500,
      callback: spawnSparkles,
      loop: -1
    })
    spawnSparkles()
  }
}
