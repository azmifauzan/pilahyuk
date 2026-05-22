# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**PilahYuk!** — browser-based waste-sorting education game for masyarakat Indonesia (Bahasa Indonesia). Conveyor-belt tap mechanic, 60-second rounds, 3 categories (Organik / Anorganik / B3). Regulation reference used internally is Perda Bandung Raya (3-jenis), but user-facing copy MUST stay nation-wide framing — never say "Bandung Raya", "Bandung", or any specific kota/RT in tags, descriptions, README, in-game text, or marketing copy. Open source (MIT), single-player, mobile-first.

`plan.md` is the source of truth for product/design decisions — read it before changing scope, scoring rules, item lists, or category logic. All decisions in its "Keputusan Final" table are locked unless the user says otherwise.

## Status

Pre-code. Only `plan.md` exists. Project scaffolding (Phase 0 in `plan.md`) has not been run yet. Before assuming any tooling exists, check the working tree.

## Planned Stack (locked)

- **Phaser 4.1.0 "Salusa"** — ESM build, WebGL renderer
- **Vite** bundler (required because Phaser 4 is ESM-only)
- **Vanilla JS** (TypeScript migration deferred)
- **Tailwind CSS** for non-canvas UI (menus, modals, share)
- **localStorage** for high score (no backend in MVP)
- **Docker** multi-stage build (`node:20-alpine` build → `nginx:alpine` serve) → Docker Hub `azmifauzan/pilahyuk:latest` → VPS `docker compose pull && up -d`
- **Domain:** `pilahyuk.aspriai.my.id` behind existing multi-domain Nginx Proxy on the VPS

Do not swap any of the above without explicit user approval — the VPS Nginx Proxy network wiring and the ESM/WebGL choice constrain everything downstream.

## Planned Layout

```
src/scenes/   Boot, Preload, Menu, Game, GameOver
src/data/     wasteItems.js (30 items + funFact per item)
src/config/   gameConfig.js
public/assets/{images,audio}
deploy/       docker-compose.yml for VPS + deploy README
Dockerfile, nginx.conf, vite.config.js, tailwind.config.js
```

## Commands (once scaffolded)

```bash
# dev
npm run dev                    # vite dev server
npm run build                  # vite production build → dist/

# docker (local build + push)
docker build -t azmifauzan/pilahyuk:latest .
docker push azmifauzan/pilahyuk:latest

# vps deploy/update
cd /opt/pilahyuk
docker compose pull && docker compose up -d
```

Test commands TBD — no test framework chosen yet in `plan.md`.

## Game Rules (authoritative)

Hardcoded constants future code must match `plan.md`:

- Round length: **60 seconds**
- Scoring: correct **+10**, 5x combo bonus **+25**, wrong **-5**, miss **-3**
- Difficulty tiers: 0–20s normal (spawn 2s), 20–40s +25% speed (spawn 1.5s), 40–60s +50% speed (spawn 1.2s)
- Item DB: 100 items (30 Organik, 45 Anorganik (30 recyclable + 15 residue), 25 B3). Exact lists in `src/data/wasteItems.js`. Treat that list as draft pending DLH/RT validation — flag changes to the user, don't silently re-balance.
- Residue items (Popok, Pembalut, Styrofoam kotor, Sachet, Masker) sort as Anorganik but must trigger an educational popup explaining they are residue.
- Wrong-sort popup is mandatory educational content, not optional polish.

## Notes for Future Sessions

- All user-facing strings: **Bahasa Indonesia** (Sunda planned v2, do not add yet).
- Placeholder assets are emoji/SVG — don't block on artwork.
- The repo will be public on GitHub under MIT; avoid committing anything that assumes private context.
- `deploy/docker-compose.yml` must join the external network of the existing Nginx Proxy on the VPS — exact network name (nginx-proxy / NPM / Traefik) is to be confirmed during Phase 0; ask before guessing.
