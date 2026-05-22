import Phaser from 'phaser'
import { SCENE_KEYS, GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js'

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
    text: 'Tempel QR code di mading RT/RW. Skor tertinggi = Pendekar Pilah RT!'
  }
]

export class AboutScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.ABOUT)
  }

  create() {
    const cx = GAME_WIDTH / 2
    this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0f172a)

    this.add.text(cx, 50, 'Tentang PilahYuk!', {
      fontSize: '26px', color: '#22c55e', fontStyle: 'bold'
    }).setOrigin(0.5)

    this.add.rectangle(cx, 80, GAME_WIDTH - 32, 2, 0x334155)

    let y = 110
    for (const { label, text } of SECTIONS) {
      this.add.text(cx, y, label, {
        fontSize: '16px', color: '#fde047', fontStyle: 'bold'
      }).setOrigin(0.5)
      y += 28
      const t = this.add.text(cx, y, text, {
        fontSize: '14px', color: '#e2e8f0', align: 'center',
        lineSpacing: 4,
        wordWrap: { width: GAME_WIDTH - 48 }
      }).setOrigin(0.5)
      y += t.height + 22
    }

    this.add.rectangle(cx, GAME_HEIGHT - 80, GAME_WIDTH - 32, 2, 0x334155)

    const backBtn = this.add.rectangle(cx, GAME_HEIGHT - 50, 220, 52, 0x334155)
      .setStrokeStyle(3, 0x475569)
      .setInteractive({ useHandCursor: true })
    this.add.text(cx, GAME_HEIGHT - 50, '← Kembali ke Menu', {
      fontSize: '17px', color: '#ffffff'
    }).setOrigin(0.5)
    backBtn.on('pointerup', () => this.scene.start(SCENE_KEYS.MENU))
  }
}
