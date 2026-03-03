// ============================================================
// RENDERER.JS — All Canvas 2D drawing functions
// ============================================================

// ---- Color Helpers ----

function _hexToRgb(hex) {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return [128, 128, 128];
  const h = hex.replace('#', '');
  if (h.length === 3) {
    return [parseInt(h[0]+h[0],16), parseInt(h[1]+h[1],16), parseInt(h[2]+h[2],16)];
  }
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}

function _lighten(hex, t) {
  const [r,g,b] = _hexToRgb(hex);
  return `rgb(${Math.min(255,Math.round(r+(255-r)*t))},${Math.min(255,Math.round(g+(255-g)*t))},${Math.min(255,Math.round(b+(255-b)*t))})`;
}

function _darken(hex, t) {
  const [r,g,b] = _hexToRgb(hex);
  return `rgb(${Math.round(r*(1-t))},${Math.round(g*(1-t))},${Math.round(b*(1-t))})`;
}

// ---- Drawing Helpers ----

// Radial gradient simulating 3D sphere (light from upper-left)
function _sphereGrad(ctx, cx, cy, r, color) {
  const hlx = cx - r * 0.28, hly = cy - r * 0.32;
  const grad = ctx.createRadialGradient(hlx, hly, r * 0.01, cx + r * 0.08, cy + r * 0.1, r * 1.15);
  grad.addColorStop(0,    _lighten(color, 0.58));
  grad.addColorStop(0.25, _lighten(color, 0.2));
  grad.addColorStop(0.6,  color);
  grad.addColorStop(0.88, _darken(color, 0.22));
  grad.addColorStop(1,    _darken(color, 0.5));
  return grad;
}

