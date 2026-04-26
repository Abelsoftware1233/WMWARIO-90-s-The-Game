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
        if (this.right > tx && this.right < tx + t + Math.abs(this.vx) + 1 && this.x < tx + t) {
          if (this.vx > 0) { this.x = tx - this.w; this.vx = 0; }
        }
        if (this.x < tx + t && this.x > tx - Math.abs(this.vx) - 1 && this.right > tx) {
          if (this.vx < 0) { this.x = tx + t; this.vx = 0; }
        }
      }
      // Vertical collision
      if (this.right > tx + 2 && this.x < tx + t - 2) {
        if (this.bottom >= ty && this.bottom <= ty + t && this.vy >= 0) {
          this.y = ty - this.h; this.vy = 0; this.onGround = true;
        } else if (this.y <= ty + t && this.y >= ty && this.vy < 0) {
          this.y = ty + t; this.vy = 0;
          // Hit block from below
          hitBlockFromBelow(tile, level);
        }
      }
    }
  }

  draw() {
    const t = TILE();
    if (this.invincible > 0 && Math.floor(this.invincible / 3) % 2 === 0) return;
    const x = Math.round(this.x);
    const y = Math.round(this.y);
    const sprite = (!this.onGround) ? MARIO_JUMP : MARIO_STAND;
    drawPixelSprite(sprite, x, y, this.facingLeft);
    if (this.starPower && game.frame % 3 === 0) {
      ctx.fillStyle = 'rgba(255,255,0,0.3)';
      ctx.fillRect(x, y, this.w, this.h);
    }
  }

  stomp() {
    this.vy = -7;
    playSound('stomp');
  }

  hurt() {
    if (this.invincible > 0 || this.starPower) return;
    if (this.big) {
      this.big = false;
      this.invincible = 120;
      playSound('powerdown');
    } else {
      this.die();
    }
  }

  die() {
    if (this.dead) return;
    this.dead = true;
    this.vy = -10;
    this.vx = 0;
    this.deathTimer = 0;
    playSound('death');
    clearInterval(game.timeInterval);
    setTimeout(() => loseLife(), 2500);
  }
}

// ============================================================
//  ENEMIES
// ============================================================

class Goomba extends Entity {
  constructor(x, y) {
    const t = TILE();
    super(x, y, t * 0.9, t * 0.9);
    this.vx = -1;
    this.squished = false;
    this.squishTimer = 0;
  }
  update(level) {
    if (this.squished) {
      this.squishTimer++;
      if (this.squishTimer > 30) this.alive = false;
      return;
    }
    this.applyGravity();
    this.x += this.vx;
    this.y += this.vy;
    this.onGround = false;
    this.collideTilesSimple(level);
    this.tickFrame(10);
  }
  collideTilesSimple(level) {
    const t = TILE();
    let hitWall = false;
    for (const tile of level.tiles) {
      if (!tile.solid) continue;
      const tx = tile.gx * t - game.cameraX;
      const ty = tile.gy * t;
      if (this.right > tx + 2 && this.x < tx + t - 2) {
        if (this.bottom >= ty && this.bottom <= ty + t + 2 && this.vy >= 0) {
          this.y = ty - this.h; this.vy = 0; this.onGround = true;
        }
      }
      if (this.bottom > ty + 2 && this.y < ty + t - 2) {
        if (this.right >= tx && this.right <= tx + t && this.x < tx) {
          this.x = tx - this.w; hitWall = true;
        } else if (this.x <= tx + t && this.x >= tx && this.right > tx + t) {
          this.x = tx + t; hitWall = true;
        }
      }
    }
    if (hitWall || (!this.onGround && this.vy > 0 && this.y > canvas.height)) this.vx *= -1;
    // Screen edge bounce
    if (this.x < -game.cameraX) { this.vx = 1; }
  }
  draw() {
    const t = TILE();
    const x = Math.round(this.x); const y = Math.round(this.y);
    if (this.squished) {
      drawRect(x, y + this.h * 0.6, this.w, this.h * 0.4, C.goombaBody);
      drawRect(x+2, y + this.h * 0.6+2, this.w-4, this.h * 0.15, C.goombaDark);
    } else {
      drawPixelSprite(GOOMBA_1, x, y - t*0.1, this.frame === 1);
    }
  }
  squish() { this.squished = true; }
}

