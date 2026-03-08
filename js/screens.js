// ============================================================
// SCREENS.JS — Title, CharSelect, LevelClear, GameOver
// ============================================================

// ---- Shared helpers ----
function _blinkText(ctx, text, x, y, timer, color, font) {
  if (Math.floor(timer * 2) % 2 === 0) {
    ctx.fillStyle = color || '#ffffff';
    ctx.font = font || '16px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y);
    ctx.textAlign = 'left';
  }
}

function _rainbowText(ctx, text, x, y, font, timer, size) {
  const colors = ['#ff0000','#ff6600','#ffcc00','#00cc44','#0088ff','#cc00ff','#ff69b4'];
  ctx.font = font || ('bold 42px "Courier New"');
  ctx.textAlign = 'center';
  let cx = x - ctx.measureText(text).width / 2;
  for (let i = 0; i < text.length; i++) {
    const col = colors[(i + Math.floor(timer * 3)) % colors.length];
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillText(text[i], cx + ctx.measureText(text.substring(0, i)).width + 2, y + 2);
    ctx.fillStyle = col;
    ctx.fillText(text[i], cx + ctx.measureText(text.substring(0, i)).width, y);
  }
  ctx.textAlign = 'left';
}

function _statBar(ctx, label, value, max, x, y, w, h, color) {
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  roundRect(ctx, x, y, w, h, 3);
  ctx.fill();
  ctx.fillStyle = color || '#ff69b4';
  roundRect(ctx, x, y, w * (value / max), h, 3);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = '11px "Courier New"';
  ctx.fillText(label, x - 48, y + h - 1);
}

// ============================================================
// TITLE SCREEN
// ============================================================
class TitleScreen {
  constructor() {
    this.timer     = 0;
    this.starField = [];
    for (let i = 0; i < 80; i++) {
      this.starField.push({
        x: randomRange(0, CANVAS_W),
        y: randomRange(0, CANVAS_H),
        size: randomRange(0.5, 2.5),
        speed: randomRange(25, 70),
        alpha: randomRange(0.4, 1)
      });
    }
    this.kittyBob = 0;
    this.kittyBobDir = 1;
  }

  update(dt) {
    this.timer += dt;
    // Scroll stars
    for (const s of this.starField) {
      s.y += s.speed * dt;
      if (s.y > CANVAS_H + 5) { s.y = -5; s.x = randomRange(0, CANVAS_W); }
    }
    // Bob kitty
    this.kittyBob += this.kittyBobDir * 22 * dt;
    if (Math.abs(this.kittyBob) > 6) this.kittyBobDir *= -1;
  }