// Draw a filled 3D sphere (gradient fill + specular highlight)
function _sphere(ctx, cx, cy, r, color, outlineColor) {
  ctx.fillStyle = _sphereGrad(ctx, cx, cy, r, color);
  ctx.strokeStyle = outlineColor !== undefined ? outlineColor : 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  if (outlineColor !== false) ctx.stroke();
  // Specular highlight
  const spec = ctx.createRadialGradient(cx - r*0.28, cy - r*0.35, 0, cx - r*0.18, cy - r*0.2, r*0.55);
  spec.addColorStop(0, 'rgba(255,255,255,0.65)');
  spec.addColorStop(0.4, 'rgba(255,255,255,0.18)');
  spec.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = spec;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

// Overlay highlight + shadow on a circle to give it a 3D sphere look (legacy)
function _addSphereDepth(ctx, cx, cy, r) {
  const hl = ctx.createRadialGradient(cx - r * 0.28, cy - r * 0.3, 0, cx, cy, r);
  hl.addColorStop(0, 'rgba(255,255,255,0.48)');
  hl.addColorStop(0.42, 'rgba(255,255,255,0.12)');
  hl.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hl;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  const sh = ctx.createRadialGradient(cx, cy, r * 0.45, cx + r * 0.15, cy + r * 0.2, r * 1.05);
  sh.addColorStop(0, 'rgba(0,0,0,0)');
  sh.addColorStop(1, 'rgba(0,0,0,0.22)');
  ctx.fillStyle = sh;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

// Soft elliptical drop-shadow beneath a character
function _dropShadow(ctx, cx, groundY, r) {
  const s = ctx.createRadialGradient(cx, groundY, 0, cx, groundY, r);
  s.addColorStop(0, 'rgba(0,0,0,0.22)');
  s.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = s;
  ctx.beginPath();
  ctx.ellipse(cx, groundY, r * 0.88, r * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
}

// Draw a bow (Hello Kitty-style) centered at cx,cy with radius r
function drawBow(ctx, cx, cy, r, color) {
  ctx.save();
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 1;

  // Left loop (slightly lighter)
  ctx.fillStyle = _lighten(color, 0.12);
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.65, cy, r * 0.55, r * 0.38, -0.25, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // Left loop highlight
  ctx.fillStyle = 'rgba(255,255,255,0.38)';
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.78, cy - r * 0.1, r * 0.22, r * 0.13, -0.25, 0, Math.PI * 2);
  ctx.fill();

  // Right loop (slightly darker for depth)
  ctx.fillStyle = _darken(color, 0.08);
  ctx.beginPath();
  ctx.ellipse(cx + r * 0.65, cy, r * 0.55, r * 0.38, 0.25, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // Right loop highlight
  ctx.fillStyle = 'rgba(255,255,255,0.38)';
  ctx.beginPath();
  ctx.ellipse(cx + r * 0.52, cy - r * 0.1, r * 0.22, r * 0.13, 0.25, 0, Math.PI * 2);
  ctx.fill();

  // Center knot
  ctx.fillStyle = color;
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.22, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  ctx.restore();
}

// ============================================================
// HELLO KITTY CHARACTER (player + screens)
// ============================================================
// Draw Hello Kitty-style cat head/body at (cx, cy) with head radius r
function drawKittyCharacter(ctx, cx, cy, r, colors, bobOffset) {
  bobOffset = bobOffset || 0;
  const by = cy + bobOffset;
  ctx.save();

  // ---- THRUSTER FLAMES (drawn first, behind ship) ----
  const flame = ctx.createRadialGradient(cx, by + r*2.1, 0, cx, by + r*2.75, r*0.9);
  flame.addColorStop(0,   'rgba(255,220,255,0.95)');
  flame.addColorStop(0.3, 'rgba(200,80,255,0.72)');
  flame.addColorStop(0.7, 'rgba(120,20,220,0.3)');
  flame.addColorStop(1,   'rgba(60,0,180,0)');
  ctx.fillStyle = flame;
  ctx.beginPath();
  ctx.ellipse(cx, by + r*2.3, r*0.30, r*0.82, 0, 0, Math.PI*2);
  ctx.fill();
  for (const sx of [-0.42, 0.42]) {
    const sf = ctx.createRadialGradient(cx + sx*r, by + r*1.98, 0, cx + sx*r, by + r*2.38, r*0.42);
    sf.addColorStop(0, 'rgba(220,150,255,0.85)');
    sf.addColorStop(1, 'rgba(100,20,200,0)');
    ctx.fillStyle = sf;
    ctx.beginPath();
    ctx.ellipse(cx + sx*r, by + r*2.05, r*0.14, r*0.42, 0, 0, Math.PI*2);
    ctx.fill();
  }

  // ---- WINGS ----
  ctx.fillStyle = _darken(colors.head, 0.12);
  ctx.strokeStyle = 'rgba(0,0,0,0.32)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(cx - r*0.54, by + r*0.38);
  ctx.lineTo(cx - r*1.68, by + r*0.90);
  ctx.lineTo(cx - r*1.40, by + r*1.56);
  ctx.lineTo(cx - r*0.48, by + r*1.16);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + r*0.54, by + r*0.38);
  ctx.lineTo(cx + r*1.68, by + r*0.90);
  ctx.lineTo(cx + r*1.40, by + r*1.56);
  ctx.lineTo(cx + r*0.48, by + r*1.16);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  // Wing accent stripe in bow colour
  ctx.strokeStyle = colors.bow;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.72;
  ctx.beginPath(); ctx.moveTo(cx - r*0.54, by + r*0.50); ctx.lineTo(cx - r*1.56, by + r*0.94); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + r*0.54, by + r*0.50); ctx.lineTo(cx + r*1.56, by + r*0.94); ctx.stroke();
  ctx.globalAlpha = 1;

  // ---- HULL BODY ----
  _sphere(ctx, cx, by + r*1.06, r*0.58, colors.head, 'rgba(0,0,0,0.28)');

  // ---- THRUSTER NOZZLES ----
  const noz = _darken(colors.head, 0.30);
  ctx.fillStyle = noz; ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(cx,          by + r*1.70, r*0.20, r*0.12, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(cx - r*0.38, by + r*1.64, r*0.13, r*0.09, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(cx + r*0.38, by + r*1.64, r*0.13, r*0.09, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();

  // ---- COCKPIT HEAD ----
  _sphere(ctx, cx, by, r, colors.head, 'rgba(0,0,0,0.28)');
  // Canopy glass
  const glass = ctx.createRadialGradient(cx - r*0.22, by - r*0.28, 0, cx, by, r);
  glass.addColorStop(0,   'rgba(180,220,255,0.40)');
  glass.addColorStop(0.5, 'rgba(100,170,255,0.12)');
  glass.addColorStop(1,   'rgba(0,80,200,0)');
  ctx.fillStyle = glass;
  ctx.beginPath(); ctx.arc(cx, by, r, 0, Math.PI*2); ctx.fill();

  // ---- EARS (rounded dome) ----
  const lEarCX = cx - r*0.60, lEarCY = by - r*0.90;
  const rEarCX = cx + r*0.60, rEarCY = by - r*0.90;
  const earW = r*0.36, earH = r*0.50;
  ctx.strokeStyle = 'rgba(0,0,0,0.26)'; ctx.lineWidth = 1.2;
  ctx.fillStyle = _sphereGrad(ctx, lEarCX, lEarCY - earH*0.4, earW, colors.head);
  ctx.beginPath(); ctx.moveTo(lEarCX - earW, lEarCY);
  ctx.bezierCurveTo(lEarCX - earW, lEarCY - earH, lEarCX + earW, lEarCY - earH, lEarCX + earW, lEarCY);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = colors.innerEar;
  ctx.beginPath(); ctx.moveTo(lEarCX - earW*0.58, lEarCY);
  ctx.bezierCurveTo(lEarCX - earW*0.58, lEarCY - earH*0.68, lEarCX + earW*0.58, lEarCY - earH*0.68, lEarCX + earW*0.58, lEarCY);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = _sphereGrad(ctx, rEarCX, rEarCY - earH*0.4, earW, colors.head);
  ctx.strokeStyle = 'rgba(0,0,0,0.26)';
  ctx.beginPath(); ctx.moveTo(rEarCX - earW, rEarCY);
  ctx.bezierCurveTo(rEarCX - earW, rEarCY - earH, rEarCX + earW, rEarCY - earH, rEarCX + earW, rEarCY);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = colors.innerEar;
  ctx.beginPath(); ctx.moveTo(rEarCX - earW*0.58, rEarCY);
  ctx.bezierCurveTo(rEarCX - earW*0.58, rEarCY - earH*0.68, rEarCX + earW*0.58, rEarCY - earH*0.68, rEarCX + earW*0.58, rEarCY);
  ctx.closePath(); ctx.fill();

  // ---- EYES ----
  ctx.fillStyle = colors.eyes;
  ctx.beginPath(); ctx.ellipse(cx - r*0.27, by - r*0.1, r*0.085, r*0.11, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + r*0.27, by - r*0.1, r*0.085, r*0.11, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.beginPath(); ctx.arc(cx - r*0.24, by - r*0.14, r*0.032, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + r*0.30, by - r*0.14, r*0.032, 0, Math.PI*2); ctx.fill();

  // ---- NOSE ----
  ctx.fillStyle = colors.nose || '#ffd700';
  ctx.beginPath(); ctx.ellipse(cx, by + r*0.1, r*0.08, r*0.06, 0, 0, Math.PI*2); ctx.fill();

  // ---- BLUSH (Hello Kitty's iconic rosy cheeks) ----
  ctx.fillStyle = '#ffaacc';
  ctx.globalAlpha = 0.55;
  ctx.beginPath(); ctx.ellipse(cx - r*0.52, by + r*0.12, r*0.20, r*0.13, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + r*0.52, by + r*0.12, r*0.20, r*0.13, 0, 0, Math.PI*2); ctx.fill();
  ctx.globalAlpha = 1;

  // ---- WHISKERS ----
  ctx.strokeStyle = 'rgba(60,40,40,0.26)'; ctx.lineWidth = 0.9;
  for (let i = -1; i <= 1; i++) {
    const wy = by + r*0.06 + i*r*0.11;
    ctx.beginPath(); ctx.moveTo(cx - r*0.15, wy); ctx.lineTo(cx - r*0.84, wy + i*r*0.04); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + r*0.15, wy); ctx.lineTo(cx + r*0.84, wy + i*r*0.04); ctx.stroke();
  }

  // ---- BOW at base of right ear ----
  drawBow(ctx, cx + r*0.60, by - r*0.90, r*0.30, colors.bow);

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

// ============================================================
// Pompom Pal — Pompompurin-style golden hamster with beret hat
// ============================================================
function drawPompomPal(ctx, cx, cy, s, c) {
  ctx.save();
  ctx.scale(s, s);
  const x = cx / s, y = cy / s;
  const r = 14;

  // Engine glow (top — enemy flies downward)
  const eg1 = ctx.createRadialGradient(x, y - r*1.6, 0, x, y - r*2.1, r*0.7);
  eg1.addColorStop(0, 'rgba(255,210,60,0.9)'); eg1.addColorStop(0.5, 'rgba(255,140,0,0.45)'); eg1.addColorStop(1, 'rgba(255,80,0,0)');
  ctx.fillStyle = eg1; ctx.beginPath(); ctx.ellipse(x, y - r*1.7, r*0.22, r*0.52, 0, 0, Math.PI*2); ctx.fill();
  // Wings
  ctx.fillStyle = _darken(c.main, 0.2); ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x - r*0.52, y - r*0.14); ctx.lineTo(x - r*1.32, y - r*0.50); ctx.lineTo(x - r*1.08, y + r*0.28); ctx.lineTo(x - r*0.44, y + r*0.14); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + r*0.52, y - r*0.14); ctx.lineTo(x + r*1.32, y - r*0.50); ctx.lineTo(x + r*1.08, y + r*0.28); ctx.lineTo(x + r*0.44, y + r*0.14); ctx.closePath(); ctx.fill(); ctx.stroke();

  // Round golden body (Pompompurin is very round/pudgy)
  _sphere(ctx, x, y, r, c.main, 'rgba(0,0,0,0.35)');

  // Small round ears
  _sphere(ctx, x - r * 0.72, y - r * 0.62, r * 0.28, c.main, 'rgba(0,0,0,0.28)');
  _sphere(ctx, x + r * 0.72, y - r * 0.62, r * 0.28, c.main, 'rgba(0,0,0,0.28)');
  ctx.fillStyle = c.ear;
  ctx.beginPath();
  ctx.arc(x - r * 0.72, y - r * 0.62, r * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.72, y - r * 0.62, r * 0.16, 0, Math.PI * 2);
  ctx.fill();

  // ---- BERET HAT (Pompompurin's most iconic feature!) ----
  // Brim (wide flat brown disc)
  ctx.fillStyle = _darken(c.cheek || '#a0522d', 0.05);
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(x, y - r * 0.72, r * 0.9, r * 0.17, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // Hat dome
  ctx.fillStyle = _sphereGrad(ctx, x, y - r * 1.06, r * 0.55, c.cheek || '#a0522d');
  ctx.beginPath();
  ctx.ellipse(x, y - r * 1.06, r * 0.58, r * 0.44, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // Hat band (white stripe)
  ctx.fillStyle = 'rgba(255,255,255,0.32)';
  ctx.beginPath();
  ctx.ellipse(x, y - r * 0.84, r * 0.72, r * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  // Hat specular
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.beginPath();
  ctx.ellipse(x - r * 0.18, y - r * 1.18, r * 0.24, r * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Rosy cheeks
  ctx.fillStyle = c.cheek;
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.ellipse(x - r * 0.56, y + r * 0.12, r * 0.24, r * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + r * 0.56, y + r * 0.12, r * 0.24, r * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Sleepy droopy eyes (Pompompurin always looks half-asleep/happy)
  ctx.fillStyle = c.eye;
  ctx.beginPath();
  ctx.ellipse(x - r * 0.3, y - r * 0.06, r * 0.13, r * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + r * 0.3, y - r * 0.06, r * 0.13, r * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  // Droopy eyelid arc above each eye
  ctx.strokeStyle = c.eye;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x - r * 0.3, y - r * 0.11, r * 0.16, Math.PI, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + r * 0.3, y - r * 0.11, r * 0.16, Math.PI, 0);
  ctx.stroke();
  // Eye shine
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x - r * 0.25, y - r * 0.12, r * 0.045, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.35, y - r * 0.12, r * 0.045, 0, Math.PI * 2);
  ctx.fill();

  // Small brown nose
  ctx.fillStyle = c.nose;
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.12, r * 0.09, r * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
  // Wide happy smile
  ctx.strokeStyle = c.nose;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y + r * 0.2, r * 0.22, 0.08, Math.PI - 0.08);
  ctx.stroke();

  ctx.restore();
}

// ============================================================
// Cinna-Pup — Cinnamoroll-style white puppy
// ============================================================
function drawCinnaPup(ctx, cx, cy, s, c) {
  ctx.save();
  ctx.scale(s, s);
  const x = cx / s, y = cy / s;
  const r = 14;

  // Engine glow (top — enemy flies downward)
  const egC = ctx.createRadialGradient(x, y - r*1.5, 0, x, y - r*2.0, r*0.65);
  egC.addColorStop(0, 'rgba(160,220,255,0.92)'); egC.addColorStop(0.5, 'rgba(80,160,255,0.5)'); egC.addColorStop(1, 'rgba(40,80,255,0)');
  ctx.fillStyle = egC; ctx.beginPath(); ctx.ellipse(x, y - r*1.62, r*0.20, r*0.48, 0, 0, Math.PI*2); ctx.fill();
  // Wings
  ctx.fillStyle = _darken(c.ear, 0.18); ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x - r*0.50, y - r*0.12); ctx.lineTo(x - r*1.28, y - r*0.46); ctx.lineTo(x - r*1.06, y + r*0.30); ctx.lineTo(x - r*0.42, y + r*0.16); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + r*0.50, y - r*0.12); ctx.lineTo(x + r*1.28, y - r*0.46); ctx.lineTo(x + r*1.06, y + r*0.30); ctx.lineTo(x + r*0.42, y + r*0.16); ctx.closePath(); ctx.fill(); ctx.stroke();

  // Big floppy BLUE ears (hang way down — Cinnamoroll's most iconic feature)
  ctx.fillStyle = _sphereGrad(ctx, x - r*0.98, y + r*0.85, r*0.46, c.ear);
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(x - r * 0.94, y + r * 0.88, r * 0.46, r * 1.18, -0.22, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = _sphereGrad(ctx, x + r*0.98, y + r*0.85, r*0.46, c.ear);
  ctx.beginPath();
  ctx.ellipse(x + r * 0.94, y + r * 0.88, r * 0.46, r * 1.18, 0.22, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // Ear inner highlights
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.beginPath();
  ctx.ellipse(x - r * 1.08, y + r * 0.46, r * 0.18, r * 0.36, -0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + r * 0.84, y + r * 0.46, r * 0.18, r * 0.36, 0.22, 0, Math.PI * 2);
  ctx.fill();

  // White round head
  _sphere(ctx, x, y, r, c.main, 'rgba(0,0,0,0.28)');

  // Cinnamon roll curly tail on top (small spiral)
  ctx.strokeStyle = c.ear;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(x, y - r * 0.95, r * 0.26, Math.PI * 0.85, Math.PI * 2.15);
  ctx.stroke();
  // Tail center
  ctx.fillStyle = c.ear;
  ctx.beginPath();
  ctx.arc(x, y - r * 0.95, r * 0.11, 0, Math.PI * 2);
  ctx.fill();

  // Rosy cheeks
  ctx.fillStyle = c.cheek;
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.ellipse(x - r * 0.55, y + r * 0.22, r * 0.22, r * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + r * 0.55, y + r * 0.22, r * 0.22, r * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Large sparkly blue eyes (Cinnamoroll's defining eyes)
  _sphere(ctx, x - r * 0.28, y - r * 0.05, r * 0.18, c.eye, 'rgba(0,0,0,0.3)');
  _sphere(ctx, x + r * 0.28, y - r * 0.05, r * 0.18, c.eye, 'rgba(0,0,0,0.3)');
  // Pupils
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.arc(x - r * 0.28, y - r * 0.05, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.28, y - r * 0.05, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Sparkle (two shine dots per eye)
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x - r * 0.22, y - r * 0.11, r * 0.065, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x - r * 0.33, y - r * 0.0, r * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.34, y - r * 0.11, r * 0.065, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.23, y - r * 0.0, r * 0.03, 0, Math.PI * 2);
  ctx.fill();

  // Tiny button nose
  ctx.fillStyle = c.nose;
  ctx.beginPath();
  ctx.arc(x, y + r * 0.19, r * 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Small wings (translucent)
  ctx.fillStyle = c.wing || '#d0e8ff';
  ctx.globalAlpha = 0.58;
  ctx.beginPath();
  ctx.ellipse(x - r * 0.88, y - r * 0.14, r * 0.32, r * 0.18, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + r * 0.88, y - r * 0.14, r * 0.32, r * 0.18, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();
}

// ============================================================
// Badtz-Grunt — Badtz-Maru-style punk penguin
// ============================================================
function drawBadtzGrunt(ctx, cx, cy, s, c) {
  ctx.save();
  ctx.scale(s, s);
  const x = cx / s, y = cy / s;
  const r = 13;

  // Engine glow (top — enemy flies downward)
  const egB = ctx.createRadialGradient(x, y - r*1.5, 0, x, y - r*2.0, r*0.65);
  egB.addColorStop(0, 'rgba(255,220,60,0.92)'); egB.addColorStop(0.5, 'rgba(255,140,0,0.48)'); egB.addColorStop(1, 'rgba(255,60,0,0)');
  ctx.fillStyle = egB; ctx.beginPath(); ctx.ellipse(x, y - r*1.62, r*0.19, r*0.46, 0, 0, Math.PI*2); ctx.fill();
  // Wings (dark — match Badtz-Maru's black color)
  ctx.fillStyle = '#2a2a44'; ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x - r*0.50, y - r*0.12); ctx.lineTo(x - r*1.28, y - r*0.46); ctx.lineTo(x - r*1.04, y + r*0.28); ctx.lineTo(x - r*0.42, y + r*0.14); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + r*0.50, y - r*0.12); ctx.lineTo(x + r*1.28, y - r*0.46); ctx.lineTo(x + r*1.04, y + r*0.28); ctx.lineTo(x + r*0.42, y + r*0.14); ctx.closePath(); ctx.fill(); ctx.stroke();

  // Egg-shaped black body
  ctx.fillStyle = _sphereGrad(ctx, x, y + r*0.2, r*0.85, c.main);
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.15, r * 0.78, r * 0.88, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // Pale belly
  ctx.fillStyle = _lighten(c.belly || '#2d2d4e', 0.75);
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.35, r * 0.44, r * 0.58, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  _sphere(ctx, x, y - r * 0.46, r * 0.76, c.main, 'rgba(0,0,0,0.4)');

  // ---- Spiky hair (4 dramatic spikes — Badtz-Maru's signature) ----
  ctx.fillStyle = '#000022';
  const spikes = [-1.6, -0.52, 0.52, 1.6];
  for (const off of spikes) {
    ctx.beginPath();
    ctx.moveTo(x + off * r * 0.2 - r * 0.1, y - r * 1.1);
    ctx.lineTo(x + off * r * 0.2,            y - r * 1.72);
    ctx.lineTo(x + off * r * 0.2 + r * 0.1,  y - r * 1.1);
    ctx.closePath();
    ctx.fill();
  }

  // Angry angled eyebrows (important for the grumpy look)
  ctx.strokeStyle = '#000022';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.46, y - r * 0.74);
  ctx.lineTo(x - r * 0.14, y - r * 0.66);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + r * 0.14, y - r * 0.66);
  ctx.lineTo(x + r * 0.46, y - r * 0.74);
  ctx.stroke();

  // Large oval white eyes
  _sphere(ctx, x - r * 0.28, y - r * 0.5, r * 0.17, c.eye, 'rgba(0,0,0,0.4)');
  _sphere(ctx, x + r * 0.28, y - r * 0.5, r * 0.17, c.eye, 'rgba(0,0,0,0.4)');
  // Small pupils (grumpy small-pupil look)
  ctx.fillStyle = c.pupil;
  ctx.beginPath();
  ctx.arc(x - r * 0.26, y - r * 0.48, r * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.30, y - r * 0.48, r * 0.09, 0, Math.PI * 2);
  ctx.fill();
  // Eye shine
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x - r * 0.22, y - r * 0.55, r * 0.045, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.34, y - r * 0.55, r * 0.045, 0, Math.PI * 2);
  ctx.fill();

  // Diamond-shaped yellow beak
  ctx.fillStyle = c.beak;
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(x,           y - r * 0.38);
  ctx.lineTo(x - r * 0.16, y - r * 0.28);
  ctx.lineTo(x,            y - r * 0.18);
  ctx.lineTo(x + r * 0.16, y - r * 0.28);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  ctx.restore();
}

// ============================================================
// Melody Bunny — My Melody-style bunny in pink hood
// ============================================================
function drawMelodyBunny(ctx, cx, cy, s, c) {
  ctx.save();
  ctx.scale(s, s);
  const x = cx / s, y = cy / s;
  const r = 14;

  // Engine glow (top — enemy flies downward)
  const egM = ctx.createRadialGradient(x, y - r*1.5, 0, x, y - r*2.1, r*0.68);
  egM.addColorStop(0, 'rgba(255,180,230,0.92)'); egM.addColorStop(0.5, 'rgba(255,100,200,0.5)'); egM.addColorStop(1, 'rgba(200,0,150,0)');
  ctx.fillStyle = egM; ctx.beginPath(); ctx.ellipse(x, y - r*1.65, r*0.21, r*0.50, 0, 0, Math.PI*2); ctx.fill();
  // Wings (pink to match hood)
  ctx.fillStyle = _darken(c.hood, 0.14); ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x - r*0.52, y - r*0.14); ctx.lineTo(x - r*1.30, y - r*0.48); ctx.lineTo(x - r*1.08, y + r*0.28); ctx.lineTo(x - r*0.44, y + r*0.14); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + r*0.52, y - r*0.14); ctx.lineTo(x + r*1.30, y - r*0.48); ctx.lineTo(x + r*1.08, y + r*0.28); ctx.lineTo(x + r*0.44, y + r*0.14); ctx.closePath(); ctx.fill(); ctx.stroke();

  // Tall bunny ears peek from top of hood
  ctx.fillStyle = _sphereGrad(ctx, x - r*0.36, y - r*1.38, r*0.21, c.ear);
  ctx.strokeStyle = 'rgba(0,0,0,0.28)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(x - r * 0.36, y - r * 1.35, r * 0.21, r * 0.58, -0.1, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = _sphereGrad(ctx, x + r*0.36, y - r*1.38, r*0.21, c.ear);
  ctx.beginPath();
  ctx.ellipse(x + r * 0.36, y - r * 1.35, r * 0.21, r * 0.58, 0.1, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // Inner ear (pink)
  ctx.fillStyle = c.hoodInner || '#ffb6c1';
  ctx.beginPath();
  ctx.ellipse(x - r * 0.36, y - r * 1.35, r * 0.1, r * 0.4, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + r * 0.36, y - r * 1.35, r * 0.1, r * 0.4, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Pink hood (My Melody's defining feature — big rounded pink dome)
  ctx.fillStyle = _sphereGrad(ctx, x, y - r*0.32, r, c.hood);
  ctx.strokeStyle = 'rgba(0,0,0,0.28)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(x, y, r, Math.PI, 0, false);
  ctx.lineTo(x + r * 1.1, y + r * 0.35);
  ctx.arc(x, y + r * 0.35, r * 1.1, 0, Math.PI, false);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  // Hood specular
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.beginPath();
  ctx.ellipse(x - r * 0.28, y - r * 0.5, r * 0.32, r * 0.18, -0.3, 0, Math.PI * 2);
  ctx.fill();
  // Hood inner edge (white lining visible at bottom)
  ctx.fillStyle = c.hoodInner || '#ffffff';
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.1, r * 0.58, r * 0.14, 0, 0, Math.PI);
  ctx.fill();

  // White face inside hood
  _sphere(ctx, x, y + r * 0.1, r * 0.76, c.main, 'rgba(0,0,0,0.18)');

  // Small black dot eyes
  ctx.fillStyle = c.eye;
  ctx.beginPath();
  ctx.arc(x - r * 0.24, y + r * 0.05, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.24, y + r * 0.05, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Eye shine
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.arc(x - r * 0.21, y + r * 0.01, r * 0.035, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.27, y + r * 0.01, r * 0.035, 0, Math.PI * 2);
  ctx.fill();

  // Small yellow nose (My Melody has a tiny yellow oval nose)
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.19, r * 0.065, r * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pink flower on hood (My Melody's detail)
  const fx = x + r * 0.66, fy = y - r * 0.28;
  const fr = r * 0.1;
  ctx.fillStyle = c.flower || '#ff0000';
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(fx + Math.cos(ang) * fr * 1.2, fy + Math.sin(ang) * fr * 1.2, fr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = c.flowerCenter || '#ffd700';
  ctx.beginPath();
  ctx.arc(fx, fy, fr * 0.72, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ============================================================
// Keroppi — giant-eyed frog
// ============================================================
function drawKeroppi(ctx, cx, cy, s, c) {
  ctx.save();
  ctx.scale(s, s);
  const x = cx / s, y = cy / s;
  const r = 13;

  // Engine glow (top — enemy flies downward)
  const egK = ctx.createRadialGradient(x, y - r*1.4, 0, x, y - r*1.9, r*0.62);
  egK.addColorStop(0, 'rgba(120,255,120,0.90)'); egK.addColorStop(0.5, 'rgba(60,200,60,0.48)'); egK.addColorStop(1, 'rgba(0,120,0,0)');
  ctx.fillStyle = egK; ctx.beginPath(); ctx.ellipse(x, y - r*1.52, r*0.19, r*0.44, 0, 0, Math.PI*2); ctx.fill();
  // Wings (green to match frog)
  ctx.fillStyle = _darken(c.main, 0.22); ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x - r*0.50, y - r*0.10); ctx.lineTo(x - r*1.26, y - r*0.44); ctx.lineTo(x - r*1.04, y + r*0.28); ctx.lineTo(x - r*0.42, y + r*0.14); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + r*0.50, y - r*0.10); ctx.lineTo(x + r*1.26, y - r*0.44); ctx.lineTo(x + r*1.04, y + r*0.28); ctx.lineTo(x + r*0.42, y + r*0.14); ctx.closePath(); ctx.fill(); ctx.stroke();

  // Round green head
  _sphere(ctx, x, y, r, c.main, 'rgba(0,0,0,0.35)');

  // Lighter belly/chin area
  ctx.fillStyle = c.belly;
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.36, r * 0.62, r * 0.56, 0, 0, Math.PI * 2);
  ctx.fill();

  // ---- HUGE goggle eyes on TOP of head (Keroppi's most iconic feature) ----
  _sphere(ctx, x - r * 0.44, y - r * 0.70, r * 0.42, c.eyeWhite, 'rgba(0,0,0,0.35)');
  _sphere(ctx, x + r * 0.44, y - r * 0.70, r * 0.42, c.eyeWhite, 'rgba(0,0,0,0.35)');
  // Pupils
  ctx.fillStyle = c.pupil;
  ctx.beginPath();
  ctx.arc(x - r * 0.42, y - r * 0.68, r * 0.26, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.46, y - r * 0.68, r * 0.26, 0, Math.PI * 2);
  ctx.fill();
  // Eye shine
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x - r * 0.33, y - r * 0.79, r * 0.11, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.55, y - r * 0.79, r * 0.11, 0, Math.PI * 2);
  ctx.fill();

  // V-shaped frog grin (Keroppi's signature W/V mouth)
  ctx.strokeStyle = c.mouth;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.38, y + r * 0.22);
  ctx.lineTo(x - r * 0.14, y + r * 0.42);
  ctx.lineTo(x,            y + r * 0.28);
  ctx.lineTo(x + r * 0.14, y + r * 0.42);
  ctx.lineTo(x + r * 0.38, y + r * 0.22);
  ctx.stroke();

  ctx.restore();
}

// ============================================================
// Tuxedo Sam — formal blue penguin
// ============================================================
function drawTuxedoSam(ctx, cx, cy, s, c) {
  ctx.save();
  ctx.scale(s, s);
  const x = cx / s, y = cy / s;
  const r = 13;

  // Engine glow (top — enemy flies downward)
  const egS = ctx.createRadialGradient(x, y - r*1.5, 0, x, y - r*2.0, r*0.65);
  egS.addColorStop(0, 'rgba(100,180,255,0.92)'); egS.addColorStop(0.5, 'rgba(40,100,220,0.5)'); egS.addColorStop(1, 'rgba(0,40,180,0)');
  ctx.fillStyle = egS; ctx.beginPath(); ctx.ellipse(x, y - r*1.62, r*0.20, r*0.48, 0, 0, Math.PI*2); ctx.fill();
  // Wings (blue to match tuxedo)
  ctx.fillStyle = _darken(c.main, 0.18); ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x - r*0.50, y - r*0.12); ctx.lineTo(x - r*1.28, y - r*0.46); ctx.lineTo(x - r*1.06, y + r*0.30); ctx.lineTo(x - r*0.42, y + r*0.16); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + r*0.50, y - r*0.12); ctx.lineTo(x + r*1.28, y - r*0.46); ctx.lineTo(x + r*1.06, y + r*0.30); ctx.lineTo(x + r*0.42, y + r*0.16); ctx.closePath(); ctx.fill(); ctx.stroke();

  // Blue body (formal penguin shape)
  ctx.fillStyle = _sphereGrad(ctx, x, y + r*0.28, r*0.85, c.main);
  ctx.strokeStyle = 'rgba(0,0,0,0.38)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.28, r * 0.78, r * 0.88, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // White belly
  ctx.fillStyle = _sphereGrad(ctx, x, y + r*0.45, r*0.5, c.belly);
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.44, r * 0.46, r * 0.64, 0, 0, Math.PI * 2);
  ctx.fill();

  // Red bowtie (prominent, Tuxedo Sam's signature)
  ctx.fillStyle = c.bowtie;
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 0.8;
  // Left wing of bow
  ctx.beginPath();
  ctx.moveTo(x,            y + r * 0.08);
  ctx.lineTo(x - r * 0.24, y + r * 0.0);
  ctx.lineTo(x - r * 0.26, y + r * 0.22);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  // Right wing of bow
  ctx.beginPath();
  ctx.moveTo(x,            y + r * 0.08);
  ctx.lineTo(x + r * 0.24, y + r * 0.0);
  ctx.lineTo(x + r * 0.26, y + r * 0.22);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  // Bowtie knot
  ctx.fillStyle = _darken(c.bowtie, 0.18);
  ctx.beginPath();
  ctx.arc(x, y + r * 0.11, r * 0.07, 0, Math.PI * 2);
  ctx.fill();

  // Round blue head
  _sphere(ctx, x, y - r * 0.62, r * 0.72, c.main, 'rgba(0,0,0,0.35)');

  // Orange beak (triangle)
  ctx.fillStyle = c.beak;
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(x,            y - r * 0.48);
  ctx.lineTo(x - r * 0.14, y - r * 0.38);
  ctx.lineTo(x + r * 0.14, y - r * 0.38);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  // Eyes (white circles with dark pupils)
  _sphere(ctx, x - r * 0.28, y - r * 0.72, r * 0.15, c.eye, 'rgba(0,0,0,0.3)');
  _sphere(ctx, x + r * 0.28, y - r * 0.72, r * 0.15, c.eye, 'rgba(0,0,0,0.3)');
  ctx.fillStyle = c.pupil;
  ctx.beginPath();
  ctx.arc(x - r * 0.27, y - r * 0.71, r * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.29, y - r * 0.71, r * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x - r * 0.23, y - r * 0.76, r * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.33, y - r * 0.76, r * 0.04, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ============================================================
// Chococat — black cat with huge chocolate nose
// ============================================================
function drawChococat(ctx, cx, cy, s, c) {
  ctx.save();
  ctx.scale(s, s);
  const x = cx / s, y = cy / s;
  const r = 13;

  // Engine glow (top — enemy flies downward)
  const egCh = ctx.createRadialGradient(x, y - r*1.4, 0, x, y - r*1.9, r*0.62);
  egCh.addColorStop(0, 'rgba(180,120,60,0.92)'); egCh.addColorStop(0.5, 'rgba(120,70,20,0.5)'); egCh.addColorStop(1, 'rgba(60,20,0,0)');
  ctx.fillStyle = egCh; ctx.beginPath(); ctx.ellipse(x, y - r*1.52, r*0.19, r*0.44, 0, 0, Math.PI*2); ctx.fill();
  // Wings (dark chocolate tones)
  ctx.fillStyle = '#2a1800'; ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x - r*0.50, y - r*0.10); ctx.lineTo(x - r*1.26, y - r*0.44); ctx.lineTo(x - r*1.04, y + r*0.28); ctx.lineTo(x - r*0.42, y + r*0.14); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + r*0.50, y - r*0.10); ctx.lineTo(x + r*1.26, y - r*0.44); ctx.lineTo(x + r*1.04, y + r*0.28); ctx.lineTo(x + r*0.42, y + r*0.14); ctx.closePath(); ctx.fill(); ctx.stroke();

  // Black head
  _sphere(ctx, x, y, r, c.main, 'rgba(0,0,0,0.5)');

  // Cat ears
  ctx.fillStyle = _sphereGrad(ctx, x - r*0.6, y - r*0.95, r*0.32, c.main);
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x - r * 0.5,  y - r * 0.72);
  ctx.lineTo(x - r * 0.82, y - r * 1.32);
  ctx.lineTo(x - r * 0.18, y - r * 1.06);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = _sphereGrad(ctx, x + r*0.6, y - r*0.95, r*0.32, c.main);
  ctx.beginPath();
  ctx.moveTo(x + r * 0.5,  y - r * 0.72);
  ctx.lineTo(x + r * 0.82, y - r * 1.32);
  ctx.lineTo(x + r * 0.18, y - r * 1.06);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  // Inner ears
  ctx.fillStyle = c.innerEar;
  ctx.beginPath();
  ctx.moveTo(x - r * 0.5,  y - r * 0.76);
  ctx.lineTo(x - r * 0.74, y - r * 1.22);
  ctx.lineTo(x - r * 0.24, y - r * 1.0);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + r * 0.5,  y - r * 0.76);
  ctx.lineTo(x + r * 0.74, y - r * 1.22);
  ctx.lineTo(x + r * 0.24, y - r * 1.0);
  ctx.closePath();
  ctx.fill();

  // ---- BIG chocolate oval nose (Chococat's #1 defining feature) ----
  _sphere(ctx, x, y + r * 0.18, r * 0.26, c.nose, 'rgba(0,0,0,0.3)');

  // ---- HUGE black eyes (Chococat's other defining feature alongside the nose) ----
  ctx.fillStyle = '#1a1a1a';
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.ellipse(x - r * 0.29, y - r * 0.30, r * 0.22, r * 0.20, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(x + r * 0.29, y - r * 0.30, r * 0.22, r * 0.20, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // Eye shine (two dots per eye, very sparkly)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x - r * 0.21, y - r * 0.38, r * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x - r * 0.35, y - r * 0.25, r * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.37, y - r * 0.38, r * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.23, y - r * 0.25, r * 0.04, 0, Math.PI * 2);
  ctx.fill();

  // Whiskers
  ctx.strokeStyle = c.whisker || '#888';
  ctx.lineWidth = 0.8;
  for (let i = -1; i <= 1; i++) {
    const wy = y + r * 0.24 + i * r * 0.12;
    ctx.beginPath();
    ctx.moveTo(x - r * 0.22, wy); ctx.lineTo(x - r * 0.88, wy); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + r * 0.22, wy); ctx.lineTo(x + r * 0.88, wy); ctx.stroke();
  }

  ctx.restore();
}

// ============================================================
// BOSS DRAWING
// ============================================================

function drawBoss(ctx, boss) {
  const cx = boss.x + boss.width / 2;
  const cy = boss.y + boss.height / 2;
  const s = boss.width / 100;
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
  ctx.fillStyle = '#ff69b4';
  ctx.beginPath();
  ctx.arc(cx, cy - r, r * 0.18, 0, Math.PI * 2);
  ctx.fill();
}

// ============================================================
// Pompompurin Boss — giant golden pudding pup with beret
// ============================================================
function drawPompompurinBoss(ctx, cx, cy, s, c) {
  const r = 36 * s;

  // Boss engine glow (top — 3 vents)
  for (let vi = -1; vi <= 1; vi++) {
    const egPP = ctx.createRadialGradient(cx + vi*r*0.38, cy - r*1.5, 0, cx + vi*r*0.38, cy - r*2.1, r*0.62);
    egPP.addColorStop(0, 'rgba(255,230,60,0.95)'); egPP.addColorStop(0.5, 'rgba(255,160,0,0.5)'); egPP.addColorStop(1, 'rgba(255,80,0,0)');
    ctx.fillStyle = egPP; ctx.beginPath(); ctx.ellipse(cx + vi*r*0.38, cy - r*1.6, r*0.14, r*0.42, 0, 0, Math.PI*2); ctx.fill();
  }
  // Boss wings (large, swept)
  ctx.fillStyle = _darken(c.main, 0.25); ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cx - r*0.58, cy - r*0.18); ctx.lineTo(cx - r*1.72, cy - r*0.62); ctx.lineTo(cx - r*1.48, cy + r*0.52); ctx.lineTo(cx - r*0.5, cy + r*0.28); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + r*0.58, cy - r*0.18); ctx.lineTo(cx + r*1.72, cy - r*0.62); ctx.lineTo(cx + r*1.48, cy + r*0.52); ctx.lineTo(cx + r*0.5, cy + r*0.28); ctx.closePath(); ctx.fill(); ctx.stroke();

  // Big round golden body
  _sphere(ctx, cx, cy, r, c.main, 'rgba(0,0,0,0.35)');

  // Small round ears
  _sphere(ctx, cx - r * 0.88, cy - r * 0.28, r * 0.22, c.main, 'rgba(0,0,0,0.28)');
  _sphere(ctx, cx + r * 0.88, cy - r * 0.28, r * 0.22, c.main, 'rgba(0,0,0,0.28)');

  // ---- Brown beret hat ----
  // Brim
  ctx.fillStyle = _darken(c.hatBrim, 0.05);
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(cx, cy - r * 0.7, r * 0.9, r * 0.18, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // Hat dome with 3D gradient
  ctx.fillStyle = _sphereGrad(ctx, cx, cy - r*1.07, r*0.56, c.hatTop);
  ctx.beginPath();
  ctx.ellipse(cx, cy - r * 1.06, r * 0.58, r * 0.44, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // Hat band (white stripe)
  ctx.fillStyle = c.hatBand;
  ctx.beginPath();
  ctx.ellipse(cx, cy - r * 0.84, r * 0.72, r * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  // Hat specular
  ctx.fillStyle = 'rgba(255,255,255,0.24)';
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.2, cy - r * 1.18, r * 0.26, r * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Rosy cheeks
  ctx.fillStyle = c.cheek;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.55, cy + r * 0.13, r * 0.28, r * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + r * 0.55, cy + r * 0.13, r * 0.28, r * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Sleepy droopy eyes
  ctx.fillStyle = c.eye;
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.3, cy - r * 0.06, r * 0.14, r * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + r * 0.3, cy - r * 0.06, r * 0.14, r * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();
  // Droopy eyelid arcs
  ctx.strokeStyle = c.eye;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx - r * 0.3, cy - r * 0.12, r * 0.18, Math.PI, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + r * 0.3, cy - r * 0.12, r * 0.18, Math.PI, 0);
  ctx.stroke();
  // Eye shine
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(cx - r * 0.24, cy - r * 0.13, r * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.36, cy - r * 0.13, r * 0.06, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = c.nose;
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 0.14, r * 0.1, r * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  // Wide happy smile
  ctx.strokeStyle = c.nose;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy + r * 0.24, r * 0.24, 0.05, Math.PI - 0.05);
  ctx.stroke();
}

// ============================================================
// Cinnamoroll Boss — giant white puppy with enormous blue ears
// ============================================================
function drawCinnamorollBoss(ctx, cx, cy, s, c) {
  const r = 38 * s;

  // Boss engine glow (top — 3 vents, blue/white for Cinnamoroll)
  for (let vi = -1; vi <= 1; vi++) {
    const egCI = ctx.createRadialGradient(cx + vi*r*0.38, cy - r*1.55, 0, cx + vi*r*0.38, cy - r*2.15, r*0.64);
    egCI.addColorStop(0, 'rgba(180,230,255,0.96)'); egCI.addColorStop(0.5, 'rgba(80,160,255,0.52)'); egCI.addColorStop(1, 'rgba(0,80,220,0)');
    ctx.fillStyle = egCI; ctx.beginPath(); ctx.ellipse(cx + vi*r*0.38, cy - r*1.65, r*0.14, r*0.44, 0, 0, Math.PI*2); ctx.fill();
  }
  // Boss wings
  ctx.fillStyle = _darken(c.ear, 0.22); ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cx - r*0.58, cy - r*0.18); ctx.lineTo(cx - r*1.74, cy - r*0.64); ctx.lineTo(cx - r*1.50, cy + r*0.52); ctx.lineTo(cx - r*0.5, cy + r*0.28); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + r*0.58, cy - r*0.18); ctx.lineTo(cx + r*1.74, cy - r*0.64); ctx.lineTo(cx + r*1.50, cy + r*0.52); ctx.lineTo(cx + r*0.5, cy + r*0.28); ctx.closePath(); ctx.fill(); ctx.stroke();

  // ---- Enormous floppy BLUE ears ----
  ctx.fillStyle = _sphereGrad(ctx, cx - r*0.98, cy + r*0.42, r*0.46, c.ear);
  ctx.strokeStyle = 'rgba(0,0,0,0.28)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.96, cy + r * 0.42, r * 0.45, r * 0.86, -0.22, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = _sphereGrad(ctx, cx + r*0.98, cy + r*0.42, r*0.46, c.ear);
  ctx.beginPath();
  ctx.ellipse(cx + r * 0.96, cy + r * 0.42, r * 0.45, r * 0.86, 0.22, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // Inner ear gradient
  ctx.fillStyle = c.earInner;
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.96, cy + r * 0.42, r * 0.24, r * 0.61, -0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + r * 0.96, cy + r * 0.42, r * 0.24, r * 0.61, 0.22, 0, Math.PI * 2);
  ctx.fill();
  // Ear highlights
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.beginPath();
  ctx.ellipse(cx - r * 1.06, cy + r * 0.1, r * 0.16, r * 0.28, -0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + r * 0.86, cy + r * 0.1, r * 0.16, r * 0.28, 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Big white round head
  _sphere(ctx, cx, cy, r, c.main, 'rgba(0,0,0,0.25)');

  // ---- Cinnamon roll tail on top ----
  ctx.strokeStyle = c.tail;
  ctx.lineWidth = 4 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy - r * 1.04, r * 0.28, Math.PI * 0.82, Math.PI * 2.18);
  ctx.stroke();
  ctx.fillStyle = c.tail;
  ctx.beginPath();
  ctx.arc(cx, cy - r * 0.82, r * 0.13, 0, Math.PI * 2);
  ctx.fill();

  // Rosy cheeks
  ctx.fillStyle = c.cheek;
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.52, cy + r * 0.22, r * 0.26, r * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + r * 0.52, cy + r * 0.22, r * 0.26, r * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Big sparkly blue eyes
  _sphere(ctx, cx - r * 0.27, cy - r * 0.05, r * 0.19, c.eye, 'rgba(0,0,0,0.28)');
  _sphere(ctx, cx + r * 0.27, cy - r * 0.05, r * 0.19, c.eye, 'rgba(0,0,0,0.28)');
  ctx.fillStyle = c.pupil;
  ctx.beginPath();
  ctx.arc(cx - r * 0.27, cy - r * 0.05, r * 0.11, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.27, cy - r * 0.05, r * 0.11, 0, Math.PI * 2);
  ctx.fill();
  // Sparkle highlights (two dots per eye)
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(cx - r * 0.21, cy - r * 0.12, r * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx - r * 0.32, cy - r * 0.01, r * 0.033, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.33, cy - r * 0.12, r * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.22, cy - r * 0.01, r * 0.033, 0, Math.PI * 2);
  ctx.fill();

  // Small button nose
  ctx.fillStyle = '#ffb6c1';
  ctx.beginPath();
  ctx.arc(cx, cy + r * 0.18, r * 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Curly tail below (cinnamon swirl)
  ctx.strokeStyle = c.tail;
  ctx.lineWidth = 3 * s;
  ctx.beginPath();
  ctx.arc(cx + r * 0.6, cy + r * 0.88, r * 0.28, Math.PI, 0);
  ctx.stroke();
}

