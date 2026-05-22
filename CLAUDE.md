# CLAUDE.md

Guidance for Claude Code (claude.ai/code) in this repository. Generic equivalent for non-Claude agents lives in [`AGENTS.md`](./AGENTS.md) — keep both files in sync when editing.

## Project

**PilahYuk!** — browser-based waste-sorting education game for masyarakat Indonesia (Bahasa Indonesia). Conveyor-belt tap mechanic, 60-second rounds, 3 categories (Organik / Anorganik / B3). Regulation reference used internally is Perda Bandung Raya (3-jenis), but user-facing copy MUST stay nation-wide framing — never say "Bandung Raya", "Bandung", or any specific kota/RT in tags, descriptions, README, in-game text, or marketing copy. Open source (MIT), single-player, mobile-first.

`docs/PLAN.md` is the source of truth for product/design decisions — read it before changing scope, scoring rules, item lists, or category logic. All decisions in its "Keputusan Final (Locked)" table are locked unless the user says otherwise. Current implementation snapshot lives in [`docs/CURRENT-STATUS.md`](./docs/CURRENT-STATUS.md).

## Status

Phase 0–3 (Setup, MVP Core, Polish, Branding & Distribusi) **shipped**. Full MVP exists: 8 scenes, 100 waste items, scoring/combo/difficulty/timer modules, procedural Web Audio SFX, share buttons, education library, Docker + nginx + compose ready. Detail snapshot: [`docs/CURRENT-STATUS.md`](./docs/CURRENT-STATUS.md).

Phase 4 (Backend & Admin Panel — Node.js + Express + Prisma + PostgreSQL 16) is the **next planned phase**, not yet started. See `docs/PLAN.md` §"Phase 4 — Backend & Admin Panel".

Open verification items (NOT confirmed from codebase alone):
- DNS `pilahyuk.aspriai.my.id` actually live.
- Image `azmifauzan/pilahyuk:latest` actually pushed to Docker Hub.
- VPS Nginx Proxy network name (`deploy/docker-compose.yml` currently uses placeholder `pilahyuk`).
- DLH / RT validation of the 100-item list.

Known docs debt: `README.md` line 16 says "selama 90 detik" but `ROUND_SECONDS = 60`. Fix opportunistically.

## Stack (locked)

- **Phaser 4.1.0 "Salusa"** — ESM, WebGL renderer
- **Vite ^5** bundler (Phaser 4 is ESM-only)
- **Vanilla JS** (TypeScript migration deferred)
- **Tailwind CSS ^3** for non-canvas UI (menu, modal, share)
- **Vitest ^2** + `@vitest/coverage-v8`, **80% threshold** on `src/data/**`, `src/game/**`, `src/config/**` (scenes excluded)
- **qrcode** dep present but not yet wired into scenes
- **Docker** multi-stage (`node:20-alpine` build → `nginx:alpine` runtime) → Docker Hub `azmifauzan/pilahyuk:latest` → VPS `docker compose pull && up -d`
- **Domain:** `pilahyuk.aspriai.my.id` behind existing multi-domain Nginx Proxy on the VPS
- **Phase 4 additions (planned, locked):** PostgreSQL 16, Node.js 20 + Express 4, Prisma 5, JWT + bcrypt, zod, chart.js, vanilla JS + Tailwind admin UI under `/admin`

Do not swap any of the above without explicit user approval. The VPS Nginx Proxy network wiring, ESM/WebGL choice, and the Phase 4 backend stack constrain everything downstream.

## Actual Layout

```
src/
  main.js                  Phaser Game init + scene registration
  styles.css               Tailwind entry
  config/gameConfig.js     LOCKED constants (round, scoring, tiers, scene keys, dimensions)
  data/wasteItems.js       100 items (30 organik / 30 anorganik recyclable / 15 residue / 25 B3)
  game/                    PURE logic (no Phaser deps, all tested via vitest)
    scoring.js  difficulty.js  timer.js  conveyor.js  sorter.js  highscore.js  audio.js
  scenes/                  Phaser scenes
    BootScene.js  PreloadScene.js  MenuScene.js  TutorialScene.js
    AboutScene.js  GameScene.js  GameOverScene.js  EducationDetailScene.js
tests/                     vitest unit tests (one file per game/ module + config + data)
deploy/                    docker-compose.yml + README.md for VPS deploy
docs/                      PLAN.md (product/design source of truth) + CURRENT-STATUS.md + CONTRIBUTING.md
public/                    currently empty — assets are emoji + procedural audio
Dockerfile  nginx.conf  vite.config.js  tailwind.config.js  postcss.config.js  vitest.config.js
index.html
CLAUDE.md  AGENTS.md  README.md  LICENSE
```

