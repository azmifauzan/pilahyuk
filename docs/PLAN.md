# 🗑️ PilahYuk! — Plan Final

> Game edukasi pemilahan sampah untuk sosialisasi ke masyarakat umum.

---

## 🔒 Keputusan Final

| # | Item | Lock |
|---|------|------|
| 1 | **Nama** | PilahYuk! |
| 2 | **Engine** | Phaser 4.1.0 "Salusa" (ESM build, WebGL) |
| 3 | **Mekanik** | Conveyor belt (tap-based) |
| 4 | **Kategori** | 3 kategori sesuai Perda Bandung Raya |
| 5 | **Hosting** | VPS pribadi → `pilahyuk.aspriai.my.id` (di belakang Nginx Proxy multi-domain) |
| - | **Repo** | GitHub public (open source, MIT License) |
| - | **Image registry** | Docker Hub (public) |
| - | **Deploy** | Manual: build lokal → push Docker Hub → pull di VPS → docker-compose up |
| 6 | **Mode** | Timer-based (60 detik) |

---

## 📍 Konteks Lokal (Hasil Riset)

- Kabupaten Bandung **darurat sampah** (status April 2026): produksi 1.500–1.800 ton/hari, hanya ~500 ton terkelola efektif.
- Kuota TPA Sarimukti untuk Kab. Bandung: **40 rit/hari**, hanya menerima sampah residu.
- Perda Bandung Raya: fasilitas pemilahan wajib minimal **3 jenis** — Organik, Anorganik, B3 Rumah Tangga.
- Walikota Bandung mendorong praktis mulai dari 2 dulu (organik vs anorganik) — sampah organik tidak akan diangkut, harus habis di RW.

**Implikasi untuk game:** fokus utama edukasi adalah **memisahkan organik** (yang harus diolah di sumber via kompos/maggot) dari yang lain. B3 jadi kategori penting karena sering ke-skip warga.

---

## 🎮 Konsep Game

**Genre:** Casual arcade / sorting (single player, browser-based)  
**Durasi:** 60 detik per ronde  
**Platform:** Web (mobile-first responsive), no install needed  
**Bahasa:** Bahasa Indonesia (opsi Sunda di v2)

### Premise
TPA Sarimukti penuh, truk sampah dibatasi 40 rit. Sebagai warga RT, kamu harus pilah sampah secepat mungkin selama 60 detik. Skor tertinggi = Pendekar Pilah RT!

---

## ⚙️ Core Mechanics — Conveyor Belt

```
┌─────────────────────────────────────────┐
│  ⏱ 1:00        SKOR: 250                │
│                                         │
│                                         │
│   ┌────────────────────────────────┐    │
│ ◄─┤ 🍌  ←  🔋  ←  📰  ←  💊  ←  🍶 │    │  (conveyor)
│   └────────────────────────────────┘    │
│                                         │
│      [🟢 ORGANIK] [🟡 ANORGANIK] [🔴 B3]│
└─────────────────────────────────────────┘
```

1. Conveyor belt horizontal di tengah layar
2. Sampah spawn di kanan, bergerak ke kiri
3. 3 tombol kategori besar di bawah: 🟢 Organik / 🟡 Anorganik / 🔴 B3
4. Tap tombol saat sampah masih di belt
5. Sampah keluar layar tanpa di-tap = -3 skor

### Scoring
| Aksi | Skor | Feedback |
|------|------|----------|
| Pilah benar | +10 | ✨ Animasi + suara ceria |
| Pilah benar (combo 5x) | +25 bonus | 🔥 Visual combo |
| Pilah salah | -5 | Popup edukasi: "Baterai itu B3 karena mengandung logam berat..." |
| Lewat (miss) | -3 | Suara mendesah pelan |

### Difficulty Progression
- 0–20 detik: speed normal, spawn tiap 2 detik
- 20–40 detik: speed +25%, spawn tiap 1.5 detik
- 40–60 detik: speed +50%, spawn tiap 1.2 detik, item tricky lebih sering muncul

---

## 📦 30 Item Sampah (Konteks Indonesia)

### 🟢 Organik (10 item)
Kulit pisang · Ampas kopi · Sisa nasi · Daun kering · Kulit telur · Kulit jeruk · Sisa sayur · Tulang ayam · Ampas teh · Kulit bawang