// ============================================================
// My Melody Boss — giant pink-hooded bunny
// ============================================================
function drawMyMelodyBoss(ctx, cx, cy, s, c) {
  const r = 37 * s;

  // Boss engine glow (top — 3 vents, pink for My Melody)
  for (let vi = -1; vi <= 1; vi++) {
    const egMM = ctx.createRadialGradient(cx + vi*r*0.36, cy - r*1.52, 0, cx + vi*r*0.36, cy - r*2.10, r*0.62);
    egMM.addColorStop(0, 'rgba(255,180,240,0.95)'); egMM.addColorStop(0.5, 'rgba(255,80,200,0.52)'); egMM.addColorStop(1, 'rgba(200,0,150,0)');
    ctx.fillStyle = egMM; ctx.beginPath(); ctx.ellipse(cx + vi*r*0.36, cy - r*1.62, r*0.13, r*0.42, 0, 0, Math.PI*2); ctx.fill();
  }
  // Boss wings (pink)
  ctx.fillStyle = _darken(c.hood, 0.18); ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cx - r*0.56, cy - r*0.16); ctx.lineTo(cx - r*1.70, cy - r*0.60); ctx.lineTo(cx - r*1.46, cy + r*0.50); ctx.lineTo(cx - r*0.48, cy + r*0.26); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + r*0.56, cy - r*0.16); ctx.lineTo(cx + r*1.70, cy - r*0.60); ctx.lineTo(cx + r*1.46, cy + r*0.50); ctx.lineTo(cx + r*0.48, cy + r*0.26); ctx.closePath(); ctx.fill(); ctx.stroke();

  // Tall bunny ears peek from top of hood
  ctx.fillStyle = _sphereGrad(ctx, cx - r*0.38, cy - r*1.42, r*0.22, c.ear);
  ctx.strokeStyle = 'rgba(0,0,0,0.28)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.38, cy - r * 1.4, r * 0.22, r * 0.62, -0.1, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = _sphereGrad(ctx, cx + r*0.38, cy - r*1.42, r*0.22, c.ear);
  ctx.beginPath();
  ctx.ellipse(cx + r * 0.38, cy - r * 1.4, r * 0.22, r * 0.62, 0.1, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // Inner ears
  ctx.fillStyle = c.hoodInner || '#ffb6c1';
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.38, cy - r * 1.4, r * 0.11, r * 0.44, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + r * 0.38, cy - r * 1.4, r * 0.11, r * 0.44, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Pink hood (big dome with gradient)
  ctx.fillStyle = _sphereGrad(ctx, cx, cy - r*0.35, r, c.hood);
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, 0, false);
  ctx.bezierCurveTo(cx + r * 1.05, cy + r * 0.2, cx + r * 0.8, cy + r * 0.5, cx, cy + r * 0.3);
  ctx.bezierCurveTo(cx - r * 0.8, cy + r * 0.5, cx - r * 1.05, cy + r * 0.2, cx - r, cy);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  // Hood specular
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.3, cy - r * 0.52, r * 0.35, r * 0.2, -0.3, 0, Math.PI * 2);
  ctx.fill();
  // Hood inner edge (white lining)
  ctx.fillStyle = c.hoodInner;
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 0.06, r * 0.55, r * 0.15, 0, 0, Math.PI);
  ctx.fill();

  // Face
  _sphere(ctx, cx, cy + r * 0.1, r * 0.72, c.main, 'rgba(0,0,0,0.2)');

  // Eyes
  ctx.fillStyle = c.eye;
  ctx.beginPath();
  ctx.arc(cx - r * 0.24, cy + r * 0.05, r * 0.11, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.24, cy + r * 0.05, r * 0.11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(cx - r * 0.21, cy + r * 0.01, r * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.27, cy + r * 0.01, r * 0.04, 0, Math.PI * 2);
  ctx.fill();

  // Small triangle nose
  ctx.fillStyle = '#ff69b4';
  ctx.beginPath();
  ctx.moveTo(cx,            cy + r * 0.22);
  ctx.lineTo(cx - r * 0.07, cy + r * 0.16);
  ctx.lineTo(cx + r * 0.07, cy + r * 0.16);
  ctx.closePath();
  ctx.fill();

  // Flower on hood
  const fx = cx + r * 0.7, fy = cy - r * 0.3;
  const fr = r * 0.1;
  ctx.fillStyle = c.flower;
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(fx + Math.cos(ang) * fr * 1.2, fy + Math.sin(ang) * fr * 1.2, fr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = c.flowerCenter;
  ctx.beginPath();
  ctx.arc(fx, fy, fr * 0.8, 0, Math.PI * 2);
  ctx.fill();
}

// ============================================================
// Badtz-Maru Boss — giant grumpy punk penguin with crown
// ============================================================
function drawBadtzMaruBoss(ctx, cx, cy, s, c) {
  const r = 36 * s;

  // Boss engine glow (top — 3 vents, fierce orange/red for Badtz-Maru)
  for (let vi = -1; vi <= 1; vi++) {
    const egBM = ctx.createRadialGradient(cx + vi*r*0.38, cy - r*1.55, 0, cx + vi*r*0.38, cy - r*2.18, r*0.65);
    egBM.addColorStop(0, 'rgba(255,120,0,0.95)'); egBM.addColorStop(0.5, 'rgba(200,40,0,0.55)'); egBM.addColorStop(1, 'rgba(100,0,0,0)');
    ctx.fillStyle = egBM; ctx.beginPath(); ctx.ellipse(cx + vi*r*0.38, cy - r*1.66, r*0.14, r*0.44, 0, 0, Math.PI*2); ctx.fill();
  }
  // Boss wings (dark, slightly purple-tinted)
  ctx.fillStyle = '#1a1a3a'; ctx.strokeStyle = 'rgba(80,0,150,0.4)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cx - r*0.60, cy - r*0.20); ctx.lineTo(cx - r*1.80, cy - r*0.68); ctx.lineTo(cx - r*1.54, cy + r*0.54); ctx.lineTo(cx - r*0.52, cy + r*0.30); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + r*0.60, cy - r*0.20); ctx.lineTo(cx + r*1.80, cy - r*0.68); ctx.lineTo(cx + r*1.54, cy + r*0.54); ctx.lineTo(cx + r*0.52, cy + r*0.30); ctx.closePath(); ctx.fill(); ctx.stroke();

  // Black egg body
  ctx.fillStyle = _sphereGrad(ctx, cx, cy + r*0.22, r*0.82, c.main);
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 0.2, r * 0.78, r * 0.95, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // Dark belly
  ctx.fillStyle = c.belly;
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 0.4, r * 0.42, r * 0.65, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  _sphere(ctx, cx, cy - r * 0.5, r * 0.78, c.main, 'rgba(0,0,0,0.4)');

  // ---- Dramatic spiky hair (5 tall spikes) ----
  ctx.fillStyle = '#000022';
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(cx + i * r * 0.26 - r * 0.12, cy - r * 1.1);
    ctx.lineTo(cx + i * r * 0.26,             cy - r * 1.72);
    ctx.lineTo(cx + i * r * 0.26 + r * 0.12,  cy - r * 1.1);
    ctx.closePath();
    ctx.fill();
  }

  // ---- Angry angled eyebrows ----
  ctx.strokeStyle = '#000022';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.44, cy - r * 0.84);
  ctx.lineTo(cx - r * 0.14, cy - r * 0.77);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.14, cy - r * 0.77);
  ctx.lineTo(cx + r * 0.44, cy - r * 0.84);
  ctx.stroke();

  // Large oval eyes
  _sphere(ctx, cx - r * 0.28, cy - r * 0.6, r * 0.18, c.eye, 'rgba(0,0,0,0.4)');
  _sphere(ctx, cx + r * 0.28, cy - r * 0.6, r * 0.18, c.eye, 'rgba(0,0,0,0.4)');
  // Red pupils (boss Badtz-Maru has red pupils)
  ctx.fillStyle = c.pupil;
  ctx.beginPath();
  ctx.arc(cx - r * 0.26, cy - r * 0.58, r * 0.11, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.30, cy - r * 0.58, r * 0.11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(cx - r * 0.21, cy - r * 0.65, r * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.35, cy - r * 0.65, r * 0.05, 0, Math.PI * 2);
  ctx.fill();

  // Diamond-shaped yellow beak
  ctx.fillStyle = c.beak;
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx,            cy - r * 0.42);
  ctx.lineTo(cx - r * 0.16, cy - r * 0.3);
  ctx.lineTo(cx,            cy - r * 0.18);
  ctx.lineTo(cx + r * 0.16, cy - r * 0.3);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  // Boss crown (purple with gem)
  ctx.fillStyle = c.crown || '#9400d3';
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 1.5;
  const cr = r * 0.32;
  ctx.beginPath();
  ctx.moveTo(cx - cr,       cy - r * 1.85);
  ctx.lineTo(cx - cr,       cy - r * 1.85 - cr);
  ctx.lineTo(cx - cr * 0.5, cy - r * 1.85 - cr * 0.5);
  ctx.lineTo(cx,            cy - r * 1.85 - cr);
  ctx.lineTo(cx + cr * 0.5, cy - r * 1.85 - cr * 0.5);
  ctx.lineTo(cx + cr,       cy - r * 1.85 - cr);
  ctx.lineTo(cx + cr,       cy - r * 1.85);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = c.crownGem || '#ff69b4';
  ctx.beginPath();
  ctx.arc(cx, cy - r * 1.85 - cr, cr * 0.2, 0, Math.PI * 2);
  ctx.fill();
}

