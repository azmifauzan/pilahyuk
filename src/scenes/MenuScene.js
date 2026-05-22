import Phaser from 'phaser'
import { SCENE_KEYS, GAME_WIDTH, GAME_HEIGHT, FONT } from '../config/gameConfig.js'
import { loadHighScore } from '../game/highscore.js'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.MENU)
  }

  create() {
    const cx = GAME_WIDTH / 2

    // 1. Background
    this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xf0fdf4)

    // Decorative top green strip
    const topStrip = this.add.graphics()
    topStrip.fillStyle(0x16a34a)
    topStrip.fillRect(0, 0, GAME_WIDTH, 6)

    // 2. Floating Background Emojis (Subtle drift & rotate)
    const backgroundEmojis = ['🍌', '🧴', '📦', '🔋', '🥛', '🍂', '🍎', '🥫', '♻️']
    backgroundEmojis.forEach(emoji => {
      const x = Phaser.Math.Between(40, GAME_WIDTH - 40)
      const y = Phaser.Math.Between(80, GAME_HEIGHT - 120)
      const floatText = this.add.text(x, y, emoji, { fontSize: '26px' }).setOrigin(0.5).setAlpha(0.12)
      
      // Floating animation
      this.tweens.add({
        targets: floatText,
        x: x + Phaser.Math.Between(-50, 50),
        y: y + Phaser.Math.Between(-50, 50),
        angle: Phaser.Math.Between(-180, 180),
        duration: Phaser.Math.Between(8000, 12000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })
    })

    // 3. Pulsing Title Card Container
    const titleContainer = this.add.container(cx, 160)

    // Title Card Background
    const titleCard = this.add.graphics()
    titleCard.fillStyle(0xffffff, 0.92)
    titleCard.fillRoundedRect(-(GAME_WIDTH - 32) / 2, -100, GAME_WIDTH - 32, 190, 24)
    titleCard.lineStyle(3, 0xd1fae5)
    titleCard.strokeRoundedRect(-(GAME_WIDTH - 32) / 2, -100, GAME_WIDTH - 32, 190, 24)
    titleContainer.add(titleCard)

    // Title Icon (Spinning/pulsing recycling symbol next to trash bin)
    const binText = this.add.text(0, -42, '🗑️', { fontSize: '58px', fontFamily: FONT }).setOrigin(0.5)
    const recycleText = this.add.text(48, -54, '♻️', { fontSize: '24px' }).setOrigin(0.5)
    recycleText.setPadding(8) // Fix clipping for the recycle icon emoji
    
    // Slow rotate recycling icon
    this.tweens.add({
      targets: recycleText,
      angle: 360,
      duration: 6000,
      repeat: -1
    })

    const titleText = this.add.text(0, 18, 'PilahYuk!', {
      fontSize: '44px', color: '#064e3b', fontStyle: 'bold', fontFamily: FONT
    }).setOrigin(0.5)

    const subtitleText = this.add.text(0, 60, 'Pilah sampah, selamatkan lingkungan!', {
      fontSize: '14px', color: '#047857', fontStyle: 'bold', fontFamily: FONT
    }).setOrigin(0.5)

    titleContainer.add([binText, recycleText, titleText, subtitleText])

    // NO title zoom/pulse tween as per user request ("tidak usah ada efek zoom cukup animasi recycle puter saja")

    // 4. Category Badges Area (Shifted down from y=300 to y=340 to reduce gap and reduce mepet keatas)
    const cats = [
      { emoji: '🌱', label: 'Organik', color: 0x16a34a },
      { emoji: '♻️', label: 'Anorganik', color: 0xd97706 },
      { emoji: '☢️', label: 'B3', color: 0xdc2626 }
    ]
    cats.forEach((c, i) => {
      const x = cx - 130 + i * 130
      const y = 340

      const badgeContainer = this.add.container(x, y)

      const badgeGfx = this.add.graphics()
      badgeGfx.fillStyle(c.color, 0.12)
      badgeGfx.fillRoundedRect(-44, -41, 88, 82, 16)
      badgeGfx.lineStyle(2.5, c.color, 0.45)
      badgeGfx.strokeRoundedRect(-44, -41, 88, 82, 16)

      const emoji = this.add.text(0, -14, c.emoji, { fontSize: '30px', fontFamily: FONT }).setOrigin(0.5)
      const label = this.add.text(0, 24, c.label, {
        fontSize: '12px', color: '#374151', fontStyle: 'bold', fontFamily: FONT
      }).setOrigin(0.5)

      badgeContainer.add([badgeGfx, emoji, label])

      // Bouncing categories
      this.tweens.add({
        targets: badgeContainer,
        y: y - 6,
        yoyo: true,
        repeat: -1,
        duration: 1500 + i * 200,
        ease: 'Sine.easeInOut'
      })
    })

    // 5. Animated Decorative Conveyor Belt (LTR) - Styled EXACTLY like Gameplay Conveyor
    const decorBeltY = 480 // Shifted down from 430
    const decorBeltW = GAME_WIDTH - 48
    const decorBeltH = 90 // Premium thick size (patokan gameplay)

    // Conveyor Shadow & Belt Gfx
    const decorBeltGfx = this.add.graphics()
    // Shadow
    decorBeltGfx.fillStyle(0x000000, 0.14)
    decorBeltGfx.fillRect(24 - 2 + 5, decorBeltY - decorBeltH / 2 + 6, decorBeltW + 4, decorBeltH)

    // Belt body
    decorBeltGfx.fillStyle(0x1e293b)
    decorBeltGfx.fillRect(24, decorBeltY - decorBeltH / 2, decorBeltW, decorBeltH)
    decorBeltGfx.lineStyle(4, 0x0f172a)
    decorBeltGfx.strokeRect(24, decorBeltY - decorBeltH / 2, decorBeltW, decorBeltH)

    // Vertical stripes (12 stripes)
    for (let i = 0; i < 12; i++) {
      const sx = 24 + (i + 0.5) * (decorBeltW / 12)
      this.add.rectangle(sx, decorBeltY, 3, decorBeltH - 12, 0x334155).setAlpha(0.7)
    }

    // Direction indicators (Pointing right ▶)
    for (let i = 1; i <= 4; i++) {
      const ax = 24 + i * (decorBeltW / 5)
      this.add.text(ax, decorBeltY, '▶', { fontSize: '20px', color: '#475569' })
        .setOrigin(0.5).setAlpha(0.4)
    }

    // Rollers on belt ends (detailed clockwise spinning rollers)
    const rR = decorBeltH / 2 + 3
    const leftRx = 24
    const rightRx = GAME_WIDTH - 24

    const createDecorRoller = (rx, ry) => {
      const container = this.add.container(rx, ry).setDepth(2)
      // Outer rim
      const rim = this.add.circle(0, 0, rR, 0x0f172a).setStrokeStyle(3.5, 0x475569)
      // Spinner spokes/dots
      const spokes = this.add.graphics()
      spokes.fillStyle(0x334155)
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 3) {
        const dx = Math.cos(angle) * (rR - 12)
        const dy = Math.sin(angle) * (rR - 12)
        spokes.fillCircle(dx, dy, 4.5)
      }
      // Center axle
      const axle = this.add.circle(0, 0, 8, 0x1e293b).setStrokeStyle(2, 0x64748b)
      
      container.add([rim, spokes, axle])
      return container
    }

    const rollerL = createDecorRoller(leftRx, decorBeltY)
    const rollerR = createDecorRoller(rightRx, decorBeltY)

    // Spin rollers clockwise (left-to-right belt motion)
    this.tweens.add({
      targets: [rollerL, rollerR],
      angle: 360,
      duration: 3000,
      repeat: -1
    })

    // Mini waste spawner riding LTR inside white circle with gray border (just like gameplay circles!)
    const spawnDecorItem = () => {
      if (!this.sys.isActive()) return
      const decorWaste = ['🍌', '🧴', '📦', '🔋', '🥛', '🍂', '🍎', '🥫']
      const emoji = Phaser.Utils.Array.GetRandom(decorWaste)
      
      const itemContainer = this.add.container(28, decorBeltY).setDepth(4).setAlpha(0)
      const bg = this.add.circle(0, 0, 26, 0xffffff).setStrokeStyle(2, 0x94a3b8)
      const emojiText = this.add.text(0, 0, emoji, { fontSize: '22px' }).setOrigin(0.5)
      
      itemContainer.add([bg, emojiText])
      
      this.tweens.add({
        targets: itemContainer,
        x: GAME_WIDTH - 28,
        alpha: { start: 0, to: 0.9, control: [ { x: 0.1, y: 1 }, { x: 0.9, y: 1 } ] },
        duration: 4000,
        onUpdate: (tween, target) => {
          if (target.x > GAME_WIDTH - 56) {
            target.alpha = Math.max(0, (GAME_WIDTH - 28 - target.x) / 28)
          } else if (target.x < 56) {
            target.alpha = Math.min(0.9, (target.x - 28) / 28)
          }
        },
        onComplete: () => itemContainer.destroy()
      })
    }

    this.time.addEvent({
      delay: 1800,
      callback: spawnDecorItem,
      loop: -1
    })
    // Spawn first items immediately
    spawnDecorItem()
    this.time.delayedCall(900, spawnDecorItem)

    // 6. Highscore Badge (Elevated layout)
    const highScore = loadHighScore()
    if (highScore > 0) {
      const hsContainer = this.add.container(cx, 565) // Shifted down from 515
      const hsBadgeGfx = this.add.graphics()
      hsBadgeGfx.fillStyle(0xfef3c7)
      hsBadgeGfx.fillRoundedRect(-100, -22, 200, 44, 14)
      hsBadgeGfx.lineStyle(2.5, 0xfbbf24)
      hsBadgeGfx.strokeRoundedRect(-100, -22, 200, 44, 14)

      const hsText = this.add.text(0, 0, `🏆 Rekor: ${highScore}`, {
        fontSize: '18px', color: '#92400e', fontStyle: 'bold', fontFamily: FONT
      }).setOrigin(0.5)

      hsContainer.add([hsBadgeGfx, hsText])

      // Highscore pulse
      this.tweens.add({
        targets: hsContainer,
        scaleX: 1.05,
        scaleY: 1.05,
        yoyo: true,
        repeat: -1,
        duration: 1000
      })
    }

    // 7. Premium Interactive 3D Pill Buttons (Shifted down to balance empty space)
    const buttonsTopY = 636 // Shifted down from 590
    
    // Play Button (Main Green)
    this._makeButton(cx, buttonsTopY, 290, 70, 0x16a34a, '#ffffff', 'MAIN SEKARANG', '▶', 22, () => {
      this.scene.start(SCENE_KEYS.GAME)
    })

    // How to Play Button (Blueish Pill)
    this._makeButton(cx, buttonsTopY + 76, 230, 52, 0xeff6ff, '#1d4ed8', '📖 Cara Main', null, 17, () => {
      this.scene.start(SCENE_KEYS.TUTORIAL, { step: 0 })
    }, 0xbfdbfe)

    // About Button (Greyish Pill)
    this._makeButton(cx, buttonsTopY + 136, 230, 48, 0xf9fafb, '#4b5563', 'ℹ️ Tentang', null, 16, () => {
      this.scene.start(SCENE_KEYS.ABOUT)
    }, 0xe5e7eb)

    // Footer
    this.add.text(cx, GAME_HEIGHT - 22, 'Open source · MIT License', {
      fontSize: '11px', color: '#9ca3af', fontFamily: FONT
    }).setOrigin(0.5)
  }

  // Premium 3D rounded button with shadow, hover scaling, and click depth yoyo.
  _makeButton(x, y, w, h, fillColor, textColor, label, icon, fontSize, onTap, borderColor = null) {
    const btnContainer = this.add.container(x, y)

    // Depth Shadow (Darker color offset downwards)
    const shadowGfx = this.add.graphics()
    shadowGfx.fillStyle(0x000000, 0.15)
    shadowGfx.fillRoundedRect(-w / 2 + 2, -h / 2 + 5, w, h, h / 2)

    // Surface Gfx
    const btnGfx = this.add.graphics()
    btnGfx.fillStyle(fillColor)
    btnGfx.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    if (borderColor) {
      btnGfx.lineStyle(2, borderColor)
      btnGfx.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    }

    // Top Gloss/Shine Highlight (3D feel)
    const shineGfx = this.add.graphics()
    shineGfx.fillStyle(0xffffff, fillColor === 0x16a34a ? 0.16 : 0.08)
    shineGfx.fillRoundedRect(-w / 2 + 4, -h / 2 + 4, w - 8, h / 2 - 4, { tl: h / 2 - 4, tr: h / 2 - 4, bl: 0, br: 0 })

    const labelText = this.add.text(0, 0, label, {
      fontSize: `${fontSize}px`, color: textColor, fontStyle: 'bold', fontFamily: FONT
    }).setOrigin(0.5)

    btnContainer.add([shadowGfx, btnGfx, shineGfx, labelText])

    // Active Interactive hit area
    const hit = this.add.rectangle(0, 0, w, h, 0x000000, 0)
      .setInteractive({ useHandCursor: true })
    btnContainer.add(hit)

    // Interactive Listeners
    hit.on('pointerover', () => {
      this.tweens.add({ targets: btnContainer, scaleX: 1.04, scaleY: 1.04, duration: 100 })
    })

    hit.on('pointerout', () => {
      this.tweens.add({ targets: btnContainer, scaleX: 1.0, scaleY: 1.0, duration: 100 })
    })

    hit.on('pointerdown', () => {
      this.tweens.add({
        targets: btnContainer,
        scaleX: 0.94, scaleY: 0.94,
        duration: 75,
        yoyo: true,
        onComplete: onTap
      })
    })
  }
}
