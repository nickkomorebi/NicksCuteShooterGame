// ============================================================
// CONSTANTS.JS — All tunable game values
// ============================================================

const CANVAS_W = 480;
const CANVAS_H = 720;

// ---------- Character Configs ----------
const CHARACTER_CONFIGS = [
  {
    id: 'classic',
    name: 'Classic Kitty',
    colors: { head: '#ffffff', innerEar: '#ffb6c1', bow: '#ff0000', eyes: '#1a1a1a', nose: '#ffd700' },
    speed: 200,
    maxHealth: 3,
    fireRate: 0.25,
    shotType: 'single',
    statSpeed: 3, statPower: 3, statDefense: 3,
    description: 'Balanced fighter with upgradeable shots'
  },
  {
    id: 'pink',
    name: 'Pink Kitty',
    colors: { head: '#ffb6c1', innerEar: '#ff69b4', bow: '#ff00ff', eyes: '#1a1a1a', nose: '#ff69b4' },
    speed: 260,
    maxHealth: 2,
    fireRate: 0.18,
    shotType: 'double',
    statSpeed: 5, statPower: 4, statDefense: 1,
    description: 'Fast and fierce double shooter'
  },
  {
    id: 'blue',
    name: 'Blue Kitty',
    colors: { head: '#87ceeb', innerEar: '#00bfff', bow: '#008080', eyes: '#1a1a1a', nose: '#00bfff' },
    speed: 160,
    maxHealth: 5,
    fireRate: 0.35,
    shotType: 'spread',
    statSpeed: 1, statPower: 3, statDefense: 5,
    description: 'Tough defender with spread shots'
  },
  {
    id: 'golden',
    name: 'Golden Kitty',
    colors: { head: '#ffd700', innerEar: '#ffa500', bow: '#ffff00', eyes: '#1a1a1a', nose: '#ff6600' },
    speed: 200,
    maxHealth: 3,
    fireRate: 0.30,
    shotType: 'starburst',
    statSpeed: 3, statPower: 5, statDefense: 3,
    description: 'Star burst 8-direction shots'
  }
];

// ---------- Enemy Type Configs ----------
const ENEMY_CONFIGS = {
  puddingPal: {
    width: 36, height: 36,
    health: 2, speed: 70, points: 100,
    colors: { main: '#ffd700', ear: '#ffed85', cheek: '#ffb347', eye: '#1a1a1a', nose: '#8b4513' }
  },
  floppyPup: {
    width: 38, height: 40,
    health: 3, speed: 55, points: 150,
    colors: { main: '#ffffff', ear: '#87ceeb', cheek: '#ffb6c1', eye: '#87ceeb', nose: '#ffb6c1' }
  },
  grumpGrunt: {
    width: 34, height: 38,
    health: 2, speed: 75, points: 120,
    colors: { main: '#1a1a2e', belly: '#2d2d4e', eye: '#ffffff', pupil: '#000000', beak: '#ffd700', hair: '#000000' }
  },
  rosyBunny: {
    width: 36, height: 42,
    health: 3, speed: 50, points: 150,
    colors: { main: '#ffb6c1', hood: '#ff69b4', hoodInner: '#ffffff', ear: '#ffffff', eye: '#1a1a1a' }
  },
  ribbsworth: {
    width: 38, height: 34,
    health: 2, speed: 65, points: 130,
    colors: { main: '#5cb85c', eyeWhite: '#ffffff', pupil: '#1a1a1a', mouth: '#ff69b4', belly: '#90ee90' }
  },
  dapperSam: {
    width: 36, height: 42,
    health: 4, speed: 50, points: 160,
    colors: { main: '#2060a0', belly: '#ffffff', beak: '#ff8c00', bowtie: '#ff0000', eye: '#ffffff', pupil: '#1a1a1a' }
  },
  chocolato: {
    width: 36, height: 36,
    health: 3, speed: 60, points: 140,
    colors: { main: '#1a1a1a', innerEar: '#3a2020', eye: '#1a1a1a', nose: '#6b3a00', whisker: '#888' }
  }
};

// ---------- Boss Configs ----------
const BOSS_CONFIGS = {
  sirPuddington: {
    name: 'Sir Puddington',
    width: 100, height: 90,
    health: 300, speed: 60, points: 3000,
    colors: { main: '#ffd700', hatTop: '#a0522d', hatBrim: '#8b4513', hatBand: '#ffffff', eye: '#1a1a1a', cheek: '#ffb347', nose: '#8b4513' }
  },
  floppsworth: {
    name: 'Floppsworth',
    width: 110, height: 100,
    health: 400, speed: 70, points: 4000,
    colors: { main: '#ffffff', ear: '#ffb6c1', earInner: '#ff69b4', eye: '#87ceeb', pupil: '#1a1a1a', cheek: '#ffb6c1', tail: '#87ceeb', wing: '#d0e8ff' }
  },
  rosieHood: {
    name: 'Rosie Hood',
    width: 110, height: 100,
    health: 400, speed: 65, points: 4000,
    colors: { main: '#ffb6c1', hood: '#ff69b4', hoodInner: '#ffffff', ear: '#ffffff', eye: '#1a1a1a', flower: '#ff0000', flowerCenter: '#ffd700' }
  },
  grumpwing: {
    name: 'Grumpwing',
    width: 100, height: 110,
    health: 500, speed: 75, points: 5000,
    colors: { main: '#1a1a2e', belly: '#2d2d4e', eye: '#ffffff', pupil: '#cc0000', beak: '#ffd700', hair: '#000022', crown: '#9400d3', crownGem: '#ff69b4' }
  },
  hexabun: {
    name: 'Hexabun',
    width: 110, height: 110,
    health: 600, speed: 80, points: 6000,
    colors: { main: '#ffffff', hood: '#2d2d2d', hoodLining: '#ff69b4', skull: '#ffffff', skullEye: '#1a1a1a', ear: '#ff69b4', eye: '#9400d3', cheek: '#ff69b4' }
  }
};

// ---------- Power-Up Types ----------
const POWERUP_TYPES = ['weapon', 'health', 'rainbow'];
const POWERUP_COLORS = { weapon: '#ff69b4', health: '#ff3366', rainbow: '#ff6600' };
const POWERUP_FALL_SPEED = 80;

// ---------- Drop Chances ----------
const WEAPON_DROP_CHANCE  = 0.38;
const HEALTH_DROP_CHANCE  = 0.12;
const RAINBOW_DROP_CHANCE = 0.04;

// ---------- Bullet ----------
const BULLET_SPEED_PLAYER = 430;
const BULLET_SPEED_ENEMY  = 160;
const BULLET_SPEED_BOSS   = 190;

// ---------- Physics / Timing ----------
const SCROLL_SPEED_BASE   = 55;   // px/s
const INVINCIBILITY_TIME  = 2.0;  // seconds
const PLAYER_WIDTH        = 40;
const PLAYER_HEIGHT       = 44;

// ---------- Colors ----------
const COLOR_BG            = '#12001e';
const COLOR_HUD_TEXT      = '#ffffff';
const COLOR_SCORE_SHADOW  = '#ff69b4';
const COLOR_HEALTH_BAR    = '#ff3366';
const COLOR_HEALTH_EMPTY  = '#440011';
const COLOR_BOSS_BAR      = '#cc00cc';

// ---------- Scoring ----------
const SPEED_BONUS_BASE    = 5000;  // max speed bonus (cleared in <100s)
const SPEED_BONUS_DECAY   = 50;    // pts lost per second over 100s
const BOSS_KILL_BONUS     = 1000;
