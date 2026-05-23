# PilahYuk! — Current Status

> Snapshot status implementasi vs `docs/PLAN.md`. Update file ini setiap kali fase besar selesai.
> Tanggal snapshot: **2026-05-22**.

---

## Ringkasan

- **Fase selesai:** Phase 0 (Setup), Phase 1 (MVP Core), Phase 2 (Polish), Phase 3 (Branding & Distribusi), Phase 3.5 (Lives + Item Naming).
- **Fase berjalan:** —
- **Fase berikutnya:** Phase 4 — Backend & Admin Panel (lihat `docs/PLAN.md`).
- **Belum diverifikasi:** DNS `pilahyuk.aspriai.my.id` aktif, image `azmifauzan/pilahyuk:latest` benar-benar terpush ke Docker Hub, validasi list item ke DLH/RT.

---

## Stack Terpasang

| Kategori | Tools / Versi |
|---|---|
| Engine | `phaser@4.1.0` (ESM, WebGL) |
| Bundler | `vite@^5.4.14` |
| Bahasa | Vanilla JS (ESM, no TS) |
| UI di luar canvas | `tailwindcss@^3.4.17` + `postcss` + `autoprefixer` |
| Test | `vitest@^2.1.9` + `@vitest/coverage-v8` (threshold 80% lines/branches/funcs/stmt) |
| QR | `qrcode@^1.5.4` |
| Container | `Dockerfile` multi-stage (`node:20-alpine` build → `nginx:alpine` runtime) |
| Reverse proxy compose | `deploy/docker-compose.yml` (network external — nama proxy network masih placeholder `pilahyuk`, perlu disesuaikan di VPS) |

---

## Struktur Aktual

```
src/
  main.js                        ✅ Phaser Game init, scenes registered
  styles.css                     ✅ Tailwind entry
  config/gameConfig.js           ✅ Locked constants (ROUND_SECONDS=60, scoring, tiers, FONT, scene keys, dimensions)
  data/wasteItems.js             ✅ 100 item (30 organik + 30 anorganik recyclable + 15 residue + 25 B3)
  game/
    scoring.js                   ✅ Scoring class (correct/wrong/miss + combo + summary)
    difficulty.js                ✅ tierForElapsed / speedAt / spawnIntervalAt / tierIndexAt
    timer.js                     ✅ CountdownTimer pure
    conveyor.js                  ✅ Conveyor pure (spawn/missed/topmost/removeByUid)
    sorter.js                    ✅ judge + randomItem
    highscore.js                 ✅ localStorage load/save (HIGH_SCORE_KEY)
    audio.js                     ✅ Procedural Web Audio SFX (correct/wrong/combo/miss) — bukan asset file
  scenes/
    BootScene.js                 ✅ Boot → Preload
    PreloadScene.js              ✅ Loader text "Memuat…" → Menu
    MenuScene.js                 ✅ Animated title card, badge kategori, mini conveyor decor, highscore badge, 3 button (Main / Cara Main / Tentang)
    TutorialScene.js             ✅ 3 step (conveyor demo, button demo, combo demo)
    AboutScene.js                ✅ 4 section slide-in + back button
    GameScene.js                 ✅ HUD (timer+score+combo+3 nyawa), belt+roller, label nama item aktif, 3 tombol kategori, popup edukasi (correct/wrong/residue), early game-over (nyawa habis), burst effect, tier flash, camera shake, timer pulse, low-time color
    GameOverScene.js             ✅ Score card, header dinamis (Waktu Habis/Nyawa Habis/Rekor Baru), isNewRecord confetti, stats grid (incl. livesUsed), main lagi/menu, share WA/TG/FB/Twitter, link ke EducationDetail
    EducationDetailScene.js      ✅ Pustaka pemilahan (toggle "Game Ini" / "Semua 100" + tab kategori + paginasi 4/halaman)
public/                          ✅ (kosong, asset = emoji + procedural audio)
tests/
  scoring.test.js                ✅
  difficulty.test.js             ✅
  timer.test.js                  ✅
  conveyor.test.js               ✅
  sorter.test.js                 ✅
  highscore.test.js              ✅
  gameConfig.test.js             ✅
  wasteItems.test.js             ✅
deploy/
  docker-compose.yml             ✅ (network external — placeholder `pilahyuk`)
  README.md                      ✅ Panduan deploy + rollback
Dockerfile                       ✅ multi-stage + healthcheck
nginx.conf                       ✅ gzip + cache hashed assets + SPA fallback + no-cache index.html
index.html                       ✅ viewport mobile-first, SVG emoji favicon
vite.config.js / tailwind.config.js / postcss.config.js / vitest.config.js ✅
README.md / LICENSE (MIT) / docs/CONTRIBUTING.md ✅
```

---

