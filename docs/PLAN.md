# 🗑️ PilahYuk! — Plan

> Game edukasi pemilahan sampah untuk masyarakat Indonesia.
> Status implementasi saat ini ada di [`CURRENT-STATUS.md`](./CURRENT-STATUS.md).

---

## 🔒 Keputusan Final (Locked)

| # | Item | Lock |
|---|------|------|
| 1 | **Nama** | PilahYuk! |
| 2 | **Engine game** | Phaser 4.1.0 "Salusa" (ESM build, WebGL) |
| 3 | **Mekanik** | Conveyor belt (tap-based) |
| 4 | **Kategori** | 3 kategori (Organik / Anorganik / B3 rumah tangga) — copy publik wajib framing nasional |
| 5 | **Hosting** | VPS pribadi → `pilahyuk.aspriai.my.id` di balik Nginx Proxy multi-domain |
| 6 | **Mode game** | Timer-based 60 detik per ronde + **3 nyawa** (game over kalau salah satu habis) |
| 7 | **Repo** | GitHub public (open source, MIT License) |
| 8 | **Image registry** | Docker Hub public (`azmifauzan/pilahyuk:latest`) |
| 9 | **Deploy** | Manual: build lokal → push Docker Hub → pull di VPS → `docker compose up -d` |
| 10 | **Database (Phase 4+)** | PostgreSQL 16 (single instance di VPS yang sama) |
| 11 | **Backend (Phase 4+)** | Node.js 20 + Express + Prisma (stack JS konsisten dengan frontend) |

> Apapun di tabel ini hanya boleh diubah kalau user eksplisit setuju. Konstrain Nginx Proxy network + ESM/WebGL Phaser 4 + Docker Hub manual flow ditahan.

---

## 📍 Konteks Lokal (Riset Awal — Tetap Internal)

- Referensi internal: Perda Bandung Raya (3-jenis pemilahan). Copy publik **tetap nasional** — tidak menyebut "Bandung", "Bandung Raya", atau RT spesifik.
- Sampah organik prioritas dipisah di sumber (kompos / maggot BSF).
- B3 sering ke-skip warga → kategori penting di game.

---

## 🎮 Konsep Game (Stabil)

- Genre casual arcade, single-player, browser, mobile-first
- 60 detik per ronde, 3 tombol kategori, conveyor LTR
- **Nyawa: 3 per ronde.** Setiap salah pilih kategori = -1 nyawa. Nyawa habis sebelum waktu habis → game over lebih awal.
- Scoring (versi pasca Phase 3.5): benar **+10**, combo 5x **+25 bonus**, **salah 0 poin (hanya -1 nyawa)**, miss **-3 poin** (tidak mengurangi nyawa)
- **Label nama item aktif** ditampilkan di HUD bagian atas selama item topmost masih di belt → membantu pemain meski emoji tidak ikonik
- Difficulty 3 tier (0–20s / 20–40s / 40–60s) — kecepatan & spawn interval naik
- Bahasa: Bahasa Indonesia (single-language di MVP & Phase 4). **English version masuk roadmap Phase 5 (go international)** — lihat §"Phase 5".
- Item DB: 100 item (30 / 30 / 15 / 25). Detail lihat `src/data/wasteItems.js`.

> Aturan numerik di atas **akan menjadi default** Phase 4 yang dapat di-override oleh admin via UI — tetap ada constraint range agar tidak rusak balance (lihat §"Validation").

---

## 📋 Fase Development

### Phase 0 — Setup ✅
**Selesai.** Detail di [`CURRENT-STATUS.md`](./CURRENT-STATUS.md). Vite + Phaser 4 + Tailwind + Vitest + Docker + nginx + deploy compose + repo public MIT.

### Phase 1 — MVP Core ✅
**Selesai.** Conveyor + 3 tombol + scoring + timer + game over + 100 item.

### Phase 2 — Polish ✅
**Selesai.** Popup edukasi, difficulty tiers, combo + visual FX, highscore localStorage, tutorial 3 step, audio (Web Audio API procedural), responsive layout.

### Phase 3 — Branding & Distribusi ✅
**Selesai.** Animated menu, About scene, EducationDetail viewer (toggle "Game Ini" vs Semua 100 + filter + paginasi), share WA/TG/FB/Twitter, Docker image + nginx config + docker-compose untuk VPS.

> Hutang teknis & item belum-diverifikasi (DNS, push Docker Hub, validasi DLH/RT, fix tipo README "90 detik") tercatat di `CURRENT-STATUS.md`.

---

### Phase 3.5 — Lives + Item Naming 🚧 (NEXT — iterasi gameplay sebelum backend)