  draw(ctx) {
    // Dark BG
    ctx.fillStyle = '#0a0015';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Stars
    for (const s of this.starField) {
      ctx.globalAlpha = s.alpha;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Title
    ctx.save();
    ctx.font = 'bold 44px "Courier New"';
    ctx.textAlign = 'center';
    // Shadow layer
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillText('SPACE', CANVAS_W / 2 + 3, 195);
    ctx.fillText('CATS', CANVAS_W / 2 + 3, 245);
    // Rainbow text
    const colors6 = ['#ff0000','#ff8800','#ffdd00','#00cc44','#0099ff','#cc00ff','#ff69b4'];
    const title1 = 'SPACE';
    const title2 = 'CATS';
    ctx.font = 'bold 46px "Courier New"';
    const char1W = ctx.measureText(title1).width;
    const char2W = ctx.measureText(title2).width;
    let sx = CANVAS_W / 2 - char1W / 2;
    for (let i = 0; i < title1.length; i++) {
      ctx.fillStyle = colors6[(i + Math.floor(this.timer * 2.5)) % colors6.length];
      ctx.fillText(title1[i], sx, 190);
      sx += ctx.measureText(title1[i]).width;
    }
    sx = CANVAS_W / 2 - char2W / 2;
    for (let i = 0; i < title2.length; i++) {
      ctx.fillStyle = colors6[(i + 2 + Math.floor(this.timer * 2.5)) % colors6.length];
      ctx.fillText(title2[i], sx, 240);
      sx += ctx.measureText(title2[i]).width;
    }
    ctx.restore();

    // Subtitle
    ctx.fillStyle = '#ff69b4';
    ctx.font = 'italic 14px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText('~ Sanrio Shoot-Em-Up ~', CANVAS_W / 2, 268);
    ctx.textAlign = 'left';

    // Animated kitty character (classic)
    const kittyColors = CHARACTER_CONFIGS[0].colors;
    drawKittyCharacter(ctx, CANVAS_W / 2, 340 + this.kittyBob, 22, kittyColors, 0);

    // Floating star particles around kitty
    const starCols = ['#ffd700','#ff69b4','#ffffff'];
    for (let i = 0; i < 5; i++) {
      const ang = (i / 5) * Math.PI * 2 + this.timer * 1.2;
      const sx2 = CANVAS_W / 2 + Math.cos(ang) * 48;
      const sy = 340 + Math.sin(ang) * 32;
      ctx.fillStyle = starCols[i % starCols.length];
      ctx.globalAlpha = 0.7 + 0.3 * Math.sin(this.timer * 3 + i);
      _starPath(ctx, sx2, sy, 5, 2, 5);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Blink prompt
    _blinkText(ctx, 'TAP  OR  PRESS  ENTER  TO  START', CANVAS_W / 2, 430, this.timer, '#ffffff', 'bold 13px "Courier New"');

    // High score / credits placeholder
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '11px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText('Arrow Keys: Move   Space/Z: Shoot   Enter: Confirm', CANVAS_W / 2, CANVAS_H - 20);
    ctx.textAlign = 'left';
  }
}

// ============================================================
// CHARACTER SELECT SCREEN
// ============================================================
class CharSelectScreen {
  constructor() {
    this.selected = 0;
    this.timer = 0;
    this.confirmed = false;
    this.confirmTimer = 0;
  }

  update(dt, input) {
    this.timer += dt;
    if (this.confirmed) {
      this.confirmTimer += dt;
      return;
    }
    if (input.isPressed('ArrowLeft'))  this.selected = (this.selected - 1 + 4) % 4;
    if (input.isPressed('ArrowRight')) this.selected = (this.selected + 1) % 4;
    if (input.isPressed('Enter') || input.isPressed('Space')) {
      this.confirmed = true;
    }
  }

  isConfirmed() { return this.confirmed && this.confirmTimer > 0.35; }
  getSelected() { return CHARACTER_CONFIGS[this.selected]; }

  draw(ctx) {
    // BG
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    grad.addColorStop(0, '#1a0030');
    grad.addColorStop(1, '#06000f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Title
    ctx.font = 'bold 26px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff69b4';
    ctx.fillText('SELECT YOUR KITTY', CANVAS_W / 2, 44);
    ctx.textAlign = 'left';

    // Divider
    ctx.strokeStyle = '#ff69b4';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    ctx.beginPath(); ctx.moveTo(20, 54); ctx.lineTo(CANVAS_W - 20, 54); ctx.stroke();
    ctx.globalAlpha = 1;

    // Character cards
    const cardW = 96, cardH = 105;
    const startX = (CANVAS_W - 4 * cardW - 3 * 8) / 2;
    const cardY = 72;

    for (let i = 0; i < CHARACTER_CONFIGS.length; i++) {
      const cc = CHARACTER_CONFIGS[i];
      const cx = startX + i * (cardW + 8);
      const isSelected = i === this.selected;

      // Card BG
      ctx.save();
      if (isSelected) {
        // Glowing selected card
        ctx.shadowColor = '#ff69b4';
        ctx.shadowBlur = 15;
        ctx.fillStyle = 'rgba(255,105,180,0.2)';
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
      }
      roundRect(ctx, cx, cardY, cardW, cardH, 8);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Border
      ctx.strokeStyle = isSelected ? '#ff69b4' : 'rgba(255,255,255,0.2)';
      ctx.lineWidth = isSelected ? 2 : 1;
      roundRect(ctx, cx, cardY, cardW, cardH, 8);
      ctx.stroke();
      ctx.restore();

      // Character art
      const kittyY = cardY + 38 + (isSelected ? Math.sin(this.timer * 3) * 4 : 0);
      drawKittyCharacter(ctx, cx + cardW / 2, kittyY, 18, cc.colors, 0);

      // Name
      ctx.font = isSelected ? 'bold 10px "Courier New"' : '9px "Courier New"';
      ctx.fillStyle = isSelected ? '#ff69b4' : 'rgba(255,255,255,0.7)';
      ctx.textAlign = 'center';
      ctx.fillText(cc.name, cx + cardW / 2, cardY + cardH - 8);
      ctx.textAlign = 'left';

      // Selection indicator
      if (isSelected) {
        ctx.fillStyle = '#ff69b4';
        ctx.textAlign = 'center';
        ctx.font = '14px "Courier New"';
        ctx.fillText('▼', cx + cardW / 2, cardY - 8);
        ctx.textAlign = 'left';
      }
    }

    // Detail panel for selected character
    const cc = CHARACTER_CONFIGS[this.selected];
    const detailY = cardY + cardH + 22;
    const panelX = 30, panelW = CANVAS_W - 60;

    ctx.fillStyle = 'rgba(255,105,180,0.08)';
    roundRect(ctx, panelX, detailY, panelW, 160, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,105,180,0.3)';
    ctx.lineWidth = 1;
    roundRect(ctx, panelX, detailY, panelW, 160, 10);
    ctx.stroke();

    // Name
    ctx.font = 'bold 18px "Courier New"';
    ctx.fillStyle = '#ff69b4';
    ctx.textAlign = 'center';
    ctx.fillText(cc.name, CANVAS_W / 2, detailY + 24);
    ctx.textAlign = 'left';

    // Description
    ctx.font = '11px "Courier New"';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.textAlign = 'center';
    ctx.fillText(cc.description, CANVAS_W / 2, detailY + 42);
    ctx.textAlign = 'left';

    // Stat bars
    const barX = panelX + 58, barW = panelW - 70, barH = 10, barSep = 24;
    const barStartY = detailY + 62;
    _statBar(ctx, 'Speed',   cc.statSpeed,   5, barX, barStartY,           barW, barH, '#00ddff');
    _statBar(ctx, 'Power',   cc.statPower,   5, barX, barStartY + barSep,  barW, barH, '#ff3366');
    _statBar(ctx, 'Defense', cc.statDefense, 5, barX, barStartY + barSep * 2, barW, barH, '#44ff88');

    // Shot type
    ctx.font = '11px "Courier New"';
    ctx.fillStyle = 'rgba(255,220,255,0.8)';
    ctx.textAlign = 'center';
    const shotLabels = { single: 'Single → Double → Triple', double: 'Double → Quad Spread', spread: 'Wide Spread (3→5 bullets)', starburst: '8-Direction Star Burst' };
    ctx.fillText('Shot: ' + (shotLabels[cc.shotType] || cc.shotType), CANVAS_W / 2, barStartY + barSep * 3 + 4);
    ctx.textAlign = 'left';

    // HP hearts
    ctx.textAlign = 'center';
    let hearts = '';
    for (let i = 0; i < cc.maxHealth; i++) hearts += '♥ ';
    ctx.fillStyle = '#ff3366';
    ctx.font = '13px "Courier New"';
    ctx.fillText(hearts.trim(), CANVAS_W / 2, barStartY + barSep * 3 + 22);
    ctx.textAlign = 'left';

    // Mobile tap zone hints
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, CANVAS_H * 0.75, CANVAS_W, CANVAS_H * 0.25);
    ctx.globalAlpha = 1;

    // Confirm prompt
    if (!this.confirmed) {
      _blinkText(ctx, 'TAP HERE  /  PRESS ENTER  TO  CONFIRM', CANVAS_W / 2, CANVAS_H - 30, this.timer, '#ffd700', 'bold 11px "Courier New"');
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font = '10px "Courier New"';
      ctx.textAlign = 'center';
      ctx.fillText('tap left half / right half to cycle', CANVAS_W / 2, CANVAS_H - 12);
      ctx.textAlign = 'left';
    } else {
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 14px "Courier New"';
      ctx.textAlign = 'center';
      ctx.fillText('READY!', CANVAS_W / 2, CANVAS_H - 22);
      ctx.textAlign = 'left';
    }
  }
}

// ============================================================
// LEVEL CLEAR SCREEN
// ============================================================
class LevelClearScreen {
  constructor(levelName, score, enemiesKilled, elapsedTime, speedBonus) {
    this.levelName     = levelName;
    this.baseScore     = score;
    this.enemiesKilled = enemiesKilled;
    this.elapsedTime   = elapsedTime;
    this.speedBonus    = speedBonus;
    this.timer         = 0;
    this.autoAdvance   = 4.0;   // seconds
    this.particles    = [];
    this._burst();
  }

  _burst() {
    const cols = ['#ffd700','#ff69b4','#ff3366','#00ddff','#ffffff','#cc00ff'];
    for (let i = 0; i < 40; i++) {
      const ang = randomRange(0, Math.PI * 2);
      const spd = randomRange(80, 240);
      this.particles.push({
        x: CANVAS_W / 2, y: CANVAS_H / 2 - 80,
        vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - 60,
        life: randomRange(1.0, 2.2),
        maxLife: 2.2,
        color: cols[Math.floor(Math.random() * cols.length)],
        size: randomRange(4, 9),
        shape: Math.random() < 0.5 ? 'star' : 'heart',
        gravity: 90
      });
    }
  }

  update(dt, input) {
    this.timer += dt;
    // Update particles
    for (const p of this.particles) {
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.gravity * dt; p.life -= dt;
    }
    this.particles = this.particles.filter(p => p.life > 0);
  }

  isComplete(input) {
    return this.timer >= this.autoAdvance || input.isPressed('Enter') || input.touchJustStarted();
  }

  draw(ctx) {
    // BG
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    grad.addColorStop(0, '#0a001e');
    grad.addColorStop(1, '#1a003a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      if (p.shape === 'star') {
        _starPath(ctx, p.x, p.y, p.size, p.size * 0.4, 5);
      } else {
        _heartPath(ctx, p.x, p.y, p.size * 0.7);
      }
      ctx.fill();
      ctx.restore();
    }

    // "LEVEL CLEAR!"
    ctx.font = 'bold 38px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillText('LEVEL CLEAR!', CANVAS_W / 2 + 2, 152);
    ctx.fillStyle = '#ffd700';
    ctx.fillText('LEVEL CLEAR!', CANVAS_W / 2, 150);

    // Level name
    ctx.font = '16px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff69b4';
    ctx.fillText(this.levelName, CANVAS_W / 2, 190);
    ctx.textAlign = 'left';

    // Score breakdown
    const bossBonus = BOSS_KILL_BONUS;
    const mins = Math.floor(this.elapsedTime / 60);
    const secs = Math.floor(this.elapsedTime % 60);
    const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

    const rows = [
      { label: 'Stage Score:',              value: this.baseScore - bossBonus - this.speedBonus },
      { label: 'Boss Bonus:',               value: bossBonus },
      { label: `Speed Bonus (${timeStr}):`, value: this.speedBonus },
      { label: 'Total Score:',              value: this.baseScore, highlight: true }
    ];

    let ry = 240;
    for (const row of rows) {
      if (row.highlight) {
        ctx.fillStyle = 'rgba(255,215,0,0.1)';
        ctx.fillRect(80, ry - 18, CANVAS_W - 160, 24);
      }
      ctx.font = row.highlight ? 'bold 15px "Courier New"' : '13px "Courier New"';
      ctx.fillStyle = row.highlight ? '#ffd700' : 'rgba(255,255,255,0.8)';
      ctx.textAlign = 'left';
      ctx.fillText(row.label, 90, ry);
      ctx.textAlign = 'right';
      ctx.fillText(row.value.toLocaleString(), CANVAS_W - 90, ry);
      ry += 30;
    }
    ctx.textAlign = 'left';

    // Enemies killed
    ctx.font = '12px "Courier New"';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('Enemies defeated: ' + this.enemiesKilled, CANVAS_W / 2, ry + 10);
    ctx.textAlign = 'left';

    // Continue prompt
    _blinkText(ctx, 'PRESS ENTER TO CONTINUE', CANVAS_W / 2, CANVAS_H - 28, this.timer, '#ffffff', '13px "Courier New"');

    // Auto-advance bar
    const pct = Math.min(this.timer / this.autoAdvance, 1);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(60, CANVAS_H - 14, CANVAS_W - 120, 6);
    ctx.fillStyle = '#ff69b4';
    ctx.fillRect(60, CANVAS_H - 14, (CANVAS_W - 120) * pct, 6);
  }
}

// ============================================================
// GAME OVER SCREEN
// ============================================================
class GameOverScreen {
  constructor(score) {
    this.score = score;
    this.timer = 0;
  }

