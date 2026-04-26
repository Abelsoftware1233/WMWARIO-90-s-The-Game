// ============================================================
//  SUPER MARIO BROS – Complete JS Game Engine
// ============================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Responsive canvas
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
//  PALETTE
// ============================================================
const C = {
  sky:    '#5c94fc',
  ground: '#c84c0c',
  groundTop:'#e49b61',
  brick:  '#c84c0c',
  brickDark:'#8c3400',
  questionBlock:'#f0a000',
  qbDark: '#b07800',
  qbShine:'#ffd860',
  pipe:   '#00a800',
  pipeDark:'#006400',
  pipeShine:'#00e000',
  marioR: '#e40000',
  marioS: '#f8b800',
  marioB: '#400000',
  marioW: '#fcbcb0',
  goombaBody:'#c84c0c',
  goombaDark:'#4c2800',
  goombaFeet:'#4c2800',
  goombaEye:'#fff',
  koopaGreen:'#00a800',
  koopaShell:'#00c800',
  koopaFeet:'#f8b800',
  koopaDark: '#004000',
  piranha:  '#e40000',
  piranhaLeaf:'#00a800',
  bulletBill:'#181818',
  bulletEye: '#fff',
  lakituCloud:'#e0e0e0',
  spiny:  '#e40000',
  spinyShell:'#c81800',
  boo:    '#f8f8f8',
  booEye: '#e40000',
  coin:   '#f8b800',
  coinShine:'#ffe060',
  mushR:  '#e40000',
  mushW:  '#fcfcfc',
  mushS:  '#f8b800',
  starC:  '#f8b800',
  cloud:  '#fcfcfc',
  cloudSh:'#c8c8c8',
  flag:   '#00a800',
  pole:   '#c8c8c8',
  castle: '#8c8c8c',
  castleDark:'#606060',
  black:  '#000',
  white:  '#fff',
  lava:   '#e40000',
  lava2:  '#f8b800',
  bowser: '#00a800',
  bowserR:'#e40000',
  bowserEye:'#f8b800',
  fire:   '#f8b800',
  fireTip:'#fff',
};

// ============================================================
//  GAME STATE
// ============================================================
let game = {
  score: 0,
  coins: 0,
  lives: 3,
  world: 1,
  level: 1,
  time: 400,
  timeInterval: null,
  state: 'title',   // title | playing | paused | dead | gameover | win
  frame: 0,
  cameraX: 0,
};

// ============================================================
//  INPUT
// ============================================================
const keys = {};
document.addEventListener('keydown', e => { keys[e.code] = true; });
document.addEventListener('keyup',   e => { keys[e.code] = false; });

// Mobile buttons
function bindBtn(id, code) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('touchstart', e => { e.preventDefault(); keys[code] = true; });
  el.addEventListener('touchend',   e => { e.preventDefault(); keys[code] = false; });
  el.addEventListener('mousedown',  () => keys[code] = true);
  el.addEventListener('mouseup',    () => keys[code] = false);
}
bindBtn('btn-left',  'ArrowLeft');
bindBtn('btn-right', 'ArrowRight');
bindBtn('btn-jump',  'Space');
bindBtn('btn-run',   'ShiftLeft');

// ============================================================
//  PIXEL DRAWING HELPERS
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

// ============================================================
//  SPRITE DEFINITIONS (pixel art grids, 16×16 base)
// ============================================================