**Tujuan:** ubah model "pengurangan poin saat salah" jadi "pengurangan nyawa", supaya pemain merasakan stakes yang lebih jelas tanpa skor negatif. Plus, tampilkan **nama item yang sedang aktif** di HUD agar pemain yang bingung emoji tetap bisa menebak kategori.

**Tetap berlaku:**
- Round 60 detik tidak berubah.
- Pure logic separation (`src/game/` tanpa Phaser) tidak boleh regress.
- Test coverage gate 80% (`src/data|game|config`) tetap.

---

#### 3.5.1 Aturan Nyawa

| Aspek | Nilai default | Catatan |
|---|---|---|
| `START_LIVES` | **3** | Hardcoded di `gameConfig.js` Phase 3.5, jadi field admin di Phase 4 |
| Salah pilih kategori | `-1` nyawa, **0 poin** | Sebelum: `SCORE_WRONG = -5`. Sekarang: `SCORE_WRONG = 0` |
| Miss (item lewat tanpa di-tap) | `-3` poin, **0 nyawa** | Tetap. Tidak mengurangi nyawa supaya kecepatan tier 3 tidak instant-kill |
| Game over trigger | `lives <= 0` **OR** `timer.isDone()` | Yang lebih dulu |

**Alasan miss tidak mengurangi nyawa:** kecepatan tier 3 (+50%, spawn 1.2s) bisa menumpuk 2-3 item bersamaan; jika miss potong nyawa, run berakhir tidak adil di detik 40+ tanpa kesalahan judgment. Tetap perlu disinsentif lewat -3 poin agar pemain tidak abaikan belt.

---

#### 3.5.2 Perubahan Konfigurasi (`src/config/gameConfig.js`)

```js
// Tambah:
export const START_LIVES = 3

// Ubah:
export const SCORE_WRONG = 0          // dari -5, tidak lagi potong poin
// SCORE_MISS tetap -3
// SCORE_CORRECT, COMBO_THRESHOLD, COMBO_BONUS tetap
```

`gameConfig.test.js` perlu di-update agar mengeksekusi konstanta baru. Test `scoring.test.js` perlu diperbarui karena wrong tidak lagi -5.

---

#### 3.5.3 Perubahan `Scoring` (`src/game/scoring.js`)

Tambah state nyawa di dalam class yang sama (hindari modul kedua agar serialisasi summary tetap sederhana):

```js
import { ..., SCORE_WRONG, START_LIVES } from '../config/gameConfig.js'

export class Scoring {
  constructor() { this.reset() }

  reset() {
    // ...existing fields...
    this.lives = START_LIVES
  }

  wrong() {
    this.score += SCORE_WRONG          // sekarang 0, biarin pakai konstanta agar admin tunable
    this.combo = 0
    this.wrongCount += 1
    this.lives = Math.max(0, this.lives - 1)
    return { delta: SCORE_WRONG, combo: 0, bonus: 0, score: this.score, lives: this.lives }
  }

  isOutOfLives() { return this.lives <= 0 }

  summary() {
    // tambah lives + livesUsed ke return
    return {
      ...,
      lives: this.lives,
      livesUsed: START_LIVES - this.lives
    }
  }
}
```

Test baru di `scoring.test.js`:
- `lives` mulai dari 3.
- `wrong()` mengurangi `lives` per panggilan; `delta` = 0; `combo` reset.
- `lives` tidak boleh negatif (clamp di 0).
- `miss()` tidak menyentuh `lives`.
- `correct()` tidak menyentuh `lives` (tidak ada heal di Phase 3.5).
- `isOutOfLives()` true setelah 3 panggilan wrong.
- `summary().lives` + `summary().livesUsed` benar.
- `reset()` mengembalikan `lives` ke `START_LIVES`.

---

#### 3.5.4 Perubahan `GameScene`

1. **HUD nyawa** — render 3 ikon hati `❤️` (atau `🟢`) di pojok kanan-atas HUD, di sebelah label SKOR. Saat `lives` berkurang, fade ikon yang hilang + camera shake (re-use shake yang ada).
2. **Label nama item aktif** — text di bawah HUD strip, di atas belt, center, font bold 18px, warna sesuai kategori (`CATEGORY_COLOR[item.data.category]`). Update setiap frame di `update()` dari `this.conveyor.topmost()`. Kalau tidak ada item topmost → kosong.
3. **`onCategoryTap` cabang wrong** — sekarang panggil `this.scoring.wrong()`, ambil `r.lives` dari return, animasikan pengurangan hati (fade + scale-down ikon). Popup edukasi tetap muncul. **Tidak ada lagi tulisan "-5"** karena delta = 0.
4. **Early game-over** — di akhir `update()`, sebelum check timer:
   ```js
   if (this.scoring.isOutOfLives()) {
     this.scene.start(SCENE_KEYS.GAME_OVER, {
       summary: this.scoring.summary(),
       seenItems: [...this.seenItems.values()],
       endReason: 'no-lives'
     })
     return
   }
   ```