When Phase 4 starts a new `backend/` (Node.js + Prisma) and likely `admin/` (vanilla JS + Tailwind) workspace will be added — see `docs/PLAN.md` §4.

## Commands

```bash
npm install                       # bootstrap (one-time)

# dev / build
npm run dev                       # vite dev server (default http://localhost:5173)
npm run build                     # production build → dist/
npm run preview                   # preview built bundle

# tests (vitest)
npm test                          # one-shot
npm run test:watch                # watch mode
npm run coverage                  # enforces 80% threshold across lines/branches/funcs/stmt

# docker (local)
docker build -t azmifauzan/pilahyuk:latest .
docker run --rm -p 8080:80 azmifauzan/pilahyuk:latest        # smoke test
docker push azmifauzan/pilahyuk:latest

# vps deploy / update
cd /opt/pilahyuk
docker compose pull && docker compose up -d
```

No E2E tests today. `playwright-core` is in devDependencies but unused — remove or wire up before relying on it.

## Game Rules (authoritative — must match `src/config/gameConfig.js`)

- Round length: **60 seconds** (`ROUND_SECONDS = 60`)
- **Lives: 3 per round** (`START_LIVES = 3`, Phase 3.5). Wrong sort → -1 life, **0 point penalty**. Game over when `lives ≤ 0` OR timer hits zero, whichever first.
- Scoring: correct **+10**, 5x combo bonus **+25**, wrong **0 points** (-1 life instead — Phase 3.5), miss **-3 points** (no life cost)
- Difficulty tiers: 0–20s normal (spawn 2.0s, speedMul 1.0), 20–40s +25% (spawn 1.5s, speedMul 1.25), 40–60s +50% (spawn 1.2s, speedMul 1.5)
- Base belt speed: 90 px/s (`BASE_BELT_SPEED_PX_PER_SEC = 90`)
- Item DB: 100 items (30 Organik, 30 Anorganik recyclable, 15 Anorganik residue, 25 B3). Lists in `src/data/wasteItems.js`. Draft pending DLH/RT validation — flag changes to the user, don't silently re-balance.
- Residue items (subtype `residue` under category `anorganik`) sort as Anorganik but must trigger an educational popup explaining they are residue. The popup is mandatory educational content, not optional polish.
- Wrong-sort popup is mandatory educational content too.
- **Active item name** must be displayed in the HUD area above the belt while a topmost item exists, so players who do not recognize an emoji can still read the name. Color follows the item's category color.

Phase 3.5 changes (lives + active-item-name HUD) are planned but not yet implemented — see `docs/PLAN.md` §"Phase 3.5". When Phase 3.5 ships, update `src/config/gameConfig.js` (`SCORE_WRONG = 0`, add `START_LIVES = 3`) and refresh this section.

After Phase 4 lands these numbers become **defaults** seeded into `GameSettings`, overridable by admin within the validation ranges defined in `docs/PLAN.md` §4.6. Until Phase 4 ships, treat them as hardcoded.

## Architecture Rules

- **Pure logic lives in `src/game/`** with no Phaser imports — that is why those modules are unit-tested. Scenes consume the pure modules. Do not regress this separation by pulling Phaser into `src/game/`.
- **Constants come from `src/config/gameConfig.js`.** Do not duplicate scoring/tier numbers in scenes.
- **`audio.js`** generates SFX via Web Audio API — there are no audio asset files yet, and that is intentional (keeps the build tiny). Do not add file-based audio without discussion.
- **Highscore** uses `localStorage` only (`pilahyuk:highscore`). Phase 4 adds session/visit tracking server-side but keeps localStorage as offline fallback.

## Notes for Future Sessions

- All user-facing strings: **Bahasa Indonesia** for MVP and Phase 4. **English is on the Phase 5 roadmap (go international, see `docs/PLAN.md` §5.1)** — do not add EN copy ad-hoc; it must land as part of the i18n refactor described there. No other locales.
- Placeholder assets are emoji — don't block on artwork.
- Repo is public on GitHub under MIT; avoid committing anything that assumes private context (no real IPs, no DLH internal docs, etc).
- `deploy/docker-compose.yml` must join the external network of the existing Nginx Proxy on the VPS — exact network name (nginx-proxy / NPM / Traefik) confirmed only at deploy time; ask before guessing.
- `coverage/` and `dist/` may be present in the working tree; both are build artifacts. Don't edit them by hand; check `.gitignore` if they show up in commits.
- When a change spans Phase 4 territory (backend, admin, Postgres), pause and re-read `docs/PLAN.md` §4 first — schema and endpoints are pre-decided there.