class KoopaTroopa extends Entity {
  constructor(x, y, flying = false) {
    const t = TILE();
    super(x, y, t * 0.8, t * 1.2);
    this.flying = flying;
    this.vx = flying ? -2 : -1.2;
    this.shelled = false;
    this.shellMoving = false;
    this.shellTimer = 0;
    this.flyAngle = 0;
  }
  update(level) {
    if (this.shelled) {
      if (this.shellMoving) {
        this.applyGravity();
        this.x += this.vx;
        this.y += this.vy;
        this.collideTilesSimple(level);
      } else {
        this.shellTimer++;
        if (this.shellTimer > 300) { this.shelled = false; this.shellMoving = false; this.shellTimer = 0; }
      }
      return;
    }
    if (this.flying) {
      this.flyAngle += 0.05;
      this.y += Math.sin(this.flyAngle) * 1.2;
      this.x += this.vx;
      if (this.x < -game.cameraX) this.vx = Math.abs(this.vx);
    } else {
      this.applyGravity();
      this.x += this.vx;
      this.y += this.vy;
      this.onGround = false;
      this.collideTilesSimple(level);
    }
    this.tickFrame(12);
  }
  collideTilesSimple(level) {
    const t = TILE();
    for (const tile of level.tiles) {
      if (!tile.solid) continue;
      const tx = tile.gx * t - game.cameraX;
      const ty = tile.gy * t;
      if (this.right > tx + 2 && this.x < tx + t - 2) {
        if (this.bottom >= ty && this.bottom <= ty + t + 2 && this.vy >= 0) {
          this.y = ty - this.h; this.vy = 0; this.onGround = true;
        }
      }
      if (this.bottom > ty + 4 && this.y < ty + t - 4) {
        if (this.right >= tx && this.right <= tx + 4) { this.x = tx - this.w; this.vx = Math.abs(this.vx); }
        else if (this.x <= tx + t && this.x >= tx + t - 4) { this.x = tx + t; this.vx = -Math.abs(this.vx); }
      }
    }
  }
  draw() {
    const x = Math.round(this.x); const y = Math.round(this.y);
    if (this.shelled) {
      drawRect(x, y + this.h*0.3, this.w, this.h*0.7, C.koopaShell);
      drawRect(x+2, y + this.h*0.35, this.w-4, this.h*0.6, C.koopaGreen);
    } else {
      drawPixelSprite(KOOPA_1, x, y, this.vx > 0);
    }
  }
  enterShell() {
    this.shelled = true; this.shellMoving = false; this.shellTimer = 0; this.vy = 0; this.vx = 0;
  }
  kickShell(fromLeft) {
    this.shellMoving = true; this.vx = fromLeft ? 8 : -8;
  }
}

class PiranhaPlant extends Entity {
  constructor(x, y) {
    const t = TILE();
    super(x, y, t, t*2);
    this.baseY = y;
    this.timer = 0;
    this.rising = true;
    this.pipeTop = y;
  }
  update() {
    this.timer++;
    if (this.rising) {
      this.y -= 0.5;
      if (this.y <= this.baseY - TILE()*1.5) { this.rising = false; }
    } else {
      this.y += 0.5;
      if (this.y >= this.baseY) { this.rising = true; this.timer = 0; }
    }
  }
  draw() {
    drawPixelSprite(PIRANHA, Math.round(this.x), Math.round(this.y));
  }
}

class BulletBill extends Entity {
  constructor(x, y) {
    const t = TILE();
    super(x, y, t * 0.9, t * 0.7);
    this.vx = -3;
  }
  update() {
    this.x += this.vx;
    if (this.x < -game.cameraX - TILE() * 2) this.alive = false;
  }
  draw() {
    drawPixelSprite(BULLETBILL, Math.round(this.x), Math.round(this.y));
  }
}

class Spiny extends Entity {
  constructor(x, y) {
    const t = TILE();
    super(x, y, t * 0.9, t * 0.85);
    this.vx = -1.5;
  }
  update(level) {
    this.applyGravity();
    this.x += this.vx;
    this.y += this.vy;
    this.onGround = false;
    this.collideTilesSimple(level);
    this.tickFrame(8);
  }
  collideTilesSimple(level) {
    const t = TILE();
    for (const tile of level.tiles) {
      if (!tile.solid) continue;
      const tx = tile.gx * t - game.cameraX;
      const ty = tile.gy * t;
      if (this.right > tx + 2 && this.x < tx + t - 2) {
        if (this.bottom >= ty && this.bottom <= ty + t + 2 && this.vy >= 0) {
          this.y = ty - this.h; this.vy = 0; this.onGround = true;
        }
      }
      if (this.bottom > ty + 4 && this.y < ty + t - 4) {
        if (this.right >= tx && this.right <= tx + 4) { this.x = tx - this.w; this.vx = Math.abs(this.vx); }
        else if (this.x <= tx + t && this.x >= tx + t - 4) { this.x = tx + t; this.vx = -Math.abs(this.vx); }
      }
    }
  }
  draw() {
    drawPixelSprite(SPINY, Math.round(this.x), Math.round(this.y), this.frame===1);
  }
}

class Boo extends Entity {
  constructor(x, y) {
    const t = TILE();
    super(x, y, t * 0.9, t * 0.9);
    this.baseX = x; this.baseY = y;
    this.angle = Math.random() * Math.PI * 2;
    this.hiding = false;
    this.hideTimer = 0;
  }
  update(mario) {
    const dx = mario.cx - this.cx;
    const dy = mario.cy - this.cy;
    const dist = Math.sqrt(dx*dx + dy*dy);
    // Hide when Mario faces them
    const facingBoo = !mario.facingLeft && dx < 0 || mario.facingLeft && dx > 0;
    if (facingBoo && dist < TILE() * 8) {
      this.hiding = true;
    } else {
      this.hiding = false;
    }
    if (!this.hiding && dist < TILE() * 12) {
      this.x += dx/dist * 1.2;
      this.y += dy/dist * 1.2;
    } else {
      this.angle += 0.02;
      this.x = this.baseX + Math.cos(this.angle) * TILE() * 2;
      this.y = this.baseY + Math.sin(this.angle) * TILE() * 1;
    }
    this.tickFrame(15);
  }
  draw() {
    if (this.hiding) {
      ctx.globalAlpha = 0.3;
    }
    drawPixelSprite(BOO, Math.round(this.x), Math.round(this.y), this.frame===1);
    ctx.globalAlpha = 1;
  }
}