5. **Tetap kirim `endReason: 'time-up'`** saat timer habis (analytics Phase 4).

---

#### 3.5.5 Perubahan `GameOverScene`

- Header dinamis berdasar `endReason`:
  - `'no-lives'` → `'💔 Nyawa Habis!'` (warna merah).
  - `'time-up'` → tetap `'⏱ Waktu Habis!'`.
  - `isNewRecord` tetap override jadi `'🏆 Rekor Baru!'`.
- Tambah satu kartu stat baru: **"Nyawa Terpakai"** = `livesUsed` (di samping kartu yang sudah ada). Atau ganti kartu "Salah" labelnya jadi "Salah (Nyawa)" — pilih yang lebih jelas saat implement.
- Logic share text update: ganti referensi poin minus jadi netral. Contoh: `"Saya pilah ${correctCount} sampah dengan ${livesUsed}/3 nyawa terpakai di PilahYuk!"`.

---

#### 3.5.6 Perubahan `TutorialScene`

Step 2 sekarang menyebut nyawa, bukan -5:

```
✅ Benar +10  ❌ Salah: -1 nyawa  (kamu punya 3)
```

Step 3 tidak berubah (combo masih relevan). Pertimbangkan tambah step kecil tentang label nama item aktif di step 1 atau step baru 4.

---

#### 3.5.7 Audio

`playWrong()` tetap (sawtooth 200Hz). Tambah `playLifeLost()` opsional — atau cukup re-use playWrong supaya bundle tidak gemuk. Default: re-use.

---

#### 3.5.8 Migrasi Highscore

`HIGH_SCORE_KEY` tetap `pilahyuk:highscore` (integer poin tertinggi). Skema tidak berubah karena delta wrong hanya 0; skor lama masih valid sebagai poin tertinggi. **Tidak perlu reset localStorage user.**

---

#### 3.5.9 Checklist Eksekusi Phase 3.5

- [ ] `src/config/gameConfig.js`: `SCORE_WRONG = 0`, tambah `START_LIVES = 3`
- [ ] `src/game/scoring.js`: lives + isOutOfLives + summary update
- [ ] `tests/scoring.test.js`: refactor untuk nyawa
- [ ] `tests/gameConfig.test.js`: cover konstanta baru
- [ ] `src/scenes/GameScene.js`: HUD nyawa, label nama item aktif, early game over, animasi life lost
- [ ] `src/scenes/GameOverScene.js`: header dinamis `endReason`, stat livesUsed, share text update
- [ ] `src/scenes/TutorialScene.js`: copy step 2 update
- [ ] Smoke test browser: golden path + edge (3 wrong cepat → game over <60s)
- [ ] Update `README.md` (juga sekalian fix tipo "90 detik" → "60 detik")
- [ ] Update `CURRENT-STATUS.md` setelah merge

**Estimasi Phase 3.5: ~1–1.5 hari kerja.**

---

### Phase 4 — Backend & Admin Panel 🚧 (setelah Phase 3.5)

**Tujuan:**
1. Pindahkan konfigurasi game (durasi, jumlah tier, kecepatan tiap tier, threshold combo) dari hardcoded ke database, dapat diubah admin via UI.
2. CRUD penuh untuk database 100 item sampah (tambah / update / hapus / toggle aktif).
3. Tracking statistik pengunjung (anonim) dan statistik permainan (skor, item paling sering salah, dll).
4. Halaman admin terlindungi login.

**Tetap berlaku:**
- Stack frontend game tidak berubah (Phaser 4 + Vite).
- Game tetap playable kalau API down → fallback ke snapshot config + items terakhir (cache di localStorage).
- Tidak menyebut RT/kota spesifik di copy publik. Statistik admin internal boleh granular.

---

#### 4.1 Stack Tambahan

