// Pure-logic conveyor belt. No Phaser deps.
// Item positions are in belt-local px. Item enters at x = beltLengthPx and
// moves toward x = 0. When x <= 0 the item is "missed" and removed.

let nextUid = 1

export function _resetUidForTests() {
  nextUid = 1
}

export class Conveyor {
  constructor({ beltLengthPx, baseSpeedPxPerSec, rng = Math.random }) {
    if (!(beltLengthPx > 0)) throw new Error('Conveyor: beltLengthPx must be > 0')
    if (!(baseSpeedPxPerSec > 0)) throw new Error('Conveyor: baseSpeedPxPerSec must be > 0')
    this.beltLengthPx = beltLengthPx
    this.baseSpeed = baseSpeedPxPerSec
    this.rng = rng
    this.items = []
    this.sinceLastSpawn = 0
  }

  update(deltaSec, { speedMul, spawnEverySec, pickItem }) {
    const speed = this.baseSpeed * speedMul
    for (const it of this.items) it.x -= speed * deltaSec

    const missed = []
    this.items = this.items.filter((it) => {
      if (it.x <= 0) { missed.push(it); return false }
      return true
    })

    this.sinceLastSpawn += deltaSec
    const spawned = []
    while (this.sinceLastSpawn >= spawnEverySec) {
      this.sinceLastSpawn -= spawnEverySec
      const data = pickItem(this.rng)
      if (!data) continue
      const it = { uid: nextUid++, data, x: this.beltLengthPx }
      this.items.push(it)
      spawned.push(it)
    }

    return { missed, spawned }
  }

  removeByUid(uid) {
    const idx = this.items.findIndex((it) => it.uid === uid)
    if (idx < 0) return null
    const [removed] = this.items.splice(idx, 1)
    return removed
  }

  topmost() {
    return this.items.length === 0 ? null : this.items[0]
  }

  count() {
    return this.items.length
  }

  reset() {
    this.items = []
    this.sinceLastSpawn = 0
  }
}