## Aturan Game (status vs `gameConfig.js`)

| Aturan | Plan | Implementasi |
|---|---|---|
| Round length | 60s | `ROUND_SECONDS = 60` ✅ |
| Nyawa | 3 per ronde | `START_LIVES = 3` ✅ |
| Skor benar | +10 | `SCORE_CORRECT = 10` ✅ |
| Skor salah | 0 poin (-1 nyawa) | `SCORE_WRONG = 0` ✅ |
| Miss | -3 | `SCORE_MISS = -3` ✅ |
| Combo threshold | 5x | `COMBO_THRESHOLD = 5` ✅ |
| Combo bonus | +25 | `COMBO_BONUS = 25` ✅ |
| Base belt speed | — (turunan) | `BASE_BELT_SPEED_PX_PER_SEC = 90` ✅ |
| Tier 0–20s | normal, spawn 2s | `{untilSec:20, speedMul:1.0, spawnEverySec:2.0}` ✅ |
| Tier 20–40s | +25%, spawn 1.5s | `{untilSec:40, speedMul:1.25, spawnEverySec:1.5}` ✅ |
| Tier 40–60s | +50%, spawn 1.2s | `{untilSec:60, speedMul:1.5, spawnEverySec:1.2}` ✅ |

**Konsisten dengan plan locked.** Hardcoded — belum dapat diubah tanpa redeploy (target Phase 4).

---

## Item Sampah

| Kategori | Plan asli | Implementasi |
|---|---|---|
| Organik | 10 | **30** ✅ (diperluas dari plan, masih konsisten dengan rasio kategori) |
| Anorganik daur ulang | 7 | **30** ✅ |
| Anorganik residu (popup edukasi) | 5 | **15** ✅ |
| B3 rumah tangga | 8 | **25** ✅ |
| **Total** | **30** | **100** ✅ |

Tiap item punya `id`, `name`, `emoji`, `category`, `subtype`, `funFact`. Belum divalidasi ke DLH/RT (action item terbuka).

---

## Fitur Pemain

- ✅ Conveyor belt left-to-right, sampah keluar di kanan = miss
- ✅ Tap 3 tombol kategori → judge → +10/−nyawa + popup edukasi
- ✅ Subtype `residue` muncul popup khusus warna gold (Anorganik Residu) bahkan saat benar
- ✅ Combo bonus tiap 5 benar berturut
- ✅ Difficulty progression 3 tier dengan flash banner
- ✅ Highscore localStorage (`pilahyuk:highscore`)
- ✅ Tutorial 3 step (skippable)
- ✅ About scene
- ✅ Game over: stats grid, share WA/TG/FB/Twitter
- ✅ Education detail viewer (toggle "Game Ini" vs Semua 100, filter kategori, paginasi)
- ✅ Procedural SFX (no asset file)
- ✅ Confetti new record
- ✅ Camera shake saat salah
- ✅ Timer color/pulse saat ≤15s / ≤10s

---

## Distribusi

- ✅ `Dockerfile` multi-stage build siap
- ✅ `nginx.conf` static serve + gzip + cache control
- ✅ `deploy/docker-compose.yml` + `deploy/README.md` (rollback section)
- ✅ Repo public-ready: `README.md`, `LICENSE` (MIT), `docs/CONTRIBUTING.md`
- ⏳ DNS `pilahyuk.aspriai.my.id` → VPS — **belum diverifikasi dari sisi codebase**
- ⏳ Push perdana `azmifauzan/pilahyuk:latest` ke Docker Hub — **belum diverifikasi**
- ⏳ External network nama final di compose (`pilahyuk` masih placeholder) — **perlu disesuaikan saat deploy**

---

## Catatan Inkonsistensi / Hutang Teknis

1. ~~`README.md` baris 16 menyebut "selama 90 detik"~~ — **diperbaiki di Phase 3.5**.
2. `coverage/` dan `dist/` masih dicommit/tertinggal di working tree. Cek `.gitignore`.
3. `playwright-core` di devDependencies tapi belum ada test E2E (mungkin untuk Phase 4 atau peninggalan eksperimen).
4. i18n / Bahasa Inggris belum ada — single-language Bahasa Indonesia saat ini, English version masuk roadmap Phase 5 (go international).
5. Asset SVG final belum (masih emoji) — sesuai plan, tidak blocker.

---

## Apa yang Belum di Plan (Roadmap)

- **Phase 4 (baru, rencana saat ini):** Backend Node.js + Postgres + Admin Panel — lihat `docs/PLAN.md` §"Phase 4 — Backend & Admin Panel".
- **Phase 5 (eks-Phase 4 v2):** Leaderboard antar komunitas, mode 2 player, achievement, PWA, tema mingguan, **English version (go international — i18n framework + EN copy + EN item list + EN funFact)**.
