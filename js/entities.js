// ============================================================
// ENTITIES.JS — Player, Enemy, Boss, Bullet, Particle, PowerUp
// ============================================================

// ============================================================
// PLAYER
// ============================================================
class Player {
  constructor(characterConfig) {
    this.character  = characterConfig;
    this.width      = PLAYER_WIDTH;
    this.height     = PLAYER_HEIGHT;
    this.x          = CANVAS_W / 2 - this.width / 2;
    this.y          = CANVAS_H - 120;
    this.speed      = characterConfig.speed;
    this.health     = characterConfig.maxHealth;
    this.maxHealth  = characterConfig.maxHealth;
    this.lives      = 3;
    this.fireRate   = characterConfig.fireRate;   // seconds between shots
    this.fireCooldown = 0;
    this.shotLevel  = 1;
    this.invincible = false;
    this.invincibleTimer = 0;
    this.shotType   = characterConfig.shotType;
  }

  update(dt, input) {
    // Movement
    let dx = 0, dy = 0;
    if (input.isHeld('ArrowLeft'))  dx -= 1;
    if (input.isHeld('ArrowRight')) dx += 1;
    if (input.isHeld('ArrowUp'))    dy -= 1;
    if (input.isHeld('ArrowDown'))  dy += 1;
    if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }

    this.x = clamp(this.x + dx * this.speed * dt, 0, CANVAS_W - this.width);
    this.y = clamp(this.y + dy * this.speed * dt, 0, CANVAS_H - this.height);

    // Invincibility frames
    if (this.invincible) {
      this.invincibleTimer -= dt;
      if (this.invincibleTimer <= 0) this.invincible = false;
    }

    // Fire cooldown
    if (this.fireCooldown > 0) this.fireCooldown -= dt;
  }

  shoot() {
    if (this.fireCooldown > 0) return [];
    this.fireCooldown = this.fireRate;

    const cx = this.x + this.width / 2;
    const cy = this.y;
    const spd = BULLET_SPEED_PLAYER;
    const lvl = this.shotLevel || 1;
    const bullets = [];

    if (lvl === 1) {
      // Single forward bullet
      bullets.push(new Bullet(cx - 4, cy, 8, 8, 0, -spd, 'player', 1, '#ffd700', 'star'));

    } else if (lvl === 2) {
      // 2 parallel bullets
      bullets.push(new Bullet(cx - 12, cy, 8, 8, 0, -spd, 'player', 1, '#ffd700', 'star'));
      bullets.push(new Bullet(cx + 4,  cy, 8, 8, 0, -spd, 'player', 1, '#ffd700', 'star'));

    } else if (lvl === 3) {
      // 3-way: center + ±18°
      bullets.push(new Bullet(cx - 4, cy, 8, 8, 0, -spd, 'player', 1, '#ffd700', 'star'));
      const r3 = 18 * Math.PI / 180;
      bullets.push(new Bullet(cx - 4, cy, 8, 8, -Math.sin(r3) * spd, -Math.cos(r3) * spd, 'player', 1, '#ff69b4', 'star'));
      bullets.push(new Bullet(cx - 4, cy, 8, 8,  Math.sin(r3) * spd, -Math.cos(r3) * spd, 'player', 1, '#ff69b4', 'star'));

    } else if (lvl === 4) {
      // 3-way + 2 homing side shots
      bullets.push(new Bullet(cx - 4, cy, 8, 8, 0, -spd, 'player', 1, '#ffd700', 'star'));
      const r4 = 18 * Math.PI / 180;
      bullets.push(new Bullet(cx - 4, cy, 8, 8, -Math.sin(r4) * spd, -Math.cos(r4) * spd, 'player', 1, '#ff69b4', 'star'));
      bullets.push(new Bullet(cx - 4, cy, 8, 8,  Math.sin(r4) * spd, -Math.cos(r4) * spd, 'player', 1, '#ff69b4', 'star'));
      const hL = new Bullet(cx - 14, cy - 4, 8, 8, -spd * 0.55, -spd * 0.65, 'player', 1, '#cc00ff', 'heart');
      const hR = new Bullet(cx + 6,  cy - 4, 8, 8,  spd * 0.55, -spd * 0.65, 'player', 1, '#cc00ff', 'heart');
      hL.isHoming = true;
      hR.isHoming = true;
      bullets.push(hL, hR);

    } else if (lvl === 5) {
      // 5-way fan + 2 homing
      for (const deg of [-36, -18, 0, 18, 36]) {
        const r5 = deg * Math.PI / 180;
        bullets.push(new Bullet(cx - 4, cy, 8, 8, Math.sin(r5) * spd, -Math.cos(r5) * spd, 'player', 2, '#ffd700', 'star'));
      }
      const hL5 = new Bullet(cx - 14, cy - 4, 8, 8, -spd * 0.55, -spd * 0.65, 'player', 1, '#cc00ff', 'heart');
      const hR5 = new Bullet(cx + 6,  cy - 4, 8, 8,  spd * 0.55, -spd * 0.65, 'player', 1, '#cc00ff', 'heart');
      hL5.isHoming = true;
      hR5.isHoming = true;
      bullets.push(hL5, hR5);

    } else {
      // Level 6: 5-way fan + piercing center laser
      for (const deg of [-36, -18, 0, 18, 36]) {
        const r6 = deg * Math.PI / 180;
        bullets.push(new Bullet(cx - 4, cy, 8, 8, Math.sin(r6) * spd, -Math.cos(r6) * spd, 'player', 2, '#ffd700', 'star'));
      }
      const laser = new Bullet(cx - 2, cy - 25, 5, 50, 0, -650, 'player', 4, '#ffffff', 'laser');
      laser.piercing = true;
      bullets.push(laser);
    }

    return bullets;
  }

  takeDamage() {
    if (this.invincible) return false;
    this.health--;
    if (this.health <= 0) {
      this.lives--;
      this.health = this.maxHealth;
      this.shotLevel = 1;  // reset weapon level on death
    }
    this.invincible = true;
    this.invincibleTimer = INVINCIBILITY_TIME;
    return true; // damage was taken
  }

  draw(ctx) {
    drawPlayer(ctx, this);
  }
}