// Mario walking frame 1
const MARIO_STAND = [
  ['.','.','.','.',C.marioR,C.marioR,C.marioR,C.marioR,C.marioR,'.','.','.','.','.','.'],
  ['.','.','.',C.marioR,C.marioR,C.marioR,C.marioR,C.marioR,C.marioR,C.marioR,C.marioR,'.','.','.','.'],
  ['.','.','.',C.marioB,C.marioB,C.marioW,C.marioW,C.marioB,C.marioW,'.','.','.','.','.'],
  ['.','.',C.marioB,C.marioW,C.marioB,C.marioW,C.marioW,C.marioW,C.marioB,C.marioW,C.marioW,'.','.','.'],
  ['.','.',C.marioB,C.marioW,C.marioB,C.marioB,C.marioW,C.marioW,C.marioW,C.marioB,C.marioB,'.','.','.'],
  ['.','.',C.marioB,C.marioB,C.marioW,C.marioW,C.marioW,C.marioW,C.marioB,C.marioB,C.marioB,'.','.','.'],
  ['.','.','.','.', C.marioW,C.marioW,C.marioW,C.marioW,C.marioW,C.marioW,'.','.','.','.'],
  ['.','.','.', C.marioR,C.marioR,C.marioS,C.marioR,C.marioR,'.','.','.','.','.','.'],
  ['.','.', C.marioR,C.marioR,C.marioR,C.marioS,C.marioR,C.marioR,C.marioR,'.','.','.','.','.'],
  ['.', C.marioR,C.marioR,C.marioR,C.marioS,C.marioS,C.marioS,C.marioR,C.marioR,C.marioR,'.','.','.','.'],
  [C.marioW,C.marioW,C.marioR,C.marioS,C.marioS,C.marioS,C.marioS,C.marioS,C.marioR,C.marioW,C.marioW,'.','.','.'],
  [C.marioW,C.marioW,C.marioW,C.marioS,C.marioS,C.marioS,C.marioS,C.marioS,C.marioW,C.marioW,C.marioW,'.','.','.'],
  ['.','.', C.marioS,C.marioS,C.marioS,'.','.',C.marioS,C.marioS,C.marioS,'.','.','.','.'],
  ['.', C.marioB,C.marioB,C.marioB,'.','.','.','.', C.marioB,C.marioB,C.marioB,'.','.','.','.'],
  [C.marioB,C.marioB,C.marioB,'.','.','.','.','.','.',C.marioB,C.marioB,C.marioB,'.','.'],
];

const MARIO_JUMP = [
  ['.','.','.',C.marioR,C.marioR,C.marioR,C.marioR,C.marioR,'.','.','.','.','.','.'],
  ['.','.',C.marioR,C.marioR,C.marioR,C.marioR,C.marioR,C.marioR,C.marioR,C.marioR,'.','.','.','.'],
  ['.','.',C.marioB,C.marioB,C.marioW,C.marioW,C.marioB,C.marioW,'.','.','.','.','.'],
  ['.',C.marioB,C.marioW,C.marioB,C.marioW,C.marioW,C.marioW,C.marioB,C.marioW,C.marioW,'.','.','.','.'],
  ['.',C.marioB,C.marioW,C.marioB,C.marioB,C.marioW,C.marioW,C.marioW,C.marioB,C.marioB,'.','.','.','.'],
  ['.',C.marioB,C.marioB,C.marioW,C.marioW,C.marioW,C.marioW,C.marioB,C.marioB,C.marioB,'.','.','.','.'],
  ['.','.','.',C.marioW,C.marioW,C.marioW,C.marioW,C.marioW,C.marioW,'.','.','.','.'],
  [C.marioS,C.marioR,C.marioR,C.marioS,C.marioR,C.marioR,C.marioR,'.','.','.','.','.','.','.'],
  [C.marioS,C.marioS,C.marioR,C.marioR,C.marioR,C.marioS,C.marioR,C.marioR,'.','.','.','.','.','.'],
  [C.marioW,C.marioS,C.marioS,C.marioS,C.marioS,C.marioS,C.marioR,C.marioR,C.marioR,'.','.','.','.'],
  [C.marioW,C.marioW,C.marioS,C.marioS,C.marioS,C.marioS,C.marioS,C.marioW,C.marioW,'.','.','.','.'],
  ['.',C.marioW,C.marioW,C.marioS,C.marioS,C.marioS,C.marioW,C.marioW,'.','.','.','.','.','.'],
  ['.','.',C.marioB,C.marioB,'.','.',C.marioS,C.marioS,C.marioS,'.','.','.','.'],
  ['.', C.marioB,C.marioB,'.','.','.','.','.',C.marioB,C.marioB,'.','.','.','.'],
];

// Goomba
const GOOMBA_1 = [
  ['.','.','.',C.goombaDark,C.goombaDark,C.goombaDark,C.goombaDark,'.','.','.'],
  ['.','.', C.goombaDark,C.goombaBody,C.goombaBody,C.goombaBody,C.goombaBody,C.goombaDark,'.','.',],
  ['.', C.goombaDark,C.goombaBody,C.goombaDark,C.goombaBody,C.goombaBody,C.goombaDark,C.goombaBody,C.goombaDark,'.'],
  [C.goombaDark,C.goombaBody,C.goombaDark,C.goombaEye,C.goombaDark,C.goombaDark,C.goombaEye,C.goombaDark,C.goombaBody,C.goombaDark],
  [C.goombaDark,C.goombaBody,C.goombaBody,C.goombaDark,C.goombaDark,C.goombaDark,C.goombaDark,C.goombaBody,C.goombaBody,C.goombaDark],
  [C.goombaDark,C.goombaBody,C.goombaBody,C.goombaBody,C.goombaBody,C.goombaBody,C.goombaBody,C.goombaBody,C.goombaBody,C.goombaDark],
  ['.',C.goombaDark,C.goombaBody,C.goombaBody,C.goombaDark,C.goombaDark,C.goombaBody,C.goombaBody,C.goombaDark,'.'],
  ['.','.', C.goombaDark,C.goombaDark,'.','.',C.goombaDark,C.goombaDark,'.','.',],
  ['.', C.goombaFeet,C.goombaFeet,'.','.','.','.', C.goombaFeet,C.goombaFeet,'.'],
  [C.goombaFeet,C.goombaFeet,'.','.','.','.','.','.', C.goombaFeet,C.goombaFeet],
];

