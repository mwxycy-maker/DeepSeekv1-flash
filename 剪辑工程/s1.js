// ① 开场：口播 + DeepSeek 徽章 → 5 亿 Token → 三方徽章 → 三项比拼 → VS 对决
'use strict';

// 徽章在口播画面上的位置（右侧空处 / 左侧霓虹牌处），不压脸
const POS = {ds_r: [1600, 330], ds_l: [300, 360], gpt: [1590, 285], op: [1590, 610]};

function floatY(t, k = 0) { return Math.sin(t * 1.6 + k) * 6; }

// 5 亿 Token：人物后面的大花字，跟口播同步从 0 涨到 5 亿，涨满后停留再离场
// 头部在画面中间，字分在头两侧：左边数字（右对齐），右边 TOKEN
function tokenBig(ctx, t) {
  const a = EV.tok_in, f = EV.tok_full, o = EV.tok_out;
  const ui = seg(t, a - .1, a + .35), uo = seg(t, o, o + .45);
  if (ui <= 0 || uo >= 1) return 0;
  const k = eOut(ui, 3) * (1 - eInOut(uo));
  // 背景压暗（人物稍后原样盖回来，形成前后层次）
  ctx.fillStyle = `rgba(4,6,16,${.5 * k})`; ctx.fillRect(0, 0, W, H);
  const r = seg(t, a, f), v = 5 * (1 - Math.pow(1 - r, 2.2));
  const num = r >= 1 ? '5' : v.toFixed(2);
  const bump = r >= 1 ? Math.max(0, 1 - (t - f) / .35) : 0;
  const lift = -40 * eInOut(uo), al = (1 - eInOut(uo));
  ctx.save(); ctx.globalAlpha *= clamp(ui * 2, 0, 1) * al;
  ctx.translate(860, 330 + lift); const sc = lerp(1.18, 1, eOut(ui, 4)) * (1 + .08 * bump); ctx.scale(sc, sc);
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'right';
  const gr = ctx.createLinearGradient(0, -230, 0, 20); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#8ea2ff');
  ctx.shadowColor = 'rgba(77,107,254,.95)'; ctx.shadowBlur = 40 + 60 * bump; ctx.fillStyle = gr;
  // 数字用 Bebas（窄），「亿」用黑体（标题字体里的「亿」不好认）
  ctx.font = '230px Black'; const yw = ctx.measureText('亿').width; ctx.fillText('亿', 0, 95);
  ctx.font = '360px Num'; ctx.fillText(num, -yw - 14, 112);
  ctx.restore();
  const ut = seg(t, a + .15, a + .7);
  ctx.save(); ctx.globalAlpha *= clamp(ut * 2, 0, 1) * al;
  ctx.translate(1120 + (1 - eOut(ut, 4)) * 260, 335 + lift); ctx.scale(1 + .06 * bump, 1 + .06 * bump);
  ctx.font = '300px Num'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  try { ctx.letterSpacing = '10px'; } catch (e) {}
  ctx.lineJoin = 'round'; ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(77,107,254,.9)'; ctx.strokeText('TOKEN', 0, 0);
  ctx.shadowColor = 'rgba(77,107,254,.8)'; ctx.shadowBlur = 30; ctx.fillStyle = '#fff'; ctx.fillText('TOKEN', 0, 0);
  ctx.restore();
  return k;
}
function tokenLayer(ctx, t) {
  const k = tokenBig(ctx, t);
  if (k > 0) personCut(ctx, t, 'person_a', 3.5, Math.min(1, k * 3));
  return k;
}

VIS[101] = (ctx, t) => {
  aroll(ctx, t);
  const [x, y] = POS.ds_r;
  badgePop(ctx, t, 'ds', x, y + floatY(t), 100, EV.ds_badge, null, {side: 'below', nameSize: 48});
};

VIS[102] = (ctx, t, s) => {
  aroll(ctx, t);
  const k = tokenLayer(ctx, t);
  const [x, y] = POS.ds_r;
  badge(ctx, 'ds', x, y + floatY(t), 100, 1 - k, {side: 'below', nameSize: 48});
};

