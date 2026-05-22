import Phaser from 'phaser'
import { SCENE_KEYS, GAME_WIDTH, GAME_HEIGHT, FONT } from '../config/gameConfig.js'
import { WASTE_ITEMS } from '../data/wasteItems.js'

const CAT_COLOR = { organik: 0x22c55e, anorganik: 0xeab308, b3: 0xef4444 }
const CAT_TEXT_COLOR = { organik: '#166534', anorganik: '#92400e', b3: '#991b1b' }

export class EducationDetailScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.EDUCATION)
  }

  init(data) {
    this.summary = data?.summary ?? {
      score: 0, maxCombo: 0, correctCount: 0,
      wrongCount: 0, missCount: 0, accuracy: 0
    }
    this.seenItems = data?.seenItems ?? []
    
    // Default to game session items if they exist, otherwise show all database
    this.scope = this.seenItems.length > 0 ? 'seen' : 'all_items'
    this.activeTab = 'all'
    this.currentPage = 0
    
    this.listObjects = []
    this.pageObjects = []
  }

  create() {
    const cx = GAME_WIDTH / 2

    // Background
    this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xf0fdf4)

    // Top strip
    const strip = this.add.graphics()
    strip.fillStyle(0x16a34a)
    strip.fillRect(0, 0, GAME_WIDTH, 6)

    // Header Title
    this.add.text(cx, 44, 'Pustaka Pemilahan 📚', {
      fontSize: '26px', color: '#064e3b', fontStyle: 'bold', fontFamily: FONT
    }).setOrigin(0.5)

    // Draw static dividers
    const divTop = this.add.graphics()
    divTop.lineStyle(1.5, 0xd1fae5)
    divTop.lineBetween(16, 74, GAME_WIDTH - 16, 74)

    // Scope Toggle & Category Filter Tabs
    this._drawControls()
    
    // Render the initial list
    this.updateList()

    // Draw proper 3D Back Button
    this._drawBackButton()
  }

  // Draw scope selectors ("Game Ini" vs "Semua 100") and Category pill tabs
  _drawControls() {
    const cx = GAME_WIDTH / 2
    
    // 1. Scope Selector Panel
    const toggleY = 104
    const tw = 175
    const th = 38
    
    this.scopeSeenBg = this.add.graphics().setDepth(2)
    this.scopeAllBg = this.add.graphics().setDepth(2)

    this.scopeSeenText = this.add.text(cx - 95, toggleY, 'Game Ini', {
      fontSize: '14px', fontStyle: 'bold', fontFamily: FONT
    }).setOrigin(0.5).setDepth(3)

    this.scopeAllText = this.add.text(cx + 95, toggleY, 'Semua 100', {
      fontSize: '14px', fontStyle: 'bold', fontFamily: FONT
    }).setOrigin(0.5).setDepth(3)

    const drawScopeGraphics = () => {
      this.scopeSeenBg.clear()
      this.scopeAllBg.clear()

      // Game Ini Selector
      if (this.scope === 'seen') {
        this.scopeSeenBg.fillStyle(0x16a34a)
        this.scopeSeenBg.fillRoundedRect(cx - 180, toggleY - th/2, tw, th, th/2)
        this.scopeSeenBg.lineStyle(1.5, 0x15803d)
        this.scopeSeenBg.strokeRoundedRect(cx - 180, toggleY - th/2, tw, th, th/2)
        this.scopeSeenText.setColor('#ffffff')
      } else {
        this.scopeSeenBg.fillStyle(0xffffff, 0.7)
        this.scopeSeenBg.fillRoundedRect(cx - 180, toggleY - th/2, tw, th, th/2)
        this.scopeSeenBg.lineStyle(1.5, 0xd1fae5)
        this.scopeSeenBg.strokeRoundedRect(cx - 180, toggleY - th/2, tw, th, th/2)
        this.scopeSeenText.setColor('#4b5563')
      }

      // Semua 100 Selector
      if (this.scope === 'all_items') {
        this.scopeAllBg.fillStyle(0x16a34a)
        this.scopeAllBg.fillRoundedRect(cx + 5, toggleY - th/2, tw, th, th/2)
        this.scopeAllBg.lineStyle(1.5, 0x15803d)
        this.scopeAllBg.strokeRoundedRect(cx + 5, toggleY - th/2, tw, th, th/2)
        this.scopeAllText.setColor('#ffffff')
      } else {
        this.scopeAllBg.fillStyle(0xffffff, 0.7)
        this.scopeAllBg.fillRoundedRect(cx + 5, toggleY - th/2, tw, th, th/2)
        this.scopeAllBg.lineStyle(1.5, 0xd1fae5)
        this.scopeAllBg.strokeRoundedRect(cx + 5, toggleY - th/2, tw, th, th/2)
        this.scopeAllText.setColor('#4b5563')
      }
    }

    drawScopeGraphics()

    // Interactive hits
    const hitSeen = this.add.rectangle(cx - 95, toggleY, tw, th, 0x000000, 0)
      .setInteractive({ useHandCursor: true }).setDepth(4)
    hitSeen.on('pointerdown', () => {
      if (this.seenItems.length === 0) {
        // Shaking effect or alert if no items seen
        this.cameras.main.shake(120, 0.005)
        return
      }
      this.tweens.add({ targets: this.scopeSeenText, scaleX: 0.9, scaleY: 0.9, duration: 75, yoyo: true })
      this.scope = 'seen'
      this.currentPage = 0
      drawScopeGraphics()
      this.updateList()
    })

    const hitAll = this.add.rectangle(cx + 95, toggleY, tw, th, 0x000000, 0)
      .setInteractive({ useHandCursor: true }).setDepth(4)
    hitAll.on('pointerdown', () => {
      this.tweens.add({ targets: this.scopeAllText, scaleX: 0.9, scaleY: 0.9, duration: 75, yoyo: true })
      this.scope = 'all_items'
      this.currentPage = 0
      drawScopeGraphics()
      this.updateList()
    })

    // 2. Horizontal Category Filter Badges with Custom Weights/Widths to prevent overlapping
    const tabsY = 162
    const tabs = [
      { id: 'all', label: 'Semua', color: 0x475569, activeColor: 0x1e293b, width: 82 },
      { id: 'organik', label: '🟢 Organik', color: 0x16a34a, activeColor: 0x15803d, width: 126 },
      { id: 'anorganik', label: '🟡 Anorganik', color: 0xd97706, activeColor: 0xb45309, width: 136 },
      { id: 'b3', label: '🔴 B3', color: 0xdc2626, activeColor: 0xb91c1c, width: 80 }
    ]

    this.tabGfxList = []
    this.tabTexts = []

    let currentX = 22 // Perfectly center align within the 480px screen (gaps total to 12px, cards to 424px)
    tabs.forEach((tab, i) => {
      const tabWidth = tab.width
      const tx = currentX + tabWidth / 2
      const tabBg = this.add.graphics().setDepth(2)
      
      const tabText = this.add.text(tx, tabsY, tab.label, {
        fontSize: '11px', fontStyle: 'bold', fontFamily: FONT
      }).setOrigin(0.5).setDepth(3)

      this.tabGfxList.push({ id: tab.id, gfx: tabBg, tab, tx, width: tabWidth })
      this.tabTexts.push({ id: tab.id, textObj: tabText })

      const hitTab = this.add.rectangle(tx, tabsY, tabWidth, 34, 0x000000, 0)
        .setInteractive({ useHandCursor: true }).setDepth(4)
        
      hitTab.on('pointerdown', () => {
        this.tweens.add({ targets: tabText, scaleX: 0.9, scaleY: 0.9, duration: 75, yoyo: true })
        this.activeTab = tab.id
        this.currentPage = 0
        drawTabGraphics()
        this.updateList()
      })

      currentX += tabWidth + 4
    })

    const drawTabGraphics = () => {
      this.tabGfxList.forEach(({ id, gfx, tab, tx, width }) => {
        gfx.clear()
        const textObj = this.tabTexts.find(t => t.id === id).textObj

        if (this.activeTab === id) {
          gfx.fillStyle(tab.activeColor)
          gfx.fillRoundedRect(tx - width / 2, tabsY - 17, width, 34, 17)
          textObj.setColor('#ffffff')
        } else {
          gfx.fillStyle(0xffffff, 0.85)
          gfx.fillRoundedRect(tx - width / 2, tabsY - 17, width, 34, 17)
          gfx.lineStyle(1.5, 0xd1fae5)
          gfx.strokeRoundedRect(tx - width / 2, tabsY - 17, width, 34, 17)
          textObj.setColor('#4b5563')
        }
      })
    }

    drawTabGraphics()
  }

  // Filters the list and forces a list redraw
  updateList() {
    // 1. Pick base list based on scope
    const baseItems = this.scope === 'seen' ? this.seenItems : WASTE_ITEMS

    // 2. Filter by Category
    if (this.activeTab === 'all') {
      this.filteredItems = [...baseItems]
    } else {
      this.filteredItems = baseItems.filter(item => item.category === this.activeTab)
    }

    // Sort alphabetically so it is very organized!
    this.filteredItems.sort((a, b) => a.name.localeCompare(b.name))

    this.renderPage()
  }

  // Renders 4 item cards for the current page & updates pagination buttons
  renderPage() {
    // Destroy previous card objects
    this.listObjects.forEach(obj => obj.destroy())
    this.listObjects = []

    const cx = GAME_WIDTH / 2
    const startCardY = 202
    const cardSpacing = 114
    const cardW = GAME_WIDTH - 32
    const cardH = 104

    const totalPages = Math.max(1, Math.ceil(this.filteredItems.length / 4))
    
    // Safety check if page is out of bounds
    if (this.currentPage >= totalPages) this.currentPage = totalPages - 1
    if (this.currentPage < 0) this.currentPage = 0

    const pageItems = this.filteredItems.slice(this.currentPage * 4, (this.currentPage + 1) * 4)

    if (pageItems.length === 0) {
      const emptyText = this.add.text(cx, startCardY + 120, 'Tidak ada item sampah\npada filter kategori ini.', {
        fontSize: '15px', color: '#6b7280', align: 'center', fontStyle: 'bold', fontFamily: FONT
      }).setOrigin(0.5)
      this.listObjects.push(emptyText)
    }

    pageItems.forEach((item, idx) => {
      const cy = startCardY + idx * cardSpacing
      const cardContainer = this.add.container(cx, cy)

      // Card Panel Graphic
      const cardGfx = this.add.graphics()
      cardGfx.fillStyle(0xffffff, 0.94)
      cardGfx.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 18)
      cardGfx.lineStyle(1.5, 0xd1fae5)
      cardGfx.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 18)

      // Emoji Badge (circle background + emoji text)
      const badgeBg = this.add.circle(-cardW / 2 + 50, 0, 36, CAT_COLOR[item.category], 0.15)
        .setStrokeStyle(2, CAT_COLOR[item.category], 0.4)
      const badgeEmoji = this.add.text(-cardW / 2 + 50, 0, item.emoji, { fontSize: '38px' }).setOrigin(0.5)

      // Item Name
      const nameText = this.add.text(-cardW / 2 + 104, -30, item.name, {
        fontSize: '16px', color: '#1f2937', fontStyle: 'bold', fontFamily: FONT
      })

      // Category label (adds (Residu) if inorganic residue)
      let catLabel = item.category === 'organik' ? 'Organik 🌱' : item.category === 'b3' ? 'B3 ☢️' : 'Anorganik ♻️'
      if (item.category === 'anorganik' && item.subtype === 'residue') {
        catLabel = 'Anorganik (Residu) ⚠️'
      }
      
      const badgeLabelText = this.add.text(-cardW / 2 + 104, -8, catLabel, {
        fontSize: '11px', color: CAT_TEXT_COLOR[item.category], fontStyle: 'bold', fontFamily: FONT
      })

      // Educational fun fact (Word-wrapped)
      const funFactText = this.add.text(-cardW / 2 + 104, 12, item.funFact, {
        fontSize: '11px', color: '#4b5563', lineSpacing: 3,
        wordWrap: { width: cardW - 132 },
        fontFamily: FONT
      })

      cardContainer.add([cardGfx, badgeBg, badgeEmoji, nameText, badgeLabelText, funFactText])
      
      // Card fade-in entrance
      cardContainer.setAlpha(0)
      this.tweens.add({
        targets: cardContainer,
        alpha: 1,
        duration: 350,
        delay: idx * 80
      })

      this.listObjects.push(cardContainer)
    })

    // Draw Pagination Controls at the bottom
    this._drawPaginationControls(totalPages)
  }

  // Draw previous/next buttons and page count indicators dynamically
  _drawPaginationControls(totalPages) {
    // Clear old page controls
    this.pageObjects.forEach(obj => obj.destroy())
    this.pageObjects = []

    const cx = GAME_WIDTH / 2
    const pagY = 668
    const btnW = 90
    const btnH = 34

    // 1. Previous Button
    const prevContainer = this.add.container(cx - 140, pagY)
    const prevGfx = this.add.graphics()
    const prevText = this.add.text(0, 0, '◀ Sblm', {
      fontSize: '13px', fontStyle: 'bold', fontFamily: FONT
    }).setOrigin(0.5)
    
    prevContainer.add([prevGfx, prevText])
    this.pageObjects.push(prevContainer)

    if (this.currentPage > 0) {
      prevGfx.fillStyle(0xf1f5f9)
      prevGfx.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 10)
      prevGfx.lineStyle(1.5, 0xd1d5db)
      prevGfx.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 10)
      prevText.setColor('#4b5563')

      const prevHit = this.add.rectangle(0, 0, btnW, btnH, 0x000000, 0)
        .setInteractive({ useHandCursor: true })
      prevContainer.add(prevHit)

      prevHit.on('pointerdown', () => {
        this.tweens.add({ targets: prevContainer, scaleX: 0.9, scaleY: 0.9, duration: 75, yoyo: true })
        this.currentPage--
        this.renderPage()
      })
    } else {
      // Disabled state
      prevGfx.fillStyle(0xe2e8f0, 0.4)
      prevGfx.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 10)
      prevGfx.lineStyle(1.5, 0xe2e8f0, 0.5)
      prevGfx.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 10)
      prevText.setColor('#9ca3af')
    }

    // 2. Halaman Indicator
    const pageText = this.add.text(cx, pagY, `Halaman ${this.currentPage + 1} dari ${totalPages}`, {
      fontSize: '14px', color: '#0f766e', fontStyle: 'bold', fontFamily: FONT
    }).setOrigin(0.5)
    this.pageObjects.push(pageText)

    // 3. Next Button
    const nextContainer = this.add.container(cx + 140, pagY)
    const nextGfx = this.add.graphics()
    const nextText = this.add.text(0, 0, 'Lanj ▶', {
      fontSize: '13px', fontStyle: 'bold', fontFamily: FONT
    }).setOrigin(0.5)

    nextContainer.add([nextGfx, nextText])
    this.pageObjects.push(nextContainer)

    if (this.currentPage < totalPages - 1) {
      nextGfx.fillStyle(0xf1f5f9)
      nextGfx.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 10)
      nextGfx.lineStyle(1.5, 0xd1d5db)
      nextGfx.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 10)
      nextText.setColor('#4b5563')

      const nextHit = this.add.rectangle(0, 0, btnW, btnH, 0x000000, 0)
        .setInteractive({ useHandCursor: true })
      nextContainer.add(nextHit)

      nextHit.on('pointerdown', () => {
        this.tweens.add({ targets: nextContainer, scaleX: 0.9, scaleY: 0.9, duration: 75, yoyo: true })
        this.currentPage++
        this.renderPage()
      })
    } else {
      // Disabled state
      nextGfx.fillStyle(0xe2e8f0, 0.4)
      nextGfx.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 10)
      nextGfx.lineStyle(1.5, 0xe2e8f0, 0.5)
      nextGfx.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 10)
      nextText.setColor('#9ca3af')
    }
  }

  // Draw premium 3D back button
  _drawBackButton() {
    const cx = GAME_WIDTH / 2
    
    // Bottom divider
    const divBottom = this.add.graphics()
    divBottom.lineStyle(1.5, 0xd1fae5)
    divBottom.lineBetween(16, 722, GAME_WIDTH - 16, 722)

    // Button specs
    const backBtnY = GAME_HEIGHT - 66
    const backBtnW = 270
    const backBtnH = 50

    const backContainer = this.add.container(cx, backBtnY)

    // 3D Shadow
    const shadow = this.add.graphics()
    shadow.fillStyle(0x000000, 0.12)
    shadow.fillRoundedRect(-backBtnW / 2 + 2, -backBtnH / 2 + 4, backBtnW, backBtnH, 25)

    // Surface
    const surface = this.add.graphics()
    surface.fillStyle(0xf1f5f9)
    surface.fillRoundedRect(-backBtnW / 2, -backBtnH / 2, backBtnW, backBtnH, 25)
    surface.lineStyle(2, 0xd1d5db)
    surface.strokeRoundedRect(-backBtnW / 2, -backBtnH / 2, backBtnW, backBtnH, 25)

    const labelText = this.add.text(0, 0, '← Kembali ke Hasil Game', {
      fontSize: '16px', color: '#374151', fontStyle: 'bold', fontFamily: FONT
    }).setOrigin(0.5)

    backContainer.add([shadow, surface, labelText])

    const hit = this.add.rectangle(0, 0, backBtnW, backBtnH, 0x000000, 0)
      .setInteractive({ useHandCursor: true })
    backContainer.add(hit)

    // Interactive Tweens
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
        onComplete: () => {
          // IMPORTANT: Return all round stats and encountered items back to the GameOverScene!
          this.scene.start(SCENE_KEYS.GAME_OVER, {
            summary: this.summary,
            seenItems: this.seenItems
          })
        }
      })
    })
  }
}