// Koopa Troopa
const KOOPA_1 = [
  ['.','.', C.koopaGreen,C.koopaGreen,C.koopaGreen,C.koopaGreen,'.','.'],
  ['.', C.koopaGreen,C.white,C.white,C.white,C.white,C.koopaGreen,'.'],
  [C.koopaGreen,C.white,C.black,C.white,C.white,C.black,C.white,C.koopaGreen],
  [C.koopaGreen,C.white,C.white,C.white,C.white,C.white,C.white,C.koopaGreen],
  ['.',C.koopaGreen,C.koopaShell,C.koopaShell,C.koopaShell,C.koopaShell,C.koopaGreen,'.'],
  ['.',C.koopaShell,C.koopaShell,C.koopaDark,C.koopaDark,C.koopaShell,C.koopaShell,'.'],
  ['.',C.koopaShell,C.koopaDark,C.koopaShell,C.koopaShell,C.koopaDark,C.koopaShell,'.'],
  ['.',C.koopaGreen,C.koopaShell,C.koopaShell,C.koopaShell,C.koopaShell,C.koopaGreen,'.'],
  [C.koopaFeet,C.koopaGreen,'.','.','.','.', C.koopaGreen,C.koopaFeet],
  [C.koopaFeet,'.','.','.','.','.','.',C.koopaFeet],
];

// Piranha Plant
const PIRANHA = [
  ['.', C.piranha,C.piranha,C.piranha,C.piranha,C.piranha,C.piranha,'.'],
  [C.piranha,C.piranha,C.white,C.piranha,C.piranha,C.white,C.piranha,C.piranha],
  [C.piranha,C.piranha,C.piranha,C.piranha,C.piranha,C.piranha,C.piranha,C.piranha],
  ['.',C.piranha,C.piranha,C.piranha,C.piranha,C.piranha,C.piranha,'.'],
  ['.','.', C.piranhaLeaf,C.pipe,'.','.','.','.',],
  ['.', C.piranhaLeaf,C.piranhaLeaf,C.pipe,'.','.','.'],
  ['.','.', C.pipe,C.pipe,'.','.','.','.'],
  ['.','.', C.pipe,C.pipe,'.','.','.','.'],
];

// Bullet Bill
const BULLETBILL = [
  ['.', C.bulletBill,C.bulletBill,C.bulletBill,C.bulletBill,C.bulletBill,'.'],
  [C.bulletBill,C.bulletBill,C.bulletBill,C.bulletEye,C.bulletBill,C.bulletBill,C.bulletBill],
  [C.black,C.bulletBill,C.bulletBill,C.bulletBill,C.bulletBill,C.bulletBill,C.bulletBill],
  [C.black,C.bulletBill,C.bulletBill,C.bulletEye,C.bulletBill,C.bulletBill,C.bulletBill],
  ['.', C.bulletBill,C.bulletBill,C.bulletBill,C.bulletBill,C.bulletBill,'.'],
];

// Spiny
const SPINY = [
  ['.','.', C.spinyShell,'.', C.spinyShell,'.', C.spinyShell,'.','.','.'],
  ['.', C.spinyShell,C.spiny,C.spinyShell,C.spiny,C.spinyShell,C.spiny,C.spinyShell,'.','.',],
  [C.spinyShell,C.spiny,C.spiny,C.spiny,C.spiny,C.spiny,C.spiny,C.spiny,C.spinyShell,'.'],
  [C.spinyShell,C.spiny,C.white,C.spiny,C.spiny,C.spiny,C.white,C.spiny,C.spinyShell,'.'],
  [C.spinyShell,C.spiny,C.spiny,C.spiny,C.spiny,C.spiny,C.spiny,C.spiny,C.spinyShell,'.'],
  ['.', C.spinyShell,C.spiny,C.spiny,C.spiny,C.spiny,C.spiny,C.spinyShell,'.','.',],
  ['.','.', C.spinyShell,C.spinyShell,C.spinyShell,C.spinyShell,'.','.','.','.',],
  ['.',C.goombaFeet,C.goombaFeet,'.','.',C.goombaFeet,C.goombaFeet,'.','.','.'],
];