class Lakitu extends Entity {
  constructor(x, y) {
    const t = TILE();
    super(x, y, t*1.5, t*1.5);
    this.baseY = y;
    this.angle = 0;
    this.throwTimer = 0;
    this.vx = -1;
  }
  update(mario, level) {
    this.angle += 0.03;
    this.y = this.baseY + Math.sin(this.angle) * TILE() * 0.5;
    // Follow Mario loosely
    const dx = mario.cx - this.cx;
    if (Math.abs(dx) > TILE() * 2) {
      this.x += dx > 0 ? 1 : -1;
    }
    this.throwTimer++;
    if (this.throwTimer > 180) {
      this.throwTimer = 0;
      level.enemies.push(new Spiny(this.x, this.y + TILE()*2));
    }
  }
  draw() {
    const t = TILE();
    drawPixelSprite(LAKITU_CLOUD, Math.round(this.x), Math.round(this.y + t*0.6));
    // Lakitu body (simple)
    drawRect(this.x + t*0.3, this.y, t*0.8, t*0.6, C.marioW);
    drawRect(this.x + t*0.35, this.y+2, t*0.7, t*0.4, C.marioR);
  }
}

class BowserBoss extends Entity {
  constructor(x, y) {
    const t = TILE();
    super(x, y, t*2, t*2.5);
    this.vx = -2;
    this.hp = 5;
    this.fireTimer = 0;
    this.jumping = false;
  }
  update(level, mario, fireballs) {
    this.applyGravity();
    this.x += this.vx;
    this.y += this.vy;
    this.onGround = false;
    // Simple ground collision
    const groundY = canvas.height - TILE() * 3;
    if (this.bottom >= groundY) { this.y = groundY - this.h; this.vy = 0; this.onGround = true; }
    // Bounds
    const minX = canvas.width/2;
    const maxX = canvas.width - this.w - TILE();
    if (this.x < minX + game.cameraX * 0) { this.x = minX; this.vx = Math.abs(this.vx); }
    if (this.x > maxX) { this.x = maxX; this.vx = -Math.abs(this.vx); }
    // Jump
    if (this.onGround && game.frame % 120 === 0) {
      this.vy = -9; this.onGround = false;
    }
    // Fire
    this.fireTimer++;
    if (this.fireTimer > 60) {
      this.fireTimer = 0;
      const dir = this.x > mario.x ? -1 : 0;
      fireballs.push({ x: this.x + (dir<0?0:this.w), y: this.cy, vx: dir<0 ? -4 : 4, vy: -2, alive: true });
    }
    this.tickFrame(10);
  }
  draw() {
    drawPixelSprite(BOWSER, Math.round(this.x), Math.round(this.y), this.vx > 0);
  }
  hit() {
    this.hp--;
    return this.hp <= 0;
  }
}

// ============================================================
//  COLLECTIBLES / PARTICLES
// ============================================================
class Collectible extends Entity {
  constructor(x, y, type) {
    const t = TILE();
    super(x, y, t*0.8, t*0.8);
    this.type = type; // coin | mushroom | star | fireflower
    this.bobAngle = Math.random() * Math.PI * 2;
    if (type !== 'coin') { this.vy = -5; }
    this.collected = false;
  }
  update(level) {
    this.bobAngle += 0.08;
    if (this.type === 'coin') {
      this.y -= 3;
      if (this.y < this.originY - TILE() * 2) this.alive = false;
      return;
    }
    this.applyGravity();
    this.x += this.vx;
    this.y += this.vy;
    this.onGround = false;
    // Simple ground collision
    for (const tile of level.tiles) {
      if (!tile.solid) continue;
      const t = TILE();
      const tx = tile.gx * t - game.cameraX;
      const ty = tile.gy * t;
      if (this.right > tx+2 && this.x < tx+t-2) {
        if (this.bottom >= ty && this.bottom <= ty+t+2 && this.vy>=0) {
          this.y = ty - this.h; this.vy = 0; this.onGround = true;
        }
      }
      if (this.onGround && this.bottom > ty+2 && this.y < ty+t-2) {
        if (this.right >= tx && this.right <= tx+4) { this.vx = Math.abs(this.vx)||1; }
        else if (this.x <= tx+t && this.x >= tx+t-4) { this.vx = -(Math.abs(this.vx)||1); }
      }
    }
    if (!this.vx && this.onGround) this.vx = 1;
  }
  draw() {
    const x = Math.round(this.x);
    const y = Math.round(this.y);
    switch(this.type) {
      case 'coin':     drawPixelSprite(COIN_SPRITE, x, y); break;
      case 'mushroom': drawPixelSprite(MUSHROOM, x, y); break;
      case 'star':     drawPixelSprite(STAR_SPRITE, x, y + Math.sin(this.bobAngle)*3); break;
    }
  }
}