  update(dt) { this.timer += dt; }

  isReadyToReturn(input) {
    return this.timer > 1.2 && (input.isPressed('Enter') || input.isPressed('Space') || input.touchJustStarted());
  }

  draw(ctx) {
    // Dark overlay BG
    ctx.fillStyle = 'rgba(10,0,21,0.95)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Slow falling stars
    // (just static decoration)
    ctx.fillStyle = 'rgba(255,105,180,0.06)';
    for (let i = 0; i < 12; i++) {
      const x = (i * 73 + 40) % CANVAS_W;
      const y = ((i * 137 + this.timer * 20) % CANVAS_H);
      _starPath(ctx, x, y, 6, 2.5, 5);
      ctx.fill();
    }

    // "GAME OVER" text
    ctx.font = 'bold 52px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillText('GAME', CANVAS_W / 2 + 3, 243);
    ctx.fillText('OVER', CANVAS_W / 2 + 3, 298);
    ctx.fillStyle = '#cc1133';
    ctx.fillText('GAME', CANVAS_W / 2, 240);
    ctx.fillStyle = '#ff1155';
    ctx.fillText('OVER', CANVAS_W / 2, 295);

    // Score
    ctx.font = '20px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillText('SCORE: ' + this.score.toLocaleString(), CANVAS_W / 2 + 2, 350);
    ctx.fillStyle = '#ffd700';
    ctx.fillText('SCORE: ' + this.score.toLocaleString(), CANVAS_W / 2, 348);
    ctx.textAlign = 'left';

    // Prompt
    if (this.timer > 1.2) {
      _blinkText(ctx, 'PRESS ENTER TO RETURN TO TITLE', CANVAS_W / 2, CANVAS_H - 45, this.timer, '#ffffff', '12px "Courier New"');
    }

    // Sad note
    ctx.fillStyle = 'rgba(255,105,180,0.5)';
    ctx.font = '12px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText('Better luck next time~ ♥', CANVAS_W / 2, CANVAS_H - 22);
    ctx.textAlign = 'left';
  }
}

// ============================================================
// WIN SCREEN (all 5 levels cleared)
// ============================================================
class WinScreen {
  constructor(score) {
    this.score  = score;
    this.timer  = 0;
    this.stars  = [];
    for (let i = 0; i < 60; i++) {
      this.stars.push({
        x: randomRange(0, CANVAS_W), y: randomRange(0, CANVAS_H),
        vx: randomRange(-80, 80), vy: randomRange(-80, 80),
        life: randomRange(1.5, 4), maxLife: 4,
        color: randomChoice(['#ffd700','#ff69b4','#ffffff','#00ddff','#cc00ff']),
        size: randomRange(3, 8), shape: Math.random() < 0.5 ? 'star' : 'heart',
        gravity: randomRange(-20, 20)
      });
    }
  }

