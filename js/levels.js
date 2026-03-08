// ============================================================
// LEVELS.JS — Level definitions, wave data, background configs
// ============================================================

// Formation helpers — returns array of {x, y} positions
function formationPositions(type, count, centerX, centerY, spacingX, spacingY) {
  const positions = [];
  spacingX = spacingX || 50;
  spacingY = spacingY || 50;

  switch (type) {
    case 'line': {
      const total = count;
      for (let i = 0; i < total; i++) {
        positions.push({
          x: centerX + (i - (total - 1) / 2) * spacingX,
          y: centerY
        });
      }
      break;
    }
    case 'V': {
      const half = Math.ceil(count / 2);
      for (let i = 0; i < count; i++) {
        const side = i < half ? -1 : 1;
        const idx  = i < half ? i : i - half;
        positions.push({
          x: centerX + side * (idx + 0.5) * spacingX * 0.7,
          y: centerY + idx * spacingY * 0.55
        });
      }
      break;
    }
    case 'grid': {
      const cols = Math.ceil(Math.sqrt(count));
      for (let i = 0; i < count; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        positions.push({
          x: centerX + (col - (cols - 1) / 2) * spacingX,
          y: centerY + row * spacingY
        });
      }
      break;
    }
    case 'diamond': {
      // Approximation: top, sides, bottom
      const rows = Math.ceil(Math.sqrt(count));
      let placed = 0;
      for (let r = 0; r < rows && placed < count; r++) {
        const colCount = r < rows / 2 ? r * 2 + 1 : (rows - r) * 2 + 1;
        const actualCols = Math.min(colCount, count - placed);
        for (let c = 0; c < actualCols && placed < count; c++) {
          positions.push({
            x: centerX + (c - (actualCols - 1) / 2) * spacingX,
            y: centerY + r * spacingY * 0.7
          });
          placed++;
        }
      }
      break;
    }
  }
  return positions;
}

// Generate a spawn position (off-screen start)
function spawnPos(entryFrom, index, total) {
  switch (entryFrom) {
    case 'top':   return { x: randomRange(80, CANVAS_W - 80), y: -50 };
    case 'left':  return { x: -50, y: randomRange(60, 280) };
    case 'right': return { x: CANVAS_W + 50, y: randomRange(60, 280) };
    case 'topLeft':  return { x: -50, y: -50 };
    case 'topRight': return { x: CANVAS_W + 50, y: -50 };
    default:      return { x: randomRange(80, CANVAS_W - 80), y: -50 };
  }
}

// Build enemy wave objects from a wave definition
// levelIndex and waveIndex (both 0-based) drive the HP scaling multiplier
function buildWave(waveDef, levelIndex, waveIndex) {
  levelIndex = levelIndex || 0;
  waveIndex  = waveIndex  || 0;
  const hpMult = (1 + 0.2 * levelIndex) * (1 + 0.25 * waveIndex);

  const enemies = [];
  for (const group of waveDef.groups) {
    const config = ENEMY_CONFIGS[group.type];
    if (!config) continue;
    // Scale HP for this wave, keep everything else the same
    const scaledConfig = Object.assign({}, config, {
      health: Math.max(1, Math.round(config.health * hpMult))
    });
    const positions = formationPositions(group.formation, group.count, group.cx, group.cy, group.sx, group.sy);
    for (let i = 0; i < positions.length; i++) {
      const spawn = spawnPos(group.entryFrom, i, positions.length);
      enemies.push(new Enemy(group.type, spawn.x, spawn.y, positions[i].x, positions[i].y, scaledConfig));
    }
  }
  return enemies;
}

// ============================================================
// LEVEL DEFINITIONS
// ============================================================