| Layer | Pilihan | Alasan |
|---|---|---|
| Database | **PostgreSQL 16** (alpine image) | sesuai instruksi user; cocok untuk transaksi + agregasi stats |
| ORM / migration | **Prisma 5** | type-safe, migration built-in, ringan untuk schema kecil |
| Backend runtime | **Node.js 20 LTS** | konsisten dengan frontend (JS ESM) |
| HTTP framework | **Express 4** | minimal, stable, ekosistem auth/middleware lengkap |
| Auth | **JWT bearer** (`jsonwebtoken`) + **bcrypt** untuk password admin | tidak butuh OAuth, single-tenant |
| Validasi input | **zod** | shared schema potensial antara frontend admin & backend |
| Rate limit | `express-rate-limit` | proteksi endpoint admin + endpoint visit POST |
| Logging | `pino` (JSON terstruktur) | mudah diparse |
| Admin UI | **Vanilla JS + Tailwind**, served di route `/admin` oleh Express (build terpisah `admin/dist`) | hindari nambah React deps, konsisten gaya vanilla |
| Charting | `chart.js` (UMD CDN-free, kecil) | dashboard stats |

> Tidak menambah React / Vue. Tidak ganti Express ke Fastify/Hono. Tidak ganti Postgres ke MySQL — kunci di tabel di atas.

---

#### 4.2 Arsitektur

```
                        ┌──────────────────────────────┐
                        │   Nginx Proxy (existing)     │
                        │   pilahyuk.aspriai.my.id     │
                        └──────────┬───────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
              ▼                    ▼                    ▼
       /                       /api/*                 /admin (static)
       (game frontend)         (Express API)          (admin UI)
       nginx:alpine            node:20-alpine         (served oleh API container)
              ▲                    │
              │ GET /api/config    │
              │ POST /api/visit    │
              │ POST /api/session  │
              └────────────────────┤
                                   ▼
                          ┌─────────────────┐
                          │ PostgreSQL 16   │
                          │ volume: pgdata  │
                          └─────────────────┘
```

- 3 service di `docker-compose.yml`: `web` (frontend nginx), `api` (Node), `db` (Postgres). Web & API ikut external network Nginx Proxy. DB hanya di internal network compose, **tidak expose port ke host**.
- `web` (frontend) reverse-proxy `/api/*` dan `/admin/*` ke `api` via nginx config tambahan, sehingga browser tetap same-origin (hindari CORS).
- Backup Postgres: cron `pg_dump` ke `/opt/pilahyuk/backups/` rotasi 7 hari (manual setup di VPS, didokumentasikan di `deploy/README.md`).

---

#### 4.3 Skema Database (Prisma)

```prisma
// File: backend/prisma/schema.prisma

model Admin {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  lastLoginAt  DateTime?
}

model GameSettings {
  id                 Int      @id @default(1)           // singleton row, app enforce id=1
  roundSeconds       Int      @default(60)
  baseBeltSpeedPx    Int      @default(90)
  comboThreshold     Int      @default(5)
  comboBonus         Int      @default(25)
  scoreCorrect       Int      @default(10)
  scoreWrong         Int      @default(0)               // Phase 3.5: tidak lagi -5, wrong potong nyawa bukan poin
  scoreMiss          Int      @default(-3)
  startLives         Int      @default(3)               // Phase 3.5: nyawa awal per ronde
  updatedAt          DateTime @updatedAt
  updatedBy          String?
}

model DifficultyTier {
  id            Int      @id @default(autoincrement())
  ordering      Int      @unique                        // 0,1,2,…
  untilSec      Int                                     // tier aktif sampai elapsed < untilSec
  speedMul      Float                                   // 1.0 = baseline
  spawnEverySec Float
  // gabungan WHERE ordering urut dipakai client; admin bisa add/remove tier (≥1 tier)
}

model WasteItem {
  id        String   @id                                // kebab-case slug ('kulit-pisang')
  name      String
  emoji     String
  category  WasteCategory
  subtype   WasteSubtype?
  funFact   String
  active    Boolean  @default(true)                     // hide dari spawn tanpa hard-delete
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum WasteCategory { ORGANIK ANORGANIK B3 }
enum WasteSubtype  { RECYCLABLE RESIDUE }

model Visit {
  id        BigInt   @id @default(autoincrement())
  sessionId String                                      // random UUID di-set di cookie/localStorage
  ipHash    String                                      // SHA256(ip + salt) — hindari simpan IP mentah
  ua        String
  referrer  String?
  path      String
  createdAt DateTime @default(now())
  @@index([createdAt])
  @@index([sessionId])
}

model GameSession {
  id            BigInt   @id @default(autoincrement())
  sessionId     String
  startedAt     DateTime
  endedAt       DateTime
  score         Int
  maxCombo      Int
  correctCount  Int
  wrongCount    Int
  missCount     Int
  accuracy      Float
  settingsSnap  Json                                    // copy aturan saat ronde dimulai (audit trail)
  @@index([endedAt])
}

model ItemEvent {
  // event-level untuk hitung item paling sering salah-sortir
  id          BigInt   @id @default(autoincrement())
  sessionId   String
  itemId      String                                    // ref WasteItem.id (loose, biar tahan hapus)
  outcome     ItemOutcome
  createdAt   DateTime @default(now())
  @@index([itemId, outcome])
  @@index([createdAt])
}

enum ItemOutcome { CORRECT WRONG MISS }

model AuditLog {
  id        BigInt   @id @default(autoincrement())
  adminId   String
  action    String                                      // "settings.update", "item.delete", …
  payload   Json
  createdAt DateTime @default(now())
}
```

