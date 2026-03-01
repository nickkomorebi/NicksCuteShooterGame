// ============================================================
// RENDERER.JS — All Canvas 2D drawing functions
// ============================================================

// ---- Helpers ----

function _outline(ctx, color, width) {
  ctx.strokeStyle = color || '#000';
  ctx.lineWidth = width || 1.5;
}

// Overlay highlight + shadow on a circle to give it a 3D sphere look
function _addSphereDepth(ctx, cx, cy, r) {
  // White highlight (upper-left quadrant)
  const hl = ctx.createRadialGradient(cx - r * 0.28, cy - r * 0.3, 0, cx, cy, r);
  hl.addColorStop(0, 'rgba(255,255,255,0.48)');
  hl.addColorStop(0.42, 'rgba(255,255,255,0.12)');
  hl.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hl;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  // Dark shadow (lower-right edge)
  const sh = ctx.createRadialGradient(cx, cy, r * 0.45, cx + r * 0.15, cy + r * 0.2, r * 1.05);
  sh.addColorStop(0, 'rgba(0,0,0,0)');
  sh.addColorStop(1, 'rgba(0,0,0,0.22)');
  ctx.fillStyle = sh;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

// Draw a bow (Hello Kitty-style) centered at cx,cy with radius r
function drawBow(ctx, cx, cy, r, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 1;
  // Left loop
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.65, cy, r * 0.55, r * 0.38, -0.25, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // Right loop
  ctx.beginPath();
  ctx.ellipse(cx + r * 0.65, cy, r * 0.55, r * 0.38, 0.25, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // Center knot
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.22, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // Highlight on loops
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.75, cy - r * 0.1, r * 0.18, r * 0.1, -0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + r * 0.55, cy - r * 0.1, r * 0.18, r * 0.1, 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Draw Hello Kitty-style cat head/body at (cx, cy) with head radius r
function drawKittyCharacter(ctx, cx, cy, r, colors, bobOffset) {
  bobOffset = bobOffset || 0;
  const by = cy + bobOffset;

  ctx.save();

  // ---- BODY ----
  ctx.fillStyle = colors.head;
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(cx, by + r * 1.35, r * 0.65, r * 0.55, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  // Arms
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.75, by + r * 1.4, r * 0.2, r * 0.38, -0.4, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx + r * 0.75, by + r * 1.4, r * 0.2, r * 0.38, 0.4, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  // Belly circle (lighter)
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.ellipse(cx, by + r * 1.4, r * 0.38, r * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  // ---- HEAD ----
  ctx.fillStyle = colors.head;
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, by, r, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  _addSphereDepth(ctx, cx, by, r);

  // ---- EARS ----
  // Left ear outer
  ctx.fillStyle = colors.head;
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.55, by - r * 0.7);
  ctx.lineTo(cx - r * 0.9, by - r * 1.38);
  ctx.lineTo(cx - r * 0.15, by - r * 1.1);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  // Left ear inner
  ctx.fillStyle = colors.innerEar;
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.54, by - r * 0.74);
  ctx.lineTo(cx - r * 0.82, by - r * 1.26);
  ctx.lineTo(cx - r * 0.22, by - r * 1.05);
  ctx.closePath();
  ctx.fill();

  // Right ear outer
  ctx.fillStyle = colors.head;
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.55, by - r * 0.7);
  ctx.lineTo(cx + r * 0.9, by - r * 1.38);
  ctx.lineTo(cx + r * 0.15, by - r * 1.1);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  // Right ear inner
  ctx.fillStyle = colors.innerEar;
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.54, by - r * 0.74);
  ctx.lineTo(cx + r * 0.82, by - r * 1.26);
  ctx.lineTo(cx + r * 0.22, by - r * 1.05);
  ctx.closePath();
  ctx.fill();

  // ---- EYES ----
  ctx.fillStyle = colors.eyes;
  ctx.beginPath();
  ctx.arc(cx - r * 0.28, by - r * 0.08, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.28, by - r * 0.08, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Eye shine
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.arc(cx - r * 0.25, by - r * 0.12, r * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.31, by - r * 0.12, r * 0.04, 0, Math.PI * 2);
  ctx.fill();

  // ---- NOSE ----
  ctx.fillStyle = colors.nose || '#ffd700';
  ctx.beginPath();
  ctx.ellipse(cx, by + r * 0.12, r * 0.09, r * 0.065, 0, 0, Math.PI * 2);
  ctx.fill();

  // ---- WHISKERS ----
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1;
  for (let i = -1; i <= 1; i++) {
    const wy = by + r * 0.08 + i * r * 0.12;
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.18, wy);
    ctx.lineTo(cx - r * 0.82, wy + i * r * 0.05);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + r * 0.18, wy);
    ctx.lineTo(cx + r * 0.82, wy + i * r * 0.05);
    ctx.stroke();
  }

  // ---- BOW (top-left of head — correct Hello Kitty placement) ----
  drawBow(ctx, cx - r * 0.52, by - r * 0.82, r * 0.28, colors.bow);

  ctx.restore();
}

