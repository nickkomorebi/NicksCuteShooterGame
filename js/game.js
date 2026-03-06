// ============================================================
// GAME.JS — Main Game class, state machine, loop
// ============================================================

class Game {
  constructor() {
    this.canvas  = document.getElementById('gameCanvas');
    this.ctx     = this.canvas.getContext('2d');
    this.input   = new InputManager();

    // State machine
    this.state   = 'TITLE';  // TITLE | CHAR_SELECT | PLAYING | BOSS_FIGHT | BOSS_DYING | LEVEL_CLEAR | GAME_OVER | WIN | LEADERBOARD

    // Screens
    this.titleScreen      = new TitleScreen();
    this.charSelectScreen = null;
    this.levelClearScreen = null;
    this.gameOverScreen   = null;
    this.winScreen        = null;
    this.leaderboardScreen = null;

    // Game objects
    this.player      = null;
    this.enemies     = [];
    this.bullets     = [];      // player bullets
    this.enemyBullets = [];     // enemy bullets
    this.powerups    = [];
    this.boss        = null;
    this.particles   = new ParticleSystem();

    // Level management
    this.currentLevel = 0;      // 0-indexed (0 = level 1)
    this.waveIndex    = 0;
    this.waveTimer    = 0;
    this.waveClearTimer = 0;
    this.allWavesCleared = false;
    this.bgState      = null;
    this.bossEntryTimer = 0;
    this.bossEntryDuration = 2.5;
    this.bossKilled   = false;

    // Flash effect
    this.flashColor = '#ff0000';
    this.flashAlpha = 0;
    this.screenShake = 0;

    // Scoring
    this.score        = 0;
    this.shotsFired   = 0;
    this.shotsHit     = 0;
    this.enemiesKilled = 0;
    this.levelStartTime = 0;  // performance.now() when level begins

    // Pause / async flags
    this.paused = false;
    this._scoreCheckPending = false;

    this.lastTime = 0;
  }

  start() {
    this._fitCanvas();
    window.addEventListener('resize', () => this._fitCanvas());
    this.lastTime = performance.now();
    requestAnimationFrame(ts => this.loop(ts));
  }

  // Scale the canvas CSS size to fit the viewport while preserving aspect ratio
  _fitCanvas() {
    const scale = Math.min(1, window.innerWidth / CANVAS_W, window.innerHeight / CANVAS_H);
    this.canvas.style.width  = Math.round(CANVAS_W * scale) + 'px';
    this.canvas.style.height = Math.round(CANVAS_H * scale) + 'px';
  }

  loop(timestamp) {
    const rawDt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;
    const dt = Math.min(rawDt, 0.05); // cap delta time

    if (!this.paused) {
      this.update(dt);
    }
    this.draw();

    requestAnimationFrame(ts => this.loop(ts));
  }

  // =========================================================
  // UPDATE
  // =========================================================
  update(dt) {
    switch (this.state) {
      case 'TITLE':       this._updateTitle(dt); break;
      case 'CHAR_SELECT': this._updateCharSelect(dt); break;
      case 'PLAYING':     this._updatePlaying(dt); break;
      case 'BOSS_FIGHT':  this._updateBossFight(dt); break;
      case 'BOSS_DYING':  this._updateBossDying(dt); break;
      case 'LEVEL_CLEAR': this._updateLevelClear(dt); break;
      case 'GAME_OVER':   this._updateGameOver(dt); break;
      case 'WIN':         this._updateWin(dt); break;
      case 'LEADERBOARD': this._updateLeaderboard(dt); break;
    }
    this.input.flush();
  }

  _updateTitle(dt) {
    this.titleScreen.update(dt);
    if (this.input.isPressed('Enter') || this.input.isPressed('Space') || this.input.touchJustStarted()) {
      this.charSelectScreen = new CharSelectScreen();
      this.state = 'CHAR_SELECT';
    }
    if (this.input.isPressed('KeyL')) {
      this._openLeaderboard();
    }
  }