**Catatan retensi:**
- `Visit` & `ItemEvent` jadi gemuk cepat. Rencana retensi awal: simpan raw 90 hari, lalu agregasi harian ke `daily_stats` (dibuat di iterasi berikutnya bila perlu — belum di scope Phase 4).

---

#### 4.4 Endpoint API

**Public (no auth):**

| Method | Path | Fungsi |
|---|---|---|
| GET | `/api/config` | Ambil `GameSettings` + `DifficultyTier[]` + `WasteItem[]` (hanya yang `active=true`). Cache-Control: `max-age=60`. Klien fallback ke snapshot localStorage kalau gagal. |
| POST | `/api/visit` | Catat 1 visit. Body: `{ sessionId, path, referrer }`. IP dihash di server. |
| POST | `/api/session/start` | Body: `{ sessionId }`. Response: `{ gameSessionId, settingsSnap }`. |
| POST | `/api/session/end` | Body: `{ gameSessionId, score, maxCombo, correctCount, wrongCount, missCount, accuracy, items: [{ itemId, outcome }] }`. Server insert `GameSession` + bulk insert `ItemEvent`. |

**Admin (JWT required, role admin):**

| Method | Path | Fungsi |
|---|---|---|
| POST | `/api/admin/login` | Body `{ email, password }` → set JWT cookie httpOnly + return profile. Rate limit 5/menit/IP. |
| POST | `/api/admin/logout` | Hapus cookie. |
| GET  | `/api/admin/me` | Verify session. |
| GET  | `/api/admin/settings` | Get `GameSettings` + tiers. |
| PUT  | `/api/admin/settings` | Update settings + tiers (transaction). Validasi range (lihat §4.6). |
| GET  | `/api/admin/items` | Query: `?category=&subtype=&active=&q=&page=&pageSize=`. |
| POST | `/api/admin/items` | Create. |
| PUT  | `/api/admin/items/:id` | Update. |
| DELETE | `/api/admin/items/:id` | Soft delete (set `active=false`). Param `?hard=true` untuk hard delete (catat di AuditLog). |
| GET  | `/api/admin/stats/overview` | KPI agregat (lihat §4.7). |
| GET  | `/api/admin/stats/visits` | Time-series visit harian. |
| GET  | `/api/admin/stats/sessions` | Time-series session + avg score harian. |
| GET  | `/api/admin/stats/items` | Item paling sering salah / paling sering muncul. |
| GET  | `/api/admin/audit` | List `AuditLog` paginasi. |

Setiap mutasi admin masuk `AuditLog` dengan `payload` berisi diff before/after.

---

#### 4.5 Admin UI (`/admin`)

Single-page vanilla JS, dibangun terpisah (`admin/` workspace di repo, Vite multi-entry atau folder Vite kedua). Output static di-serve oleh Express via `express.static('admin/dist')`.

**Halaman:**
1. **Login** — email + password, error handling, lockout setelah N gagal.
2. **Dashboard** — kartu KPI (visit hari ini, total session, avg score, item paling salah top-5), 2 line chart (visit 30 hari, session 30 hari), bar chart top 10 item salah.
3. **Pengaturan Game** — form:
   - Durasi ronde (slider 30–180 detik)
   - Skor benar / salah / miss (number, dengan validasi tanda)
   - Combo threshold (3–10) & bonus (10–100)
   - Base belt speed (60–200 px/s)
   - Tabel tier difficulty (add/remove row, drag reorder, fields `untilSec`, `speedMul`, `spawnEverySec`)
   - Preview teks aturan saat ini + tombol "Simpan & Aktifkan"
4. **Item Sampah** — tabel paginasi + filter kategori/subtype/aktif + search:
   - Kolom: emoji, name, category, subtype, active toggle, updatedAt
   - Modal create/edit: name, emoji (input + emoji picker sederhana), category, subtype (muncul kalau Anorganik), funFact (textarea wajib), active
   - Action: edit / soft-delete (toggle aktif) / hard-delete (konfirmasi 2 langkah)
   - Import/export JSON (untuk migrasi seeding awal dari `src/data/wasteItems.js`)
