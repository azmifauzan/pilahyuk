import Phaser from 'phaser'
import {
  SCENE_KEYS,
  GAME_WIDTH,
  GAME_HEIGHT,
  ROUND_SECONDS,
  BASE_BELT_SPEED_PX_PER_SEC,
  CATEGORY_IDS,
  CATEGORY_LABEL,
  START_LIVES,
  FONT
} from '../config/gameConfig.js'
import { Scoring } from '../game/scoring.js'
import { Conveyor } from '../game/conveyor.js'
import { CountdownTimer } from '../game/timer.js'
import { speedAt, spawnIntervalAt, tierIndexAt } from '../game/difficulty.js'
import { randomItem, judge } from '../game/sorter.js'
import { resumeAudio, playCorrect, playWrong, playCombo, playMiss } from '../game/audio.js'

const BELT_Y = 410
const BELT_HEIGHT = 180
const BELT_PAD_X = 20
const BUTTONS_Y = 755
const BTN_HEIGHT = 112
const ITEM_RADIUS = 52
const HUD_H = 90

const CAT_EMOJI = { organik: '🌱', anorganik: '♻️', b3: '☢️' }
const CAT_BTN_COLOR = { organik: 0x16a34a, anorganik: 0xd97706, b3: 0xdc2626 }
const CAT_TEXT_COLOR = { organik: '#16a34a', anorganik: '#d97706', b3: '#dc2626' }
const TIER_MESSAGES = ['', '⚡ Kecepatan naik!', '🔥 Kecepatan maksimal!']