  update(dt, input) {
    this.timer += dt;
    for (const s of this.stars) {
      s.x += s.vx * dt; s.y += s.vy * dt; s.vy += s.gravity * dt; s.life -= dt;
      if (s.life <= 0) {
        s.x = randomRange(0, CANVAS_W); s.y = randomRange(0, CANVAS_H);
        s.vx = randomRange(-80, 80); s.vy = randomRange(-80, 80);
        s.life = randomRange(1.5, 4);
      }
    }
  }

  isReadyToReturn(input) {
    return this.timer > 2.0 && (input.isPressed('Enter') || input.isPressed('Space') || input.touchJustStarted());
  }

  draw(ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    grad.addColorStop(0, '#1a003a');
    grad.addColorStop(1, '#06000f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Celebration particles
    for (const s of this.stars) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, s.life / s.maxLife);
      ctx.fillStyle = s.color;
      if (s.shape === 'star') { _starPath(ctx, s.x, s.y, s.size, s.size * 0.4, 5); }
      else { _heartPath(ctx, s.x, s.y, s.size * 0.7); }
      ctx.fill();
      ctx.restore();
    }

    ctx.font = 'bold 36px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd700';
    ctx.fillText('CONGRATULATIONS!', CANVAS_W / 2, 180);
    ctx.fillStyle = '#ff69b4';
    ctx.font = '20px "Courier New"';
    ctx.fillText('You saved the Sanrio world!', CANVAS_W / 2, 220);
    ctx.fillText('★ ★ ★ ★ ★', CANVAS_W / 2, 260);
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px "Courier New"';
    ctx.fillText('Final Score:', CANVAS_W / 2, 320);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 28px "Courier New"';
    ctx.fillText(this.score.toLocaleString(), CANVAS_W / 2, 358);
    ctx.textAlign = 'left';