// Boo
const BOO = [
  ['.','.', C.boo,C.boo,C.boo,C.boo,C.boo,C.boo,'.','.',],
  ['.', C.boo,C.boo,C.boo,C.boo,C.boo,C.boo,C.boo,C.boo,'.'],
  [C.boo,C.boo,C.booEye,C.boo,C.boo,C.boo,C.booEye,C.boo,C.boo,C.cloudSh],
  [C.boo,C.boo,C.boo,C.boo,C.boo,C.boo,C.boo,C.boo,C.boo,C.cloudSh],
  [C.boo,C.boo,C.boo,C.booEye,C.booEye,C.booEye,C.boo,C.boo,C.boo,'.'],
  ['.', C.boo,C.boo,C.boo,C.boo,C.boo,C.boo,C.boo,'.','.',],
  ['.',C.boo,'.',C.boo,'.',C.boo,'.',C.boo,'.','.',],
];

// Lakitu (cloud + spiny thrower)
const LAKITU_CLOUD = [
  ['.', C.cloudSh,C.cloudSh,'.', C.cloudSh,C.cloudSh,'.','.',],
  [C.cloudSh,C.cloud,C.cloud,C.cloudSh,C.cloud,C.cloud,C.cloudSh,'.'],
  [C.cloud,C.cloud,C.cloud,C.cloud,C.cloud,C.cloud,C.cloud,C.cloudSh],
  [C.cloud,C.cloud,C.cloud,C.cloud,C.cloud,C.cloud,C.cloud,C.cloud],
  ['.',C.cloudSh,C.cloud,C.cloud,C.cloud,C.cloud,C.cloudSh,'.'],
];

// Coin
const COIN_SPRITE = [
  ['.',C.coin,C.coin,C.coin,'.'],
  [C.coin,C.coinShine,C.coinShine,C.coin,C.coin],
  [C.coin,C.coinShine,C.coin,C.coin,C.coin],
  [C.coin,C.coin,C.coin,C.coin,C.coin],
  ['.',C.coin,C.coin,C.coin,'.'],
];

// Mushroom
const MUSHROOM = [
  ['.',C.mushR,C.mushR,C.mushR,'.'],
  [C.mushR,C.mushR,C.mushW,C.mushR,C.mushR],
  [C.mushR,C.mushW,C.mushR,C.mushW,C.mushR],
  [C.mushR,C.mushR,C.mushR,C.mushR,C.mushR],
  ['.',C.mushS,C.mushS,C.mushS,'.'],
];

// Star
const STAR_SPRITE = [
  ['.','.', C.starC,'.','.',],
  ['.', C.starC,C.starC,C.starC,'.'],
  [C.starC,C.starC,C.starC,C.starC,C.starC],
  ['.', C.starC,C.starC,C.starC,'.'],
  ['.','.', C.starC,'.','.',],
];

// Bowser
const BOWSER = [
  ['.','.', C.bowserR,C.bowserR,'.', C.bowserR,C.bowserR,'.','.'],
  ['.', C.bowser,C.bowserR,C.bowser,C.bowser,C.bowser,C.bowserR,C.bowser,'.'],
  [C.bowser,C.bowser,C.bowser,C.bowserEye,C.bowser,C.bowserEye,C.bowser,C.bowser,C.bowser],
  [C.bowser,C.bowser,C.bowser,C.bowser,C.white,C.bowser,C.bowser,C.bowser,C.bowser],
  ['.', C.bowser,C.bowser,C.bowserR,C.bowserR,C.bowserR,C.bowser,C.bowser,'.'],
  ['.', C.bowser,C.bowserR,C.bowser,C.bowser,C.bowser,C.bowserR,C.bowser,'.'],
  ['.','.', C.bowser,C.bowser,'.', C.bowser,C.bowser,'.','.'],
  ['.', C.goombaFeet,'.', C.goombaFeet,'.', C.goombaFeet,'.', C.goombaFeet,'.'],
];

// Fireball
const FIREBALL = [
  ['.', C.fire,'.'],
  [C.fire,C.fireTip,C.fire],
  ['.', C.fire,'.'],
];