// ============================================================
// BULLET
// ============================================================
class Bullet {
  constructor(x, y, w, h, vx, vy, type, damage, color, shape) {
    this.x      = x;
    this.y      = y;
    this.width  = w;
    this.height = h;
    this.vx     = vx;
    this.vy     = vy;
    this.type     = type;   // 'player' | 'enemy'
    this.damage   = damage;
    this.color    = color;
    this.shape    = shape;  // 'star' | 'heart' | 'blob' | 'homing' | 'laser'
    this.isHoming = false;
    this.piercing = false;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  isOffscreen() {
    return this.x < -40 || this.x > CANVAS_W + 40 ||
           this.y < -40 || this.y > CANVAS_H + 40;
  }

  draw(ctx) {
    drawBullet(ctx, this);
  }
}

// ============================================================
// ENEMY
// ============================================================
class Enemy {
  constructor(type, x, y, formationX, formationY, config) {
    this.type       = type;
    this.x          = x;
    this.y          = y;
    this.width      = config.width;
    this.height     = config.height;
    this.health     = config.health;
    this.maxHealth  = config.health;
    this.speed      = config.speed;
    this.points     = config.points;
    this.colors     = config.colors;

    // Formation position
    this.formationX = formationX;
    this.formationY = formationY;

    // Movement state
    this.phase      = 'ENTERING';  // ENTERING | FORMATION | DIVING | RETURNING
    this.pathTimer  = 0;
    this.diveTimer  = 0;
    this.diveDelay  = randomRange(3, 9); // seconds before first dive
    this.diveCooldown = 0;
    this.diveAngle  = 0;
    this.diveSpeed  = this.speed * 2.5;

    // Entry arc control point (bezier)
    this.startX     = x;
    this.startY     = y;
    this.entryTime  = 0;
    this.entryDuration = 1.5 + Math.random() * 0.5;

    // Shooting
    this.shotCooldown = randomRange(2, 5);
    this.alive      = true;
  }