  _updateCharSelect(dt) {
    // Touch nav: bottom quarter = confirm, left half = prev, right half = next
    if (this.input.touchJustStarted()) {
      const tx = this.input.touchPos().x;
      const ty = this.input.touchPos().y;
      if (ty > CANVAS_H * 0.75)  this.input.pressVirtual('Space');
      else if (tx < CANVAS_W / 2) this.input.pressVirtual('ArrowLeft');
      else                         this.input.pressVirtual('ArrowRight');
    }
    this.charSelectScreen.update(dt, this.input);
    if (this.charSelectScreen.isConfirmed()) {
      const chosen = this.charSelectScreen.getSelected();
      this._startGame(chosen);
    }
  }

  _updatePlaying(dt) {
    const level = LEVEL_DEFS[this.currentLevel];

    // Dev shortcut: G = skip to next level
    if (this.input.isPressed('KeyG')) {
      this._triggerBossFight();
      return;
    }

    // Pause
    if (this.input.isPressed('Escape') || this.input.isPressed('KeyP')) {
      this.paused = !this.paused;
      return;
    }

    // Update player
    this.player.update(dt, this.input);
    this._applyTouchMovement();

    // Player shooting
    if (this.input.isHeld('Space') || this.input.isHeld('KeyZ') || this.input.isHeld('KeyX') || this.input.touch.active) {
      const newBullets = this.player.shoot();
      if (newBullets.length > 0) this.shotsFired += newBullets.length;
      this.bullets.push(...newBullets);
    }

    // Wave logic
    if (!this.allWavesCleared) {
      this._updateWaves(dt, level);
    } else {
      // All waves done — wait briefly then boss
      this.waveClearTimer -= dt;
      if (this.waveClearTimer <= 0) {
        this._triggerBossFight();
        return;
      }
    }

    this._updateEnemies(dt);
    this._updateBullets(dt);
    this._updatePowerups(dt);
    this._updateParticles(dt);
    this._updateBG(dt);
    this._checkCollisions();
    this._checkPlayerDead();
    this._decayFlash(dt);

    // Check if current wave is cleared (no enemies left and no more waves pending)
    if (this.enemies.length === 0 && !this.allWavesCleared && this.waveIndex >= level.waves.length) {
      this.allWavesCleared = true;
      this.waveClearTimer = 1.5;
    }
  }

  _updateWaves(dt, level) {
    this.waveTimer -= dt;
    if (this.waveIndex < level.waves.length && this.waveTimer <= 0) {
      // Only spawn next wave if no enemies remain (for sequential style) OR it's the first wave
      if (this.enemies.length === 0 || this.waveIndex === 0) {
        const waveDef = level.waves[this.waveIndex];
        const newEnemies = buildWave(waveDef, this.currentLevel, this.waveIndex);
        this.enemies.push(...newEnemies);
        this.waveIndex++;
        this.waveTimer = this.waveIndex < level.waves.length ? level.waves[this.waveIndex - 1].delay || 3.0 : 999;
      } else if (this.enemies.every(e => e.phase === 'FORMATION')) {
        // Spawn next wave when current wave is settled
        const waveDef = level.waves[this.waveIndex];
        const newEnemies = buildWave(waveDef, this.currentLevel, this.waveIndex);
        this.enemies.push(...newEnemies);
        this.waveIndex++;
        this.waveTimer = 4.0;
      }
    }
  }

  _triggerBossFight() {
    const level = LEVEL_DEFS[this.currentLevel];
    const bossConfig = BOSS_CONFIGS[level.bossType];
    this.boss = new Boss(level.bossType, bossConfig);
    this.enemies = [];
    this.bullets = [];
    this.enemyBullets = [];
    this.bossEntryTimer = this.bossEntryDuration;
    this.bossKilled = false;
    this.state = 'BOSS_FIGHT';
  }

  _updateBossFight(dt) {
    // Pause
    if (this.input.isPressed('Escape') || this.input.isPressed('KeyP')) {
      this.paused = !this.paused;
      return;
    }

    // Update player
    this.player.update(dt, this.input);
    this._applyTouchMovement();

    // Player shooting
    if (this.input.isHeld('Space') || this.input.isHeld('KeyZ') || this.input.isHeld('KeyX') || this.input.touch.active) {
      const newBullets = this.player.shoot();
      if (newBullets.length > 0) this.shotsFired += newBullets.length;
      this.bullets.push(...newBullets);
    }

    // Boss entry banner
    if (this.bossEntryTimer > 0) {
      this.bossEntryTimer -= dt;
    }

    // Update boss
    const playerCX = this.player.x + this.player.width / 2;
    const playerCY = this.player.y + this.player.height / 2;
    const newBullets = this.boss.update(dt, playerCX, playerCY);
    this.enemyBullets.push(...newBullets);

    this._updateBullets(dt);
    this._updatePowerups(dt);
    this._updateParticles(dt);
    this._updateBG(dt);
    this._checkBossCollisions();
    this._checkPlayerDead();
    this._decayFlash(dt);

    // Boss death
    if (!this.boss.alive) {
      this.state = 'BOSS_DYING';
    }
  }