    _blinkText(ctx, 'PRESS ENTER TO PLAY AGAIN', CANVAS_W / 2, CANVAS_H - 38, this.timer, '#ffffff', '13px "Courier New"');
    ctx.fillStyle = 'rgba(255,105,180,0.5)';
    ctx.font = '11px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText('Thank you for playing~ ♥♥♥', CANVAS_W / 2, CANVAS_H - 18);
    ctx.textAlign = 'left';
  }
}

// ============================================================
// LEADERBOARD SCREEN
// ============================================================
class LeaderboardScreen {
  constructor(scores) {
    this.scores = scores; // [{name, score}]
    this.timer  = 0;
  }

  update(dt) { this.timer += dt; }

  isDone(input) {
    return this.timer > 0.5 && (input.isPressed('Enter') || input.isPressed('Space') || input.touchJustStarted());
  }

  draw(ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    grad.addColorStop(0, '#0a001e');
    grad.addColorStop(1, '#1a003a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Title
    ctx.font = 'bold 30px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillText('★ HIGH SCORES ★', CANVAS_W / 2 + 2, 54);
    ctx.fillStyle = '#ffd700';
    ctx.fillText('★ HIGH SCORES ★', CANVAS_W / 2, 52);

    // Divider
    ctx.strokeStyle = '#ff69b4';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    ctx.beginPath(); ctx.moveTo(40, 66); ctx.lineTo(CANVAS_W - 40, 66); ctx.stroke();
    ctx.globalAlpha = 1;

    if (this.scores.length === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '14px "Courier New"';
      ctx.fillText('No scores yet — be the first!', CANVAS_W / 2, 200);
    } else {
      const rankColors = ['#ffd700', '#c0c0c0', '#cd7f32'];
      for (let i = 0; i < this.scores.length; i++) {
        const s = this.scores[i];
        const y = 100 + i * 54;
        const isTop3 = i < 3;

        // Row bg for top 3
        if (isTop3) {
          ctx.fillStyle = `rgba(255,215,0,${0.06 - i * 0.015})`;
          ctx.fillRect(40, y - 20, CANVAS_W - 80, 34);
        }

        ctx.font = isTop3 ? 'bold 15px "Courier New"' : '13px "Courier New"';
        ctx.fillStyle = rankColors[i] || 'rgba(255,255,255,0.75)';

        // Rank
        ctx.textAlign = 'left';
        ctx.fillText(`#${i + 1}`, 52, y);

        // Name
        ctx.fillText(s.name, 100, y);

        // Score
        ctx.textAlign = 'right';
        ctx.fillText(Number(s.score).toLocaleString(), CANVAS_W - 52, y);
      }
    }

    ctx.textAlign = 'left';
    _blinkText(ctx, 'TAP  /  PRESS ENTER TO RETURN', CANVAS_W / 2, CANVAS_H - 28, this.timer, '#ff69b4', '12px "Courier New"');
  }
}

// ============================================================
// PAUSE SCREEN (overlay)
// ============================================================
function drawPauseOverlay(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.font = 'bold 38px "Courier New"';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff69b4';
  ctx.fillText('PAUSED', CANVAS_W / 2, CANVAS_H / 2);
  ctx.font = '14px "Courier New"';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Press ESC or P to resume', CANVAS_W / 2, CANVAS_H / 2 + 36);
  ctx.textAlign = 'left';
}

// ============================================================
// BOSS ENTRY BANNER
// ============================================================
function drawBossEntry(ctx, bossName, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(40,0,60,0.8)';
  ctx.fillRect(0, CANVAS_H / 2 - 36, CANVAS_W, 72);
  ctx.strokeStyle = '#cc00cc';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, CANVAS_H / 2 - 36, CANVAS_W, 72);
  ctx.font = 'bold 16px "Courier New"';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff00ff';
  ctx.fillText('WARNING!  BOSS  APPROACHING', CANVAS_W / 2, CANVAS_H / 2 - 10);
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 22px "Courier New"';
  ctx.fillText(bossName.toUpperCase(), CANVAS_W / 2, CANVAS_H / 2 + 18);
  ctx.restore();
}