// Question Block
function drawQuestionBlock(x, y, hit = false) {
  const t = TILE();
  drawRect(x, y, t, t, hit ? C.brickDark : C.questionBlock);
  drawRect(x+1, y+1, t-2, t-2, hit ? C.brickDark : C.qbDark);
  if (!hit) {
    // Shine
    drawRect(x+2, y+2, px(2), px(2), C.qbShine);
    // Q mark
    const qx = x + t/2 - px(1);
    const qy = y + t/2 - px(2);
    drawRect(qx - px(1), qy, px(4), px(2), C.white);
    drawRect(qx + px(1), qy + px(2), px(2), px(2), C.white);
    drawRect(qx, qy + px(4), px(2), px(2), C.white);
    drawRect(qx, qy + px(7), px(2), px(2), C.white);
  }
}

function drawBrick(x, y) {
  const t = TILE();
  drawRect(x, y, t, t, C.brick);
  drawRect(x, y, t, 2, C.brickDark);
  drawRect(x, y+t-2, t, 2, C.brickDark);
  drawRect(x, y, 2, t, C.brickDark);
  drawRect(x+t-2, y, 2, t, C.brickDark);
  // mortar lines
  drawRect(x+2, y + Math.floor(t*0.45), t-4, 2, C.brickDark);
  drawRect(x+2, y+2, Math.floor(t/2)-2, Math.floor(t*0.45)-2, C.groundTop);
  drawRect(x+2+Math.floor(t/2), y + Math.floor(t*0.45)+2, Math.floor(t/2)-4, t-Math.floor(t*0.45)-4, C.groundTop);
}

function drawGroundTile(x, y) {
  const t = TILE();
  drawRect(x, y, t, t, C.ground);
  drawRect(x, y, t, px(3), C.groundTop);
  drawRect(x+2, y+2, px(3), px(3), C.groundTop);
}

function drawPipeTop(x, y, h) {
  const t = TILE();
  // pipe body
  drawRect(x + px(2), y + t, t - px(4), h, C.pipeDark);
  drawRect(x + px(2), y + t, px(4), h, C.pipe);
  // pipe top cap
  drawRect(x, y, t + px(4), t, C.pipe);
  drawRect(x+px(2), y+px(2), px(4), t - px(2), C.pipeShine);
  drawRect(x, y, px(2), t, C.pipeDark);
  drawRect(x + t + px(2), y, px(2), t, C.pipeDark);
}

function drawCloud(x, y) {
  const t = TILE();
  const w = t * 3;
  const h = t * 2;
  ctx.fillStyle = C.cloudSh;
  ctx.beginPath();
  ctx.arc(x+w*0.25, y+h*0.7, h*0.35, 0, Math.PI*2);
  ctx.arc(x+w*0.5,  y+h*0.5, h*0.45, 0, Math.PI*2);
  ctx.arc(x+w*0.75, y+h*0.7, h*0.3,  0, Math.PI*2);
  ctx.fillRect(x, y+h*0.65, w, h*0.35);
  ctx.fill();
  ctx.fillStyle = C.cloud;
  ctx.beginPath();
  ctx.arc(x+w*0.25, y+h*0.65, h*0.3, 0, Math.PI*2);
  ctx.arc(x+w*0.5,  y+h*0.45, h*0.4, 0, Math.PI*2);
  ctx.arc(x+w*0.75, y+h*0.65, h*0.25,0, Math.PI*2);
  ctx.fillRect(x+px(2), y+h*0.6, w-px(4), h*0.4);
  ctx.fill();
}

function drawCastle(x, y) {
  const t = TILE();
  const w = t*4; const h = t*5;
  drawRect(x, y, w, h, C.castle);
  // battlements
  for(let i=0; i<3; i++) {
    drawRect(x + i*t*1.2, y, t*0.8, t*0.6, C.castleDark);
  }
  // window
  drawRect(x+w/2-t*0.4, y+h*0.3, t*0.8, t, C.black);
  // door
  drawRect(x+w/2-t*0.6, y+h-t*1.5, t*1.2, t*1.5, C.black);
  // bricks
  for(let row=0; row<5; row++) {
    for(let col=0; col<4; col++) {
      if((row+col)%2===0) drawRect(x+col*t, y+row*t, t, px(2), C.castleDark);
    }
  }
}