  _updateBossDying(dt) {
    this.boss.deathTimer -= dt;
    this._updateParticles(dt);
    this._updateBG(dt);
    this._decayFlash(dt);

    // Spam particles while dying
    if (Math.random() < 0.4) {
      const cx = this.boss.x + randomRange(0, this.boss.width);
      const cy = this.boss.y + randomRange(0, this.boss.height);
      this.particles.emit(cx, cy, 6, {
        colors: ['#ff69b4','#ffd700','#ff3366','#ffffff','#cc00ff'],
        shapes: ['star','heart','circle'],
        speed: 180, life: 1.2, sizeMin: 4, sizeMax: 10
      });
    }

    if (this.boss.deathTimer <= 0) {
      // Big death explosion
      const cx = this.boss.x + this.boss.width / 2;
      const cy = this.boss.y + this.boss.height / 2;
      this.particles.emit(cx, cy, 60, {
        colors: ['#ffd700','#ff69b4','#ff0000','#ffffff','#cc00ff','#00ddff'],
        shapes: ['star','heart','circle'],
        speed: 260, life: 2.5, sizeMin: 6, sizeMax: 14, gravity: 40
      });
      this._triggerFlash('#ffffff', 0.7);
      this.screenShake = 0.5;

      // Score
      this.score += this.boss.points;
      this.score += BOSS_KILL_BONUS;

      // Drop rainbow power-up
      this.powerups.push(new PowerUp(
        this.boss.x + this.boss.width / 2 - 10,
        this.boss.y + this.boss.height / 2,
        'rainbow'
      ));

      this._goToLevelClear();
    }
  }

  _goToLevelClear() {
    const level = LEVEL_DEFS[this.currentLevel];
    const elapsed = (performance.now() - this.levelStartTime) / 1000;
    const speedBonus = Math.max(0, SPEED_BONUS_BASE - Math.floor(elapsed) * SPEED_BONUS_DECAY);
    this.score += speedBonus;
    this.levelClearScreen = new LevelClearScreen(
      level.name,
      this.score,
      this.enemiesKilled,
      elapsed,
      speedBonus
    );
    this.state = 'LEVEL_CLEAR';
  }

  _updateLevelClear(dt) {
    this.levelClearScreen.update(dt, this.input);
    if (this.levelClearScreen.isComplete(this.input)) {
      this.currentLevel++;
      if (this.currentLevel >= LEVEL_DEFS.length) {
        // All levels done!
        this.winScreen = new WinScreen(this.score);
        this.state = 'WIN';
      } else {
        this._loadLevel(this.currentLevel);
      }
    }
  }

  _updateGameOver(dt) {
    this.gameOverScreen.update(dt);
    if (!this._scoreCheckPending && this.gameOverScreen.isReadyToReturn(this.input)) {
      this._scoreCheckPending = true;
      this._handleEndGame();
    }
  }

  _updateWin(dt) {
    this.winScreen.update(dt, this.input);
    if (!this._scoreCheckPending && this.winScreen.isReadyToReturn(this.input)) {
      this._scoreCheckPending = true;
      this._handleEndGame();
    }
  }

  _updateLeaderboard(dt) {
    if (this.leaderboardScreen) {
      this.leaderboardScreen.update(dt);
      if (this.leaderboardScreen.isDone(this.input)) {
        this._resetToTitle();
      }
    }
  }

  _updateEnemies(dt) {
    const playerCX = this.player.x + this.player.width / 2;
    const playerCY = this.player.y + this.player.height / 2;

    for (const e of this.enemies) {
      const shot = e.update(dt, playerCX, playerCY);
      if (shot) this.enemyBullets.push(shot);
    }
    this.enemies = this.enemies.filter(e => e.alive);
  }