5. **Statistik** — detail per dimensi (tanggal range picker, drill down kategori, item, jam-jam padat).
6. **Audit Log** — read-only.
7. **Akun** — ganti password admin.

Mobile-friendly tapi prioritas desktop (admin biasanya di laptop).

---

#### 4.6 Validation & Constraint Aturan Game

Server (zod) menolak settings yang merusak balance:
- `roundSeconds` ∈ [30, 300]
- `baseBeltSpeedPx` ∈ [40, 240]
- `comboThreshold` ∈ [2, 20]
- `comboBonus` ∈ [0, 200]
- `scoreCorrect` > 0
- `scoreWrong` ≤ 0 (default 0; admin boleh set negatif lagi kalau mau classic mode)
- `scoreMiss` < 0
- `startLives` ∈ [1, 10]
- Tier:
  - minimal 1 tier
  - `untilSec` strictly increasing (sort by `ordering`)
  - `untilSec` terakhir == `roundSeconds`
  - `speedMul` ∈ [0.5, 3.0]
  - `spawnEverySec` ∈ [0.3, 5.0]
- WasteItem:
  - `id` kebab-case unik, regex `^[a-z0-9-]+$`
  - `subtype` hanya valid kalau `category=ANORGANIK`
  - `funFact` 20–280 char

Frontend admin menerapkan validasi yang sama untuk UX cepat (zod shared schema).

---

#### 4.7 Statistik

KPI dashboard:
- **Visit harian** (unique `sessionId` per hari) — line 30 hari.
- **Session selesai** per hari + avg/median score — line 30 hari.
- **Distribusi skor** — histogram bucket (0–50 / 50–100 / 100–200 / 200+).
- **Combo max** rata-rata.
- **Akurasi** rata-rata.
- **Top item paling sering salah** — ranking berdasarkan `wrong / total appearances` (min appearance 20 agar tidak bias).
- **Top item paling sering muncul** — frequency dari `ItemEvent`.
- **Jam padat** — heatmap `weekday × hour`.

Query berat (heatmap, ranking) di-cache 5 menit memori (LRU sederhana) untuk hemat round-trip ke Postgres.

---

#### 4.8 Integrasi ke Frontend Game

Perubahan di game (minimal, additive):

1. `BootScene` / `PreloadScene`: fetch `GET /api/config` (timeout 1.5s). Sukses → simpan ke `localStorage` (`pilahyuk:config-snapshot` + TTL 24 jam). Gagal → load snapshot terakhir; kalau tidak ada → fallback ke `gameConfig.js` + `wasteItems.js` (jadi "seed default").
2. `gameConfig.js` & `wasteItems.js` **tetap ada** sebagai seed/default — tidak dihapus. Tapi dibungkus jadi `getActiveConfig()` yang prioritas: API > snapshot > default.
3. Pada `GameScene.create`: panggil `POST /api/session/start`, simpan `gameSessionId` + `settingsSnap` di scene state. Gunakan `settingsSnap` (bukan modul global) supaya bila admin ubah settings mid-ronde, ronde berjalan tidak rusak.
4. Pada `update()` setiap kali sort terjadi (correct/wrong/miss): buffer event ke array lokal.
5. Pada timer habis → `POST /api/session/end` dengan summary + buffer events. Best-effort (kalau offline, drop — game tidak boleh stuck di game over).
6. Visit tracker: 1 `POST /api/visit` saat Menu load pertama per `sessionId` (cek localStorage flag `pilahyuk:visit-sent-<yyyymmdd>`).
7. Tidak ada PII dikirim. `sessionId` UUID generate di klien, disimpan localStorage.

---

#### 4.9 Deploy

`deploy/docker-compose.yml` direvisi:

```yaml
services:
  web:
    image: azmifauzan/pilahyuk-web:latest      # frontend (vite build) — sama dengan image existing, di-rebrand
    restart: unless-stopped
    networks: [pilahyuk, proxy]                # proxy = network external NPM/jwilder/Traefik
  api:
    image: azmifauzan/pilahyuk-api:latest      # Node 20 Express + Prisma
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql://pilahyuk:${DB_PASSWORD}@db:5432/pilahyuk
      JWT_SECRET: ${JWT_SECRET}
      ADMIN_SEED_EMAIL: ${ADMIN_SEED_EMAIL}
      ADMIN_SEED_PASSWORD: ${ADMIN_SEED_PASSWORD}
      IP_HASH_SALT: ${IP_HASH_SALT}
    depends_on: [db]
    networks: [pilahyuk]
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: pilahyuk
      POSTGRES_USER: pilahyuk
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks: [pilahyuk]
volumes:
  pgdata:
networks:
  pilahyuk: {}
  proxy:
    external: true
```

