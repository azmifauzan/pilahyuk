import Phaser from 'phaser'
import { SCENE_KEYS, GAME_WIDTH, GAME_HEIGHT, FONT } from '../config/gameConfig.js'
import { saveHighScore, loadHighScore } from '../game/highscore.js'

const GAME_URL = 'https://pilahyuk.aspriai.my.id'

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.GAME_OVER)
  }

  init(data) {
    this.summary = data?.summary ?? {
      score: 0, maxCombo: 0, correctCount: 0,
      wrongCount: 0, missCount: 0, accuracy: 0,
      lives: 0, livesUsed: 3
    }
    this.seenItems = data?.seenItems ?? []
    this.endReason = data?.endReason ?? 'time-up'
  }

  create() {
    const cx = GAME_WIDTH / 2
    const newHigh = saveHighScore(this.summary.score)
    const isNewRecord = this.summary.score > 0 && this.summary.score >= newHigh

    // Background
    this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xf0fdf4)

    // Confetti celebration if new highscore!
    if (isNewRecord) {
      this.time.addEvent({
        delay: 180,
        callback: () => {
          if (!this.sys.isActive()) return
          const colors = [0xf59e0b, 0xef4444, 0x10b981, 0x3b82f6, 0xec4899, 0xa855f7]
          for (let i = 0; i < 6; i++) {
            const color = Phaser.Utils.Array.GetRandom(colors)
            const px = Phaser.Math.Between(10, GAME_WIDTH - 10)
            const circle = this.add.circle(px, -20, Phaser.Math.Between(4, 8), color).setDepth(20)
            
            this.tweens.add({
              targets: circle,
              y: GAME_HEIGHT + 20,
              x: px + Phaser.Math.Between(-90, 90),
              angle: Phaser.Math.Between(180, 720),
              duration: Phaser.Math.Between(2200, 3600),
              ease: 'Quad.easeOut',
              onComplete: () => circle.destroy()
            })
          }
        },
        repeat: 12
      })
    }

    // Header
    let headerColor, headerText
    if (isNewRecord) {
      headerColor = '#d97706'
      headerText = '🏆 Rekor Baru!'
    } else if (this.endReason === 'no-lives') {
      headerColor = '#dc2626'
      headerText = '💔 Nyawa Habis!'
    } else {
      headerColor = '#064e3b'
      headerText = '⏱ Waktu Habis!'
    }
    this.add.text(cx, 54, headerText, {
      fontSize: '34px', color: headerColor, fontStyle: 'bold', fontFamily: FONT
    }).setOrigin(0.5)

    // Score Card Background
    const scoreCard = this.add.graphics()
    scoreCard.fillStyle(0xffffff, 0.85)
    scoreCard.fillRoundedRect(32, 100, GAME_WIDTH - 64, 150, 20)
    scoreCard.lineStyle(2, 0xd1fae5)
    scoreCard.strokeRoundedRect(32, 100, GAME_WIDTH - 64, 150, 20)

    // Score
    this.add.text(cx, 138, `${this.summary.score}`, {
      fontSize: '56px', color: '#d97706', fontStyle: 'bold', fontFamily: FONT
    }).setOrigin(0.5)
    this.add.text(cx, 185, 'poin', {
      fontSize: '15px', color: '#9ca3af', fontFamily: FONT
    }).setOrigin(0.5)

    // Record line
    if (isNewRecord) {
      const rec = this.add.text(cx, 222, '✨ Skor tertinggi baru!', {
        fontSize: '16px', color: '#16a34a', fontStyle: 'bold', fontFamily: FONT
      }).setOrigin(0.5)
      this.tweens.add({ targets: rec, scaleX: 1.06, scaleY: 1.06, duration: 500, yoyo: true, repeat: -1 })
    } else {
      const hs = loadHighScore()
      if (hs > 0) {
        this.add.text(cx, 222, `🏆 Rekor Terbaik: ${hs} poin`, {
          fontSize: '16px', color: '#b45309', fontStyle: 'bold', fontFamily: FONT
        }).setOrigin(0.5)
      }
    }

    this._drawDivider(262)
    this._drawStats(276)
    this._drawDivider(450)

    // Action buttons (Play again, main menu, share)
    this._buildButtons(cx, 484)

    // Education summary below buttons (clean, overflow-free)
    this._drawDivider(656)
    this._buildEducationSection(cx, 674)
  }

  _drawDivider(y) {
    const divGfx = this.add.graphics()
    divGfx.lineStyle(1.5, 0xd1fae5)
    divGfx.lineBetween(16, y, GAME_WIDTH - 16, y)
  }

  // Premium Grid-Based Card Stats Display
  _drawStats(startY) {
    const cx = GAME_WIDTH / 2
    const livesUsed = this.summary.livesUsed ?? this.summary.wrongCount
    const stats = [
      { label: 'Benar', value: this.summary.correctCount, color: 0x16a34a, emoji: '✅' },
      { label: 'Nyawa Terpakai', value: `${livesUsed}/3`, color: 0xdc2626, emoji: '💔' },
      { label: 'Lewat', value: this.summary.missCount, color: 0x6b7280, emoji: '💨' },
      { label: 'Combo Max', value: this.summary.maxCombo, color: 0xd97706, emoji: '🔥' },
      { label: 'Akurasi', value: `${Math.round(this.summary.accuracy * 100)}%`, color: 0x2563eb, emoji: '🎯' }
    ]

    stats.forEach((stat, i) => {
      const isLast = i === stats.length - 1
      const row = Math.floor(i / 2)
      const col = i % 2

      // Positions
      let cardX = isLast ? cx : (col === 0 ? cx - 105 : cx + 105)
      let cardY = startY + row * 66
      
      let cardW = isLast ? 350 : 190
      let cardH = 54

      // Draw a beautiful tile card with drop shadow
      const cardGfx = this.add.graphics()
      // Shadow
      cardGfx.fillStyle(0x000000, 0.04)
      cardGfx.fillRoundedRect(cardX - cardW / 2 + 1, cardY - cardH / 2 + 2, cardW, cardH, 12)
      
      // Card Body
      cardGfx.fillStyle(0xffffff, 0.95)
      cardGfx.fillRoundedRect(cardX - cardW / 2, cardY - cardH / 2, cardW, cardH, 12)
      cardGfx.lineStyle(2, stat.color, 0.25)
      cardGfx.strokeRoundedRect(cardX - cardW / 2, cardY - cardH / 2, cardW, cardH, 12)

      if (isLast) {
        // Full width accuracy card
        const emojiText = this.add.text(cardX - 130, cardY, stat.emoji, { fontSize: '24px' }).setOrigin(0.5)
        const labelText = this.add.text(cardX - 100, cardY, stat.label, {
          fontSize: '14px', color: '#4b5563', fontFamily: FONT, fontStyle: 'bold'
        }).setOrigin(0, 0.5)
        const valueText = this.add.text(cardX + 130, cardY, stat.value, {
          fontSize: '22px', color: stat.color, fontStyle: 'bold', fontFamily: FONT
        }).setOrigin(1, 0.5)
      } else {
        // Standard split card
        const emojiText = this.add.text(cardX - cardW / 2 + 24, cardY, stat.emoji, { fontSize: '20px' }).setOrigin(0.5)
        
        const labelText = this.add.text(cardX - cardW / 2 + 50, cardY - 8, stat.label, {
          fontSize: '11px', color: '#6b7280', fontFamily: FONT, fontStyle: 'bold'
        }).setOrigin(0, 0.5)
        
        const valueText = this.add.text(cardX - cardW / 2 + 50, cardY + 10, `${stat.value}`, {
          fontSize: '17px', color: '#111827', fontStyle: 'bold', fontFamily: FONT
        }).setOrigin(0, 0.5)
      }
    })
  }

  _buildButtons(cx, topY) {
    // MAIN LAGI (Green 3D Pill)
    this._makeButton(cx, topY, 280, 48, 0x16a34a, '#ffffff', 'MAIN LAGI', 18, () => {
      this.scene.start(SCENE_KEYS.GAME)
    })

    // Menu Utama (Grey 3D Pill)
    this._makeButton(cx, topY + 54, 200, 38, 0xf1f5f9, '#374151', 'Menu Utama', 15, () => {
      this.scene.start(SCENE_KEYS.MENU)
    }, 0xd1d5db)

    // Bagikan Skor Section (Title + 4 Social Buttons with increased spacing)
    this.add.text(cx, topY + 90, '📢 BAGIKAN SKOR', {
      fontSize: '11px', color: '#9ca3af', fontStyle: 'bold', fontFamily: FONT
    }).setOrigin(0.5)

    const shareY = topY + 132
    const btnGap = 80
    const livesUsed = this.summary.livesUsed ?? this.summary.wrongCount
    const text = `Saya pilah ${this.summary.correctCount} sampah dengan ${livesUsed}/3 nyawa terpakai di PilahYuk! 🗑️♻️\nAyo uji ketangkasan pilah sampahmu selama 60 detik di: ${GAME_URL}`

    const sharePlatforms = [
      {
        name: 'WhatsApp',
        color: 0x25D366,
        url: `https://wa.me/?text=${encodeURIComponent(text)}`
      },
      {
        name: 'Telegram',
        color: 0x0088cc,
        url: `https://t.me/share/url?url=${encodeURIComponent(GAME_URL)}&text=${encodeURIComponent(text)}`
      },
      {
        name: 'Facebook',
        color: 0x1877F2,
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(GAME_URL)}`
      },
      {
        name: 'Twitter',
        color: 0x111111,
        url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
      }
    ]

    sharePlatforms.forEach((p, idx) => {
      const px = cx - (btnGap * 1.5) + idx * btnGap
      this._makeCircleButton(px, shareY, 48, p.color, '#ffffff', p.name, 18, () => {
        window.open(p.url, '_blank')
      })
    })
  }

  // Circular 3D Social sharing button with dynamic custom vector icons instead of emojis
  _makeCircleButton(x, y, size, fillColor, textColor, platform, fontSize, onTap) {
    const btnContainer = this.add.container(x, y)

    // Shadow
    const shadowGfx = this.add.graphics()
    shadowGfx.fillStyle(0x000000, 0.12)
    shadowGfx.fillCircle(1.5, 3, size / 2)

    // Surface
    const btnGfx = this.add.graphics()
    btnGfx.fillStyle(fillColor)
    btnGfx.fillCircle(0, 0, size / 2)

    // Gloss Shine Highlight
    const shineGfx = this.add.graphics()
    shineGfx.fillStyle(0xffffff, 0.12)
    shineGfx.fillCircle(-2, -2, size / 2 - 4)

    // Draw standard-compliant custom vector logo graphics
    let iconElement
    if (platform === 'WhatsApp') {
      const iconGfx = this.add.graphics()
      // White speech bubble body
      iconGfx.fillStyle(0xffffff)
      iconGfx.fillCircle(0, -1, 10)
      iconGfx.beginPath()
      iconGfx.moveTo(-8, 4)
      iconGfx.lineTo(-10, 10)
      iconGfx.lineTo(-4, 7)
      iconGfx.closePath()
      iconGfx.fillPath()

      // Green telephone emoji receiver precisely positioned inside speech bubble
      const phoneText = this.add.text(0.5, -1, '📞', { fontSize: '11px' }).setOrigin(0.5)
      
      const iconContainer = this.add.container(0, 0)
      iconContainer.add([iconGfx, phoneText])
      iconElement = iconContainer
    } else if (platform === 'Telegram') {
      const iconGfx = this.add.graphics()
      
      // Left wing (pure white)
      iconGfx.fillStyle(0xffffff)
      iconGfx.beginPath()
      iconGfx.moveTo(8, -8)
      iconGfx.lineTo(-8, -1.5)
      iconGfx.lineTo(-1.5, 1.5)
      iconGfx.closePath()
      iconGfx.fillPath()

      // Right wing (shaded grey-white for premium 3D paper plane look)
      iconGfx.fillStyle(0xe2e8f0)
      iconGfx.beginPath()
      iconGfx.moveTo(8, -8)
      iconGfx.lineTo(-1.5, 1.5)
      iconGfx.lineTo(1.5, 7.5)
      iconGfx.closePath()
      iconGfx.fillPath()
      
      iconElement = iconGfx
    } else if (platform === 'Facebook') {
      // Bold white 'f' slightly shifted down-right to look identical to FB logo
      iconElement = this.add.text(3, 4, 'f', {
        fontSize: '28px',
        color: '#ffffff',
        fontStyle: 'bold',
        fontFamily: FONT
      }).setOrigin(0.5)
    } else if (platform === 'Twitter') {
      // Modern X logo
      const iconGfx = this.add.graphics()
      iconGfx.fillStyle(0xffffff)
      
      // Main thick diagonal bar
      iconGfx.beginPath()
      iconGfx.moveTo(-7, -7)
      iconGfx.lineTo(-4, -7)
      iconGfx.lineTo(7, 7)
      iconGfx.lineTo(4, 7)
      iconGfx.closePath()
      iconGfx.fillPath()

      // Thin crossing diagonal bar
      iconGfx.lineStyle(1.8, 0xffffff)
      iconGfx.lineBetween(6.5, -7, -6.5, 7)

      iconElement = iconGfx
    }

    btnContainer.add([shadowGfx, btnGfx, shineGfx])
    if (iconElement) {
      btnContainer.add(iconElement)
    }

    const hit = this.add.circle(0, 0, size / 2, 0x000000, 0)
      .setInteractive({ useHandCursor: true })
    btnContainer.add(hit)

    hit.on('pointerover', () => {
      this.tweens.add({ targets: btnContainer, scaleX: 1.1, scaleY: 1.1, duration: 100 })
    })

    hit.on('pointerout', () => {
      this.tweens.add({ targets: btnContainer, scaleX: 1.0, scaleY: 1.0, duration: 100 })
    })

    hit.on('pointerdown', () => {
      this.tweens.add({
        targets: btnContainer,
        scaleX: 0.9, scaleY: 0.9,
        duration: 75,
        yoyo: true,
        onComplete: onTap
      })
    })
  }

  _makeButton(x, y, w, h, fillColor, textColor, label, fontSize, onTap, borderColor = null) {
    const btnContainer = this.add.container(x, y)

    const shadowGfx = this.add.graphics()
    shadowGfx.fillStyle(0x000000, 0.12)
    shadowGfx.fillRoundedRect(-w / 2 + 2, -h / 2 + 4, w, h, h / 2)

    const btnGfx = this.add.graphics()
    btnGfx.fillStyle(fillColor)
    btnGfx.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    if (borderColor) {
      btnGfx.lineStyle(2, borderColor)
      btnGfx.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    }

    const shineGfx = this.add.graphics()
    shineGfx.fillStyle(0xffffff, fillColor === 0x16a34a ? 0.16 : 0.08)
    shineGfx.fillRoundedRect(-w / 2 + 3, -h / 2 + 3, w - 6, h / 2 - 3, { tl: h / 2 - 3, tr: h / 2 - 3, bl: 0, br: 0 })

    const labelText = this.add.text(0, 0, label, {
      fontSize: `${fontSize}px`, color: textColor, fontStyle: 'bold', fontFamily: FONT
    }).setOrigin(0.5)

    btnContainer.add([shadowGfx, btnGfx, shineGfx, labelText])

    const hit = this.add.rectangle(0, 0, w, h, 0x000000, 0)
      .setInteractive({ useHandCursor: true })
    btnContainer.add(hit)

    hit.on('pointerover', () => {
      this.tweens.add({ targets: btnContainer, scaleX: 1.05, scaleY: 1.05, duration: 100 })
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

  // Proper Education Summary Card with a beautiful dedicated detail page button
  _buildEducationSection(cx, topY) {
    this.add.text(cx, topY, '📚 Edukasi Sampah Ronde Ini', {
      fontSize: '16px', color: '#064e3b', fontStyle: 'bold', fontFamily: FONT
    }).setOrigin(0.5)

    const cardY = topY + 20
    const cardW = GAME_WIDTH - 32
    const cardH = 120

    // Card background
    const cardGfx = this.add.graphics()
    cardGfx.fillStyle(0xffffff, 0.9)
    cardGfx.fillRoundedRect(16, cardY, cardW, cardH, 16)
    cardGfx.lineStyle(1.5, 0xd1fae5)
    cardGfx.strokeRoundedRect(16, cardY, cardW, cardH, 16)

    const textStyle = { fontSize: '13px', color: '#374151', align: 'center', fontFamily: FONT, wordWrap: { width: cardW - 32 } }

    if (!this.seenItems || this.seenItems.length === 0) {
      this.add.text(cx, cardY + cardH / 2, 'Tidak ada item sampah yang terlihat pada ronde ini. Mainkan game untuk membuka edukasi!', textStyle).setOrigin(0.5)
      return
    }

    // High level summary
    this.add.text(cx, cardY + 26, `Kamu berhasil menemui ${this.seenItems.length} jenis sampah!\nMari pelajari fakta daur ulang & pembuangannya agar kelak lingkungan tetap asri.`, {
      ...textStyle,
      fontStyle: 'bold',
      color: '#047857'
    }).setOrigin(0.5)

    // Sleek 3D button to launch the library details page
    const libBtnY = cardY + 84
    const libBtnW = 260
    const libBtnH = 42

    const libContainer = this.add.container(cx, libBtnY)
    
    const libShadow = this.add.graphics()
    libShadow.fillStyle(0x000000, 0.1)
    libShadow.fillRoundedRect(-libBtnW / 2 + 2, -libBtnH / 2 + 4, libBtnW, libBtnH, libBtnH / 2)

    const libSurface = this.add.graphics()
    libSurface.fillStyle(0xfef3c7) // Amber/Gold tone
    libSurface.fillRoundedRect(-libBtnW / 2, -libBtnH / 2, libBtnW, libBtnH, libBtnH / 2)
    libSurface.lineStyle(2, 0xfbbf24)
    libSurface.strokeRoundedRect(-libBtnW / 2, -libBtnH / 2, libBtnW, libBtnH, libBtnH / 2)

    const libLabel = this.add.text(0, 0, `📖 Lihat Detail Edukasi (${this.seenItems.length})`, {
      fontSize: '14px', color: '#92400e', fontStyle: 'bold', fontFamily: FONT
    }).setOrigin(0.5)

    libContainer.add([libShadow, libSurface, libLabel])

    const libHit = this.add.rectangle(0, 0, libBtnW, libBtnH, 0x000000, 0)
      .setInteractive({ useHandCursor: true })
    libContainer.add(libHit)

    libHit.on('pointerover', () => {
      this.tweens.add({ targets: libContainer, scaleX: 1.05, scaleY: 1.05, duration: 100 })
    })

    libHit.on('pointerout', () => {
      this.tweens.add({ targets: libContainer, scaleX: 1.0, scaleY: 1.0, duration: 100 })
    })

    libHit.on('pointerdown', () => {
      this.tweens.add({
        targets: libContainer,
        scaleX: 0.94, scaleY: 0.94,
        duration: 75,
        yoyo: true,
        onComplete: () => {
          this.scene.start(SCENE_KEYS.EDUCATION, {
            summary: this.summary,
            seenItems: this.seenItems
          })
        }
      })
    })
  }
}