  update(dt, playerX, playerY) {
    this.pathTimer += dt;

    if (this.phase === 'ENTERING') {
      // Bezier arc from spawn to formation
      const t = Math.min(this.pathTimer / this.entryDuration, 1);
      const et = easeOutQuad(t);
      // Control point: midway between start and formation, offset sideways
      const cpx = (this.startX + this.formationX) / 2 + (this.startY < this.formationY ? 80 : -80);
      const cpy = (this.startY + this.formationY) / 2;
      this.x = (1 - et) * (1 - et) * this.startX + 2 * (1 - et) * et * cpx + et * et * this.formationX;
      this.y = (1 - et) * (1 - et) * this.startY + 2 * (1 - et) * et * cpy + et * et * this.formationY;
      if (t >= 1) {
        this.phase = 'FORMATION';
        this.pathTimer = 0;
      }
    } else if (this.phase === 'FORMATION') {
      // Gentle drift to follow formation (already at position)
      // Small oscillation
      this.x = this.formationX + Math.sin(this.pathTimer * 0.8 + this.formationX * 0.05) * 3;
      this.y = this.formationY + Math.sin(this.pathTimer * 0.6) * 2;
      // Dive check
      this.diveDelay -= dt;
      if (this.diveDelay <= 0) {
        this.phase = 'DIVING';
        this.diveAngle = angleTo(this.x, this.y, playerX, playerY);
        this.pathTimer = 0;
      }
    } else if (this.phase === 'DIVING') {
      this.x += Math.cos(this.diveAngle) * this.diveSpeed * dt;
      this.y += Math.sin(this.diveAngle) * this.diveSpeed * dt;
      if (this.y > CANVAS_H + 50 || this.x < -100 || this.x > CANVAS_W + 100) {
        // Teleport back above screen and re-enter
        this.x = this.formationX;
        this.y = -this.height - 20;
        this.startX = this.x;
        this.startY = this.y;
        this.entryDuration = 1.0;
        this.pathTimer = 0;
        this.phase = 'ENTERING';
        this.diveDelay = randomRange(4, 10);
      }
    }

    // Shooting
    this.shotCooldown -= dt;
    if (this.shotCooldown <= 0 && this.phase === 'DIVING') {
      this.shotCooldown = randomRange(1.5, 3.5);
      return this._createShot();
    }
    return null;
  }

  _createShot() {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height;
    return new Bullet(cx - 4, cy, 8, 8, 0, BULLET_SPEED_ENEMY, 'enemy', 1, '#ff9900', 'blob');
  }

  takeDamage(dmg) {
    this.health -= dmg || 1;
    if (this.health <= 0) { this.alive = false; }
    return !this.alive;
  }

  draw(ctx) {
    if (!this.alive) return;
    ctx.save();
    drawEnemyByType(ctx, this.x + this.width / 2, this.y + this.height / 2, this.type, this.colors, 1);
    // Health pip (only if damaged)
    if (this.health < this.maxHealth) {
      const barW = this.width * 0.8;
      const barX = this.x + this.width * 0.1;
      const barY = this.y + this.height + 3;
      ctx.fillStyle = '#440011';
      ctx.fillRect(barX, barY, barW, 3);
      ctx.fillStyle = '#ff3366';
      ctx.fillRect(barX, barY, barW * (this.health / this.maxHealth), 3);
    }
    ctx.restore();
  }
}

// ============================================================
// BOSS (extends Enemy)
// ============================================================
class Boss {
  constructor(bossType, config) {
    this.bossType     = bossType;
    this.config       = config;
    this.width        = config.width;
    this.height       = config.height;
    this.health       = config.health;
    this.maxHealth    = config.health;
    this.speed        = config.speed;
    this.points       = config.points;
    this.colors       = config.colors;

    this.x  = CANVAS_W / 2 - this.width / 2;
    this.y  = -this.height - 10;

    this.phase      = 1;
    this.phaseThreshold = config.health * 0.5;

    this.alive       = true;
    this.entering    = true;
    this.entryY      = 60;
    this.entrySpeed  = 80;

    this.moveTimer   = 0;
    this.moveDir     = 1;
    this.moveCycleTime = 3;
    this.shotTimer   = 0;
    this.shotRate    = 1.8;
    this.patternIndex = 0;
    this.patternTimer = 0;

    this.deathTimer  = null;
    this.name        = config.name;
  }