  _updateBullets(dt) {
    for (const b of this.bullets) {
      if (b.isHoming) this._steerHomingBullet(b, dt);
      b.update(dt);
    }
    for (const b of this.enemyBullets) b.update(dt);
    this.bullets      = this.bullets.filter(b => !b.isOffscreen());
    this.enemyBullets = this.enemyBullets.filter(b => !b.isOffscreen());
  }

  _steerHomingBullet(b, dt) {
    const isBoss = (this.state === 'BOSS_FIGHT');
    const targets = isBoss
      ? (this.boss && this.boss.alive ? [this.boss] : [])
      : this.enemies.filter(e => e.alive);
    if (targets.length === 0) return;

    const bx = b.x + b.width / 2;
    const by = b.y + b.height / 2;
    let nearest = null, nearestDist = Infinity;
    for (const t of targets) {
      const d = dist(bx, by, t.x + t.width / 2, t.y + t.height / 2);
      if (d < nearestDist) { nearestDist = d; nearest = t; }
    }
    if (!nearest) return;

    const targetAng = angleTo(bx, by, nearest.x + nearest.width / 2, nearest.y + nearest.height / 2);
    const curAng    = Math.atan2(b.vy, b.vx);
    let diff = targetAng - curAng;
    while (diff >  Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    const newAng = curAng + Math.sign(diff) * Math.min(Math.abs(diff), 3.5 * dt);
    const spd = Math.hypot(b.vx, b.vy);
    b.vx = Math.cos(newAng) * spd;
    b.vy = Math.sin(newAng) * spd;
  }

  _updatePowerups(dt) {
    for (const p of this.powerups) p.update(dt);
    this.powerups = this.powerups.filter(p => p.alive);
  }

  _updateParticles(dt) {
    this.particles.update(dt);
  }

  _updateBG(dt) {
    if (this.bgState) {
      updateBGState(this.bgState, dt, this.currentLevel + 1);
    }
  }

  // =========================================================
  // COLLISION DETECTION
  // =========================================================
  _checkCollisions() {
    // Player bullets vs enemies
    for (let bi = this.bullets.length - 1; bi >= 0; bi--) {
      const b = this.bullets[bi];
      for (let ei = this.enemies.length - 1; ei >= 0; ei--) {
        const e = this.enemies[ei];
        if (collides(b, e)) {
          const killed = e.takeDamage(b.damage);
          this.shotsHit++;
          if (killed) {
            this.score += e.points;
            this.enemiesKilled++;
            this._onEnemyKill(e);
          } else {
            this.particles.emit(b.x, b.y, 4, { colors: ['#ffd700','#fff'], speed: 80, life: 0.4, sizeMin: 2, sizeMax: 5 });
          }
          if (!b.piercing) {
            this.bullets.splice(bi, 1);
            break;  // bullet consumed, stop checking enemies
          }
          // piercing: continue hitting more enemies
        }
      }
    }

    // Enemy bullets vs player
    if (!this.player.invincible) {
      for (let bi = this.enemyBullets.length - 1; bi >= 0; bi--) {
        const b = this.enemyBullets[bi];
        if (collides(b, this.player)) {
          this.enemyBullets.splice(bi, 1);
          const hit = this.player.takeDamage();
          if (hit) this._onPlayerHit();
          break;
        }
      }
    }

    // Player body vs enemies
    if (!this.player.invincible) {
      for (const e of this.enemies) {
        if (collides(this.player, e)) {
          const hit = this.player.takeDamage();
          if (hit) this._onPlayerHit();
          break;
        }
      }
    }

    // Player vs power-ups
    for (let pi = this.powerups.length - 1; pi >= 0; pi--) {
      const pu = this.powerups[pi];
      if (collides(this.player, pu)) {
        pu.applyTo(this.player);
        this.score += 50;
        this.particles.emit(pu.x + pu.width / 2, pu.y + pu.height / 2, 10, {
          colors: [POWERUP_COLORS[pu.type], '#ffffff'],
          shapes: ['star', 'circle'],
          speed: 100, life: 0.8, sizeMin: 3, sizeMax: 7
        });
        this.powerups.splice(pi, 1);
      }
    }
  }

  _checkBossCollisions() {
    if (!this.boss || !this.boss.alive) return;

    // Player bullets vs boss
    for (let bi = this.bullets.length - 1; bi >= 0; bi--) {
      const b = this.bullets[bi];
      if (collides(b, this.boss)) {
        this.boss.takeDamage(b.damage);
        this.shotsHit++;
        this.particles.emit(b.x, b.y, 5, {
          colors: ['#ffd700','#ff00ff','#fff'],
          shapes: ['star','circle'],
          speed: 100, life: 0.4, sizeMin: 3, sizeMax: 7
        });
        if (!b.piercing) {
          this.bullets.splice(bi, 1);
        }
      }
    }

    // Enemy bullets vs player
    if (!this.player.invincible) {
      for (let bi = this.enemyBullets.length - 1; bi >= 0; bi--) {
        const b = this.enemyBullets[bi];
        if (collides(b, this.player)) {
          this.enemyBullets.splice(bi, 1);
          const hit = this.player.takeDamage();
          if (hit) this._onPlayerHit();
          break;
        }
      }
    }

    // Player vs power-ups
    for (let pi = this.powerups.length - 1; pi >= 0; pi--) {
      const pu = this.powerups[pi];
      if (collides(this.player, pu)) {
        pu.applyTo(this.player);
        this.score += 50;
        this.particles.emit(pu.x + pu.width / 2, pu.y + pu.height / 2, 10, {
          colors: [POWERUP_COLORS[pu.type], '#ffffff'],
          shapes: ['star','circle'],
          speed: 100, life: 0.8, sizeMin: 3, sizeMax: 7
        });
        this.powerups.splice(pi, 1);
      }
    }
  }

  _onEnemyKill(e) {
    const cx = e.x + e.width / 2;
    const cy = e.y + e.height / 2;
    this.particles.emit(cx, cy, 14, {
      colors: ['#ffd700','#ff69b4','#ff3366','#ffffff','#cc00ff'],
      shapes: ['star','heart','circle'],
      speed: 150, life: 1.0, sizeMin: 4, sizeMax: 9, gravity: 50
    });
    // Weapon drop (only when player can still upgrade)
    if ((this.player.shotLevel || 1) < 6 && Math.random() < WEAPON_DROP_CHANCE) {
      this.powerups.push(new PowerUp(cx - 10, cy, 'weapon'));
    }
    // Health drop (independent)
    if (Math.random() < HEALTH_DROP_CHANCE) {
      this.powerups.push(new PowerUp(cx - 10, cy, 'health'));
    }
    // Rainbow drop (rare, independent)
    if (Math.random() < RAINBOW_DROP_CHANCE) {
      this.powerups.push(new PowerUp(cx - 10, cy, 'rainbow'));
    }
  }

  _onPlayerHit() {
    this._triggerFlash('#ff0000', 0.45);
    this.screenShake = 0.3;
    const cx = this.player.x + this.player.width / 2;
    const cy = this.player.y + this.player.height / 2;
    this.particles.emit(cx, cy, 10, {
      colors: ['#ff0000','#ff3366','#ffb6c1'],
      shapes: ['circle','heart'],
      speed: 120, life: 0.7, sizeMin: 3, sizeMax: 7
    });
  }

  _checkPlayerDead() {
    if (this.player.lives <= 0) {
      this.gameOverScreen = new GameOverScreen(this.score);
      this.state = 'GAME_OVER';
    }
  }

  // =========================================================
  // VISUAL EFFECTS
  // =========================================================
  _triggerFlash(color, alpha) {
    this.flashColor = color;
    this.flashAlpha = alpha;
  }

  _decayFlash(dt) {
    if (this.flashAlpha > 0) {
      this.flashAlpha = Math.max(0, this.flashAlpha - dt * 3);
    }
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 2);
    }
  }

  // =========================================================
  // LEVEL / GAME MANAGEMENT
  // =========================================================
  _startGame(characterConfig) {
    this.player        = new Player(characterConfig);
    this.score         = 0;
    this.shotsFired    = 0;
    this.shotsHit      = 0;
    this.enemiesKilled = 0;
    this.currentLevel  = 0;
    this._loadLevel(0);
  }

  _loadLevel(levelIndex) {
    this.enemies      = [];
    this.bullets      = [];
    this.enemyBullets = [];
    this.powerups     = [];
    this.boss         = null;
    this.waveIndex    = 0;
    this.waveTimer    = 1.5; // delay before first wave
    this.allWavesCleared = false;
    this.waveClearTimer  = 0;
    this.particles.clear();
    this.bgState        = createBGState(levelIndex + 1);
    this.levelStartTime = performance.now();
    this.state          = 'PLAYING';
    // Reset flash
    this.flashAlpha   = 0;
    this.screenShake  = 0;
    // Level entry flash
    this._triggerFlash('#ffffff', 0.5);
  }

  // Move player directly to touch position. Lives in game.js (not entities.js)
  // so it reads this.input.touch directly — same object the HUD debug confirmed works.
  _applyTouchMovement() {
    if (!this.player || !this.input.touch.active) return;
    const tx = this.input.touch.x;
    const ty = this.input.touch.y;
    this.player.x = clamp(tx - this.player.width  / 2,      0, CANVAS_W - this.player.width);
    this.player.y = clamp(ty - this.player.height / 2 - 30, 0, CANVAS_H - this.player.height);
  }

  async _handleEndGame() {
    let qualifies = false;
    try {
      const res  = await fetch('/api/scores');
      const top10 = await res.json();
      qualifies = this.score > 0 && (top10.length < 10 || this.score > top10[top10.length - 1].score);
    } catch (e) { /* API unavailable — skip high score */ }

    this._scoreCheckPending = false;

    if (qualifies) {
      this._showNameInput();
    } else {
      this._resetToTitle();
    }
  }

  _showNameInput() {
    this.paused = true;
    const overlay = document.getElementById('scoreOverlay');
    const msgEl   = document.getElementById('scoreMsg');
    const valEl   = document.getElementById('scoreVal');
    const input   = document.getElementById('playerNameInput');
    msgEl.textContent = '✨ NEW HIGH SCORE! ✨';
    valEl.textContent = this.score.toLocaleString() + ' pts';
    input.value = '';
    overlay.style.display = 'flex';
    setTimeout(() => input.focus(), 50);

    const submit = async (name) => {
      overlay.style.display = 'none';
      this.paused = false;
      // Switch state immediately so no further game-over/win update runs
      this.leaderboardScreen = new LeaderboardScreen([]);
      this.state = 'LEADERBOARD';
      try {
        await fetch('/api/scores', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ name: name || 'AAA', score: this.score })
        });
        const res = await fetch('/api/scores');
        this.leaderboardScreen.scores = await res.json();
      } catch (e) { /* ignore errors, show empty board */ }
    };

    document.getElementById('submitScoreBtn').onclick = () => submit(input.value.trim());
    input.onkeydown = (e) => { if (e.key === 'Enter') submit(input.value.trim()); };
  }

  async _openLeaderboard() {
    let scores = [];
    try {
      const res = await fetch('/api/scores');
      scores = await res.json();
    } catch (e) { /* show empty board if API down */ }
    this.leaderboardScreen = new LeaderboardScreen(scores);
    this.state = 'LEADERBOARD';
  }

  _resetToTitle() {
    this.state              = 'TITLE';
    this._scoreCheckPending = false;
    this.titleScreen        = new TitleScreen();
    this.enemies      = [];
    this.bullets      = [];
    this.enemyBullets = [];
    this.powerups     = [];
    this.boss         = null;
    this.player       = null;
    this.particles.clear();
    this.bgState      = null;
  }

  // =========================================================
  // DRAW
  // =========================================================
  draw() {
    const ctx = this.ctx;

    // Screen shake — only during active gameplay, not menus or end screens
    ctx.save();
    const shakeActive = this.screenShake > 0 &&
      (this.state === 'PLAYING' || this.state === 'BOSS_FIGHT' || this.state === 'BOSS_DYING');
    if (shakeActive) {
      const sx = randomRange(-this.screenShake * 8, this.screenShake * 8);
      const sy = randomRange(-this.screenShake * 8, this.screenShake * 8);
      ctx.translate(sx, sy);
    }

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    switch (this.state) {
      case 'TITLE':       this._drawTitle(ctx); break;
      case 'CHAR_SELECT': this._drawCharSelect(ctx); break;
      case 'PLAYING':     this._drawPlaying(ctx); break;
      case 'BOSS_FIGHT':  this._drawBossFight(ctx); break;
      case 'BOSS_DYING':  this._drawBossDying(ctx); break;
      case 'LEVEL_CLEAR': this._drawLevelClear(ctx); break;
      case 'GAME_OVER':   this._drawGameOver(ctx); break;
      case 'WIN':         this._drawWin(ctx); break;
      case 'LEADERBOARD': this._drawLeaderboard(ctx); break;
    }

    // Flash overlay
    if (this.flashAlpha > 0) {
      drawFlash(ctx, this.flashColor, this.flashAlpha);
    }

    ctx.restore();
  }

  _drawTitle(ctx) {
    this.titleScreen.draw(ctx);
  }

  _drawCharSelect(ctx) {
    this.charSelectScreen.draw(ctx);
  }

  _drawPlaying(ctx) {
    // Background
    drawBackground(ctx, this.currentLevel + 1, this.bgState);
    // Particles (behind entities)
    this.particles.draw(ctx);
    // Enemies
    for (const e of this.enemies) e.draw(ctx);
    // Bullets
    for (const b of this.bullets)      b.draw(ctx);
    for (const b of this.enemyBullets) b.draw(ctx);
    // Power-ups
    for (const p of this.powerups) p.draw(ctx);
    // Player
    if (this.player) this.player.draw(ctx);
    // HUD
    if (this.player) {
      drawHUD(ctx, this.player, this.score, this.currentLevel + 1, null);
    }
    // Level name (top-left, first few seconds)
    if (this.waveIndex <= 1 && this.waveTimer > -2) {
      const levelName = LEVEL_DEFS[this.currentLevel].name;
      ctx.globalAlpha = Math.min(1, this.waveTimer);
      ctx.font = 'bold 18px "Courier New"';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ff69b4';
      ctx.fillText('Level ' + (this.currentLevel + 1) + ': ' + levelName, CANVAS_W / 2, CANVAS_H / 2);
      ctx.globalAlpha = 1;
      ctx.textAlign = 'left';
    }
  }

  _drawBossFight(ctx) {
    drawBackground(ctx, this.currentLevel + 1, this.bgState);
    this.particles.draw(ctx);
    // Bullets
    for (const b of this.bullets)      b.draw(ctx);
    for (const b of this.enemyBullets) b.draw(ctx);
    // Power-ups
    for (const p of this.powerups) p.draw(ctx);
    // Boss
    if (this.boss) this.boss.draw(ctx);
    // Player
    if (this.player) this.player.draw(ctx);
    // HUD with boss health bar
    const bossRatio = this.boss ? this.boss.health / this.boss.maxHealth : 0;
    if (this.player) {
      drawHUD(ctx, this.player, this.score, this.currentLevel + 1, bossRatio);
    }
    // Boss entry banner
    if (this.bossEntryTimer > 0) {
      const alpha = Math.min(1, this.bossEntryTimer / (this.bossEntryDuration * 0.4));
      drawBossEntry(ctx, this.boss.name, alpha);
    }
  }

  _drawBossDying(ctx) {
    drawBackground(ctx, this.currentLevel + 1, this.bgState);
    this.particles.draw(ctx);
    if (this.boss) this.boss.draw(ctx);
    if (this.player) this.player.draw(ctx);
    const bossRatio = this.boss ? Math.max(0, this.boss.health / this.boss.maxHealth) : 0;
    if (this.player) drawHUD(ctx, this.player, this.score, this.currentLevel + 1, bossRatio);
  }

  _drawLevelClear(ctx) {
    // Draw game world faintly in background
    if (this.bgState) drawBackground(ctx, this.currentLevel + 1, this.bgState);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    this.levelClearScreen.draw(ctx);
  }

  _drawGameOver(ctx) {
    this.gameOverScreen.draw(ctx);
  }

  _drawWin(ctx) {
    this.winScreen.draw(ctx);
  }

  _drawLeaderboard(ctx) {
    if (this.leaderboardScreen) this.leaderboardScreen.draw(ctx);
  }
}

// ============================================================
// ENTRY POINT
// ============================================================
window.addEventListener('load', () => {
  const game = new Game();
  game.start();
});
