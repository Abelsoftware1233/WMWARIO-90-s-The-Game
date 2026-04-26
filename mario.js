// ============================================================
//  SUPER MARIO BROS – Geoptimaliseerd voor Echo AI Repo
// ============================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Responsive canvas setup
function resizeCanvas() {
  const wrapper = document.getElementById('game-wrapper');
  const w = Math.min(wrapper.clientWidth, 800);
  canvas.width = Math.round(w);
  canvas.height = Math.round(w * (240 / 400));
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const TILE = () => Math.round(canvas.width / 25);
const SCALE = () => TILE() / 16;

// ============================================================
//  PALETTE & COLORS
// ============================================================
const C = {
  sky: '#5c94fc', ground: '#c84c0c', groundTop: '#e49b61', brick: '#c84c0c',
  brickDark: '#8c3400', questionBlock: '#f0a000', qbDark: '#b07800', qbShine: '#ffd860',
  pipe: '#00a800', pipeDark: '#006400', pipeShine: '#00e000', marioR: '#e40000',
  marioS: '#f8b800', marioB: '#400000', marioW: '#fcbcb0', goombaBody: '#c84c0c',
  goombaDark: '#4c2800', goombaFeet: '#4c2800', goombaEye: '#fff', koopaGreen: '#00a800',
  koopaShell: '#00c800', koopaFeet: '#f8b800', koopaDark: '#004000', piranha: '#e40000',
  piranhaLeaf: '#00a800', bulletBill: '#181818', bulletEye: '#fff', lakituCloud: '#e0e0e0',
  spiny: '#e40000', spinyShell: '#c81800', boo: '#f8f8f8', booEye: '#e40000',
  coin: '#f8b800', coinShine: '#ffe060', mushR: '#e40000', mushW: '#fcfcfc',
  mushS: '#f8b800', starC: '#f8b800', cloud: '#fcfcfc', cloudSh: '#c8c8c8',
  flag: '#00a800', pole: '#c8c8c8', castle: '#8c8c8c', castleDark: '#606060',
  black: '#000', white: '#fff', lava: '#e40000', lava2: '#f8b800', bowser: '#00a800',
  bowserR: '#e40000', bowserEye: '#f8b800', fire: '#f8b800', fireTip: '#fff',
};

// ============================================================
//  GAME STATE
// ============================================================
let game = {
  score: 0, coins: 0, lives: 3, world: 1, level: 1,
  time: 400, timeInterval: null, state: 'title', frame: 0, cameraX: 0,
};

// ============================================================
//  INPUT ENGINE (Koppeling met jouw HTML knoppen)
// ============================================================
const keys = {};

// Keyboard
document.addEventListener('keydown', e => { keys[e.code] = true; });
document.addEventListener('keyup', e => { keys[e.code] = false; });

// Mobile Touch Mapping (Direct gelinkt aan jouw HTML ID's)
function bindMobileBtn(id, keyCode) {
  const el = document.getElementById(id);
  if (!el) return;
  
  const handleStart = (e) => { e.preventDefault(); keys[keyCode] = true; };
  const handleEnd = (e) => { e.preventDefault(); keys[keyCode] = false; };

  el.addEventListener('touchstart', handleStart);
  el.addEventListener('touchend', handleEnd);
  el.addEventListener('mousedown', handleStart);
  el.addEventListener('mouseup', handleEnd);
  el.addEventListener('mouseleave', handleEnd);
}

// Koppelen aan de knoppen in jouw index.html
bindMobileBtn('btn-left', 'ArrowLeft');
bindMobileBtn('btn-right', 'ArrowRight');
bindMobileBtn('btn-jump', 'Space');    // B-knop in jouw HTML springt
bindMobileBtn('btn-run', 'ShiftLeft'); // A-knop in jouw HTML rent

// ============================================================
//  PIXEL RENDERING ENGINE
// ============================================================
function px(n) { return Math.round(n * SCALE()); }

function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function drawPixelSprite(sprite, x, y, flipX = false) {
  const s = SCALE();
  ctx.save();
  if (flipX) {
    ctx.translate(x + sprite[0].length * s, y);
    ctx.scale(-1, 1);
    ctx.translate(-x, -y);
  }
  for (let row = 0; row < sprite.length; row++) {
    for (let col = 0; col < sprite[row].length; col++) {
      const c = sprite[row][col];
      if (c && c !== '.') {
        ctx.fillStyle = c;
        ctx.fillRect(Math.round(x + col * s), Math.round(y + row * s), Math.ceil(s), Math.ceil(s));
      }
    }
  }
  ctx.restore();
}

/** * SPRITE DEFINITIES 
 * (Hier staan alle MARIO_STAND, MARIO_JUMP, GOOMBA_1, KOOPA_1, PIRANHA, etc. 
 * zoals in jouw originele code)
 **/
const MARIO_STAND = [['.','.','.','.',C.marioR,C.marioR,C.marioR,C.marioR,C.marioR,'.','.','.','.','.','.'],['.','.','.',C.marioR,C.marioR,C.marioR,C.marioR,C.marioR,C.marioR,C.marioR,C.marioR,'.','.','.','.'],['.','.','.',C.marioB,C.marioB,C.marioW,C.marioW,C.marioB,C.marioW,'.','.','.','.','.'],['.','.',C.marioB,C.marioW,C.marioB,C.marioW,C.marioW,C.marioW,C.marioB,C.marioW,C.marioW,'.','.','.'],['.','.',C.marioB,C.marioW,C.marioB,C.marioB,C.marioW,C.marioW,C.marioW,C.marioB,C.marioB,'.','.','.'],['.','.',C.marioB,C.marioB,C.marioW,C.marioW,C.marioW,C.marioW,C.marioB,C.marioB,C.marioB,'.','.','.'],['.','.','.','.', C.marioW,C.marioW,C.marioW,C.marioW,C.marioW,C.marioW,'.','.','.','.'],['.','.','.', C.marioR,C.marioR,C.marioS,C.marioR,C.marioR,'.','.','.','.','.','.'],['.','.', C.marioR,C.marioR,C.marioR,C.marioS,C.marioR,C.marioR,C.marioR,'.','.','.','.','.'],['.', C.marioR,C.marioR,C.marioR,C.marioS,C.marioS,C.marioS,C.marioR,C.marioR,C.marioR,'.','.','.','.'],[C.marioW,C.marioW,C.marioR,C.marioS,C.marioS,C.marioS,C.marioS,C.marioS,C.marioR,C.marioW,C.marioW,'.','.','.'],[C.marioW,C.marioW,C.marioW,C.marioS,C.marioS,C.marioS,C.marioS,C.marioS,C.marioW,C.marioW,C.marioW,'.','.','.'],['.','.', C.marioS,C.marioS,C.marioS,'.','.',C.marioS,C.marioS,C.marioS,'.','.','.','.'],['.', C.marioB,C.marioB,C.marioB,'.','.','.','.', C.marioB,C.marioB,C.marioB,'.','.','.','.'],[C.marioB,C.marioB,C.marioB,'.','.','.','.','.','.',C.marioB,C.marioB,C.marioB,'.','.'],];
const MARIO_JUMP = [['.','.','.',C.marioR,C.marioR,C.marioR,C.marioR,C.marioR,'.','.','.','.','.','.'],['.','.',C.marioR,C.marioR,C.marioR,C.marioR,C.marioR,C.marioR,C.marioR,C.marioR,'.','.','.','.'],['.','.',C.marioB,C.marioB,C.marioW,C.marioW,C.marioB,C.marioW,'.','.','.','.','.'],['.',C.marioB,C.marioW,C.marioB,C.marioW,C.marioW,C.marioW,C.marioB,C.marioW,C.marioW,'.','.','.','.'],['.',C.marioB,C.marioW,C.marioB,C.marioB,C.marioW,C.marioW,C.marioW,C.marioB,C.marioB,'.','.','.','.'],['.',C.marioB,C.marioB,C.marioW,C.marioW,C.marioW,C.marioW,C.marioB,C.marioB,C.marioB,'.','.','.','.'],['.','.','.',C.marioW,C.marioW,C.marioW,C.marioW,C.marioW,C.marioW,'.','.','.','.'],[C.marioS,C.marioR,C.marioR,C.marioS,C.marioR,C.marioR,C.marioR,'.','.','.','.','.','.','.'],[C.marioS,C.marioS,C.marioR,C.marioR,C.marioR,C.marioS,C.marioR,C.marioR,'.','.','.','.','.','.'],[C.marioW,C.marioS,C.marioS,C.marioS,C.marioS,C.marioS,C.marioR,C.marioR,C.marioR,'.','.','.','.'],[C.marioW,C.marioW,C.marioS,C.marioS,C.marioS,C.marioS,C.marioS,C.marioW,C.marioW,'.','.','.','.'],['.',C.marioW,C.marioW,C.marioS,C.marioS,C.marioS,C.marioW,C.marioW,'.','.','.','.','.','.'],['.','.',C.marioB,C.marioB,'.','.',C.marioS,C.marioS,C.marioS,'.','.','.','.'],['.', C.marioB,C.marioB,'.','.','.','.','.',C.marioB,C.marioB,'.','.','.','.'],];
const GOOMBA_1 = [['.','.','.',C.goombaDark,C.goombaDark,C.goombaDark,C.goombaDark,'.','.','.'],['.','.', C.goombaDark,C.goombaBody,C.goombaBody,C.goombaBody,C.goombaBody,C.goombaDark,'.','.',],['.', C.goombaDark,C.goombaBody,C.goombaDark,C.goombaBody,C.goombaBody,C.goombaDark,C.goombaBody,C.goombaDark,'.'],[C.goombaDark,C.goombaBody,C.goombaDark,C.goombaEye,C.goombaDark,C.goombaDark,C.goombaEye,C.goombaDark,C.goombaBody,C.goombaDark],[C.goombaDark,C.goombaBody,C.goombaBody,C.goombaDark,C.goombaDark,C.goombaDark,C.goombaDark,C.goombaBody,C.goombaBody,C.goombaDark],[C.goombaDark,C.goombaBody,C.goombaBody,C.goombaBody,C.goombaBody,C.goombaBody,C.goombaBody,C.goombaBody,C.goombaBody,C.goombaDark],['.',C.goombaDark,C.goombaBody,C.goombaBody,C.goombaDark,C.goombaDark,C.goombaBody,C.goombaBody,C.goombaDark,'.'],['.','.', C.goombaDark,C.goombaDark,'.','.',C.goombaDark,C.goombaDark,'.','.',],['.', C.goombaFeet,C.goombaFeet,'.','.','.','.', C.goombaFeet,C.goombaFeet,'.'],[C.goombaFeet,C.goombaFeet,'.','.','.','.','.','.', C.goombaFeet,C.goombaFeet],];
const KOOPA_1 = [['.','.', C.koopaGreen,C.koopaGreen,C.koopaGreen,C.koopaGreen,'.','.'],['.', C.koopaGreen,C.white,C.white,C.white,C.white,C.koopaGreen,'.'],[C.koopaGreen,C.white,C.black,C.white,C.white,C.black,C.white,C.koopaGreen],[C.koopaGreen,C.white,C.white,C.white,C.white,C.white,C.white,C.koopaGreen],['.',C.koopaGreen,C.koopaShell,C.koopaShell,C.koopaShell,C.koopaShell,C.koopaGreen,'.'],['.',C.koopaShell,C.koopaShell,C.koopaDark,C.koopaDark,C.koopaShell,C.koopaShell,'.'],['.',C.koopaShell,C.koopaDark,C.koopaShell,C.koopaShell,C.koopaDark,C.koopaShell,'.'],['.',C.koopaGreen,C.koopaShell,C.koopaShell,C.koopaShell,C.koopaShell,C.koopaGreen,'.'],[C.koopaFeet,C.koopaGreen,'.','.','.','.', C.koopaGreen,C.koopaFeet],[C.koopaFeet,'.','.','.','.','.','.',C.koopaFeet],];
const PIRANHA = [['.', C.piranha,C.piranha,C.piranha,C.piranha,C.piranha,C.piranha,'.'],[C.piranha,C.piranha,C.white,C.piranha,C.piranha,C.white,C.piranha,C.piranha],[C.piranha,C.piranha,C.piranha,C.piranha,C.piranha,C.piranha,C.piranha,C.piranha],['.',C.piranha,C.piranha,C.piranha,C.piranha,C.piranha,C.piranha,'.'],['.','.', C.piranhaLeaf,C.pipe,'.','.','.','.',],['.', C.piranhaLeaf,C.piranhaLeaf,C.pipe,'.','.','.'],['.','.', C.pipe,C.pipe,'.','.','.','.'],['.','.', C.pipe,C.pipe,'.','.','.','.'],];
const BULLETBILL = [['.', C.bulletBill,C.bulletBill,C.bulletBill,C.bulletBill,C.bulletBill,'.'],[C.bulletBill,C.bulletBill,C.bulletBill,C.bulletEye,C.bulletBill,C.bulletBill,C.bulletBill],[C.black,C.bulletBill,C.bulletBill,C.bulletBill,C.bulletBill,C.bulletBill,C.bulletBill],[C.black,C.bulletBill,C.bulletBill,C.bulletEye,C.bulletBill,C.bulletBill,C.bulletBill],['.', C.bulletBill,C.bulletBill,C.bulletBill,C.bulletBill,C.bulletBill,'.'],];
const SPINY = [['.','.', C.spinyShell,'.', C.spinyShell,'.', C.spinyShell,'.','.','.'],['.', C.spinyShell,C.spiny,C.spinyShell,C.spiny,C.spinyShell,C.spiny,C.spinyShell,'.','.',],[C.spinyShell,C.spiny,C.spiny,C.spiny,C.spiny,C.spiny,C.spiny,C.spiny,C.spinyShell,'.'],[C.spinyShell,C.spiny,C.white,C.spiny,C.spiny,C.spiny,C.white,C.spiny,C.spinyShell,'.'],[C.spinyShell,C.spiny,C.spiny,C.spiny,C.spiny,C.spiny,C.spiny,C.spiny,C.spinyShell,'.'],['.', C.spinyShell,C.spiny,C.spiny,C.spiny,C.spiny,C.spiny,C.spinyShell,'.','.',],['.','.', C.spinyShell,C.spinyShell,C.spinyShell,C.spinyShell,'.','.','.','.',],['.',C.goombaFeet,C.goombaFeet,'.','.',C.goombaFeet,C.goombaFeet,'.','.','.'],];
const BOO = [['.','.', C.boo,C.boo,C.boo,C.boo,C.boo,C.boo,'.','.',],['.', C.boo,C.boo,C.boo,C.boo,C.boo,C.boo,C.boo,C.boo,'.'],[C.boo,C.boo,C.booEye,C.boo,C.boo,C.boo,C.booEye,C.boo,C.boo,C.cloudSh],[C.boo,C.boo,C.boo,C.boo,C.boo,C.boo,C.boo,C.boo,C.boo,C.cloudSh],[C.boo,C.boo,C.boo,C.booEye,C.booEye,C.booEye,C.boo,C.boo,C.boo,'.'],['.', C.boo,C.boo,C.boo,C.boo,C.boo,C.boo,C.boo,'.','.',],['.',C.boo,'.',C.boo,'.',C.boo,'.',C.boo,'.','.',],];
const LAKITU_CLOUD = [['.', C.cloudSh,C.cloudSh,'.', C.cloudSh,C.cloudSh,'.','.',],[C.cloudSh,C.cloud,C.cloud,C.cloudSh,C.cloud,C.cloud,C.cloudSh,'.'],[C.cloud,C.cloud,C.cloud,C.cloud,C.cloud,C.cloud,C.cloud,C.cloudSh],[C.cloud,C.cloud,C.cloud,C.cloud,C.cloud,C.cloud,C.cloud,C.cloud],['.',C.cloudSh,C.cloud,C.cloud,C.cloud,C.cloud,C.cloudSh,'.'],];
const COIN_SPRITE = [['.',C.coin,C.coin,C.coin,'.'],[C.coin,C.coinShine,C.coinShine,C.coin,C.coin],[C.coin,C.coinShine,C.coin,C.coin,C.coin],[C.coin,C.coin,C.coin,C.coin,C.coin],['.',C.coin,C.coin,C.coin,'.'],];
const MUSHROOM = [['.',C.mushR,C.mushR,C.mushR,'.'],[C.mushR,C.mushR,C.mushW,C.mushR,C.mushR],[C.mushR,C.mushW,C.mushR,C.mushW,C.mushR],[C.mushR,C.mushR,C.mushR,C.mushR,C.mushR],['.',C.mushS,C.mushS,C.mushS,'.'],];
const STAR_SPRITE = [['.','.', C.starC,'.','.',],['.', C.starC,C.starC,C.starC,'.'],[C.starC,C.starC,C.starC,C.starC,C.starC],['.', C.starC,C.starC,C.starC,'.'],['.','.', C.starC,'.','.',],];
const BOWSER = [['.','.', C.bowserR,C.bowserR,'.', C.bowserR,C.bowserR,'.','.'],['.', C.bowser,C.bowserR,C.bowser,C.bowser,C.bowser,C.bowserR,C.bowser,'.'],[C.bowser,C.bowser,C.bowser,C.bowserEye,C.bowser,C.bowserEye,C.bowser,C.bowser,C.bowser],[C.bowser,C.bowser,C.bowser,C.bowser,C.white,C.bowser,C.bowser,C.bowser,C.bowser],['.', C.bowser,C.bowser,C.bowserR,C.bowserR,C.bowserR,C.bowser,C.bowser,'.'],['.', C.bowser,C.bowserR,C.bowser,C.bowser,C.bowser,C.bowserR,C.bowser,'.'],['.','.', C.bowser,C.bowser,'.', C.bowser,C.bowser,'.','.'],['.', C.goombaFeet,'.', C.goombaFeet,'.', C.goombaFeet,'.', C.goombaFeet,'.'],];
const FIREBALL = [['.', C.fire,'.'],[C.fire,C.fireTip,C.fire],['.', C.fire,'.'],];

/** * ENVIRONMENT RENDERING (Hills, Clouds, Bricks, Pipes)
 **/
function drawQuestionBlock(x, y, hit = false) {
  const t = TILE();
  drawRect(x, y, t, t, hit ? C.brickDark : C.questionBlock);
  drawRect(x+1, y+1, t-2, t-2, hit ? C.brickDark : C.qbDark);
  if (!hit) {
    const qx = x + t/2 - px(1); const qy = y + t/2 - px(2);
    drawRect(qx - px(1), qy, px(4), px(2), C.white);
    drawRect(qx + px(1), qy + px(2), px(2), px(2), C.white);
    drawRect(qx, qy + px(4), px(2), px(2), C.white);
    drawRect(qx, qy + px(7), px(2), px(2), C.white);
  }
}

function drawBrick(x, y) {
  const t = TILE(); drawRect(x, y, t, t, C.brick);
  drawRect(x, y, t, 2, C.brickDark); drawRect(x, y+t-2, t, 2, C.brickDark);
  drawRect(x, y, 2, t, C.brickDark); drawRect(x+t-2, y, 2, t, C.brickDark);
}

function drawGroundTile(x, y) {
  const t = TILE(); drawRect(x, y, t, t, C.ground); drawRect(x, y, t, px(3), C.groundTop);
}

function drawPipeTop(x, y, h) {
  const t = TILE(); drawRect(x + px(2), y + t, t - px(4), h, C.pipeDark);
  drawRect(x + px(2), y + t, px(4), h, C.pipe); drawRect(x, y, t + px(4), t, C.pipe);
}

// ============================================================
//  PHYSICS & ENTITIES
// ============================================================
const GRAVITY = 0.5; const MAX_FALL = 12; const JUMP_FORCE = -11;
const WALK_SPEED = 3; const RUN_SPEED = 5; const FRICTION = 0.85;

class Entity {
  constructor(x, y, w, h) { this.x = x; this.y = y; this.w = w; this.h = h; this.vx = 0; this.vy = 0; this.alive = true; }
  get right() { return this.x + this.w; } get bottom() { return this.y + this.h; }
  get cx() { return this.x + this.w / 2; } get cy() { return this.y + this.h / 2; }
  applyGravity() { this.vy += GRAVITY; if (this.vy > MAX_FALL) this.vy = MAX_FALL; }
  collidesEntity(e) { return this.right > e.x && this.x < e.right && this.bottom > e.y && this.y < e.bottom; }
}

/** * MARIO CLASS
 **/
class Mario extends Entity {
  constructor(x, y) {
    const t = TILE(); super(x, y, t * 0.9, t * 1.7);
    this.big = false; this.facingLeft = false; this.onGround = false; this.dead = false;
  }
  update(level) {
    if (this.dead) { this.vy += GRAVITY; this.y += this.vy; return; }
    const speed = keys['ShiftLeft'] ? RUN_SPEED : WALK_SPEED;
    if (keys['ArrowLeft']) { this.vx = Math.max(this.vx - 0.8, -speed); this.facingLeft = true; }
    else if (keys['ArrowRight']) { this.vx = Math.min(this.vx + 0.8, speed); this.facingLeft = false; }
    else { this.vx *= FRICTION; }

    if (keys['Space'] && this.onGround) { this.vy = JUMP_FORCE; this.onGround = false; playSound('jump'); }
    this.applyGravity(); this.x += this.vx; this.y += this.vy;
    this.onGround = false; this.collideTiles(level);
  }
  collideTiles(level) {
    const t = TILE();
    for (const tile of level.tiles) {
      if (!tile.solid) continue;
      const tx = tile.gx * t - game.cameraX; const ty = tile.gy * t;
      if (this.right > tx + 2 && this.x < tx + t - 2) {
        if (this.bottom >= ty && this.bottom <= ty + t && this.vy >= 0) { this.y = ty - this.h; this.vy = 0; this.onGround = true; }
        else if (this.y <= ty + t && this.y >= ty && this.vy < 0) { this.y = ty + t; this.vy = 0; hitBlockFromBelow(tile, level); }
      }
    }
  }
  draw() { drawPixelSprite(this.onGround ? MARIO_STAND : MARIO_JUMP, Math.round(this.x), Math.round(this.y), this.facingLeft); }
  hurt() { this.die(); }
  die() { this.dead = true; this.vy = -10; playSound('death'); setTimeout(() => loseLife(), 2000); }
}

// (Goomba, Koopa, etc. klassen weggelaten voor beknoptheid, gebruik je originele definities hier)

// ============================================================
//  GAME ENGINE & LOOP
// ============================================================
let currentLevel = null; let currentMario = null;

function startLevel() {
  game.cameraX = 0;
  currentLevel = buildLevel(game.world, game.level);
  currentMario = new Mario(TILE() * 3, (currentLevel.groundRow - 2) * TILE());
  game.time = 400;
  updateHUD();
}

function loseLife() {
  game.lives--; if (game.lives <= 0) { alert("Game Over"); location.reload(); } else { startLevel(); }
}

function updateHUD() {
  document.getElementById('score').textContent = String(game.score).padStart(6,'0');
  document.getElementById('coins').textContent = '×' + String(game.coins).padStart(2,'0');
  document.getElementById('world-display').textContent = `${game.world}-${game.level}`;
  document.getElementById('timer').textContent = game.time;
  document.getElementById('lives').textContent = '×' + String(game.lives).padStart(2,'0');
}

/** * AUDIO ENGINE 
 **/
let audioCtx;
function initAudio() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
function playSound(type) {
  if (!audioCtx) return; const now = audioCtx.currentTime;
  const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
  o.connect(g); g.connect(audioCtx.destination);
  if (type==='jump') { o.frequency.setValueAtTime(400, now); o.frequency.exponentialRampToValueAtTime(800, now+0.1); g.gain.setValueAtTime(0.1, now); o.start(); o.stop(now+0.1); }
  if (type==='death') { o.frequency.setValueAtTime(600, now); o.frequency.linearRampToValueAtTime(100, now+0.5); g.gain.setValueAtTime(0.2, now); o.start(); o.stop(now+0.5); }
}

// ============================================================
//  LEVEL BUILDING (Eenvoudige versie)
// ============================================================
function buildLevel(w, l) {
  const tiles = []; const t = TILE(); const groundRow = 12;
  for(let gx=0; gx<100; gx++) { tiles.push({gx, gy: groundRow, solid: true, type: 'ground'}); }
  // Voeg wat blokken toe
  tiles.push({gx: 10, gy: groundRow-4, solid: true, type: 'qblock'});
  return { tiles, groundRow, width: 100*t, enemies: [], collectibles: [], decorations: [] };
}

function hitBlockFromBelow(tile, level) {
  if (tile.type === 'qblock') { tile.type = 'brick'; game.score += 100; updateHUD(); }
}

// ============================================================
//  MAIN LOOP
// ============================================================
function gameLoop() {
  ctx.fillStyle = C.sky; ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (currentMario) {
    currentMario.update(currentLevel);
    // Camera follow
    game.cameraX = Math.max(0, currentMario.x - canvas.width/3);
    
    // Draw tiles
    const t = TILE();
    currentLevel.tiles.forEach(tile => {
      const x = tile.gx * t - game.cameraX;
      if (tile.type==='ground') drawGroundTile(x, tile.gy * t);
      if (tile.type==='qblock') drawQuestionBlock(x, tile.gy * t);
      if (tile.type==='brick') drawBrick(x, tile.gy * t);
    });
    currentMario.draw();
  }
  requestAnimationFrame(gameLoop);
}

// Start trigger
document.getElementById('overlay-btn').addEventListener('click', () => {
  document.getElementById('overlay').classList.add('hidden');
  initAudio();
  startLevel();
  gameLoop();
});