const LEVEL_DEFS = [
  // ---- LEVEL 1: Sweetheart Meadows ----
  {
    name:    'Sweetheart Meadows',
    bgLevel: 1,
    bossType: 'sirPuddington',
    waves: [
      {
        delay: 1.5,
        groups: [
          { type: 'puddingPal', count: 5, formation: 'V',    entryFrom: 'top',   cx: 240, cy: 130, sx: 55, sy: 48 }
        ]
      },
      {
        delay: 1.0,
        groups: [
          { type: 'puddingPal', count: 4, formation: 'line', entryFrom: 'left',  cx: 200, cy: 100, sx: 58, sy: 50 },
          { type: 'puddingPal', count: 4, formation: 'line', entryFrom: 'right', cx: 280, cy: 160, sx: 58, sy: 50 }
        ]
      },
      {
        delay: 1.0,
        groups: [
          { type: 'puddingPal', count: 6, formation: 'grid', entryFrom: 'top',   cx: 240, cy: 120, sx: 58, sy: 55 }
        ]
      }
    ]
  },

  // ---- LEVEL 2: Rainbow Sky ----
  {
    name:    'Rainbow Sky',
    bgLevel: 2,
    bossType: 'floppsworth',
    waves: [
      {
        delay: 1.5,
        groups: [
          { type: 'floppyPup', count: 5, formation: 'line',  entryFrom: 'top',   cx: 240, cy: 100, sx: 60, sy: 52 }
        ]
      },
      {
        delay: 1.0,
        groups: [
          { type: 'grumpGrunt', count: 4, formation: 'V',   entryFrom: 'left',  cx: 180, cy: 120, sx: 55, sy: 50 },
          { type: 'floppyPup',   count: 3, formation: 'line', entryFrom: 'right', cx: 320, cy: 100, sx: 58, sy: 50 }
        ]
      },
      {
        delay: 1.0,
        groups: [
          { type: 'floppyPup',   count: 4, formation: 'grid', entryFrom: 'top',  cx: 160, cy: 115, sx: 56, sy: 52 },
          { type: 'grumpGrunt', count: 4, formation: 'grid', entryFrom: 'top',  cx: 320, cy: 115, sx: 56, sy: 52 }
        ]
      }
    ]
  },

  // ---- LEVEL 3: Star Forest ----
  {
    name:    'Star Forest',
    bgLevel: 3,
    bossType: 'rosieHood',
    waves: [
      {
        delay: 1.5,
        groups: [
          { type: 'rosyBunny', count: 5, formation: 'V',    entryFrom: 'top',  cx: 240, cy: 110, sx: 58, sy: 52 }
        ]
      },
      {
        delay: 1.0,
        groups: [
          { type: 'ribbsworth',     count: 4, formation: 'line', entryFrom: 'left', cx: 180, cy: 105, sx: 58, sy: 52 },
          { type: 'rosyBunny', count: 4, formation: 'line', entryFrom: 'right',cx: 320, cy: 105, sx: 58, sy: 52 }
        ]
      },
      {
        delay: 1.0,
        groups: [
          { type: 'rosyBunny', count: 3, formation: 'line', entryFrom: 'top',  cx: 180, cy:  90, sx: 58, sy: 50 },
          { type: 'ribbsworth',     count: 3, formation: 'line', entryFrom: 'top',  cx: 300, cy:  90, sx: 58, sy: 50 }
        ]
      },
      {
        delay: 1.0,
        groups: [
          { type: 'rosyBunny', count: 6, formation: 'diamond', entryFrom: 'top', cx: 240, cy: 120, sx: 58, sy: 52 }
        ]
      }
    ]
  },

  // ---- LEVEL 4: Ocean Deep ----
  {
    name:    'Ocean Deep',
    bgLevel: 4,
    bossType: 'grumpwing',
    waves: [
      {
        delay: 1.5,
        groups: [
          { type: 'dapperSam', count: 5, formation: 'V',    entryFrom: 'top',  cx: 240, cy: 110, sx: 58, sy: 52 }
        ]
      },
      {
        delay: 1.0,
        groups: [
          { type: 'chocolato',  count: 4, formation: 'grid', entryFrom: 'left', cx: 160, cy: 110, sx: 56, sy: 52 },
          { type: 'dapperSam', count: 4, formation: 'grid', entryFrom: 'right',cx: 320, cy: 110, sx: 56, sy: 52 }
        ]
      },
      {
        delay: 1.0,
        groups: [
          { type: 'dapperSam', count: 3, formation: 'line', entryFrom: 'top',  cx: 170, cy:  95, sx: 58, sy: 50 },
          { type: 'chocolato',  count: 3, formation: 'line', entryFrom: 'top',  cx: 310, cy:  95, sx: 58, sy: 50 }
        ]
      },
      {
        delay: 1.0,
        groups: [
          { type: 'chocolato',  count: 7, formation: 'diamond', entryFrom: 'top', cx: 240, cy: 120, sx: 58, sy: 52 }
        ]
      }
    ]
  },

  // ---- LEVEL 5: Starlight Castle ----
  {
    name:    'Starlight Castle',
    bgLevel: 5,
    bossType: 'hexabun',
    waves: [
      {
        delay: 1.5,
        groups: [
          { type: 'puddingPal',   count: 4, formation: 'line',    entryFrom: 'top',   cx: 240, cy: 100, sx: 58, sy: 52 },
          { type: 'grumpGrunt',  count: 3, formation: 'V',       entryFrom: 'left',  cx: 140, cy: 120, sx: 58, sy: 50 }
        ]
      },
      {
        delay: 1.0,
        groups: [
          { type: 'rosyBunny', count: 4, formation: 'grid',    entryFrom: 'right', cx: 340, cy: 110, sx: 56, sy: 52 },
          { type: 'ribbsworth',     count: 4, formation: 'line',    entryFrom: 'top',   cx: 180, cy: 100, sx: 58, sy: 50 }
        ]
      },
      {
        delay: 1.0,
        groups: [
          { type: 'dapperSam',   count: 3, formation: 'line',    entryFrom: 'left',  cx: 150, cy: 105, sx: 58, sy: 50 },
          { type: 'chocolato',    count: 3, formation: 'line',    entryFrom: 'right', cx: 330, cy: 105, sx: 58, sy: 50 },
          { type: 'floppyPup',    count: 3, formation: 'line',    entryFrom: 'top',   cx: 240, cy:  90, sx: 58, sy: 50 }
        ]
      },
      {
        delay: 1.0,
        groups: [
          { type: 'puddingPal',   count: 4, formation: 'diamond', entryFrom: 'top',   cx: 140, cy: 110, sx: 56, sy: 50 },
          { type: 'chocolato',    count: 4, formation: 'diamond', entryFrom: 'top',   cx: 340, cy: 110, sx: 56, sy: 50 }
        ]
      },
      {
        delay: 1.0,
        groups: [
          { type: 'rosyBunny', count: 8, formation: 'grid',    entryFrom: 'top',   cx: 240, cy: 110, sx: 56, sy: 52 }
        ]
      }
    ]
  }
];