VIS[103] = (ctx, t, s) => {
  aroll(ctx, t);
  tokenLayer(ctx, t);
  // DeepSeek 徽章从右侧滑到左侧，给对手让位（等花字离场后再出现）
  const m = eInOut(seg(t, EV.tok_out, EV.tok_out + .65));
  const x = lerp(POS.ds_r[0], POS.ds_l[0], m), y = lerp(POS.ds_r[1], POS.ds_l[1], m) - Math.sin(m * Math.PI) * 60;
  badge(ctx, 'ds', x, y + floatY(t), 100, seg(t, EV.tok_out + .35, EV.tok_out + .65), {side: 'below', nameSize: 48});
  // 花字还在时，对手徽章先在花字下方并排弹出；花字离场后滑到右侧原位
  const mv = eInOut(seg(t, EV.tok_out + .1, EV.tok_out + .8));
  const gx = lerp(1370, POS.gpt[0], mv), gy = lerp(660, POS.gpt[1], mv), ox = lerp(1710, POS.op[0], mv), oy = lerp(660, POS.op[1], mv);
  badgePop(ctx, t, 'gpt', gx, gy + floatY(t, 1), 92, EV.gpt_badge, null, {side: 'below', nameSize: 46});
  badgePop(ctx, t, 'op', ox, oy + floatY(t, 2), 92, EV.op_badge, null, {side: 'below', nameSize: 46});
};

// 三项比拼：口播变形成左下角头像，三张窗口卡依次飞入（同一角度、同一方向）
const TASKS = [
  {key: 'task_tower', ev: 'task1', x: 400, src: ['tower_op', 2], img: 'task_tower'},
  {key: 'task_game', ev: 'task2', x: 960, src: ['game_op', 2], img: 'task_game'},
  {key: 'task_mv', ev: 'task3', x: 1520, src: ['mv_op', 6]},
];
VIS[104] = (ctx, t, s) => {
  bgLight(ctx, t);
  const out = s.end - .45;
  TASKS.forEach((k, i) => {
    const [key, off] = k.src;
    windowCard(ctx, {t, key: k.key, cx: k.x, cy: 560, w: 540, h: 345, a: EV[k.ev] - .25, b: out + i * .05, dir: 1, ry: -16, rx: 4,
      content: key in window.VSRC ? fillVideo(key, off + Math.max(0, t - EV[k.ev])) : (k.img ? fillImage(k.img, .5, .45) : fillVideo('mv_op', off))});
  });
  // 口播画面在镜头开头连续收缩进左下角圆窗；徽章跟着缩到上方
  const mu = seg(t, s.start, s.start + .75);
  hostMorph(ctx, t, mu);
  const bo = 1 - seg(t, s.start, s.start + .35);
  if (bo > 0) {
    badge(ctx, 'ds', POS.ds_l[0], POS.ds_l[1], 100, bo, {side: 'below', nameSize: 48, s: lerp(.6, 1, bo)});
    badge(ctx, 'gpt', POS.gpt[0], POS.gpt[1], 92, bo, {side: 'below', nameSize: 46, s: lerp(.6, 1, bo)});
    badge(ctx, 'op', POS.op[0], POS.op[1], 92, bo, {side: 'below', nameSize: 46, s: lerp(.6, 1, bo)});
  }
  // 三个徽章排在卡片上方一条线，表示同一提示词同台
  const bi = seg(t, s.start + .3, s.start + .8);
  ['ds', 'gpt', 'op'].forEach((m, i) => badge(ctx, m, 760 + i * 200, 250, 66, bi * (1 - seg(t, out, out + .3)), {side: 'none', s: backOut(bi, 2)}));
};

