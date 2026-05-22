# AGENTS.md

Guidance for any LLM coding agent (Cursor, Codex, Aider, Continue, Cline, Windsurf, Sourcegraph Cody, etc.) working in this repo. This file is the tool-agnostic counterpart of [`CLAUDE.md`](./CLAUDE.md) — same substance, no Claude-specific phrasing. **Keep both files in sync** when editing one.

## Quick orientation

- **Project:** PilahYuk! — browser waste-sorting education game (Bahasa Indonesia).
- **Source of truth for product/design:** [`docs/PLAN.md`](./docs/PLAN.md). Read this before touching scoring rules, durations, item lists, category logic, or scope.
- **Implementation snapshot (what already exists):** [`docs/CURRENT-STATUS.md`](./docs/CURRENT-STATUS.md).
- **License:** MIT, public repo. Do not commit anything assuming private context.

## What ships today

Phase 0–3 are done: Vite + Phaser 4.1.0 (ESM, WebGL) game with 8 scenes, 100 waste items, scoring/combo/difficulty/timer pure-logic modules, procedural Web Audio SFX, share buttons (WA / Telegram / Facebook / Twitter), education library viewer, Docker multi-stage image, nginx config, and a VPS docker-compose. Tests are in `tests/` via Vitest with a 80% coverage threshold on `src/data/**`, `src/game/**`, `src/config/**`.

Phase 4 (Backend + Admin Panel: Node.js + Express + Prisma + PostgreSQL 16) is planned, **not yet implemented**. See `docs/PLAN.md` §"Phase 4 — Backend & Admin Panel" for schema, endpoints, validation rules, and the execution checklist.

Unverified from codebase: DNS `pilahyuk.aspriai.my.id`, Docker Hub push of `azmifauzan/pilahyuk:latest`, VPS Nginx Proxy network name (compose placeholder is `pilahyuk`), DLH/RT validation of the item list. Known docs typo: `README.md` says "selama 90 detik" but `ROUND_SECONDS = 60`.

## Hard rules (do not break)

1. **Nation-wide framing in public copy.** Internally the 3-category split references Perda Bandung Raya, but README, in-game text, meta tags, marketing copy, commit messages on user-facing files, etc. **must not** say "Bandung", "Bandung Raya", or name any specific kota / RT / RW.
2. **Locked decisions table** in `docs/PLAN.md` §"Keputusan Final (Locked)" is the contract. Do not swap engine, bundler, deploy target, DB engine, or backend stack without explicit user approval.
3. **Game numerical rules** must match `src/config/gameConfig.js` (round seconds, scoring, combo, tier table). Phase 4 will move these into Postgres `GameSettings`; until then, treat them as hardcoded and do not silently re-tune.
4. **Pure logic stays pure.** Modules under `src/game/` must not import `phaser`. Scenes under `src/scenes/` consume the pure modules. The unit tests rely on this separation.
5. **Constants come from `src/config/gameConfig.js`.** Do not duplicate scoring or tier numbers in scenes.
6. **Audio is procedural** (Web Audio API in `src/game/audio.js`). No file-based audio assets without discussion — keeps the bundle tiny.
7. **All user-facing strings: Bahasa Indonesia** for MVP and Phase 4. **English is on the Phase 5 roadmap (go international, see `docs/PLAN.md` §5.1)** — do not introduce EN copy piecemeal; it lands as part of the i18n refactor described there. No other locales.
8. **Items list draft.** `src/data/wasteItems.js` is pending DLH/RT validation. Flag user-requested changes; do not silently rebalance categories.
9. **Residue items** (subtype `residue` under category `anorganik`) sort as Anorganik but require an educational popup explaining the residue context. This is mandatory educational content.

## Stack (locked)

| Layer | Choice |
|---|---|
| Game engine | Phaser 4.1.0 "Salusa" (ESM, WebGL) |
| Bundler | Vite ^5 |
| Language | Vanilla JS (ESM, no TS) |
| Non-canvas UI | Tailwind CSS ^3 |
| Tests | Vitest ^2 + `@vitest/coverage-v8` (≥80% on `src/data/**`, `src/game/**`, `src/config/**`) |
| High score | `localStorage` (`pilahyuk:highscore`) |
| Container | Multi-stage: `node:20-alpine` build → `nginx:alpine` runtime |
| Registry | Docker Hub `azmifauzan/pilahyuk:latest` |
| Hosting | VPS behind existing multi-domain Nginx Proxy → `pilahyuk.aspriai.my.id` |
| **Phase 4 (planned)** | PostgreSQL 16, Node.js 20 + Express 4, Prisma 5, JWT + bcrypt, zod, chart.js, vanilla JS + Tailwind admin UI under `/admin` |

## Layout

