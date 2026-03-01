// ============================================================
// INPUT.JS — Keyboard state manager
// ============================================================

class InputManager {
  constructor() {
    this.keys = {};
    this._prev = {};
    document.addEventListener('keydown', e => {
      this.keys[e.code] = true;
      // Prevent scroll on arrow keys / space
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) {
        e.preventDefault();
      }
    });
    document.addEventListener('keyup', e => {
      this.keys[e.code] = false;
    });
  }

  // True while key is held
  isHeld(code) {
    return !!this.keys[code];
  }

  // True only on the first frame the key is pressed (rising edge)
  isPressed(code) {
    return !!this.keys[code] && !this._prev[code];
  }

  // Call at the end of each update() to track previous state
  flush() {
    this._prev = Object.assign({}, this.keys);
  }
}