// VS 对决：左右两半从两侧撞进来，中间闪电；口播停顿处 VS 重击
function lightning(ctx, t, x0, y0, x1, y1, seed, k) {
  if (k <= 0) return;
  const r = E.rng(seed + Math.floor(t * 24)); const pts = [];
  const n = 26;
  for (let i = 0; i <= n; i++) { const u = i / n; const j = (i === 0 || i === n) ? 0 : (r() - .5) * 70; pts.push([lerp(x0, x1, u) + j, lerp(y0, y1, u)]); }
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const [lw, a, blur] of [[26, .25, 60], [10, .6, 30], [4, 1, 10]]) {
    ctx.shadowColor = 'rgba(140,190,255,1)'; ctx.shadowBlur = blur; ctx.globalAlpha = a * k;
    E.line(ctx, pts, [200, 225, 255], 1, lw);
  }
  ctx.restore();
}
VIS[105] = (ctx, t, s) => {
  const ui = eOut(seg(t, EV.vs_in, EV.vs_in + .6), 5);
  const uo = seg(t, EV.vs_end - .22, EV.vs_end);
  // 左半：DeepSeek 蓝；右半：对手暖色。分割线从斜线两侧撞到中间
  bgDark(ctx, t, [12, 18, 40], [4, 6, 14], [77, 107, 254]);
  const off = (1 - ui) * 1100;
  ctx.save();
  ctx.beginPath(); ctx.moveTo(-off, 0); ctx.lineTo(1040 - off, 0); ctx.lineTo(880 - off, H); ctx.lineTo(-off, H); ctx.closePath(); ctx.clip();
  const gl = ctx.createLinearGradient(0, 0, 1000, H); gl.addColorStop(0, '#0d1a4a'); gl.addColorStop(1, '#1f3ab8');
  ctx.fillStyle = gl; ctx.fillRect(-off, 0, 1100, H);
  dotGrid(ctx, [120, 150, 255], .18);
  badge(ctx, 'ds', 470 - off, 470 + floatY(t), 190, 1, {side: 'below', nameSize: 70});
  ctx.restore();
  ctx.save();
  ctx.beginPath(); ctx.moveTo(1040 + off, 0); ctx.lineTo(W + off, 0); ctx.lineTo(W + off, H); ctx.lineTo(880 + off, H); ctx.closePath(); ctx.clip();
  const gr = ctx.createLinearGradient(W, 0, 900, H); gr.addColorStop(0, '#3a1408'); gr.addColorStop(1, '#a8401c');
  ctx.fillStyle = gr; ctx.fillRect(880 + off, 0, 1100, H);
  dotGrid(ctx, [255, 170, 120], .16);
  badge(ctx, 'gpt', 1360 + off, 320 + floatY(t, 1), 112, 1, {side: 'right', nameSize: 52});
  badge(ctx, 'op', 1330 + off, 660 + floatY(t, 2), 112, 1, {side: 'right', nameSize: 52});
  ctx.restore();
  // 中间闪电，碰撞瞬间与重击时更亮
  const hitK = Math.max(0, 1 - Math.abs(t - EV.vs_hit) / .5);
  const pauseK = Math.max(0, 1 - Math.abs(t - (EV.vs_end - .55)) / .45);
  lightning(ctx, t, 1040, -20, 880, H + 20, 11, ui * (.65 + .35 * Math.max(hitK, pauseK)));
  // VS 字：先出现，停顿处再砸一次
  const va = seg(t, EV.vs_in + .35, EV.vs_in + .7);
  if (va > 0) {
    const slam = seg(t, EV.vs_end - .55, EV.vs_end - .35);
    const sc = lerp(2.2, 1, eOut(va, 5)) * (1 + .18 * Math.sin(Math.PI * slam));
    ctx.save(); ctx.translate(955, 500); ctx.scale(sc, sc); ctx.rotate(-.08);
    ctx.font = '250px Title'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round'; ctx.lineWidth = 34; ctx.strokeStyle = '#0a0c12'; ctx.strokeText('VS', 0, 0);
    ctx.shadowColor = 'rgba(160,200,255,.95)'; ctx.shadowBlur = 50; ctx.fillStyle = '#fff'; ctx.fillText('VS', 0, 0);
    ctx.restore();
  }
  E.flash(ctx, Math.max(0, 1 - Math.abs(t - (EV.vs_end - .5)) / .12) * .55 + Math.max(0, 1 - (t - EV.vs_in - .55) / .15) * (t > EV.vs_in + .55 ? .35 : 0));
  vignette(ctx, .4);
  if (t > EV.vs_end - .55) E.shake(ctx, Math.max(0, 1 - (t - EV.vs_end + .55) / .3), Math.floor(t * 30));
  if (uo > 0) E.whip(ctx, uo);
};