```
src/
  main.js                  Phaser Game init + scene registration
  styles.css               Tailwind entry
  config/gameConfig.js     LOCKED constants
  data/wasteItems.js       100 items (30 organik / 30 anorganik recyclable / 15 residue / 25 B3)
  game/                    PURE logic, no Phaser deps, fully unit-tested
    scoring.js  difficulty.js  timer.js  conveyor.js  sorter.js  highscore.js  audio.js
  scenes/                  Phaser scenes
    BootScene  PreloadScene  MenuScene  TutorialScene
    AboutScene  GameScene   GameOverScene  EducationDetailScene
tests/                     Vitest unit tests (one per game/ module + config + data)
deploy/                    docker-compose.yml + README.md (VPS deploy + rollback)
docs/                      PLAN.md (product/design SOT) + CURRENT-STATUS.md + CONTRIBUTING.md
public/                    empty today — assets are emoji + procedural audio
Dockerfile  nginx.conf  vite.config.js  tailwind.config.js  postcss.config.js  vitest.config.js
index.html
CLAUDE.md  AGENTS.md  README.md  LICENSE
```

Phase 4 will add a `backend/` (Node.js + Prisma) workspace and likely an `admin/` (vanilla JS + Tailwind) workspace — both pre-specified in `docs/PLAN.md` §4.

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
npm run coverage                  # enforces 80% threshold (lines/branches/funcs/stmt)

# docker (local build + push)
docker build -t azmifauzan/pilahyuk:latest .
docker run --rm -p 8080:80 azmifauzan/pilahyuk:latest        # smoke test on :8080
docker push azmifauzan/pilahyuk:latest

# vps deploy / update
cd /opt/pilahyuk
docker compose pull && docker compose up -d
```

There are no E2E tests today. `playwright-core` is in devDependencies but unused — wire it up or remove before relying on it.

## Game rules cheat-sheet (must match `src/config/gameConfig.js`)

- Round length: **60 s** (`ROUND_SECONDS = 60`)
- **Lives: 3 per round** (`START_LIVES = 3`, Phase 3.5). Wrong sort → -1 life, **0 point penalty**. Game over when lives reach 0 OR timer hits zero, whichever first.
- Scoring: correct **+10**, 5x combo bonus **+25**, wrong **0 points** (life-only penalty, Phase 3.5), miss **-3 points** (no life cost)
- Difficulty tiers:
  - 0–20 s: `speedMul 1.0`, `spawnEverySec 2.0`
  - 20–40 s: `speedMul 1.25`, `spawnEverySec 1.5`
  - 40–60 s: `speedMul 1.5`, `spawnEverySec 1.2`
- Base belt speed: **90 px/s** (`BASE_BELT_SPEED_PX_PER_SEC = 90`)
- Item DB: 100 items (30 Organik, 30 Anorganik recyclable, 15 Anorganik residue, 25 B3)
- Wrong-sort popup + residue-sort popup are mandatory educational content.
- **Active item name** must be displayed in the HUD area above the belt while a topmost item exists — players need a readable fallback when an emoji is ambiguous.

Phase 3.5 (lives + active-item-name HUD) is planned, **not yet implemented**. When it ships, refresh this cheat-sheet to drop the "Phase 3.5" markers.

After Phase 4 these become defaults seeded into the `GameSettings` table, overridable by admin within the validation ranges defined in `docs/PLAN.md` §4.6.

## Workflow expectations for agents

- **Read first, edit second.** Open `docs/PLAN.md` and `docs/CURRENT-STATUS.md` before substantive changes. Open `src/config/gameConfig.js` before touching anything numeric.
- **Prefer edits over rewrites.** Files in this repo are small; surgical patches are easier to review.
- **Do not create new docs** (`*.md`) unless the user asks. If you must add one (e.g., a new ADR), keep it in `docs/`.
- **Tests are not optional for `src/game/**`, `src/data/**`, `src/config/**`.** The 80% coverage gate enforces this. New logic in those folders needs corresponding Vitest specs.
- **Phaser scenes are excluded from the coverage gate** by `vitest.config.js`. That is intentional — scenes are integration surfaces; keep logic out of them so it stays testable.
- **No new runtime dependencies** without justification. The game must stay light on Android low-end. devDeps for tooling are fine when small.
- **Bahasa Indonesia for UI copy and `funFact` text.** Code identifiers and code comments may be English; user-visible strings may not.
- **Commits / PRs:** write normal prose, not compressed shorthand. Reference the touched phase (e.g., "Phase 4A:").
- **When the requested change spans Phase 4 territory** (backend, admin panel, Postgres, stats endpoints), re-read `docs/PLAN.md` §4 first — the schema, endpoints, and validation ranges are pre-decided there. Diverging from §4 requires user sign-off.
- **Destructive operations** (force push, `rm -rf`, dropping tables, deleting branches, rewriting history) require explicit user confirmation in this session. Default to non-destructive alternatives.

## Things to ask the user before assuming

- VPS Nginx Proxy network name (`deploy/docker-compose.yml` placeholder is `pilahyuk`).
- DLH / RT validation outcomes for the 100-item list.
- Whether the Docker Hub push has actually happened, and which tag is currently live.
- Phase 4 secrets: `JWT_SECRET`, `DB_PASSWORD`, `ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD`, `IP_HASH_SALT`. Never commit values, never invent them.

## When in doubt

Re-read `docs/PLAN.md` then `docs/CURRENT-STATUS.md`. If still ambiguous, ask the user — silent guessing on locked decisions is the failure mode this file exists to prevent.