Migrasi data awal:
- Saat `api` start pertama: `prisma migrate deploy` + seed dari `src/data/wasteItems.js` (di-port ke `backend/prisma/seed.ts`) bila tabel kosong.
- Seed admin pertama dari env `ADMIN_SEED_EMAIL` + `ADMIN_SEED_PASSWORD` (di-hash bcrypt sebelum insert). Setelah pertama, env diabaikan.

Backup:
- Cron VPS `0 3 * * * docker exec pilahyuk-db pg_dump -U pilahyuk pilahyuk | gzip > /opt/pilahyuk/backups/$(date +\%F).sql.gz` + rotasi 7 hari.
- Dokumentasikan di `deploy/README.md`.

---

#### 4.10 Checklist Eksekusi Phase 4

**4A — Bootstrap backend (1 hari)**
- [ ] Buat workspace `backend/` (npm workspaces atau folder terpisah)
- [ ] Init Express + Prisma + zod + jsonwebtoken + bcrypt
- [ ] `prisma init`, tulis schema §4.3
- [ ] Setup ESLint + format konsisten dengan root
- [ ] Test infra: vitest + supertest

**4B — Auth + GameSettings (1–2 hari)**
- [ ] Migration awal + seed admin
- [ ] `POST /api/admin/login` + middleware auth + audit log
- [ ] `GET/PUT /api/admin/settings` + validation §4.6
- [ ] Test integrasi happy + sad path

**4C — WasteItem CRUD (1 hari)**
- [ ] Endpoint CRUD §4.4
- [ ] Seed dari `src/data/wasteItems.js` (port ke `seed.ts`)
- [ ] Import/export JSON
- [ ] Test integrasi

**4D — Stats ingest + query (1–2 hari)**
- [ ] `/api/visit`, `/api/session/start`, `/api/session/end`
- [ ] Rate limit visit endpoint
- [ ] Query agregat §4.7 + cache 5 menit
- [ ] Index DB sesuai schema

**4E — Frontend game integrasi (1 hari)**
- [ ] `getActiveConfig()` fetcher + snapshot localStorage
- [ ] Hooks ke MenuScene (visit), GameScene (session start/end + item events)
- [ ] Fallback offline (no-op silent)
- [ ] Update test agar pure-logic tidak tergantung modul global

**4F — Admin UI (2–3 hari)**
- [ ] Skeleton vanilla JS + Tailwind di `admin/`
- [ ] Halaman Login, Dashboard, Pengaturan Game, Item Sampah, Statistik, Audit, Akun
- [ ] Chart.js integrasi
- [ ] Build via Vite, di-serve oleh Express

**4G — Deploy (1 hari)**
- [ ] Dockerfile API
- [ ] docker-compose final §4.9
- [ ] Cron backup + dokumentasi `deploy/README.md`
- [ ] Smoke test di VPS staging (subdomain `*-staging` opsional)
- [ ] Cutover production

**Estimasi total Phase 4: ~8–12 hari kerja.**

---

### Phase 5 — Roadmap v2 (Future, belum dimulai)

- [ ] Leaderboard antar komunitas (memanfaatkan backend Phase 4)
- [ ] Mode 2 player di 1 device (split screen)
- [ ] Achievement badges
- [ ] PWA installable + offline mode penuh
- [ ] Tema mingguan (mis. "Minggu B3") via flag di GameSettings
- [ ] Asset SVG kustom menggantikan emoji
- [ ] **English version — Go International** (lihat §5.1 di bawah)

---

#### 5.1 English Version — Go International (Phase 5)

**Tujuan:** buka audiens global tanpa fork repo, dengan menambah Bahasa Inggris di samping Bahasa Indonesia. ID tetap default; EN opt-in via tombol di Menu (`🇮🇩 ID` / `🇬🇧 EN`).

**Cakupan terjemahan:**
- Semua copy UI: Menu, Tutorial (3 step), About (4 section), GameScene HUD + popup, GameOver, EducationDetail, Tombol kategori.
- 100 item: `name` + `funFact` versi EN. Kategori tetap pakai label internal (`organik`/`anorganik`/`b3`) tapi UI label di-translate (`Organic`/`Inorganic`/`Hazardous`).
- Meta tag HTML (`<meta name="description">`, `<title>`).
- README sub-section EN (atau `README.en.md` terpisah, link timbal balik di header).
- Share text untuk WA / Telegram / Facebook / Twitter pakai bahasa aktif.