// ============================================================
// PLAYER DRAWING
// ============================================================
function drawPlayer(ctx, player) {
  const cx = player.x + player.width / 2;
  const cy = player.y + player.height / 2;
  const r = 16;
  const colors = player.character.colors;

  ctx.save();

  // Invincibility flash (~3.5 Hz, gentle)
  if (player.invincible && Math.floor(player.invincibleTimer * 3.5) % 2 === 0) {
    ctx.globalAlpha = 0.35;
  }

  drawKittyCharacter(ctx, cx, cy, r, colors, 0);

  // Engine glow underneath
  const grad = ctx.createRadialGradient(cx, cy + r * 2, 2, cx, cy + r * 2, r * 0.9);
  grad.addColorStop(0, 'rgba(255,150,255,0.8)');
  grad.addColorStop(1, 'rgba(255,100,200,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 2.1, r * 0.5, r * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ============================================================
// ENEMY DRAWING
// ============================================================

function drawEnemyByType(ctx, x, y, type, colors, scale) {
  scale = scale || 1;
  const cx = x, cy = y;
  switch (type) {
    case 'pompomPal':    drawPompomPal(ctx, cx, cy, scale, colors); break;
    case 'cinnaPup':     drawCinnaPup(ctx, cx, cy, scale, colors); break;
    case 'badtzGrunt':   drawBadtzGrunt(ctx, cx, cy, scale, colors); break;
    case 'melodyBunny':  drawMelodyBunny(ctx, cx, cy, scale, colors); break;
    case 'keroppi':      drawKeroppi(ctx, cx, cy, scale, colors); break;
    case 'tuxedoSam':    drawTuxedoSam(ctx, cx, cy, scale, colors); break;
    case 'chococat':     drawChococat(ctx, cx, cy, scale, colors); break;
    default: drawPompomPal(ctx, cx, cy, scale, colors);
  }
}

// Pompom Pal — golden hamster (mini Pompompurin)
function drawPompomPal(ctx, cx, cy, s, c) {
  ctx.save();
  ctx.scale(s, s);
  const x = cx / s, y = cy / s;
  const r = 14;
  // Body
  ctx.fillStyle = c.main;
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  _addSphereDepth(ctx, x, y, r);
  // Ears
  ctx.beginPath();
  ctx.arc(x - r * 0.7, y - r * 0.7, r * 0.35, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + r * 0.7, y - r * 0.7, r * 0.35, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // Inner ears
  ctx.fillStyle = c.ear;
  ctx.beginPath();
  ctx.arc(x - r * 0.7, y - r * 0.7, r * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.7, y - r * 0.7, r * 0.2, 0, Math.PI * 2);
  ctx.fill();
  // Cheeks
  ctx.fillStyle = c.cheek;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.arc(x - r * 0.55, y + r * 0.15, r * 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.55, y + r * 0.15, r * 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // Eyes
  ctx.fillStyle = c.eye;
  ctx.beginPath();
  ctx.arc(x - r * 0.3, y - r * 0.1, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.3, y - r * 0.1, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
  // Eye shine
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x - r * 0.27, y - r * 0.15, r * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.33, y - r * 0.15, r * 0.05, 0, Math.PI * 2);
  ctx.fill();
  // Nose
  ctx.fillStyle = c.nose;
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.15, r * 0.09, r * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
  // Happy smile
  ctx.strokeStyle = c.nose;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y + r * 0.22, r * 0.2, 0.1, Math.PI - 0.1);
  ctx.stroke();
  ctx.restore();
}

// Cinna-Pup — Cinnamoroll-style dog
function drawCinnaPup(ctx, cx, cy, s, c) {
  ctx.save();
  ctx.scale(s, s);
  const x = cx / s, y = cy / s;
  const r = 14;
  // Big floppy ears (behind head)
  ctx.fillStyle = c.ear;
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(x - r * 0.95, y + r * 0.5, r * 0.5, r * 0.9, -0.3, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(x + r * 0.95, y + r * 0.5, r * 0.5, r * 0.9, 0.3, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // Head
  ctx.fillStyle = c.main;
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  _addSphereDepth(ctx, x, y, r);
  // Cheeks
  ctx.fillStyle = c.cheek;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.arc(x - r * 0.55, y + r * 0.2, r * 0.24, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.55, y + r * 0.2, r * 0.24, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // Eyes (large, blue)
  ctx.fillStyle = c.eye;
  ctx.beginPath();
  ctx.arc(x - r * 0.28, y - r * 0.05, r * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.28, y - r * 0.05, r * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.arc(x - r * 0.28, y - r * 0.05, r * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.28, y - r * 0.05, r * 0.09, 0, Math.PI * 2);
  ctx.fill();
  // Eye shine
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x - r * 0.24, y - r * 0.1, r * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.32, y - r * 0.1, r * 0.05, 0, Math.PI * 2);
  ctx.fill();
  // Nose
  ctx.fillStyle = c.nose;
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.18, r * 0.1, r * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  // Tiny wings
  ctx.fillStyle = c.wing || '#d0e8ff';
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.ellipse(x - r * 0.9, y - r * 0.2, r * 0.35, r * 0.2, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + r * 0.9, y - r * 0.2, r * 0.35, r * 0.2, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}

// Badtz-Grunt — punk penguin
function drawBadtzGrunt(ctx, cx, cy, s, c) {
  ctx.save();
  ctx.scale(s, s);
  const x = cx / s, y = cy / s;
  const r = 13;
  // Body (penguin body shape)
  ctx.fillStyle = c.main;
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(x, y + r * 0.1, r * 0.8, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // White belly
  ctx.fillStyle = c.belly || '#2d2d4e';
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.3, r * 0.45, r * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  // Head
  ctx.fillStyle = c.main;
  ctx.beginPath();
  ctx.arc(x, y - r * 0.45, r * 0.75, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  _addSphereDepth(ctx, x, y - r * 0.45, r * 0.75);
  // Spiky hair
  ctx.fillStyle = '#000022';
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * r * 0.3, y - r * 1.1);
    ctx.lineTo(x + i * r * 0.5 - r * 0.1, y - r * 1.65);
    ctx.lineTo(x + i * r * 0.5 + r * 0.1, y - r * 1.65);
    ctx.closePath();
    ctx.fill();
  }
  // Eyes (white with dot pupils)
  ctx.fillStyle = c.eye;
  ctx.beginPath();
  ctx.arc(x - r * 0.28, y - r * 0.55, r * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.28, y - r * 0.55, r * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = c.pupil;
  ctx.beginPath();
  ctx.arc(x - r * 0.26, y - r * 0.53, r * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.3, y - r * 0.53, r * 0.09, 0, Math.PI * 2);
  ctx.fill();
  // Beak
  ctx.fillStyle = c.beak;
  ctx.beginPath();
  ctx.moveTo(x - r * 0.12, y - r * 0.35);
  ctx.lineTo(x + r * 0.12, y - r * 0.35);
  ctx.lineTo(x, y - r * 0.12);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// Melody Bunny — My Melody-style
function drawMelodyBunny(ctx, cx, cy, s, c) {
  ctx.save();
  ctx.scale(s, s);
  const x = cx / s, y = cy / s;
  const r = 14;
  // Bunny ears (peeking out of hood)
  ctx.fillStyle = c.ear;
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(x - r * 0.35, y - r * 1.35, r * 0.2, r * 0.55, -0.15, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(x + r * 0.35, y - r * 1.35, r * 0.2, r * 0.55, 0.15, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // Inner ears
  ctx.fillStyle = c.hoodInner || '#ffb6c1';
  ctx.beginPath();
  ctx.ellipse(x - r * 0.35, y - r * 1.35, r * 0.1, r * 0.38, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + r * 0.35, y - r * 1.35, r * 0.1, r * 0.38, 0.15, 0, Math.PI * 2);
  ctx.fill();
  // Hood
  ctx.fillStyle = c.hood;
  ctx.beginPath();
  ctx.arc(x, y, r, Math.PI, 0, false);
  ctx.lineTo(x + r * 1.1, y + r * 0.3);
  ctx.arc(x, y + r * 0.3, r * 1.1, 0, Math.PI, false);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  // Face circle inside hood
  ctx.fillStyle = c.main;
  ctx.beginPath();
  ctx.arc(x, y + r * 0.1, r * 0.78, 0, Math.PI * 2);
  ctx.fill();
  _addSphereDepth(ctx, x, y + r * 0.1, r * 0.78);
  // Eyes
  ctx.fillStyle = c.eye;
  ctx.beginPath();
  ctx.arc(x - r * 0.25, y, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.25, y, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Nose/mouth
  ctx.fillStyle = '#ff69b4';
  ctx.beginPath();
  ctx.arc(x, y + r * 0.22, r * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Keroppi — frog
function drawKeroppi(ctx, cx, cy, s, c) {
  ctx.save();
  ctx.scale(s, s);
  const x = cx / s, y = cy / s;
  const r = 13;
  // Big dome head
  ctx.fillStyle = c.main;
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  _addSphereDepth(ctx, x, y, r);
  // Lighter belly area
  ctx.fillStyle = c.belly;
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.35, r * 0.65, r * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  // Big goggle eyes on top
  ctx.fillStyle = c.eyeWhite;
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.arc(x - r * 0.4, y - r * 0.65, r * 0.32, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + r * 0.4, y - r * 0.65, r * 0.32, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = c.pupil;
  ctx.beginPath();
  ctx.arc(x - r * 0.38, y - r * 0.63, r * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.42, y - r * 0.63, r * 0.18, 0, Math.PI * 2);
  ctx.fill();
  // Eye shine
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x - r * 0.33, y - r * 0.7, r * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.47, y - r * 0.7, r * 0.07, 0, Math.PI * 2);
  ctx.fill();
  // Mouth
  ctx.strokeStyle = c.mouth;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y + r * 0.3, r * 0.45, 0.15, Math.PI - 0.15);
  ctx.stroke();
  ctx.restore();
}

// Tuxedo Sam — formal penguin
function drawTuxedoSam(ctx, cx, cy, s, c) {
  ctx.save();
  ctx.scale(s, s);
  const x = cx / s, y = cy / s;
  const r = 13;
  // Body
  ctx.fillStyle = c.main;
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.25, r * 0.8, r * 0.9, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // White belly
  ctx.fillStyle = c.belly;
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.4, r * 0.45, r * 0.65, 0, 0, Math.PI * 2);
  ctx.fill();
  // Bowtie
  ctx.fillStyle = c.bowtie;
  ctx.beginPath();
  ctx.moveTo(x - r * 0.22, y + r * 0.05);
  ctx.lineTo(x, y + r * 0.15);
  ctx.lineTo(x - r * 0.22, y + r * 0.25);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + r * 0.22, y + r * 0.05);
  ctx.lineTo(x, y + r * 0.15);
  ctx.lineTo(x + r * 0.22, y + r * 0.25);
  ctx.closePath();
  ctx.fill();
  // Head
  ctx.fillStyle = c.main;
  ctx.beginPath();
  ctx.arc(x, y - r * 0.6, r * 0.7, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  _addSphereDepth(ctx, x, y - r * 0.6, r * 0.7);
  // Beak
  ctx.fillStyle = c.beak;
  ctx.beginPath();
  ctx.moveTo(x - r * 0.15, y - r * 0.5);
  ctx.lineTo(x + r * 0.15, y - r * 0.5);
  ctx.lineTo(x, y - r * 0.28);
  ctx.closePath();
  ctx.fill();
  // Eyes
  ctx.fillStyle = c.eye;
  ctx.beginPath();
  ctx.arc(x - r * 0.28, y - r * 0.72, r * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.28, y - r * 0.72, r * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = c.pupil;
  ctx.beginPath();
  ctx.arc(x - r * 0.27, y - r * 0.71, r * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.29, y - r * 0.71, r * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Chococat — black cat
function drawChococat(ctx, cx, cy, s, c) {
  ctx.save();
  ctx.scale(s, s);
  const x = cx / s, y = cy / s;
  const r = 13;
  // Head
  ctx.fillStyle = c.main;
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  _addSphereDepth(ctx, x, y, r);
  // Ears
  ctx.beginPath();
  ctx.moveTo(x - r * 0.5, y - r * 0.72);
  ctx.lineTo(x - r * 0.82, y - r * 1.3);
  ctx.lineTo(x - r * 0.18, y - r * 1.05);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + r * 0.5, y - r * 0.72);
  ctx.lineTo(x + r * 0.82, y - r * 1.3);
  ctx.lineTo(x + r * 0.18, y - r * 1.05);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  // Inner ears
  ctx.fillStyle = c.innerEar;
  ctx.beginPath();
  ctx.moveTo(x - r * 0.5, y - r * 0.76);
  ctx.lineTo(x - r * 0.74, y - r * 1.2);
  ctx.lineTo(x - r * 0.24, y - r * 1.0);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + r * 0.5, y - r * 0.76);
  ctx.lineTo(x + r * 0.74, y - r * 1.2);
  ctx.lineTo(x + r * 0.24, y - r * 1.0);
  ctx.closePath();
  ctx.fill();
  // Big nose dot
  ctx.fillStyle = c.nose;
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.05, r * 0.18, r * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  // Eyes (large ovals)
  ctx.fillStyle = c.eye;
  ctx.beginPath();
  ctx.arc(x - r * 0.3, y - r * 0.18, r * 0.13, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.3, y - r * 0.18, r * 0.13, 0, Math.PI * 2);
  ctx.fill();
  // Shine
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x - r * 0.26, y - r * 0.22, r * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.34, y - r * 0.22, r * 0.05, 0, Math.PI * 2);
  ctx.fill();
  // Whiskers
  ctx.strokeStyle = c.whisker;
  ctx.lineWidth = 0.8;
  for (let i = -1; i <= 1; i++) {
    const wy = y + r * 0.15 + i * r * 0.12;
    ctx.beginPath();
    ctx.moveTo(x - r * 0.22, wy); ctx.lineTo(x - r * 0.85, wy); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + r * 0.22, wy); ctx.lineTo(x + r * 0.85, wy); ctx.stroke();
  }
  ctx.restore();
}

// ============================================================
// BOSS DRAWING
// ============================================================

function drawBoss(ctx, boss) {
  const cx = boss.x + boss.width / 2;
  const cy = boss.y + boss.height / 2;
  const s = boss.width / 100;  // scale factor
  const c = boss.colors;
  const phase = boss.phase;

  ctx.save();

  // Phase 2 aura
  if (phase === 2) {
    const aura = ctx.createRadialGradient(cx, cy, 10, cx, cy, boss.width * 0.8);
    aura.addColorStop(0, 'rgba(255,0,200,0.15)');
    aura.addColorStop(1, 'rgba(255,0,200,0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(cx, cy, boss.width * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  switch (boss.bossType) {
    case 'pompompurin': drawPompompurinBoss(ctx, cx, cy, s, c); break;
    case 'cinnamoroll': drawCinnamorollBoss(ctx, cx, cy, s, c); break;
    case 'myMelody':    drawMyMelodyBoss(ctx, cx, cy, s, c); break;
    case 'badtzMaru':   drawBadtzMaruBoss(ctx, cx, cy, s, c); break;
    case 'kuromi':      drawKuromiBoss(ctx, cx, cy, s, c); break;
  }

  // Crown / sparkle for all bosses
  _drawCrown(ctx, cx, cy - boss.height * 0.52, s * 16, phase === 2 ? '#ff00ff' : '#ffd700');

  ctx.restore();
}

function _drawCrown(ctx, cx, cy, r, color) {
  ctx.fillStyle = color;
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - r, cy);
  ctx.lineTo(cx - r, cy - r);
  ctx.lineTo(cx - r * 0.5, cy - r * 0.5);
  ctx.lineTo(cx, cy - r);
  ctx.lineTo(cx + r * 0.5, cy - r * 0.5);
  ctx.lineTo(cx + r, cy - r);
  ctx.lineTo(cx + r, cy);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  // Gems on crown
  ctx.fillStyle = '#ff69b4';
  ctx.beginPath();
  ctx.arc(cx, cy - r, r * 0.18, 0, Math.PI * 2);
  ctx.fill();
}

// Pompompurin boss
function drawPompompurinBoss(ctx, cx, cy, s, c) {
  const r = 36 * s;
  // Body (big round)
  ctx.fillStyle = c.main;
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  _addSphereDepth(ctx, cx, cy, r);
  // Hat brim
  ctx.fillStyle = c.hatBrim;
  ctx.beginPath();
  ctx.ellipse(cx, cy - r * 0.7, r * 0.85, r * 0.18, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // Hat top
  ctx.fillStyle = c.hatTop;
  ctx.beginPath();
  ctx.ellipse(cx, cy - r * 1.05, r * 0.55, r * 0.42, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // Hat band
  ctx.fillStyle = c.hatBand;
  ctx.beginPath();
  ctx.ellipse(cx, cy - r * 0.82, r * 0.7, r * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  // Ears
  ctx.fillStyle = c.main;
  ctx.beginPath();
  ctx.arc(cx - r * 0.85, cy - r * 0.3, r * 0.22, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + r * 0.85, cy - r * 0.3, r * 0.22, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // Cheeks
  ctx.fillStyle = c.cheek;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.arc(cx - r * 0.55, cy + r * 0.15, r * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.55, cy + r * 0.15, r * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // Eyes
  ctx.fillStyle = c.eye;
  ctx.beginPath();
  ctx.arc(cx - r * 0.3, cy - r * 0.05, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.3, cy - r * 0.05, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(cx - r * 0.27, cy - r * 0.09, r * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.33, cy - r * 0.09, r * 0.05, 0, Math.PI * 2);
  ctx.fill();
  // Nose
  ctx.fillStyle = c.nose;
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 0.15, r * 0.1, r * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  // Smile
  ctx.strokeStyle = c.nose;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy + r * 0.22, r * 0.22, 0.1, Math.PI - 0.1);
  ctx.stroke();
}

// Cinnamoroll boss
function drawCinnamorollBoss(ctx, cx, cy, s, c) {
  const r = 38 * s;
  // Large floppy ears
  ctx.fillStyle = c.ear;
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.95, cy + r * 0.4, r * 0.42, r * 0.85, -0.25, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx + r * 0.95, cy + r * 0.4, r * 0.42, r * 0.85, 0.25, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // Inner ears
  ctx.fillStyle = c.earInner;
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.95, cy + r * 0.4, r * 0.22, r * 0.6, -0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + r * 0.95, cy + r * 0.4, r * 0.22, r * 0.6, 0.25, 0, Math.PI * 2);
  ctx.fill();
  // Head
  ctx.fillStyle = c.main;
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  _addSphereDepth(ctx, cx, cy, r);
  // Fluffy tail on top (cinnamon roll)
  ctx.fillStyle = c.tail;
  ctx.beginPath();
  ctx.arc(cx, cy - r * 1.05, r * 0.3, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // Cheeks
  ctx.fillStyle = c.cheek;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.arc(cx - r * 0.52, cy + r * 0.2, r * 0.26, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.52, cy + r * 0.2, r * 0.26, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // Eyes (big blue)
  ctx.fillStyle = c.eye;
  ctx.beginPath();
  ctx.arc(cx - r * 0.27, cy - r * 0.05, r * 0.17, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.27, cy - r * 0.05, r * 0.17, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = c.pupil;
  ctx.beginPath();
  ctx.arc(cx - r * 0.27, cy - r * 0.05, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.27, cy - r * 0.05, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(cx - r * 0.23, cy - r * 0.1, r * 0.055, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.31, cy - r * 0.1, r * 0.055, 0, Math.PI * 2);
  ctx.fill();
  // Nose
  ctx.fillStyle = '#ffb6c1';
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 0.18, r * 0.1, r * 0.075, 0, 0, Math.PI * 2);
  ctx.fill();
  // Curly tail below
  ctx.strokeStyle = c.tail;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx + r * 0.6, cy + r * 0.85, r * 0.28, Math.PI, 0);
  ctx.stroke();
}

// My Melody boss
function drawMyMelodyBoss(ctx, cx, cy, s, c) {
  const r = 37 * s;
  // Bunny ears
  ctx.fillStyle = c.ear;
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.38, cy - r * 1.4, r * 0.22, r * 0.6, -0.1, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx + r * 0.38, cy - r * 1.4, r * 0.22, r * 0.6, 0.1, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // Inner ears (pink)
  ctx.fillStyle = c.hoodInner || '#ffb6c1';
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.38, cy - r * 1.4, r * 0.12, r * 0.42, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + r * 0.38, cy - r * 1.4, r * 0.12, r * 0.42, 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Hood (big pink dome)
  ctx.fillStyle = c.hood;
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, 0, false);
  ctx.bezierCurveTo(cx + r * 1.05, cy + r * 0.2, cx + r * 0.8, cy + r * 0.5, cx, cy + r * 0.3);
  ctx.bezierCurveTo(cx - r * 0.8, cy + r * 0.5, cx - r * 1.05, cy + r * 0.2, cx - r, cy);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  // Hood bottom line
  ctx.fillStyle = c.hoodInner;
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 0.05, r * 0.55, r * 0.15, 0, 0, Math.PI);
  ctx.fill();
  // Face
  ctx.fillStyle = c.main;
  ctx.beginPath();
  ctx.arc(cx, cy + r * 0.1, r * 0.72, 0, Math.PI * 2);
  ctx.fill();
  _addSphereDepth(ctx, cx, cy + r * 0.1, r * 0.72);
  // Eyes
  ctx.fillStyle = c.eye;
  ctx.beginPath();
  ctx.arc(cx - r * 0.24, cy + r * 0.05, r * 0.11, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.24, cy + r * 0.05, r * 0.11, 0, Math.PI * 2);
  ctx.fill();
  // Nose
  ctx.fillStyle = '#ff69b4';
  ctx.beginPath();
  ctx.arc(cx, cy + r * 0.22, r * 0.07, 0, Math.PI * 2);
  ctx.fill();
  // Little flower on hood
  const fx = cx + r * 0.7, fy = cy - r * 0.3;
  ctx.fillStyle = c.flower;
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(fx + Math.cos(ang) * r * 0.12, fy + Math.sin(ang) * r * 0.12, r * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = c.flowerCenter;
  ctx.beginPath();
  ctx.arc(fx, fy, r * 0.08, 0, Math.PI * 2);
  ctx.fill();
}

// Badtz-Maru boss
function drawBadtzMaruBoss(ctx, cx, cy, s, c) {
  const r = 36 * s;
  // Body
  ctx.fillStyle = c.main;
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 0.2, r * 0.78, r * 0.95, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // Belly
  ctx.fillStyle = c.belly;
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 0.4, r * 0.42, r * 0.65, 0, 0, Math.PI * 2);
  ctx.fill();
  // Head
  ctx.fillStyle = c.main;
  ctx.beginPath();
  ctx.arc(cx, cy - r * 0.5, r * 0.78, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  _addSphereDepth(ctx, cx, cy - r * 0.5, r * 0.78);
  // Spiky hair (5 spikes)
  ctx.fillStyle = '#000022';
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(cx + i * r * 0.25 - r * 0.12, cy - r * 1.1);
    ctx.lineTo(cx + i * r * 0.25, cy - r * 1.65);
    ctx.lineTo(cx + i * r * 0.25 + r * 0.12, cy - r * 1.1);
    ctx.closePath();
    ctx.fill();
  }
  // Eyes (with angry pupils)
  ctx.fillStyle = c.eye;
  ctx.beginPath();
  ctx.arc(cx - r * 0.28, cy - r * 0.6, r * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.28, cy - r * 0.6, r * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = c.pupil;
  ctx.beginPath();
  ctx.arc(cx - r * 0.26, cy - r * 0.58, r * 0.11, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.3, cy - r * 0.58, r * 0.11, 0, Math.PI * 2);
  ctx.fill();
  // Angry eyebrows
  ctx.strokeStyle = '#000022';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.42, cy - r * 0.82);
  ctx.lineTo(cx - r * 0.14, cy - r * 0.78);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.14, cy - r * 0.78);
  ctx.lineTo(cx + r * 0.42, cy - r * 0.82);
  ctx.stroke();
  // Beak
  ctx.fillStyle = c.beak;
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.14, cy - r * 0.42);
  ctx.lineTo(cx + r * 0.14, cy - r * 0.42);
  ctx.lineTo(cx, cy - r * 0.18);
  ctx.closePath();
  ctx.fill();
}

// Kuromi boss
function drawKuromiBoss(ctx, cx, cy, s, c) {
  const r = 37 * s;
  // Jester-like hood (dark with pink lining)
  ctx.fillStyle = c.hood;
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, 0, false);
  ctx.lineTo(cx + r, cy + r * 0.5);
  ctx.arc(cx, cy + r * 0.5, r, 0, Math.PI, false);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  // Hood lining
  ctx.fillStyle = c.hoodLining;
  ctx.beginPath();
  ctx.arc(cx, cy + r * 0.5, r, 0, Math.PI, false);
  ctx.fill();
  // Skull motif on hood
  const sx = cx - r * 0.6, sy = cy - r * 0.25;
  ctx.fillStyle = c.skull;
  ctx.beginPath();
  ctx.arc(sx, sy, r * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = c.skullEye;
  ctx.beginPath();
  ctx.arc(sx - r * 0.06, sy - r * 0.02, r * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(sx + r * 0.06, sy - r * 0.02, r * 0.04, 0, Math.PI * 2);
  ctx.fill();
  // Face
  ctx.fillStyle = c.main;
  ctx.beginPath();
  ctx.arc(cx, cy + r * 0.12, r * 0.72, 0, Math.PI * 2);
  ctx.fill();
  _addSphereDepth(ctx, cx, cy + r * 0.12, r * 0.72);
  // Ears (bunny ears peek from under hood)
  ctx.fillStyle = c.ear;
  ctx.beginPath();
  ctx.arc(cx - r * 0.62, cy - r * 0.62, r * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.62, cy - r * 0.62, r * 0.2, 0, Math.PI * 2);
  ctx.fill();
  // Eyes (violet)
  ctx.fillStyle = c.eye;
  ctx.beginPath();
  ctx.arc(cx - r * 0.22, cy + r * 0.1, r * 0.13, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.22, cy + r * 0.1, r * 0.13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(cx - r * 0.19, cy + r * 0.07, r * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.25, cy + r * 0.07, r * 0.05, 0, Math.PI * 2);
  ctx.fill();
  // Cheeks
  ctx.fillStyle = c.cheek;
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.arc(cx - r * 0.5, cy + r * 0.25, r * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.5, cy + r * 0.25, r * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // Mouth (mischievous smirk)
  ctx.strokeStyle = '#ff69b4';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.2, cy + r * 0.35);
  ctx.quadraticCurveTo(cx + r * 0.05, cy + r * 0.48, cx + r * 0.3, cy + r * 0.3);
  ctx.stroke();
}

// ============================================================
// BULLET DRAWING
// ============================================================

function drawBullet(ctx, bullet) {
  ctx.save();
  switch (bullet.shape) {
    case 'star':       _drawStarBullet(ctx, bullet);   break;
    case 'heart':      _drawHeartBullet(ctx, bullet);  break;
    case 'blob':       _drawBlobBullet(ctx, bullet);   break;
    case 'homing':     _drawHomingBullet(ctx, bullet); break;
    case 'laser':      _drawLaserBullet(ctx, bullet);  break;
    default:           _drawBlobBullet(ctx, bullet);
  }
  ctx.restore();
}

function _drawStarBullet(ctx, b) {
  const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
  const r = b.width / 2;
  // Glow
  const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2);
  grd.addColorStop(0, 'rgba(255,255,100,0.6)');
  grd.addColorStop(1, 'rgba(255,200,0,0)');
  ctx.fillStyle = grd;
  ctx.beginPath(); ctx.arc(cx, cy, r * 2, 0, Math.PI * 2); ctx.fill();
  // Star shape
  ctx.fillStyle = b.color || '#ffd700';
  _starPath(ctx, cx, cy, r, r * 0.45, 5);
  ctx.fill();
  ctx.fillStyle = '#fffacd';
  _starPath(ctx, cx, cy, r * 0.5, r * 0.2, 5);
  ctx.fill();
}

function _drawHeartBullet(ctx, b) {
  const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
  const r = b.width / 2;
  ctx.fillStyle = b.color || '#ff3366';
  ctx.shadowColor = '#ff0066';
  ctx.shadowBlur = 6;
  _heartPath(ctx, cx, cy, r * 1.2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  _heartPath(ctx, cx - r * 0.1, cy - r * 0.15, r * 0.5);
  ctx.fill();
}

function _drawBlobBullet(ctx, b) {
  const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
  const r = b.width / 2;
  // Glow
  ctx.shadowColor = b.color || '#ff6600';
  ctx.shadowBlur = 8;
  ctx.fillStyle = b.color || '#ff6600';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,200,0.5)';
  ctx.beginPath();
  ctx.arc(cx - r * 0.2, cy - r * 0.2, r * 0.4, 0, Math.PI * 2);
  ctx.fill();
}

function _drawHomingBullet(ctx, b) {
  const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
  const r = b.width / 2;
  const angle = Math.atan2(b.vy, b.vx);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle + Math.PI / 2);
  ctx.fillStyle = b.color || '#cc00cc';
  ctx.shadowColor = '#ff00ff';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.lineTo(r * 0.6, r);
  ctx.lineTo(-r * 0.6, r);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
}

function _drawLaserBullet(ctx, b) {
  const cx = b.x + b.width / 2;
  // Outer glow halo
  const glow = ctx.createRadialGradient(cx, b.y + b.height / 2, 0, cx, b.y + b.height / 2, b.width * 5);
  glow.addColorStop(0, 'rgba(180,240,255,0.35)');
  glow.addColorStop(1, 'rgba(180,240,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(b.x - b.width * 3, b.y, b.width * 7, b.height);
  // Core beam: white center → cyan edges
  const beam = ctx.createLinearGradient(b.x, 0, b.x + b.width, 0);
  beam.addColorStop(0,   'rgba(80,200,255,0.85)');
  beam.addColorStop(0.5, '#ffffff');
  beam.addColorStop(1,   'rgba(80,200,255,0.85)');
  ctx.shadowColor = '#00ddff';
  ctx.shadowBlur = 14;
  ctx.fillStyle = beam;
  ctx.fillRect(b.x, b.y, b.width, b.height);
  ctx.shadowBlur = 0;
}

// ============================================================
// POWER-UP DRAWING
// ============================================================

function drawPowerUp(ctx, pu) {
  const cx = pu.x + pu.width / 2, cy = pu.y + pu.height / 2;
  const r = pu.width / 2;
  ctx.save();

  // Glow pulse
  const pulse = 0.8 + 0.2 * Math.sin(Date.now() * 0.006);
  ctx.shadowColor = POWERUP_COLORS[pu.type];
  ctx.shadowBlur = 12 * pulse;

  // Background circle
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  switch (pu.type) {
    case 'health':
      // Red heart
      ctx.fillStyle = '#ff3366';
      ctx.shadowColor = '#ff0066';
      ctx.shadowBlur = 6;
      _heartPath(ctx, cx, cy, r * 0.85);
      ctx.fill();
      ctx.shadowBlur = 0;
      // Shine
      ctx.fillStyle = 'rgba(255,255,255,0.38)';
      _heartPath(ctx, cx - r * 0.1, cy - r * 0.15, r * 0.4);
      ctx.fill();
      break;
    case 'weapon':
      // Pink bow + gold star overlay
      drawBow(ctx, cx, cy - r * 0.08, r * 0.82, '#ff69b4');
      ctx.fillStyle = '#ffd700';
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 5;
      _starPath(ctx, cx + r * 0.52, cy - r * 0.52, r * 0.36, r * 0.14, 5);
      ctx.fill();
      ctx.shadowBlur = 0;
      break;
    case 'rainbow':
      // Swirling rainbow circle
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        const colors6 = ['#ff0000','#ff9900','#ffff00','#00cc00','#0066ff','#cc00cc'];
        ctx.fillStyle = colors6[i];
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r * 0.82, ang, ang + Math.PI * 2 / 6);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.4, 0, Math.PI * 2);
      ctx.fill();
      break;
  }

  ctx.shadowBlur = 0;
  ctx.restore();
}

// ============================================================
// BACKGROUND DRAWING
// ============================================================

function drawBackground(ctx, level, bgState) {
  switch (level) {
    case 1: _drawMeadowBG(ctx, bgState); break;
    case 2: _drawRainbowBG(ctx, bgState); break;
    case 3: _drawStarForestBG(ctx, bgState); break;
    case 4: _drawOceanBG(ctx, bgState); break;
    case 5: _drawCastleBG(ctx, bgState); break;
    default: _drawMeadowBG(ctx, bgState);
  }
}

function _drawMeadowBG(ctx, bg) {
  // Sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  grad.addColorStop(0, '#87ceeb');
  grad.addColorStop(1, '#d4f4a4');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  // Far clouds
  _drawScrolledElements(ctx, bg.far, _drawCloud.bind(null, ctx), '#fff');
  // Mid flowers
  _drawScrolledElements(ctx, bg.mid, _drawFlower.bind(null, ctx));
  // Near elements (petals)
  _drawScrolledElements(ctx, bg.near, _drawPetal.bind(null, ctx));
}

function _drawRainbowBG(ctx, bg) {
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  grad.addColorStop(0, '#1a0040');
  grad.addColorStop(0.5, '#400080');
  grad.addColorStop(1, '#8000ff');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  // Rainbow stripes
  _drawScrolledElements(ctx, bg.far, _drawRainbowArc.bind(null, ctx));
  _drawScrolledElements(ctx, bg.mid, _drawCloud.bind(null, ctx), 'rgba(255,255,255,0.6)');
  _drawScrolledElements(ctx, bg.near, _drawStar.bind(null, ctx));
}

function _drawStarForestBG(ctx, bg) {
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  grad.addColorStop(0, '#0a001e');
  grad.addColorStop(1, '#1a0040');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  _drawScrolledElements(ctx, bg.far, _drawStar.bind(null, ctx));
  _drawScrolledElements(ctx, bg.mid, _drawTree.bind(null, ctx));
  _drawScrolledElements(ctx, bg.near, _drawStar.bind(null, ctx), null, 0.7);
}

function _drawOceanBG(ctx, bg) {
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  grad.addColorStop(0, '#001428');
  grad.addColorStop(1, '#004080');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  _drawScrolledElements(ctx, bg.far, _drawBubble.bind(null, ctx));
  _drawScrolledElements(ctx, bg.mid, _drawSeaweed.bind(null, ctx));
  _drawScrolledElements(ctx, bg.near, _drawBubble.bind(null, ctx), null, 0.7);
}

function _drawCastleBG(ctx, bg) {
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  grad.addColorStop(0, '#08001a');
  grad.addColorStop(1, '#200050');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  _drawScrolledElements(ctx, bg.far, _drawStar.bind(null, ctx));
  _drawScrolledElements(ctx, bg.mid, _drawCastleTurret.bind(null, ctx));
  _drawScrolledElements(ctx, bg.near, _drawStar.bind(null, ctx), null, 0.6);
}

// Generic scrolled element renderer
function _drawScrolledElements(ctx, elements, drawFn, color, alpha) {
  ctx.save();
  if (alpha !== undefined) ctx.globalAlpha = alpha;
  for (const el of elements) {
    drawFn(el.x, el.y, el.size, color || el.color);
  }
  ctx.restore();
}

// Individual element draw functions
function _drawCloud(ctx, x, y, size, color) {
  ctx.fillStyle = color || 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.arc(x, y, size * 0.55, 0, Math.PI * 2);
  ctx.arc(x + size * 0.5, y - size * 0.1, size * 0.42, 0, Math.PI * 2);
  ctx.arc(x + size, y, size * 0.5, 0, Math.PI * 2);
  ctx.arc(x + size * 0.5, y + size * 0.15, size * 0.48, 0, Math.PI * 2);
  ctx.fill();
}

function _drawFlower(ctx, x, y, size, color) {
  ctx.fillStyle = color || '#ff69b4';
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(x + Math.cos(ang) * size * 0.45, y + Math.sin(ang) * size * 0.45, size * 0.38, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.arc(x, y, size * 0.28, 0, Math.PI * 2);
  ctx.fill();
}

function _drawPetal(ctx, x, y, size) {
  ctx.fillStyle = 'rgba(255,182,193,0.7)';
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(x * 0.03);
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.5, size * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function _drawRainbowArc(ctx, x, y, size) {
  const colors = ['#ff0000','#ff6600','#ffcc00','#00cc00','#0066ff','#cc00ff'];
  for (let i = 0; i < colors.length; i++) {
    ctx.strokeStyle = colors[i];
    ctx.lineWidth = size * 0.08;
    ctx.beginPath();
    ctx.arc(x, y + size * 2, size * (1.2 + i * 0.15), Math.PI, 0);
    ctx.stroke();
  }
}

function _drawStar(ctx, x, y, size, color) {
  ctx.fillStyle = color || '#ffffff';
  _starPath(ctx, x, y, size, size * 0.4, 5);
  ctx.fill();
}

function _drawTree(ctx, x, y, size) {
  ctx.fillStyle = '#1a4a0a';
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size * 0.6, y + size * 0.3);
  ctx.lineTo(x - size * 0.6, y + size * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x, y - size * 1.4);
  ctx.lineTo(x + size * 0.45, y - size * 0.3);
  ctx.lineTo(x - size * 0.45, y - size * 0.3);
  ctx.closePath();
  ctx.fill();
}

function _drawBubble(ctx, x, y, size) {
  ctx.strokeStyle = 'rgba(100,200,255,0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(100,200,255,0.07)';
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath();
  ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.25, 0, Math.PI * 2);
  ctx.fill();
}

function _drawSeaweed(ctx, x, y, size) {
  ctx.strokeStyle = 'rgba(0,180,80,0.6)';
  ctx.lineWidth = size * 0.25;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y + size * 2);
  ctx.quadraticCurveTo(x + size * 0.8, y + size, x, y);
  ctx.quadraticCurveTo(x - size * 0.8, y - size, x, y - size * 2);
  ctx.stroke();
}

function _drawCastleTurret(ctx, x, y, size) {
  ctx.fillStyle = 'rgba(80,0,120,0.6)';
  ctx.fillRect(x - size * 0.4, y - size, size * 0.8, size * 2);
  // Battlements
  for (let i = -1; i <= 1; i++) {
    ctx.fillRect(x + i * size * 0.28 - size * 0.12, y - size * 1.3, size * 0.22, size * 0.3);
  }
  // Window
  ctx.fillStyle = 'rgba(255,200,255,0.5)';
  ctx.beginPath();
  ctx.arc(x, y - size * 0.4, size * 0.22, Math.PI, 0);
  ctx.fillRect(x - size * 0.22, y - size * 0.4, size * 0.44, size * 0.38);
  ctx.fill();
}

// ============================================================
// PATH HELPERS
// ============================================================

function _starPath(ctx, cx, cy, outerR, innerR, points) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const ang = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    if (i === 0) ctx.moveTo(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r);
    else ctx.lineTo(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r);
  }
  ctx.closePath();
}

function _heartPath(ctx, cx, cy, r) {
  ctx.beginPath();
  ctx.moveTo(cx, cy + r * 0.7);
  ctx.bezierCurveTo(cx - r * 1.4, cy - r * 0.2, cx - r * 1.4, cy - r * 1.1, cx, cy - r * 0.5);
  ctx.bezierCurveTo(cx + r * 1.4, cy - r * 1.1, cx + r * 1.4, cy - r * 0.2, cx, cy + r * 0.7);
  ctx.closePath();
}

// ============================================================
// HUD DRAWING
// ============================================================

function drawHUD(ctx, player, score, levelNum, bossHealthRatio) {
  ctx.save();

  // ---- Header bar ----
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(0, 0, CANVAS_W, 36);

  // Score
  ctx.font = 'bold 16px "Courier New"';
  ctx.fillStyle = COLOR_SCORE_SHADOW;
  ctx.fillText('★ ' + score, 182, 22);
  ctx.fillStyle = COLOR_HUD_TEXT;
  ctx.fillText('★ ' + score, 180, 20);

  // Level number (top-right)
  ctx.textAlign = 'right';
  ctx.fillStyle = COLOR_HUD_TEXT;
  ctx.fillText('LV ' + levelNum, CANVAS_W - 10, 20);
  ctx.textAlign = 'left';

  // Lives (mini kitty silhouettes — top-left)
  for (let i = 0; i < player.lives; i++) {
    _drawMiniKitty(ctx, 10 + i * 22, 12, player.character.colors);
  }

  // ---- Boss health bar (top-center, drawn before bottom HUD) ----
  if (bossHealthRatio !== null && bossHealthRatio !== undefined) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(CANVAS_W / 2 - 120, 8, 244, 18);
    ctx.fillStyle = COLOR_HEALTH_EMPTY;
    ctx.fillRect(CANVAS_W / 2 - 119, 9, 242, 16);
    ctx.fillStyle = COLOR_BOSS_BAR;
    ctx.fillRect(CANVAS_W / 2 - 119, 9, 242 * Math.max(0, bossHealthRatio), 16);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText('BOSS', CANVAS_W / 2, 21);
    ctx.textAlign = 'left';
  }

  // ---- HP bar — large, centered at bottom ----
  const barW   = 280, barH = 22;
  const barX   = (CANVAS_W - barW) / 2;
  const barY   = CANVAS_H - 46;
  const hpRatio = player.health / player.maxHealth;

  // Background panel
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(barX - 38, barY - 20, barW + 42, barH + 24);

  // "HP" label
  ctx.font = 'bold 15px "Courier New"';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'right';
  ctx.fillText('HP', barX - 6, barY + barH * 0.72);
  ctx.textAlign = 'left';

  // Empty bar
  ctx.fillStyle = COLOR_HEALTH_EMPTY;
  ctx.fillRect(barX, barY, barW, barH);

  // Filled portion with gradient
  if (hpRatio > 0) {
    const fillW = barW * hpRatio;
    const grad = ctx.createLinearGradient(barX, barY, barX, barY + barH);
    grad.addColorStop(0,   '#ff80b8');
    grad.addColorStop(0.5, '#ff3366');
    grad.addColorStop(1,   '#cc0033');
    ctx.fillStyle = grad;
    // Pulse red glow when HP critical (≤25%)
    if (hpRatio <= 0.25) {
      const pulse = Math.abs(Math.sin(Date.now() * 0.006));
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur  = 10 + 10 * pulse;
    }
    ctx.fillRect(barX, barY, fillW, barH);
    ctx.shadowBlur = 0;
  }

  // White border (2px)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth   = 2;
  ctx.strokeRect(barX, barY, barW, barH);

  // Heart pips at 25/50/75/100% marks (clipped to filled portion)
  ctx.save();
  ctx.beginPath();
  ctx.rect(barX, barY, barW * hpRatio, barH);
  ctx.clip();
  for (let i = 1; i <= 4; i++) {
    const pipX = barX + barW * (i / 4) - 6;
    const pipY = barY + barH / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    _heartPath(ctx, pipX, pipY, barH * 0.28);
    ctx.fill();
  }
  ctx.restore();

  // ---- Weapon level pips — row above the HP bar ----
  const shotLevel   = player.shotLevel || 1;
  const pipCount    = 6;
  const pipSpacing  = 38;
  const pipRowY     = barY - 14;
  const pipStartX   = barX + (barW - (pipCount - 1) * pipSpacing) / 2;

  for (let i = 1; i <= pipCount; i++) {
    const px = pipStartX + (i - 1) * pipSpacing;
    const py = pipRowY;
    if (i <= shotLevel) {
      ctx.fillStyle  = '#ffd700';
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur  = 5;
      _starPath(ctx, px, py, 7, 3, 5);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,0.38)';
      ctx.lineWidth   = 1.5;
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Weapon label
  ctx.font      = '10px "Courier New"';
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.textAlign = 'center';
  ctx.fillText('SHOT LV', barX + barW / 2, pipRowY + 11);
  ctx.textAlign = 'left';

  ctx.restore();
}

function _drawMiniKitty(ctx, cx, cy, colors) {
  const r = 7;
  ctx.fillStyle = colors.head;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  // Ears
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.5, cy - r * 0.6);
  ctx.lineTo(cx - r * 0.85, cy - r * 1.2);
  ctx.lineTo(cx - r * 0.15, cy - r);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.5, cy - r * 0.6);
  ctx.lineTo(cx + r * 0.85, cy - r * 1.2);
  ctx.lineTo(cx + r * 0.15, cy - r);
  ctx.closePath();
  ctx.fill();
  // Bow dot
  ctx.fillStyle = colors.bow;
  ctx.beginPath();
  ctx.arc(cx + r * 0.55, cy - r * 0.8, r * 0.28, 0, Math.PI * 2);
  ctx.fill();
  // Eyes
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(cx - r * 0.28, cy - r * 0.1, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.28, cy - r * 0.1, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
}

// ============================================================
// PARTICLE DRAWING
// ============================================================

function drawParticle(ctx, p) {
  ctx.save();
  const progress = p.life / p.maxLife;
  ctx.globalAlpha = progress;
  const size = p.size * (0.3 + progress * 0.7);

  switch (p.shape) {
    case 'star':
      ctx.fillStyle = p.color;
      _starPath(ctx, p.x, p.y, size, size * 0.4, 5);
      ctx.fill();
      break;
    case 'heart':
      ctx.fillStyle = p.color;
      _heartPath(ctx, p.x, p.y, size * 0.7);
      ctx.fill();
      break;
    case 'circle':
    default:
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fill();
  }
  ctx.restore();
}

// Screen flash effect
function drawFlash(ctx, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.restore();
}
