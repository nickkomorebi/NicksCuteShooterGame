// ============================================================
// INPUT.JS — Keyboard state manager
// ============================================================

class InputManager {
  constructor() {
    this.keys = {};
    this._prev = {};
    this._virtualKeys = {};

    // Touch state
    this.touch = { active: false, x: 0, y: 0 };
    this._prevTouchActive = false;
    this._touchStartedThisFrame = false;
    this._canvas = document.getElementById('gameCanvas');

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

    // Touch events on the canvas
    this._canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      const mapped = this._mapToCanvas(e.touches[0]);
      this.touch.active = true;
      this.touch.x = mapped.x;
      this.touch.y = mapped.y;
      this._touchStartedThisFrame = true;  // survives fast taps that end before next frame
    }, { passive: false });

    this._canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      const mapped = this._mapToCanvas(e.touches[0]);
      this.touch.x = mapped.x;
      this.touch.y = mapped.y;
    }, { passive: false });

    this._canvas.addEventListener('touchend', e => {
      e.preventDefault();
      if (e.touches.length === 0) this.touch.active = false;
    }, { passive: false });

    // Document-level listeners catch taps that canvas-level events miss (e.g. iOS Safari).
    // These only set the "just started" flag for menu navigation — not touch.active,
    // which is reserved for gameplay (canvas-only).
    document.addEventListener('touchstart', e => {
      this._touchStartedThisFrame = true;
      // Also update touch position using first touch, mapped to canvas coords
      if (e.touches.length > 0) {
        const mapped = this._mapToCanvas(e.touches[0]);
        this.touch.x = mapped.x;
        this.touch.y = mapped.y;
      }
    }, { passive: true });

    document.addEventListener('click', e => {
      const rect = this._canvas.getBoundingClientRect();
      this._touchStartedThisFrame = true;
      this.touch.x = (e.clientX - rect.left) * (this._canvas.width  / rect.width);
      this.touch.y = (e.clientY - rect.top)  * (this._canvas.height / rect.height);
    });
  }

  // Map a Touch object's client coords to canvas coords (handles CSS scaling)
  _mapToCanvas(touch) {
    const rect = this._canvas.getBoundingClientRect();
    return {
      x: (touch.clientX - rect.left) * (this._canvas.width  / rect.width),
      y: (touch.clientY - rect.top)  * (this._canvas.height / rect.height),
    };
  }

  // True while key is held
  isHeld(code) {
    return !!this.keys[code];
  }

  // True only on the first frame the key is pressed (rising edge), or if a virtual press was injected
  isPressed(code) {
    return (!!this.keys[code] && !this._prev[code]) || !!this._virtualKeys[code];
  }

  // Inject a one-frame virtual key press (used for touch-based menu navigation)
  pressVirtual(code) {
    this._virtualKeys[code] = true;
  }

  // True while a finger is on the canvas
  isTouching() {
    return this.touch.active;
  }

  // Current touch position in canvas coordinates
  touchPos() {
    return { x: this.touch.x, y: this.touch.y };
  }

  // True on the first frame a touch begins — uses event-set flag so fast taps aren't missed
  touchJustStarted() {
    return this._touchStartedThisFrame;
  }

  // Call at the end of each update() to track previous state
  flush() {
    this._prev = Object.assign({}, this.keys);
    this._virtualKeys = {};
    this._prevTouchActive = this.touch.active;
    this._touchStartedThisFrame = false;
  }
}