**Pendekatan i18n:**
- File `src/i18n/id.json` + `src/i18n/en.json`, struktur key flat (`menu.play`, `gameOver.shareText`, …).
- Tambah modul `src/game/i18n.js` (pure):
  ```js
  let locale = 'id'
  let messages = { id: idJson, en: enJson }
  export function setLocale(l) { if (messages[l]) locale = l }
  export function getLocale() { return locale }
  export function t(key, vars = {}) { /* lookup + simple {var} interpolation */ }
  ```
- Persist pilihan di `localStorage` key `pilahyuk:locale`. Default fallback: browser `navigator.language` → `id` kalau bukan `en-*`.
- Scenes tidak hardcode string; semua via `t('…')`.

**Skema data item bilingual:**

```js
{ id: 'kulit-pisang',
  emoji: '🍌',
  category: 'organik',
  subtype: null,
  i18n: {
    id: { name: 'Kulit Pisang',  funFact: 'Kulit pisang cepat membusuk…' },
    en: { name: 'Banana Peel',   funFact: 'Banana peels decompose quickly…' }
  }
}
```

Migrasi:
- Tambah field `i18n` di `wasteItems.js` saat porting (atau via admin Phase 4 — lihat di bawah).
- Helper baru `getItemDisplay(item, locale)` di `sorter.js` agar scene tidak care soal bahasa.

**Integrasi dengan Phase 4 admin:**
- `WasteItem.name` & `WasteItem.funFact` jadi JSON `{ id: string, en: string }` (Prisma `Json` field) atau tabel anak `WasteItemTranslation (itemId, locale, name, funFact)` — pilih saat implement (tabel anak lebih ramah query agregat).
- Admin UI dapat tab toggle ID/EN saat edit item; validation `funFact` 20–280 char per locale.
- `GameSettings` tambah field `defaultLocale` (`'id' | 'en'`) — optional, default `'id'`.

**Konstrain copy (penting):**
- EN copy tetap **netral global**, bukan US-centric. Hindari "TPA" / "DLH" / "RT" — sebut "landfill" / "local environmental agency" / "neighborhood community".
- Tetap tidak menyebut kota / negara spesifik (hard rule berlaku lintas bahasa).
- Istilah teknis: B3 = "Household Hazardous Waste (HHW)", residue Anorganik = "Inorganic Residue".

**Checklist Eksekusi (1.5–2 minggu):**
- [ ] Tambah `src/i18n/{id,en}.json` + modul `i18n.js` + test
- [ ] Refactor semua scene strings ke `t(...)`
- [ ] Translate 100 item name + funFact ke EN (review native speaker bila memungkinkan)
- [ ] Tambah toggle bahasa di MenuScene (persist localStorage)
- [ ] Update meta tag HTML dinamis di Boot/Preload
- [ ] Update share text per locale
- [ ] Update README (atau `README.en.md`)
- [ ] (Bila Phase 4 sudah landed) migrasi schema `WasteItem` → bilingual + admin UI tab ID/EN
- [ ] Smoke test di browser dengan `navigator.language` di-set ke `en-US`

---

## 🚀 Strategi Sosialisasi

1. **Soft launch:** test ke keluarga, tetangga, komunitas terdekat.
2. **QR di papan informasi:** print QR code, tempel di mading / pos ronda.
3. **Grup WA komunitas:** share link + ajakan kompetisi.
4. **Event kumpul warga:** main bareng, hadiah top scorer.
5. **Sekolah lokal:** approach SD/SMP sebagai materi tambahan.
6. **Open source di GitHub:** komunitas lain bisa fork & adopt.

---

## 📊 Metrik Sukses

- Jumlah pemain unik per minggu (Phase 4: dashboard admin)
- Skor rata-rata (indikator pemahaman)
- **Item paling sering salah pilah** → bahan sosialisasi tambahan (Phase 4: ranking otomatis)
- Pre/post survey ke komunitas
- Korelasi dengan kualitas pemilahan di bank sampah / kompos lokal

---

## ✅ Next Actions

1. Mulai **Phase 4A — Bootstrap backend**.
2. Paralel: verifikasi DNS `pilahyuk.aspriai.my.id` aktif dan push pertama image ke Docker Hub (action item terbuka dari Phase 0/3).
3. Paralel: validasi list 100 item sampah ke DLH/RT setempat (action item terbuka sejak Phase 1).
4. Fix tipo `README.md` "selama 90 detik" → "60 detik".

---

*Updated 2026-05-22. Status: 🟢 Phase 0–3 done, Phase 4 ready to start.*