// Score pop
const pops = [];
function addPop(x, y, text) {
  pops.push({ x, y, text, life: 60, vy: -1.5 });
}

// ============================================================
//  SOUND ENGINE (Web Audio)
// ============================================================
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx;
function initAudio() {
  if (!audioCtx) audioCtx = new AudioCtx();
}

function playSound(type) {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.connect(g); g.connect(audioCtx.destination);
  switch(type) {
    case 'jump':
      o.type = 'square';
      o.frequency.setValueAtTime(400, now);
      o.frequency.exponentialRampToValueAtTime(800, now + 0.1);
      g.gain.setValueAtTime(0.15, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      o.start(now); o.stop(now + 0.15); break;
    case 'coin':
      o.type = 'square';
      o.frequency.setValueAtTime(988, now);
      o.frequency.setValueAtTime(1319, now + 0.1);
      g.gain.setValueAtTime(0.2, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      o.start(now); o.stop(now + 0.2); break;
    case 'stomp':
      o.type = 'square';
      o.frequency.setValueAtTime(300, now);
      o.frequency.exponentialRampToValueAtTime(100, now + 0.1);
      g.gain.setValueAtTime(0.2, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      o.start(now); o.stop(now + 0.12); break;
    case 'powerup':
      o.type = 'square';
      [523,659,784,1047].forEach((f,i) => o.frequency.setValueAtTime(f, now+i*0.07));
      g.gain.setValueAtTime(0.2, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      o.start(now); o.stop(now + 0.4); break;
    case 'death':
      o.type = 'square';
      o.frequency.setValueAtTime(600, now);
      o.frequency.exponentialRampToValueAtTime(200, now + 0.5);
      g.gain.setValueAtTime(0.3, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      o.start(now); o.stop(now + 0.6); break;
    case 'powerdown':
      o.type = 'square';
      o.frequency.setValueAtTime(500, now);
      o.frequency.exponentialRampToValueAtTime(200, now+0.3);
      g.gain.setValueAtTime(0.2, now);
      g.gain.exponentialRampToValueAtTime(0.001, now+0.35);
      o.start(now); o.stop(now+0.35); break;
    case 'flagpole':
      o.type = 'square';
      [659,784,988,1319].forEach((f,i)=> o.frequency.setValueAtTime(f, now+i*0.08));
      g.gain.setValueAtTime(0.2, now); g.gain.exponentialRampToValueAtTime(0.001, now+0.5);
      o.start(now); o.stop(now+0.5); break;
    case 'bowserhit':
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(100, now);
      g.gain.setValueAtTime(0.3, now); g.gain.exponentialRampToValueAtTime(0.001, now+0.2);
      o.start(now); o.stop(now+0.2); break;
  }
}

// ============================================================
//  LEVEL DEFINITIONS
// ============================================================

function makeTile(gx, gy, type) {
  return { gx, gy, type, solid: ['ground','brick','qblock','qblock_hit','pipe','castle_wall','lava_platform'].includes(type), hit: false };
}

function hitBlockFromBelow(tile, level) {
  if (tile.type === 'qblock' && !tile.hit) {
    tile.hit = true;
    tile.type = 'qblock_hit';
    // Spawn content
    const t = TILE();
    const wx = tile.gx * t - game.cameraX;
    const wy = tile.gy * t;
    const roll = Math.random();
    if (roll < 0.5) {
      const c = new Collectible(wx + t*0.1, wy - t, 'coin');
      c.originY = wy - t;
      level.collectibles.push(c);
      addScore(200, wx, wy);
      game.coins++;
      playSound('coin');
    } else if (roll < 0.75) {
      const m = new Collectible(wx + t*0.1, wy - t, 'mushroom');
      m.vx = 1;
      level.collectibles.push(m);
    } else {
      const s = new Collectible(wx + t*0.1, wy - t, 'star');
      s.vx = 2; s.vy = -5;
      level.collectibles.push(s);
    }
    addScore(100, wx, wy);
  } else if (tile.type === 'brick') {
    // Smash brick if big Mario
    if (currentMario && currentMario.big) {
      tile.solid = false;
      tile.type = 'broken';
      addScore(50, tile.gx * TILE() - game.cameraX, tile.gy * TILE());
    }
  }
}

function addScore(pts, x, y) {
  game.score += pts;
  addPop(x, y, '+' + pts);
  updateHUD();
}

// Level data builder
function buildLevel(worldNum, levelNum) {
  const W = 200; // level width in tiles
  const H = 15;
  const tiles = [];
  const enemies = [];
  const collectibles = [];
  const decorations = [];
  const t = TILE();
  const gh = canvas.height;
  const groundRow = Math.floor(gh / t) - 2;

  // Ground
  for (let gx = 0; gx < W; gx++) {
    tiles.push(makeTile(gx, groundRow, 'ground'));
    tiles.push(makeTile(gx, groundRow + 1, 'ground'));
  }

  // Level-specific layouts
  if (worldNum === 1 && levelNum === 1) {
    // Classic 1-1
    // Pipes
    [[20, groundRow-2, 2], [36, groundRow-3, 3], [46, groundRow-4, 4]].forEach(([gx, gy, h]) => {
      tiles.push(makeTile(gx, gy, 'pipe'));
      tiles.push(makeTile(gx+1, gy, 'pipe'));
      for(let i=1; i<h; i++) { tiles.push(makeTile(gx, gy+i, 'pipe')); tiles.push(makeTile(gx+1, gy+i, 'pipe')); }
    });
    // Q-blocks row
    [[16,groundRow-4,'qblock'],[19,groundRow-4,'brick'],[22,groundRow-4,'qblock'],[25,groundRow-4,'qblock'],[28,groundRow-4,'brick'],[30,groundRow-8,'qblock']].forEach(([gx,gy,ty])=>tiles.push(makeTile(gx,gy,ty)));
    // Staircase
    for(let s=0; s<4; s++) for(let h=0; h<=s; h++) tiles.push(makeTile(128+s, groundRow-h, 'ground'));
    for(let s=3; s>=0; s--) for(let h=0; h<=s; h++) tiles.push(makeTile(136+3-s, groundRow-h, 'ground'));
    // Enemies
    enemies.push(new Goomba(25*t - game.cameraX, (groundRow-1)*t));
    enemies.push(new Goomba(40*t - game.cameraX, (groundRow-1)*t));
    enemies.push(new KoopaTroopa(55*t - game.cameraX, (groundRow-1)*t));
    enemies.push(new Goomba(70*t - game.cameraX, (groundRow-1)*t));
    enemies.push(new Goomba(71*t - game.cameraX, (groundRow-1)*t));
    enemies.push(new PiranhaPlant(20*t - game.cameraX, (groundRow-2)*t));
    // Gap
    for(let gx=75; gx<80; gx++) { const idx=tiles.findIndex(ti=>ti.gx===gx&&ti.gy===groundRow); if(idx>-1){tiles.splice(idx,1);} }
    // Clouds (decoration)
    decorations.push({type:'cloud', gx:5, gy:3});
    decorations.push({type:'cloud', gx:20, gy:2});
    decorations.push({type:'cloud', gx:50, gy:4});
    // Flag at end
    tiles.push({gx:150, gy:groundRow, type:'flagpole', solid:false});

  } else if (worldNum === 1 && levelNum === 2) {
    // Underground / Cave
    // Ceiling
    for(let gx=0; gx<W; gx++) { tiles.push(makeTile(gx,0,'ground')); tiles.push(makeTile(gx,1,'ground')); }
    // Boo enemies
    enemies.push(new Boo(15*t, (groundRow-3)*t));
    enemies.push(new Boo(30*t, (groundRow-4)*t));
    enemies.push(new Boo(50*t, (groundRow-2)*t));
    // Platforms
    [[8,groundRow-4,6],[22,groundRow-5,5],[40,groundRow-3,8],[60,groundRow-6,4]].forEach(([gx,gy,len])=>{
      for(let i=0;i<len;i++) tiles.push(makeTile(gx+i, gy,'brick'));
    });
    // Goombas on platforms
    enemies.push(new Goomba(9*t, (groundRow-5)*t));
    enemies.push(new Goomba(42*t, (groundRow-4)*t));
    tiles.push({gx:150, gy:groundRow, type:'flagpole', solid:false});

  } else if (worldNum === 2 && levelNum === 1) {
    // Desert/water level
    enemies.push(new KoopaTroopa(20*t, (groundRow-1)*t, true)); // flying
    enemies.push(new Spiny(30*t, (groundRow-1)*t));
    enemies.push(new Lakitu(60*t, 3*t));
    enemies.push(new BulletBill(80*t, (groundRow-3)*t));
    enemies.push(new Goomba(50*t, (groundRow-1)*t));
    enemies.push(new PiranhaPlant(25*t, (groundRow-2)*t));
    // Q-blocks
    for(let i=0;i<5;i++) tiles.push(makeTile(15+i*6, groundRow-5,'qblock'));
    // Stairs
    for(let s=0;s<5;s++) for(let h=0;h<=s;h++) tiles.push(makeTile(100+s, groundRow-h,'ground'));
    // Gap
    for(let gx=65; gx<70; gx++) { const idx=tiles.findIndex(ti=>ti.gx===gx&&ti.gy===groundRow); if(idx>-1){tiles.splice(idx,1);} const idx2=tiles.findIndex(ti=>ti.gx===gx&&ti.gy===groundRow+1); if(idx2>-1){tiles.splice(idx2,1);} }
    tiles.push({gx:150, gy:groundRow, type:'flagpole', solid:false});
    decorations.push({type:'cloud', gx:10, gy:2});

  } else {
    // World 3: Bowser's Castle
    // Lava on ground row
    for(let gx=0;gx<W;gx++) { tiles.push(makeTile(gx, groundRow+1, 'lava_platform')); }
    // Platforms above lava
    [[3,groundRow-2,4],[10,groundRow-3,4],[18,groundRow-2,5],[30,groundRow-4,4],[45,groundRow-2,4],[60,groundRow-3,5]].forEach(([gx,gy,len])=>{
      for(let i=0;i<len;i++) tiles.push(makeTile(gx+i, gy,'ground'));
    });
    // Bullet Bill shooters
    enemies.push(new BulletBill(20*t, (groundRow-3)*t));
    enemies.push(new BulletBill(40*t, (groundRow-2)*t));
    enemies.push(new Spiny(32*t, (groundRow-5)*t));
    enemies.push(new KoopaTroopa(48*t, (groundRow-3)*t));
    enemies.push(new Boo(55*t, (groundRow-4)*t));
    // Bowser boss at end
    enemies.push(new BowserBoss(80*t, (groundRow-3)*t));
    // Castle decoration
    decorations.push({type:'castle', gx:75, gy:groundRow-5});
    tiles.push({gx:95, gy:groundRow, type:'flagpole', solid:false});
  }

  return { tiles, enemies, collectibles, decorations, width: W * t, groundRow };
}

// ============================================================
//  GAME LOGIC
// ============================================================
let currentLevel = null;
let currentMario = null;
let bowserFireballs = [];

function startLevel() {
  game.cameraX = 0;
  currentLevel = buildLevel(game.world, game.level);
  currentMario = new Mario(TILE() * 3, (currentLevel.groundRow - 2) * TILE());
  bowserFireballs = [];
  game.time = 400;
  clearInterval(game.timeInterval);
  game.timeInterval = setInterval(() => {
    if (game.state === 'playing') {
      game.time--;
      if (game.time <= 0) { currentMario.die(); }
      updateHUD();
    }
  }, 1000);
}

function loseLife() {
  game.lives--;
  updateHUD();
  if (game.lives <= 0) {
    showOverlay('GAME OVER', `Score: ${game.score}`, 'PLAY AGAIN', () => {
      game.score=0; game.lives=3; game.coins=0; game.world=1; game.level=1;
      updateHUD(); startLevel(); game.state='playing';
    });
  } else {
    showOverlay(`MARIO × ${game.lives}`, `WORLD ${game.world}-${game.level}`, 'CONTINUE', () => {
      startLevel(); game.state='playing';
    });
  }
}

function nextLevel() {
  clearInterval(game.timeInterval);
  game.level++;
  if (game.level > 2) { game.level = 1; game.world++; }
  if (game.world > 3) {
    showOverlay('YOU WIN! 🎉', `Final Score: ${game.score}`, 'PLAY AGAIN', () => {
      game.score=0; game.lives=3; game.coins=0; game.world=1; game.level=1;
      updateHUD(); startLevel(); game.state='playing';
    });
    return;
  }
  showOverlay(`WORLD ${game.world}-${game.level}`, '', 'START', () => {
    startLevel(); game.state='playing';
  });
  updateHUD();
}

// ============================================================
//  HUD
// ============================================================
function updateHUD() {
  document.getElementById('score').textContent = String(game.score).padStart(6,'0');
  document.getElementById('coins').textContent = '×' + String(game.coins).padStart(2,'0');
  document.getElementById('world-display').textContent = `${game.world}-${game.level}`;
  document.getElementById('timer').textContent = game.time;
  document.getElementById('lives').textContent = '×0' + game.lives;
}

function showOverlay(title, sub, btnText, onStart) {
  game.state = 'paused';
  const el = document.getElementById('overlay');
  el.classList.remove('hidden');
  document.getElementById('overlay-title').textContent = title;
  document.getElementById('overlay-sub').textContent = sub;
  const btn = document.getElementById('overlay-btn');
  btn.textContent = btnText;
  btn.onclick = () => {
    el.classList.add('hidden');
    if (onStart) onStart();
  };
}

// ============================================================
//  COLLISION DETECTION
// ============================================================
function checkMarioEnemyCollision(mario, enemies) {
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    if (!mario.collidesEntity(enemy)) continue;
    if (mario.starPower) {
      enemy.alive = false;
      addScore(300, enemy.x, enemy.y);
      continue;
    }

    if (enemy instanceof Boo) {
      if (!enemy.hiding) mario.hurt();
      continue;
    }

    // Stomp detection
    const stompThreshold = 6;
    const marioFalling = mario.vy > 0;
    const marioAbove = mario.bottom < enemy.y + enemy.h * 0.5;

    if (marioFalling && marioAbove) {
      if (enemy instanceof Goomba) { enemy.squish(); addScore(100, enemy.x, enemy.y); mario.stomp(); }
      else if (enemy instanceof KoopaTroopa) {
        if (!enemy.shelled) { enemy.enterShell(); mario.stomp(); addScore(100, enemy.x, enemy.y); }
        else { enemy.kickShell(mario.cx < enemy.cx); mario.stomp(); }
      }
      else if (enemy instanceof Spiny) { mario.hurt(); }
      else if (enemy instanceof BulletBill) { enemy.alive = false; mario.stomp(); addScore(200, enemy.x, enemy.y); }
      else if (enemy instanceof BowserBoss) {
        if (enemy.hit()) { enemy.alive = false; addScore(5000, enemy.x, enemy.y); setTimeout(nextLevel, 1500); }
        mario.stomp();
      }
    } else {
      // Side collision
      if (enemy instanceof KoopaTroopa && enemy.shelled && !enemy.shellMoving) {
        enemy.kickShell(mario.cx < enemy.cx);
      } else if (enemy instanceof BowserBoss) {
        mario.hurt();
      } else if (!(enemy instanceof PiranhaPlant && enemy.y > canvas.height)) {
        mario.hurt();
      }
    }
  }
}

function checkKoopaShellEnemies(enemies) {
  for (const e of enemies) {
    if (!(e instanceof KoopaTroopa) || !e.shelled || !e.shellMoving) continue;
    for (const target of enemies) {
      if (target === e || !target.alive) continue;
      if (e.collidesEntity(target)) {
        target.alive = false;
        addScore(200, target.x, target.y);
      }
    }
  }
}

function checkMarioCollectibles(mario, collectibles) {
  for (const c of collectibles) {
    if (!c.alive || c.collected) continue;
    if (!mario.collidesEntity(c)) continue;
    c.alive = false; c.collected = true;
    switch(c.type) {
      case 'coin':     game.coins++; game.score += 200; addPop(c.x, c.y, '+200'); playSound('coin'); break;
      case 'mushroom': mario.big = true; mario.h = TILE()*2; addScore(1000, c.x, c.y); playSound('powerup'); break;
      case 'star':     mario.starPower = true; mario.starTimer = 600; addScore(1000, c.x, c.y); playSound('powerup'); break;
    }
    updateHUD();
  }
}

// Flagpole
let levelCleared = false;
function checkFlagpole(mario, level) {
  if (levelCleared) return;
  const flag = level.tiles.find(t => t.type === 'flagpole');
  if (!flag) return;
  const t = TILE();
  const fx = flag.gx * t - game.cameraX;
  if (mario.x + mario.w > fx && mario.x < fx + t * 4) {
    levelCleared = true;
    game.score += game.time * 50;
    playSound('flagpole');
    setTimeout(nextLevel, 2000);
  }
}

// ============================================================
//  RENDER
// ============================================================
function drawBackground() {
  const isCastle = game.world === 3;
  const isUnderground = game.world === 1 && game.level === 2;
  if (isCastle) {
    // Dark red castle bg
    ctx.fillStyle = '#1a0000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Lava glow at bottom
    const grad = ctx.createLinearGradient(0, canvas.height*0.7, 0, canvas.height);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(1, 'rgba(228,0,0,0.4)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, canvas.height*0.7, canvas.width, canvas.height*0.3);
  } else if (isUnderground) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = C.sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Hills
    const t = TILE();
    const hillColor = '#00a000';
    const hillDark = '#008000';
    const hillX = ((-game.cameraX * 0.3) % (canvas.width * 1.5)) - canvas.width*0.5;
    [[hillX, canvas.height - t*2, t*5], [hillX+t*8, canvas.height-t*2, t*4], [hillX+canvas.width*0.5, canvas.height-t*2, t*6]].forEach(([hx,hy,hr])=>{
      ctx.fillStyle = hillColor;
      ctx.beginPath();
      ctx.arc(hx, hy, hr, Math.PI, 0, false);
      ctx.fill();
      ctx.fillStyle = hillDark;
      ctx.beginPath();
      ctx.arc(hx+hr*0.2, hy, hr*0.5, Math.PI, 0, false);
      ctx.fill();
    });
  }
}

function drawTiles(tiles) {
  const t = TILE();
  const isCastle = game.world === 3;
  for (const tile of tiles) {
    const x = tile.gx * t - game.cameraX;
    const y = tile.gy * t;
    if (x + t < 0 || x > canvas.width) continue;
    switch(tile.type) {
      case 'ground':
        if (isCastle) {
          drawRect(x, y, t, t, C.castle);
          drawRect(x, y, t, 2, C.castleDark);
        } else {
          drawGroundTile(x, y);
        }
        break;
      case 'brick': drawBrick(x, y); break;
      case 'qblock': drawQuestionBlock(x, y, false); break;
      case 'qblock_hit': drawQuestionBlock(x, y, true); break;
      case 'pipe':
        // handled below in pipe pass
        break;
      case 'lava_platform':
        const lavaAnim = Math.sin(game.frame * 0.1) * 0.5;
        drawRect(x, y, t, t, game.frame % 20 < 10 ? C.lava : C.lava2);
        break;
      case 'flagpole':
        drawFlag(x - t*2, y - t*6);
        break;
    }
  }
  // Pipes need special rendering (find pipe tops)
  const pipeTops = tiles.filter(ti => ti.type === 'pipe' && !tiles.find(tj => tj.gx===ti.gx && tj.gy===ti.gy-1 && tj.type==='pipe'));
  const drawnPipes = new Set();
  for (const pt of pipeTops) {
    const key = `${pt.gx}`;
    if (drawnPipes.has(key)) continue;
    drawnPipes.add(key);
    const x = pt.gx * t - game.cameraX;
    const y = pt.gy * t;
    const pipeH = tiles.filter(ti=>ti.gx===pt.gx&&ti.type==='pipe').length;
    drawPipeTop(x - px(2), y, pipeH * t - t);
  }
}

function drawDecorations(decs) {
  const t = TILE();
  for (const d of decs) {
    const x = d.gx * t - game.cameraX;
    const y = d.gy * t;
    if (x + t*4 < 0 || x > canvas.width) continue;
    if (d.type === 'cloud') drawCloud(x, y);
    if (d.type === 'castle') drawCastle(x, y);
  }
}

function drawPops() {
  ctx.font = `${px(7)}px 'Press Start 2P', monospace`;
  ctx.textAlign = 'center';
  for (let i = pops.length-1; i >= 0; i--) {
    const p = pops[i];
    ctx.fillStyle = `rgba(255,255,255,${p.life/60})`;
    ctx.fillText(p.text, p.x, p.y);
    p.y += p.vy;
    p.life--;
    if (p.life <= 0) pops.splice(i, 1);
  }
}

// ============================================================
//  MAIN GAME LOOP
// ============================================================
let lastTime = 0;
function gameLoop(ts) {
  const dt = ts - lastTime;
  lastTime = ts;
  game.frame++;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (game.state === 'playing') {
    update();
  }
  render();
  requestAnimationFrame(gameLoop);
}

function update() {
  if (!currentLevel || !currentMario) return;
  const mario = currentMario;
  const level = currentLevel;

  // Update Mario
  mario.update(level);

  // Camera
  const targetCam = mario.x - canvas.width * 0.35;
  game.cameraX += (targetCam - game.cameraX) * 0.15;
  if (game.cameraX < 0) game.cameraX = 0;
  if (game.cameraX > level.width - canvas.width) game.cameraX = level.width - canvas.width;

  // Update enemies
  for (const e of level.enemies) {
    if (!e.alive) continue;
    if (e instanceof Boo)     e.update(mario);
    else if (e instanceof Lakitu) e.update(mario, level);
    else if (e instanceof BowserBoss) e.update(level, mario, bowserFireballs);
    else e.update(level);
  }
  level.enemies = level.enemies.filter(e => e.alive);

  // Update collectibles
  for (const c of level.collectibles) c.update(level);
  level.collectibles = level.collectibles.filter(c => c.alive);

  // Bowser fireballs
  for (const fb of bowserFireballs) {
    fb.x += fb.vx; fb.y += fb.vy;
    fb.vy += 0.2;
    if (fb.x < -100 || fb.x > canvas.width + 100 || fb.y > canvas.height) fb.alive = false;
    if (mario.right > fb.x && mario.x < fb.x+TILE() && mario.bottom > fb.y && mario.y < fb.y+TILE()) {
      mario.hurt(); fb.alive = false;
    }
  }
  bowserFireballs = bowserFireballs.filter(fb => fb.alive);

  // Collision checks
  if (!mario.dead) {
    checkMarioEnemyCollision(mario, level.enemies);
    checkKoopaShellEnemies(level.enemies);
    checkMarioCollectibles(mario, level.collectibles);
    checkFlagpole(mario, level);
  }

  // Fall off screen
  if (mario.y > canvas.height + TILE()*2 && !mario.dead) mario.die();

  // Time warning color
  const timerEl = document.getElementById('timer');
  timerEl.style.color = game.time <= 100 ? '#f00' : '#fff';
}

function render() {
  drawBackground();
  if (!currentLevel) return;
  drawDecorations(currentLevel.decorations);
  drawTiles(currentLevel.tiles);
  // Draw collectibles
  for (const c of currentLevel.collectibles) c.draw();
  // Draw enemies
  for (const e of currentLevel.enemies) {
    if (!e.alive) continue;
    e.draw();
  }
  // Draw Bowser fireballs
  for (const fb of bowserFireballs) {
    drawPixelSprite(FIREBALL, Math.round(fb.x), Math.round(fb.y));
  }
  // Draw Mario
  if (currentMario) currentMario.draw();
  // Draw score pops
  drawPops();
  // Star shimmer
  if (currentMario && currentMario.starPower && game.frame % 4 < 2) {
    ctx.fillStyle = 'rgba(255,255,0,0.08)';
    ctx.fillRect(0,0,canvas.width,canvas.height);
  }
}

// ============================================================
//  INIT
// ============================================================
function init() {
  updateHUD();
  showOverlay(
    'SUPER MARIO BROS',
    'Arrow Keys / WASD to move\nSpace / W to jump\nShift to run',
    'PLAY',
    () => {
      initAudio();
      levelCleared = false;
      game.state = 'playing';
      startLevel();
    }
  );
  requestAnimationFrame(gameLoop);
}

// Prevent scroll on space/arrows
window.addEventListener('keydown', e => {
  if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
});

// Start
init();