// ============================================================
// Kuromi Boss — dark jester bunny
// ============================================================
function drawKuromiBoss(ctx, cx, cy, s, c) {
  const r = 37 * s;

  // Boss engine glow (top — 3 vents, eerie purple for Kuromi)
  for (let vi = -1; vi <= 1; vi++) {
    const egKU = ctx.createRadialGradient(cx + vi*r*0.36, cy - r*1.52, 0, cx + vi*r*0.36, cy - r*2.10, r*0.62);
    egKU.addColorStop(0, 'rgba(200,80,255,0.95)'); egKU.addColorStop(0.5, 'rgba(120,0,200,0.55)'); egKU.addColorStop(1, 'rgba(60,0,100,0)');
    ctx.fillStyle = egKU; ctx.beginPath(); ctx.ellipse(cx + vi*r*0.36, cy - r*1.62, r*0.13, r*0.42, 0, 0, Math.PI*2); ctx.fill();
  }
  // Boss wings (dark with purple tint)
  ctx.fillStyle = '#1e0030'; ctx.strokeStyle = 'rgba(150,0,200,0.45)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cx - r*0.56, cy - r*0.18); ctx.lineTo(cx - r*1.72, cy - r*0.64); ctx.lineTo(cx - r*1.48, cy + r*0.52); ctx.lineTo(cx - r*0.48, cy + r*0.28); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + r*0.56, cy - r*0.18); ctx.lineTo(cx + r*1.72, cy - r*0.64); ctx.lineTo(cx + r*1.48, cy + r*0.52); ctx.lineTo(cx + r*0.48, cy + r*0.28); ctx.closePath(); ctx.fill(); ctx.stroke();

  // Dark jester hood (with gradient)
  ctx.fillStyle = _sphereGrad(ctx, cx, cy - r*0.3, r, c.hood);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, 0, false);
  ctx.lineTo(cx + r, cy + r * 0.5);
  ctx.arc(cx, cy + r * 0.5, r, 0, Math.PI, false);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  // Pink hood lining at the bottom
  ctx.fillStyle = c.hoodLining;
  ctx.beginPath();
  ctx.arc(cx, cy + r * 0.5, r, 0, Math.PI, false);
  ctx.fill();
  // Hood specular
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.3, cy - r * 0.52, r * 0.32, r * 0.18, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Skull motif on hood (pink skull, centered — Kuromi's most iconic detail)
  const sx = cx, sy = cy - r * 0.28;
  _sphere(ctx, sx, sy, r * 0.18, '#ff69b4', 'rgba(0,0,0,0.3)');
  ctx.fillStyle = c.skullEye;
  ctx.beginPath();
  ctx.arc(sx - r * 0.06, sy - r * 0.02, r * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(sx + r * 0.06, sy - r * 0.02, r * 0.04, 0, Math.PI * 2);
  ctx.fill();
  // Skull mouth
  ctx.strokeStyle = c.skullEye;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(sx, sy + r * 0.07, r * 0.06, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // White face
  _sphere(ctx, cx, cy + r * 0.12, r * 0.72, c.main, 'rgba(0,0,0,0.2)');

  // Pink bunny ears peek from under hood
  ctx.fillStyle = c.ear;
  ctx.beginPath();
  ctx.arc(cx - r * 0.62, cy - r * 0.62, r * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.62, cy - r * 0.62, r * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Violet eyes
  _sphere(ctx, cx - r * 0.22, cy + r * 0.1, r * 0.13, c.eye, 'rgba(0,0,0,0.25)');
  _sphere(ctx, cx + r * 0.22, cy + r * 0.1, r * 0.13, c.eye, 'rgba(0,0,0,0.25)');
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(cx - r * 0.18, cy + r * 0.06, r * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.26, cy + r * 0.06, r * 0.05, 0, Math.PI * 2);
  ctx.fill();

  // Rosy cheeks
  ctx.fillStyle = c.cheek;
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.arc(cx - r * 0.5, cy + r * 0.26, r * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.5, cy + r * 0.26, r * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Mischievous smirk (asymmetric)
  ctx.strokeStyle = '#ff69b4';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.2, cy + r * 0.36);
  ctx.quadraticCurveTo(cx + r * 0.06, cy + r * 0.5, cx + r * 0.3, cy + r * 0.3);
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
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  grad.addColorStop(0, '#87ceeb');
  grad.addColorStop(1, '#d4f4a4');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  _drawScrolledElements(ctx, bg.far, _drawCloud.bind(null, ctx), '#fff');
  _drawScrolledElements(ctx, bg.mid, _drawFlower.bind(null, ctx));
  _drawScrolledElements(ctx, bg.near, _drawPetal.bind(null, ctx));
}

function _drawRainbowBG(ctx, bg) {
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  grad.addColorStop(0, '#1a0040');
  grad.addColorStop(0.5, '#400080');
  grad.addColorStop(1, '#8000ff');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
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

function _drawScrolledElements(ctx, elements, drawFn, color, alpha) {
  ctx.save();
  if (alpha !== undefined) ctx.globalAlpha = alpha;
  for (const el of elements) {
    drawFn(el.x, el.y, el.size, color || el.color);
  }
  ctx.restore();
}

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
  for (let i = -1; i <= 1; i++) {
    ctx.fillRect(x + i * size * 0.28 - size * 0.12, y - size * 1.3, size * 0.22, size * 0.3);
  }
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

  // ---- Boss health bar ----
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

  // ---- HP bar ----
  const barW   = 280, barH = 22;
  const barX   = (CANVAS_W - barW) / 2;
  const barY   = CANVAS_H - 46;
  const hpRatio = player.health / player.maxHealth;

  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(barX - 38, barY - 20, barW + 42, barH + 24);

  ctx.font = 'bold 15px "Courier New"';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'right';
  ctx.fillText('HP', barX - 6, barY + barH * 0.72);
  ctx.textAlign = 'left';

  ctx.fillStyle = COLOR_HEALTH_EMPTY;
  ctx.fillRect(barX, barY, barW, barH);

  if (hpRatio > 0) {
    const fillW = barW * hpRatio;
    const grad = ctx.createLinearGradient(barX, barY, barX, barY + barH);
    grad.addColorStop(0,   '#ff80b8');
    grad.addColorStop(0.5, '#ff3366');
    grad.addColorStop(1,   '#cc0033');
    ctx.fillStyle = grad;
    if (hpRatio <= 0.25) {
      const pulse = Math.abs(Math.sin(Date.now() * 0.006));
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur  = 10 + 10 * pulse;
    }
    ctx.fillRect(barX, barY, fillW, barH);
    ctx.shadowBlur = 0;
  }

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth   = 2;
  ctx.strokeRect(barX, barY, barW, barH);

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

  // ---- Weapon level pips ----
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
  // Ears — rounded dome shape (matches main drawKittyCharacter)
  const mEarW = r * 0.36, mEarH = r * 0.50;
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.60 - mEarW, cy - r * 0.90);
  ctx.bezierCurveTo(cx - r * 0.60 - mEarW, cy - r * 0.90 - mEarH, cx - r * 0.60 + mEarW, cy - r * 0.90 - mEarH, cx - r * 0.60 + mEarW, cy - r * 0.90);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.60 - mEarW, cy - r * 0.90);
  ctx.bezierCurveTo(cx + r * 0.60 - mEarW, cy - r * 0.90 - mEarH, cx + r * 0.60 + mEarW, cy - r * 0.90 - mEarH, cx + r * 0.60 + mEarW, cy - r * 0.90);
  ctx.closePath();
  ctx.fill();
  // Bow at base of right ear
  ctx.fillStyle = colors.bow;
  ctx.beginPath();
  ctx.arc(cx + r * 0.60, cy - r * 0.90, r * 0.28, 0, Math.PI * 2);
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