function drawFlag(x, y) {
  const t = TILE();
  // pole
  drawRect(x + t*3, y, px(3), t*7, C.pole);
  // flag
  drawRect(x+t*1, y, t*2, t*1.5, C.flag);
  drawRect(x+t*1, y, t*2, px(3), '#006400');
}

// ============================================================
//  PHYSICS CONSTANTS
// ============================================================
const GRAVITY = 0.5;
const MAX_FALL = 12;
const JUMP_FORCE = -11;
const WALK_SPEED = 3;
const RUN_SPEED = 5;
const FRICTION = 0.85;

// ============================================================
//  ENTITY BASE CLASS
// ============================================================
class Entity {
  constructor(x, y, w, h) {
    this.x = x; this.y = y;
    this.w = w; this.h = h;
    this.vx = 0; this.vy = 0;
    this.onGround = false;
    this.alive = true;
    this.frame = 0;
    this.frameTimer = 0;
  }
  get right()  { return this.x + this.w; }
  get bottom() { return this.y + this.h; }
  get cx()     { return this.x + this.w / 2; }
  get cy()     { return this.y + this.h / 2; }

  applyGravity() {
    this.vy += GRAVITY;
    if (this.vy > MAX_FALL) this.vy = MAX_FALL;
  }

  collidesTile(tx, ty) {
    const t = TILE();
    return this.right > tx && this.x < tx + t && this.bottom > ty && this.y < ty + t;
  }

  collidesEntity(e) {
    return this.right > e.x && this.x < e.right && this.bottom > e.y && this.y < e.bottom;
  }

  tickFrame(speed = 8) {
    this.frameTimer++;
    if (this.frameTimer >= speed) { this.frameTimer = 0; this.frame = (this.frame + 1) % 2; }
  }
}

// ============================================================
//  MARIO PLAYER
// ============================================================
class Mario extends Entity {
  constructor(x, y) {
    const t = TILE();
    super(x, y, t * 0.9, t * 1.7);
    this.big = false;
    this.starPower = false;
    this.starTimer = 0;
    this.invincible = 0;
    this.facingLeft = false;
    this.jumping = false;
    this.jumpHeld = false;
    this.running = false;
    this.dead = false;
    this.deathTimer = 0;
    this.walkFrame = 0;
    this.walkTimer = 0;
  }

  update(level) {
    if (this.dead) {
      this.vy += GRAVITY;
      this.y += this.vy;
      return;
    }

    const running = keys['ShiftLeft'] || keys['ShiftRight'] || keys['KeyZ'] || keys['KeyX'];
    const speed = running ? RUN_SPEED : WALK_SPEED;

    if (keys['ArrowLeft'] || keys['KeyA']) {
      this.vx = Math.max(this.vx - 0.8, -speed);
      this.facingLeft = true;
    } else if (keys['ArrowRight'] || keys['KeyD']) {
      this.vx = Math.min(this.vx + 0.8, speed);
      this.facingLeft = false;
    } else {
      this.vx *= FRICTION;
      if (Math.abs(this.vx) < 0.1) this.vx = 0;
    }

    const jumpBtn = keys['Space'] || keys['ArrowUp'] || keys['KeyW'];
    if (jumpBtn && this.onGround && !this.jumpHeld) {
      this.vy = JUMP_FORCE * (this.big ? 1.05 : 1);
      this.onGround = false;
      this.jumpHeld = true;
      playSound('jump');
    }
    if (!jumpBtn) this.jumpHeld = false;
    // Variable jump height
    if (jumpBtn && this.vy < -4 && !this.onGround) {
      this.vy -= 0.3;
    }

    this.applyGravity();
    this.x += this.vx;
    this.y += this.vy;

    // World bounds
    if (this.x < 0) { this.x = 0; this.vx = 0; }

    this.onGround = false;
    this.collideTiles(level);

    // Walk animation
    if (Math.abs(this.vx) > 0.2) {
      this.walkTimer++;
      if (this.walkTimer >= 6) { this.walkTimer = 0; this.walkFrame = (this.walkFrame + 1) % 3; }
    } else { this.walkFrame = 0; }

    if (this.starPower) {
      this.starTimer--;
      if (this.starTimer <= 0) { this.starPower = false; }
    }
    if (this.invincible > 0) this.invincible--;
  }

  collideTiles(level) {
    const t = TILE();
    for (const tile of level.tiles) {
      if (!tile.solid) continue;
      const tx = tile.gx * t - game.cameraX;
      const ty = tile.gy * t;
      // Horizontal collision
      if (this.bottom > ty + 2 && this.y < ty + t - 2) {
        if (this.right > tx && this.right < tx + t