// ============================================================
// BACKGROUND ELEMENT GENERATORS
// ============================================================

function createBGState(levelNum) {
  const bg = { far: [], mid: [], near: [] };

  // palette: optional array — each element gets a stable random color from it
  const populate = (arr, count, minSize, maxSize, palette) => {
    for (let i = 0; i < count * 2; i++) {
      arr.push({
        x: randomRange(0, CANVAS_W),
        y: randomRange(-CANVAS_H, CANVAS_H),
        size: randomRange(minSize, maxSize),
        color: palette ? randomChoice(palette) : null,
        vy: 0
      });
    }
  };

  const FLOWER_COLS = ['#ff69b4','#ff99cc','#ffb6c1','#ff1493','#ffd700'];
  const STAR_COLS   = ['#ffffff','#fffacd','#ffd700','#aaddff'];

  switch (levelNum) {
    case 1:
      populate(bg.far,  10, 25, 45, null);         // clouds
      populate(bg.mid,  12, 12, 22, FLOWER_COLS);  // flowers — stable color!
      populate(bg.near, 15,  6, 12, null);          // petals
      break;
    case 2:
      populate(bg.far,   5, 80, 130, null);         // rainbow arcs
      populate(bg.mid,   8, 20,  38, null);         // clouds
      populate(bg.near, 20,  4,   8, STAR_COLS);    // stars
      break;
    case 3:
      populate(bg.far,  30, 3,  7, STAR_COLS);      // stars
      populate(bg.mid,   8, 18, 32, null);           // trees
      populate(bg.near, 15, 2,  5, STAR_COLS);      // small stars
      break;
    case 4:
      populate(bg.far,  20,  8, 18, null);           // bubbles
      populate(bg.mid,   8, 14, 24, null);           // seaweed
      populate(bg.near, 15,  4, 10, null);           // small bubbles
      break;
    case 5:
      populate(bg.far,  30, 3, 6, STAR_COLS);        // stars
      populate(bg.mid,   6, 22, 40, null);            // turrets
      populate(bg.near, 20, 2,  5, STAR_COLS);       // tiny stars
      break;
  }

  return bg;
}

function updateBGState(bgState, dt, levelNum) {
  const speeds = { far: 20, mid: 45, near: 70 };

  for (const [layer, spd] of Object.entries(speeds)) {
    for (const el of bgState[layer]) {
      el.y += spd * dt;
      if (el.y > CANVAS_H + 80) {
        el.y = -80 - Math.random() * 60;
        el.x = randomRange(0, CANVAS_W);
      }
    }
  }
}
