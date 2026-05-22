# 🗑️ PilahYuk!

> Game edukasi pemilahan sampah untuk masyarakat Indonesia. Bermain sambil belajar memilah organik, anorganik, dan B3 rumah tangga.

Open source, gratis, langsung jalan di browser HP/desktop tanpa install.

## Kenapa dibikin?

Banyak rumah tangga belum terbiasa memilah sampah dari sumber, padahal pemilahan adalah kunci agar sampah organik bisa diolah jadi kompos/maggot dan sampah B3 tidak ikut tercampur ke TPA. PilahYuk! dibuat sebagai alat sosialisasi ringan untuk RT/RW, sekolah, dan komunitas — siapa pun di Indonesia bisa pakai.

> Kategori 3-jenis (Organik / Anorganik / B3) mengikuti pendekatan yang sudah lazim dipakai pemda di Indonesia. Validasi item ke DLH/RT setempat tetap disarankan sebelum digunakan untuk program resmi.

## Cara main

- Sampah jalan di conveyor selama **90 detik**.
- Tap tombol kategori (🟢 Organik / 🟡 Anorganik / 🔴 B3) saat sampah masih di belt.
- Benar **+10** · Combo 5x **+25 bonus** · Salah **-5** · Lewat **-3**.
- Setiap kesalahan menampilkan popup edukasi.

## Stack

- [Phaser 4](https://phaser.io/) (ESM, WebGL)
- [Vite](https://vitejs.dev/) bundler
- [Tailwind CSS](https://tailwindcss.com/) untuk UI di luar canvas
- [Vitest](https://vitest.dev/) untuk unit test (coverage ≥ 80%)
- Docker multi-stage (`node:20-alpine` → `nginx:alpine`) untuk distribusi

## Jalanin lokal

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # output ke dist/
npm test           # unit test
npm run coverage   # report coverage (gagal kalau < 80%)
```

## Build Docker

```bash
docker build -t pilahyuk:dev .
docker run --rm -p 8080:80 pilahyuk:dev
# buka http://localhost:8080
```

Detail deploy ke VPS lihat [`deploy/README.md`](./deploy/README.md).

## Struktur

```
src/
  config/gameConfig.js     # konstanta aturan game (locked)
  data/wasteItems.js       # 30 item sampah + funFact
  game/                    # logika murni (testable tanpa Phaser)
    scoring.js
    difficulty.js
    timer.js
    conveyor.js
    sorter.js
    highscore.js
  scenes/                  # Phaser scenes
deploy/                    # docker-compose untuk VPS
tests/                     # unit test (vitest)
```

## Kontribusi

Lihat [CONTRIBUTING.md](./CONTRIBUTING.md). Issue & PR sangat dihargai — terutama validasi/penambahan item sampah dari pengalaman bank sampah / RT setempat di kota lain.

## Lisensi

[MIT](./LICENSE) © 2026 Fauzan Azmi
