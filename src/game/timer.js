export class CountdownTimer {
  constructor(totalSec) {
    if (!(totalSec > 0)) throw new Error('CountdownTimer: totalSec must be > 0')
    this.total = totalSec
    this.elapsed = 0
    this.done = false
  }

  tick(deltaSec) {
    if (this.done || deltaSec <= 0) return false
    this.elapsed += deltaSec
    if (this.elapsed >= this.total) {
      this.elapsed = this.total
      this.done = true
      return true
    }
    return false
  }

  remaining() {
    return Math.max(0, this.total - this.elapsed)
  }

  isDone() {
    return this.done
  }

  reset() {
    this.elapsed = 0
    this.done = false
  }
}