### 🟡 Anorganik (12 item)
**Daur ulang (7):** Botol plastik · Kaleng minuman · Kardus · Koran bekas · Botol kaca · Kemasan tetrapak susu · Kantong plastik bersih

**Residu non-B3 (5)** — masuk anorganik, tapi popup edukasi jelasin "ini residu, gak bisa didaur ulang, kurangi konsumsinya":  
Popok bayi · Pembalut · Styrofoam kotor · Sachet kopi/mie · Masker bekas

### 🔴 B3 Rumah Tangga (8 item)
Baterai bekas · Lampu LED/neon bekas · Obat kadaluarsa · Kemasan pestisida · Oli bekas · Termometer raksa · Elektronik kecil · Jarum suntik

> 📋 **Action item:** validasi list ke DLH Kab. Bandung atau ketua RT setempat sebelum final.

---

## 🛠️ Tech Stack Final

### Frontend
- **Phaser 4.1.0 "Salusa"** — ESM build, WebGL renderer
- **Vite** sebagai bundler (cocok dengan ESM Phaser 4)
- **JavaScript** (TypeScript opsional, bisa migrasi later)
- **Tailwind CSS** untuk UI di luar canvas (menu, modal, share)
- **localStorage** untuk high score (no backend di MVP)

### Asset
- SVG illustrations (lightweight, scalable)
- Placeholder awal pakai emoji unicode (🍌 🔋 📰)
- Audio: Phaser audio system built-in, asset dari freesound.org

### Deployment
- **VPS pribadi** dengan **Nginx Proxy** existing (handle multi-domain & SSL)
- **Domain:** `pilahyuk.aspriai.my.id`
- **Image:** dibuild lokal, di-push ke Docker Hub public (mis. `azmifauzan/pilahyuk:latest`)
- **Server:** pull image, jalanin via `docker-compose`
- **License:** MIT (paling permissive, ramah komunitas)

### Deployment Flow (Manual)

```
┌──────────────┐        ┌─────────────┐        ┌────────────────┐
│  LOCAL DEV   │        │ DOCKER HUB  │        │      VPS       │
├──────────────┤        ├─────────────┤        ├────────────────┤
│ npm run build│        │             │        │ docker-compose │
│ docker build │  push  │  pilahyuk:  │  pull  │    pull        │
│      ↓       ├───────►│   latest    ├───────►│      ↓         │
│ docker push  │        │             │        │ docker-compose │
│              │        │             │        │   up -d        │
└──────────────┘        └─────────────┘        └───────┬────────┘
                                                       │
                                                       ▼
                                          ┌────────────────────────┐
                                          │  Nginx Proxy (existing)│
                                          │  pilahyuk.aspriai.my.id│
                                          └────────────────────────┘
```

**Commands cheatsheet:**
```bash
# Di lokal — build & push
docker build -t azmifauzan/pilahyuk:latest .
docker push azmifauzan/pilahyuk:latest

# Di VPS — first deploy
cd /opt/pilahyuk
docker compose pull
docker compose up -d

# Di VPS — update
docker compose pull && docker compose up -d
```

> **Note:** `docker-compose.yml` di VPS perlu disambungkan ke external network milik Nginx Proxy lu (entah `nginx-proxy`, NPM, atau Traefik). Detail config di Phase 0.

### Project Structure
```
pilahyuk/
├── src/
│   ├── scenes/
│   │   ├── BootScene.js
│   │   ├── PreloadScene.js
│   │   ├── MenuScene.js
│   │   ├── GameScene.js
│   │   └── GameOverScene.js
│   ├── data/
│   │   └── wasteItems.js     # 30 item + funFact
│   ├── config/
│   │   └── gameConfig.js
│   └── main.js
├── public/
│   └── assets/
│       ├── images/
│       └── audio/
├── deploy/                   # config untuk deploy di VPS
│   ├── docker-compose.yml    # docker-compose buat dijalanin di VPS
│   └── README.md             # cara deploy di VPS
├── index.html
├── vite.config.js
├── tailwind.config.js
├── Dockerfile                # multi-stage: vite build → nginx:alpine
├── nginx.conf                # config nginx di dalam container
├── .dockerignore
├── README.md                 # demo GIF, install, contribute
├── LICENSE                   # MIT
├── CONTRIBUTING.md           # panduan kontribusi
└── .gitignore
```

