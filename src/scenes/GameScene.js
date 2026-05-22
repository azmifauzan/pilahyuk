import Phaser from 'phaser'
import {
  SCENE_KEYS,
  GAME_WIDTH,
  GAME_HEIGHT,
  ROUND_SECONDS,
  BASE_BELT_SPEED_PX_PER_SEC,
  CATEGORY_IDS,
  CATEGORY_LABEL,
  CATEGORY_COLOR
} from '../config/gameConfig.js'
import { Scoring } from '../game/scoring.js'
import { Conveyor } from '../game/conveyor.js'
import { CountdownTimer } from '../game/timer.js'
import { speedAt, spawnIntervalAt, tierIndexAt } from '../game/difficulty.js'
import { randomItem, judge } from '../game/sorter.js'
import { resumeAudio, playCorrect, playWrong, playCombo, playMiss } from '../game/audio.js'

const BELT_Y = 360
const BELT_HEIGHT = 120
const BELT_PAD_X = 16
const BUTTONS_Y = 720
const ITEM_RADIUS = 38

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
    this.lastTierIndex = 0
    this.popupTimer = 0

    this.drawBelt()
    this.drawHUD()
    this.drawButtons()
    this._buildPopup()
  }

  drawBelt() {
    this.add.rectangle(
      GAME_WIDTH / 2, BELT_Y,
      this.beltLength + 8, BELT_HEIGHT,
      0x334155
    ).setStrokeStyle(4, 0x0f172a)

    // belt stripes
    for (let i = 0; i < 8; i++) {
      const x = BELT_PAD_X + (i + 0.5) * (this.beltLength / 8)
      this.add.rectangle(x, BELT_Y, 4, BELT_HEIGHT - 12, 0x1e293b, 0.4)
    }
  }

  drawHUD() {
    this.timeLabel = this.add.text(16, 16, '01:30', {
      fontSize: '28px', color: '#ffffff', fontStyle: 'bold'
    })
    this.scoreLabel = this.add.text(GAME_WIDTH - 16, 16, 'SKOR: 0', {
      fontSize: '24px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(1, 0)
    this.comboLabel = this.add.text(GAME_WIDTH / 2, 62, '', {
      fontSize: '20px', color: '#fde047', fontStyle: 'bold'
    }).setOrigin(0.5)
  }

  drawButtons() {
    const btnWidth = (GAME_WIDTH - 16 * 4) / 3
    CATEGORY_IDS.forEach((cat, i) => {
      const x = 16 + btnWidth / 2 + i * (btnWidth + 16)
      const rect = this.add.rectangle(x, BUTTONS_Y, btnWidth, 96, CATEGORY_COLOR[cat])
        .setStrokeStyle(4, 0x0f172a)
        .setInteractive({ useHandCursor: true })
      this.add.text(x, BUTTONS_Y, CATEGORY_LABEL[cat], {
        fontSize: '20px', color: '#ffffff', fontStyle: 'bold'
      }).setOrigin(0.5)
      rect.on('pointerdown', () => {
        this.tweens.add({ targets: rect, scaleX: 0.94, scaleY: 0.94, duration: 80, yoyo: true })
      })
      rect.on('pointerup', () => this.onCategoryTap(cat))
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
    const padX = 24
    const padY = 8
    const pw = GAME_WIDTH - 32
    const px = 16
    const topY = BELT_Y - BELT_HEIGHT / 2 - 130

    this.popupHeader.setText(header).setPosition(GAME_WIDTH / 2, topY + 22).setVisible(true)
    this.popupBody.setText(body).setPosition(GAME_WIDTH / 2, topY + 60 + padY).setVisible(true)

    const ph = 22 + 16 + this.popupBody.height + padY * 2 + 16
    this.popupBg.clear()
    this.popupBg.fillStyle(bgColorHex, 0.95)
    this.popupBg.fillRoundedRect(px, topY, pw, ph, 10)
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
    const bg = this.add.circle(0, 0, ITEM_RADIUS, 0xf8fafc).setStrokeStyle(3, 0x1e293b)
    const emoji = this.add.text(0, 0, item.data.emoji, { fontSize: '36px' }).setOrigin(0.5)
    container.add([bg, emoji])
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
        x: x + Math.cos(angle) * 65,
        y: y + Math.sin(angle) * 65,
        alpha: 0,
        scaleX: 0.4,
        scaleY: 0.4,
        duration: 400,
        ease: 'Power2',
        onComplete: () => dot.destroy()
      })
    }
  }

  _flashTier(tierIndex) {
    const msg = TIER_MESSAGES[tierIndex]
    if (!msg) return
    const flash = this.add.text(GAME_WIDTH / 2, BELT_Y - 80, msg, {
      fontSize: '22px', color: '#fde047', fontStyle: 'bold',
      backgroundColor: '#1e293b',
      padding: { x: 14, y: 8 }
    }).setOrigin(0.5).setDepth(15)
    this.tweens.add({
      targets: flash,
      alpha: 0,
      y: BELT_Y - 140,
      duration: 1600,
      ease: 'Power2',
      onComplete: () => flash.destroy()
    })
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

      const correctLabel = CATEGORY_LABEL[item.data.category]
      this._showPopup(
        `❌ Salah! ${r.delta}  →  ${correctLabel}`,
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

    // difficulty tier change notification
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
    for (const s of spawned) this.spawnSprite(s)

    for (const it of this.conveyor.items) {
      const sprite = this.itemSprites.get(it.uid)
      if (sprite) sprite.x = this.beltXForItemX(it.x)
    }

    if (this.popupTimer > 0) {
      this.popupTimer -= deltaSec
      if (this.popupTimer <= 0) this._hidePopup()
    }

    const remaining = this.timer.remaining()
    const mm = Math.floor(remaining / 60).toString().padStart(2, '0')
    const ss = Math.floor(remaining % 60).toString().padStart(2, '0')
    this.timeLabel.setText(`${mm}:${ss}`)

    // pulse timer red in last 15 seconds
    if (remaining <= 15) {
      const pulse = 0.6 + 0.4 * Math.sin(elapsed * 6)
      this.timeLabel.setAlpha(pulse)
      this.timeLabel.setColor(remaining <= 10 ? '#ef4444' : '#fde047')
    }

    this.scoreLabel.setText(`SKOR: ${this.scoring.score}`)
    this.comboLabel.setText(this.scoring.combo >= 2 ? `🔥 Combo x${this.scoring.combo}` : '')

    if (this.timer.isDone()) {
      this.scene.start(SCENE_KEYS.GAME_OVER, { summary: this.scoring.summary() })
    }
  }
}