export class GameScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.GAME)
  }

  create() {
    this.scoring = new Scoring()
    this.timer = new CountdownTimer(ROUND_SECONDS)
    this.beltLength = GAME_WIDTH - BELT_PAD_X * 2
    this.conveyor = new Conveyor({
      beltLengthPx: this.beltLength,
      baseSpeedPxPerSec: BASE_BELT_SPEED_PX_PER_SEC
    })
    this.itemSprites = new Map()
    this.seenItems = new Map()
    this.lastTierIndex = 0
    this.popupTimer = 0

    this._drawBackground()
    this.drawBelt()
    this.drawHUD()
    this.drawButtons()
    this._buildPopup()
    this.activeIndicator = this.add.graphics().setDepth(3)

    this.activeItemLabel = this.add.text(GAME_WIDTH / 2, 115, '', {
      fontSize: '18px', color: '#064e3b', fontStyle: 'bold', fontFamily: FONT
    }).setOrigin(0.5).setDepth(2)
  }

  _drawBackground() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xf0fdf4)
    // belt zone tinted strip
    this.add.rectangle(GAME_WIDTH / 2, BELT_Y, GAME_WIDTH, BELT_HEIGHT + 44, 0xdde8e4)
  }

  drawBelt() {
    // Shadow
    const shadowRect = this.add.graphics()
    shadowRect.fillStyle(0x000000, 0.14)
    shadowRect.fillRect(BELT_PAD_X - 2 + 5, BELT_Y - BELT_HEIGHT / 2 + 6, this.beltLength + 8, BELT_HEIGHT)

    // Belt body
    this.add.rectangle(GAME_WIDTH / 2, BELT_Y, this.beltLength + 8, BELT_HEIGHT, 0x1e293b)
      .setStrokeStyle(4, 0x0f172a)

    // Stripes
    for (let i = 0; i < 12; i++) {
      const x = BELT_PAD_X + (i + 0.5) * (this.beltLength / 12)
      this.add.rectangle(x, BELT_Y, 3, BELT_HEIGHT - 16, 0x334155).setAlpha(0.7)
    }

    // Direction arrows pointing right (▶) for left-to-right
    for (let i = 1; i <= 4; i++) {
      const ax = BELT_PAD_X + i * (this.beltLength / 5)
      this.add.text(ax, BELT_Y, '▶', { fontSize: '22px', color: '#475569' })
        .setOrigin(0.5).setAlpha(0.4)
    }

    // Rollers on belt ends (spokes rotate clockwise)
    const rR = BELT_HEIGHT / 2 + 6
    const leftRx = BELT_PAD_X - 5
    const rightRx = GAME_WIDTH - BELT_PAD_X + 5

    const createRoller = (rx, ry) => {
      const container = this.add.container(rx, ry).setDepth(2)

      // Outer rim
      const rim = this.add.circle(0, 0, rR, 0x0f172a).setStrokeStyle(4, 0x475569)

      // Spinner spokes/dots
      const spokes = this.add.graphics()
      spokes.fillStyle(0x334155)
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 3) {
        const dx = Math.cos(angle) * (rR - 22)
        const dy = Math.sin(angle) * (rR - 22)
        spokes.fillCircle(dx, dy, 7)
      }

      // Center axle
      const axle = this.add.circle(0, 0, 14, 0x1e293b).setStrokeStyle(3, 0x64748b)

      container.add([rim, spokes, axle])
      return container
    }

    const rollerL = createRoller(leftRx, BELT_Y)
    const rollerR = createRoller(rightRx, BELT_Y)

    // Spin rollers clockwise (left-to-right belt motion)
    this.tweens.add({
      targets: [rollerL, rollerR],
      angle: 360,
      duration: 3000,
      repeat: -1
    })
  }

  drawHUD() {
    // White panel
    const hudGfx = this.add.graphics()
    hudGfx.fillStyle(0xffffff, 0.98)
    hudGfx.fillRect(0, 0, GAME_WIDTH, HUD_H)
    hudGfx.lineStyle(2, 0xd1fae5)
    hudGfx.strokeRect(0, 0, GAME_WIDTH, HUD_H)

    // Timer progress bar (drawn each frame by timerBarGfx)
    this.add.rectangle(GAME_WIDTH / 2, HUD_H + 5, GAME_WIDTH, 10, 0xe5e7eb)
    this.timerBarGfx = this.add.graphics()

    // Waktu (left)
    this.add.text(24, 8, 'WAKTU', { fontSize: '11px', color: '#9ca3af', fontStyle: 'bold' })
    this.timeLabel = this.add.text(20, 25, '01:00', { fontSize: '40px', color: '#064e3b', fontStyle: 'bold' })

    // Skor (right)
    this.add.text(GAME_WIDTH - 24, 8, 'SKOR', { fontSize: '11px', color: '#9ca3af', fontStyle: 'bold' }).setOrigin(1, 0)
    this.scoreLabel = this.add.text(GAME_WIDTH - 20, 25, '0', { fontSize: '40px', color: '#1e40af', fontStyle: 'bold' }).setOrigin(1, 0)

    // Combo (center-left area)
    this.comboLabel = this.add.text(GAME_WIDTH / 2 - 40, HUD_H / 2, '', {
      fontSize: '16px', color: '#d97706', fontStyle: 'bold'
    }).setOrigin(0.5)

    // Lives (center-right area — 3 heart icons)
    this.lifeIcons = []
    for (let i = 0; i < START_LIVES; i++) {
      const icon = this.add.text(GAME_WIDTH / 2 + 80 + i * 24, HUD_H / 2, '❤️', {
        fontSize: '20px'
      }).setOrigin(0.5)
      this.lifeIcons.push(icon)
    }
  }

  drawButtons() {
    const pad = 12
    const btnWidth = (GAME_WIDTH - pad * 4) / 3
    const stripY = BUTTONS_Y - BTN_HEIGHT / 2 - 14

    const stripGfx = this.add.graphics()
    stripGfx.fillStyle(0xffffff, 0.97)
    stripGfx.fillRect(0, stripY, GAME_WIDTH, BTN_HEIGHT + 28)
    stripGfx.lineStyle(2, 0xe5e7eb)
    stripGfx.strokeRect(0, stripY, GAME_WIDTH, BTN_HEIGHT + 28)

    const BORDER_COLORS = { organik: 0x15803d, anorganik: 0xb45309, b3: 0xb91c1c }

    CATEGORY_IDS.forEach((cat, i) => {
      const x = pad + btnWidth / 2 + i * (btnWidth + pad)
      const y = BUTTONS_Y

      const btnContainer = this.add.container(x, y)

      // 3D shadow underneath
      const shadowGfx = this.add.graphics()
      shadowGfx.fillStyle(0x000000, 0.15)
      shadowGfx.fillRoundedRect(-btnWidth / 2 + 2, -BTN_HEIGHT / 2 + 5, btnWidth, BTN_HEIGHT, 24)

      // Surface button body
      const btnGfx = this.add.graphics()
      btnGfx.fillStyle(CAT_BTN_COLOR[cat])
      btnGfx.fillRoundedRect(-btnWidth / 2, -BTN_HEIGHT / 2, btnWidth, BTN_HEIGHT, 24)

      // Outline border
      btnGfx.lineStyle(3, BORDER_COLORS[cat])
      btnGfx.strokeRoundedRect(-btnWidth / 2, -BTN_HEIGHT / 2, btnWidth, BTN_HEIGHT, 24)

      // Bevel top gloss
      const shineGfx = this.add.graphics()
      shineGfx.fillStyle(0xffffff, 0.16)
      shineGfx.fillRoundedRect(-btnWidth / 2 + 4, -BTN_HEIGHT / 2 + 4, btnWidth - 8, BTN_HEIGHT / 2 - 4, { tl: 20, tr: 20, bl: 0, br: 0 })

      const emojiText = this.add.text(0, -18, CAT_EMOJI[cat], { fontSize: '34px' }).setOrigin(0.5)
      const labelText = this.add.text(0, 24, CATEGORY_LABEL[cat], {
        fontSize: '17px', color: '#ffffff', fontStyle: 'bold'
      }).setOrigin(0.5)

      btnContainer.add([shadowGfx, btnGfx, shineGfx, emojiText, labelText])

      const hit = this.add.rectangle(0, 0, btnWidth, BTN_HEIGHT, 0x000000, 0)
        .setInteractive({ useHandCursor: true })
      btnContainer.add(hit)

      // Dynamic Interactive Tweens
      hit.on('pointerover', () => {
        this.tweens.add({ targets: btnContainer, scaleX: 1.05, scaleY: 1.05, duration: 100 })
      })

      hit.on('pointerout', () => {
        this.tweens.add({ targets: btnContainer, scaleX: 1.0, scaleY: 1.0, duration: 100 })
      })

      hit.on('pointerdown', () => {
        this.tweens.add({
          targets: btnContainer,
          scaleX: 0.90, scaleY: 0.90,
          duration: 75
        })
      })

      hit.on('pointerup', () => {
        this.tweens.add({
          targets: btnContainer,
          scaleX: 1.05, scaleY: 1.05,
          duration: 75,
          onComplete: () => this.onCategoryTap(cat)
        })
      })
    })
  }

  _buildPopup() {
    this.popupBg = this.add.graphics().setVisible(false).setDepth(10)
    this.popupHeader = this.add.text(GAME_WIDTH / 2, 0, '', {
      fontSize: '16px', fontStyle: 'bold', color: '#ffffff', align: 'center'
    }).setOrigin(0.5).setVisible(false).setDepth(11)
    this.popupBody = this.add.text(GAME_WIDTH / 2, 0, '', {
      fontSize: '13px', color: '#e2e8f0', align: 'center',
      wordWrap: { width: GAME_WIDTH - 56 }
    }).setOrigin(0.5).setVisible(false).setDepth(11)
  }

  _showPopup(header, body, bgColorHex) {
    const padY = 8
    const pw = GAME_WIDTH - 32
    const px = 16
    const topY = BELT_Y - BELT_HEIGHT / 2 - 145

    this.popupHeader.setText(header).setPosition(GAME_WIDTH / 2, topY + 22).setVisible(true)
    this.popupBody.setText(body).setPosition(GAME_WIDTH / 2, topY + 56 + padY).setVisible(true)

    const ph = 22 + 16 + this.popupBody.height + padY * 2 + 16
    this.popupBg.clear()
    this.popupBg.fillStyle(bgColorHex, 0.96)
    this.popupBg.fillRoundedRect(px, topY, pw, ph, 12)
    this.popupBg.setVisible(true)

    this.popupTimer = 2.5
  }

  _hidePopup() {
    this.popupBg.setVisible(false)
    this.popupHeader.setVisible(false)
    this.popupBody.setVisible(false)
  }

  beltXForItemX(itemX) {
    return BELT_PAD_X + (this.beltLength - itemX)
  }

  spawnSprite(item) {
    const container = this.add.container(this.beltXForItemX(item.x), BELT_Y)
    const bg = this.add.circle(0, 0, ITEM_RADIUS, 0xffffff).setStrokeStyle(3, 0x94a3b8)
    const emoji = this.add.text(0, 0, item.data.emoji, { fontSize: '44px' }).setOrigin(0.5)
    container.add([bg, emoji])
    container.setDepth(4)
    this.itemSprites.set(item.uid, container)
  }

  destroySprite(uid) {
    const sprite = this.itemSprites.get(uid)
    if (sprite) {
      sprite.destroy()
      this.itemSprites.delete(uid)
    }
  }

  _burstEffect(x, y, color) {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const dot = this.add.circle(x, y, 6, color, 1).setDepth(5)
      this.tweens.add({
        targets: dot,
        x: x + Math.cos(angle) * 72,
        y: y + Math.sin(angle) * 72,
        alpha: 0, scaleX: 0.4, scaleY: 0.4,
        duration: 400, ease: 'Power2',
        onComplete: () => dot.destroy()
      })
    }
  }

  _flashTier(tierIndex) {
    const msg = TIER_MESSAGES[tierIndex]
    if (!msg) return
    const flash = this.add.text(GAME_WIDTH / 2, BELT_Y - 110, msg, {
      fontSize: '22px', color: '#fde047', fontStyle: 'bold',
      backgroundColor: '#1e293b',
      padding: { x: 14, y: 8 }
    }).setOrigin(0.5).setDepth(15)
    this.tweens.add({
      targets: flash, alpha: 0, y: BELT_Y - 170,
      duration: 1600, ease: 'Power2',
      onComplete: () => flash.destroy()
    })
  }

  _animateLifeLost(livesRemaining) {
    // Fade out the icon that was just lost (index = livesRemaining, 0-based)
    const icon = this.lifeIcons[livesRemaining]
    if (icon) {
      this.tweens.add({
        targets: icon,
        alpha: 0.15,
        scaleX: 0.5,
        scaleY: 0.5,
        duration: 300,
        ease: 'Power2'
      })
    }
  }

  onCategoryTap(category) {
    resumeAudio()
    const item = this.conveyor.topmost()
    if (!item) return

    const result = judge(item.data, category)
    const spriteX = this.beltXForItemX(item.x)
    this.conveyor.removeByUid(item.uid)
    this.destroySprite(item.uid)

    if (result.ok) {
      const r = this.scoring.correct()
      if (r.bonus) {
        playCombo()
        const comboFlash = this.add.text(GAME_WIDTH / 2, BELT_Y + 20, '🔥 COMBO!', {
          fontSize: '28px', color: '#fde047', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(12)
        this.tweens.add({
          targets: comboFlash, alpha: 0, y: BELT_Y - 40,
          scaleX: 1.4, scaleY: 1.4, duration: 700,
          onComplete: () => comboFlash.destroy()
        })
      } else {
        playCorrect()
      }

      this._burstEffect(spriteX, BELT_Y, 0x22c55e)

      if (result.subtype === 'residue') {
        this._showPopup(
          `✅ Benar — Anorganik  (Residu)`,
          `⚠️ ${item.data.name} adalah residu — tidak bisa didaur ulang.\n${item.data.funFact}`,
          0x713f12
        )
      } else {
        this._showPopup(
          `✅ Benar! +${r.delta}${r.bonus ? '  🔥 COMBO!' : ''}`,
          item.data.funFact,
          0x14532d
        )
      }
    } else {
      const r = this.scoring.wrong()
      playWrong()
      this.cameras.main.shake(280, 0.015)
      this._animateLifeLost(r.lives)

      const correctLabel = CATEGORY_LABEL[item.data.category]
      this._showPopup(
        `❌ Salah! (-1 nyawa)  →  ${correctLabel}`,
        `${item.data.name} termasuk ${correctLabel}.\n${item.data.funFact}`,
        0x7f1d1d
      )
    }
  }

  update(_time, deltaMs) {
    const deltaSec = deltaMs / 1000
    if (this.timer.isDone()) return

    this.timer.tick(deltaSec)
    const elapsed = ROUND_SECONDS - this.timer.remaining()

    const { missed, spawned } = this.conveyor.update(deltaSec, {
      speedMul: speedAt(elapsed) / BASE_BELT_SPEED_PX_PER_SEC,
      spawnEverySec: spawnIntervalAt(elapsed),
      pickItem: (rng) => randomItem(rng)
    })

    const tierNow = tierIndexAt(elapsed)
    if (tierNow !== this.lastTierIndex) {
      this._flashTier(tierNow)
      this.lastTierIndex = tierNow
    }

    for (const m of missed) {
      playMiss()
      this.scoring.miss()
      this.destroySprite(m.uid)
    }
    for (const s of spawned) {
      this.spawnSprite(s)
      this.seenItems.set(s.data.id, s.data)
    }

    for (const it of this.conveyor.items) {
      const sprite = this.itemSprites.get(it.uid)
      if (sprite) sprite.x = this.beltXForItemX(it.x)
    }

    // Highlight active (topmost) item + show name label
    const topItem = this.conveyor.topmost()
    this.activeIndicator.clear()
    if (topItem) {
      const topX = this.beltXForItemX(topItem.x)
      this.activeIndicator.lineStyle(3, 0xfbbf24, 0.85)
      this.activeIndicator.strokeCircle(topX, BELT_Y, ITEM_RADIUS + 10)
      this.activeItemLabel
        .setText(topItem.data.name)
        .setColor(CAT_TEXT_COLOR[topItem.data.category])
    } else {
      this.activeItemLabel.setText('')
    }

    if (this.popupTimer > 0) {
      this.popupTimer -= deltaSec
      if (this.popupTimer <= 0) this._hidePopup()
    }

    const remaining = this.timer.remaining()
    const mm = Math.floor(remaining / 60).toString().padStart(2, '0')
    const ss = Math.floor(remaining % 60).toString().padStart(2, '0')
    this.timeLabel.setText(`${mm}:${ss}`)

    // Timer bar
    const ratio = remaining / ROUND_SECONDS
    const barColor = remaining <= 10 ? 0xef4444 : remaining <= 30 ? 0xf59e0b : 0x16a34a
    this.timerBarGfx.clear()
    this.timerBarGfx.fillStyle(barColor)
    this.timerBarGfx.fillRect(0, HUD_H, GAME_WIDTH * ratio, 10)

    // Pulse timer text when low
    if (remaining <= 15) {
      const pulse = 0.6 + 0.4 * Math.sin(elapsed * 6)
      this.timeLabel.setAlpha(pulse)
      this.timeLabel.setColor(remaining <= 10 ? '#ef4444' : '#f59e0b')
    } else {
      this.timeLabel.setAlpha(1).setColor('#064e3b')
    }

    this.scoreLabel.setText(`${this.scoring.score}`)
    this.comboLabel.setText(this.scoring.combo >= 2 ? `🔥 x${this.scoring.combo}` : '')

    // Early game-over: lives depleted
    if (this.scoring.isOutOfLives()) {
      this.scene.start(SCENE_KEYS.GAME_OVER, {
        summary: this.scoring.summary(),
        seenItems: [...this.seenItems.values()],
        endReason: 'no-lives'
      })
      return
    }

    if (this.timer.isDone()) {
      this.scene.start(SCENE_KEYS.GAME_OVER, {
        summary: this.scoring.summary(),
        seenItems: [...this.seenItems.values()],
        endReason: 'time-up'
      })
    }
  }
}