  update(dt, playerX, playerY) {
    if (this.deathTimer !== null) {
      this.deathTimer -= dt;
      return [];
    }

    // Entry
    if (this.entering) {
      this.y += this.entrySpeed * dt;
      if (this.y >= this.entryY) {
        this.y = this.entryY;
        this.entering = false;
      }
      return [];
    }

    // Phase transition
    if (this.phase === 1 && this.health <= this.phaseThreshold) {
      this.phase = 2;
      this.shotRate = 1.1;
      this.speed *= 1.4;
      this.moveCycleTime = 2;
    }

    // Movement (side to side, descend slightly in phase 2)
    this.moveTimer += dt;
    const cx = CANVAS_W / 2 - this.width / 2;
    const range = CANVAS_W * 0.25;
    this.x = cx + Math.sin(this.moveTimer / this.moveCycleTime * Math.PI * 2) * range;
    if (this.phase === 2) {
      this.y = this.entryY + Math.sin(this.moveTimer * 0.5) * 25;
    }
    this.x = clamp(this.x, 10, CANVAS_W - this.width - 10);

    // Shooting
    const bullets = [];
    this.shotTimer -= dt;
    if (this.shotTimer <= 0) {
      this.shotTimer = this.shotRate;
      const newBullets = this._shoot(playerX, playerY);
      bullets.push(...newBullets);
    }
    return bullets;
  }

  _shoot(playerX, playerY) {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height;
    const bullets = [];
    const patterns = this.phase === 1
      ? ['aimed', 'spread3', 'aimed']
      : ['spread5', 'homing', 'spread3', 'aimed', 'spread5'];

    const pat = patterns[this.patternIndex % patterns.length];
    this.patternIndex++;

    switch (pat) {
      case 'aimed': {
        const ang = angleTo(cx, cy, playerX, playerY);
        bullets.push(new Bullet(cx - 5, cy, 10, 10, Math.cos(ang) * BULLET_SPEED_BOSS, Math.sin(ang) * BULLET_SPEED_BOSS, 'enemy', 1, '#cc00cc', 'blob'));
        break;
      }
      case 'spread3': {
        for (const d of [-25, 0, 25]) {
          const ang = Math.PI / 2 + d * Math.PI / 180;
          bullets.push(new Bullet(cx - 5, cy, 10, 10, Math.cos(ang) * BULLET_SPEED_BOSS * 0.9, Math.sin(ang) * BULLET_SPEED_BOSS * 0.9, 'enemy', 1, '#ff6600', 'blob'));
        }
        break;
      }
      case 'spread5': {
        for (let i = -2; i <= 2; i++) {
          const ang = Math.PI / 2 + i * 20 * Math.PI / 180;
          bullets.push(new Bullet(cx - 5, cy, 10, 10, Math.cos(ang) * BULLET_SPEED_BOSS, Math.sin(ang) * BULLET_SPEED_BOSS, 'enemy', 1, '#ff3300', 'blob'));
        }
        break;
      }
      case 'homing': {
        const ang = angleTo(cx, cy, playerX, playerY);
        const b = new Bullet(cx - 6, cy, 12, 12, Math.cos(ang) * BULLET_SPEED_BOSS * 0.7, Math.sin(ang) * BULLET_SPEED_BOSS * 0.7, 'enemy', 1, '#ff00ff', 'homing');
        b._homingTarget = { x: playerX, y: playerY };
        bullets.push(b);
        // Plus two flanking aimed
        for (const d of [-30, 30]) {
          const fa = ang + d * Math.PI / 180;
          bullets.push(new Bullet(cx - 5, cy, 8, 8, Math.cos(fa) * BULLET_SPEED_BOSS, Math.sin(fa) * BULLET_SPEED_BOSS, 'enemy', 1, '#cc00cc', 'blob'));
        }
        break;
      }
    }
    return bullets;
  }