---

## 📋 Fase Development

### Phase 0 — Setup (1 hari)
- [ ] Init project: `npm create vite@latest pilahyuk -- --template vanilla`
- [ ] Install Phaser 4 + Tailwind: `npm i phaser@4 tailwindcss`
- [ ] Setup Vite config + Tailwind
- [ ] Skeleton scenes (Boot → Preload → Menu → Game → GameOver)
- [ ] Bikin `Dockerfile` multi-stage (node:20-alpine build → nginx:alpine serve)
- [ ] Bikin `nginx.conf` (static serve + gzip + cache control)
- [ ] Bikin `deploy/docker-compose.yml` (pull dari Docker Hub + connect ke external network Nginx Proxy)
- [ ] Test build lokal: `docker build -t pilahyuk:dev . && docker run -p 8080:80 pilahyuk:dev`
- [ ] Push pertama ke Docker Hub (manual): `docker login && docker push ...`
- [ ] Setup VPS: arahkan DNS `pilahyuk.aspriai.my.id` ke VPS, konfigurasi Nginx Proxy
- [ ] First deploy di VPS: `docker compose pull && docker compose up -d`
- [ ] Init Git repo + push ke GitHub public
- [ ] README.md, LICENSE (MIT), CONTRIBUTING.md, .gitignore

### Phase 1 — MVP Core (3–4 hari)
- [ ] Database 30 item sampah (JSON di `src/data/wasteItems.js`)
- [ ] Asset placeholder (emoji rendered to canvas, atau SVG simple)
- [ ] Conveyor belt mechanic (spawn, movement, despawn)
- [ ] 3 tombol kategori + tap handler
- [ ] Collision/proximity check (item di atas belt → tombol)
- [ ] Score system + timer 60 detik
- [ ] Game over screen + restart

### Phase 2 — Polish (2–3 hari)
- [ ] Popup edukasi: konten funFact per item
- [ ] Difficulty progression (3 tahap)
- [ ] Combo system + visual feedback (particle, screen shake)
- [ ] High score localStorage
- [ ] Splash screen + tutorial 3 step
- [ ] Audio: SFX benar/salah/combo, background music
- [ ] Responsive layout (test 360px – 1920px)

### Phase 3 — Branding & Distribusi (2 hari)
- [ ] Logo PilahYuk! (custom atau AI-generated)
- [ ] Asset SVG final (ganti placeholder)
- [ ] Halaman About + info program sampah RT/RW
- [ ] Share to WhatsApp button
- [ ] QR code generator (di halaman after-game)
- [ ] Deploy production ke subdomain
- [ ] Test di Android low-end, iPhone, desktop

### Phase 4 — v2 (Future)
- [ ] Backend Laravel + leaderboard antar RT
- [ ] Mode 2 player di 1 device (split screen)
- [ ] Achievement badges
- [ ] PWA (installable)
- [ ] Tema mingguan (mis. "Minggu B3")
- [ ] Versi Bahasa Sunda

---

## 🚀 Strategi Sosialisasi

1. **Soft launch:** test ke keluarga, tetangga, tim SEI
2. **QR di pos ronda:** print QR code, tempel di mading RT
3. **Grup WA RT/RW:** share link + ajakan kompetisi
4. **Event kumpul warga:** main bareng, hadiah buat top scorer
5. **Sekolah lokal:** approach SD/SMP sebagai materi tambahan
6. **Open source di GitHub:** sejalan dengan vibe Fabriku — RT/RW lain bisa fork & adopt

---

## 📊 Metrik Sukses

- Jumlah pemain unik per minggu
- Skor rata-rata (indikator pemahaman)
- **Item paling sering salah pilah** → bahan sosialisasi tambahan
- Pre/post survey ke warga RT
- Korelasi dengan kualitas pemilahan di bank sampah/kompos RT

---

## ✅ Next Actions

1. **Mulai Phase 0** — setup project Vite + Phaser 4 + skeleton
2. **Paralel:** setup VPS (DNS untuk `pilahyuk.aspriai.my.id`, nginx, SSL)
3. **Paralel:** validasi list 30 item sampah ke DLH/RT setempat
4. **Pertimbangkan:** beli/siapin domain logo & branding (bisa AI-generated dulu)

---

*Updated final. Status: 🟢 Ready to code. Open source @ GitHub.*