  takeDamage(dmg) {
    this.health -= dmg || 1;
    if (this.health <= 0 && this.alive) {
      this.alive = false;
      this.deathTimer = 2.5;
    }
    return !this.alive;
  }

  draw(ctx) {
    drawBoss(ctx, this);
  }
}

// ============================================================
// PARTICLE & PARTICLE SYSTEM
// ============================================================
class Particle {
  constructor(x, y, vx, vy, life, color, size, shape) {
    this.x      = x;
    this.y      = y;
    this.vx     = vx;
    this.vy     = vy;
    this.life   = life;
    this.maxLife= life;
    this.color  = color;
    this.size   = size;
    this.shape  = shape || 'circle'; // 'circle' | 'star' | 'heart'
    this.gravity= 60;
  }

  update(dt) {
    this.x  += this.vx * dt;
    this.y  += this.vy * dt;
    this.vy += this.gravity * dt;
    this.life -= dt;
  }

  isDead() { return this.life <= 0; }

  draw(ctx) {
    drawParticle(ctx, this);
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  emit(x, y, count, options) {
    const {
      colors      = ['#ffd700','#ff69b4','#ff3366','#ffffff'],
      shapes      = ['star','circle','heart'],
      speed       = 120,
      life        = 0.9,
      sizeMin     = 4,
      sizeMax     = 9,
      spread      = Math.PI * 2,
      gravity     = 60
    } = options || {};

    for (let i = 0; i < count; i++) {
      const ang = randomRange(-spread / 2, spread / 2) - Math.PI / 2;
      const spd = randomRange(speed * 0.4, speed);
      const p = new Particle(
        x + randomRange(-4, 4),
        y + randomRange(-4, 4),
        Math.cos(ang) * spd,
        Math.sin(ang) * spd,
        randomRange(life * 0.6, life * 1.4),
        randomChoice(colors),
        randomRange(sizeMin, sizeMax),
        randomChoice(shapes)
      );
      p.gravity = gravity;
      this.particles.push(p);
    }
  }

  update(dt) {
    this.particles = this.particles.filter(p => {
      p.update(dt);
      return !p.isDead();
    });
  }

  draw(ctx) {
    for (const p of this.particles) p.draw(ctx);
  }

  clear() { this.particles = []; }
}

// ============================================================
// POWER-UP
// ============================================================
class PowerUp {
  constructor(x, y, type) {
    this.x      = x;
    this.y      = y;
    this.width  = 20;
    this.height = 20;
    this.type   = type;
    this.vy     = POWERUP_FALL_SPEED;
    this.alive  = true;
    this.bobTimer = Math.random() * Math.PI * 2;
  }

  update(dt) {
    this.bobTimer += dt * 3;
    this.y += this.vy * dt;
    this.x += Math.sin(this.bobTimer) * 0.4;
    if (this.y > CANVAS_H + 30) this.alive = false;
  }

  draw(ctx) {
    drawPowerUp(ctx, this);
  }

  applyTo(player) {
    switch (this.type) {
      case 'weapon':
        player.shotLevel = Math.min((player.shotLevel || 1) + 1, 6);
        break;
      case 'health':
        player.health = Math.min(player.health + 1, player.maxHealth);
        break;
      case 'rainbow':
        player.invincible = true;
        player.invincibleTimer = Math.max(player.invincibleTimer, 4.0);
        player.health = Math.min(player.health + 1, player.maxHealth);
        break;
    }
  }
}
