// ① 开场：口播 + DeepSeek 徽章 → 5 亿 Token → 三方徽章 → 三项比拼 → VS 对决
'use strict';

// 徽章在口播画面上的位置（右侧空处 / 左侧霓虹牌处），不压脸
const POS = {ds_r: [1600, 330], ds_l: [300, 360], gpt: [1590, 285], op: [1590, 610]};

function floatY(t, k = 0) { return Math.sin(t * 1.6 + k) * 6; }

// Token 卡片（按截图重绘成清晰大字卡）
function tokenCard(ctx, t, a, b, cx, cy, value, dir, delay) {
  const ui = seg(t, a + delay, a + delay + .6), uo = b == null ? 0 : seg(t, b, b + .5);
  if (ui <= 0 || uo >= 1) return;
  const key = 'tok' + delay;
  const c = cardCanvas(key, 760, 250, (g, x, y, w, h) => {
    g.fillStyle = '#f4f5f7'; g.fillRect(x, y, w, h);
    g.font = '118px Num'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillStyle = '#15171c';
    g.fillText(rollNum(value, seg(t, a + delay, a + delay + 1.1)), x + 44, y + h / 2 + 8);
    g.font = '44px Num'; g.fillStyle = '#4d6bfe'; g.textAlign = 'right'; g.fillText('TOKENS', x + w - 36, y + h / 2 + 30);
  }, {border: 6, bezel: 0, radius: 34, col: '#16181d'});
  const p1 = flyPose(ui, dir), p2 = exitPose(uo, dir);
  E.persp(ctx, c, 760, 250, cx + p1.dx + p2.dx, cy + p1.dy + p2.dy, {scale: 1.22 * p1.s * p2.s, ry: -10 * dir + p1.ry + p2.ry, rx: 6 + p1.rx + p2.rx, rz: p1.rz + p2.rz, a: p1.a, radius: 34, n: 10});
}

VIS[101] = (ctx, t) => {
  aroll(ctx, t);
  const [x, y] = POS.ds_r;
  badgePop(ctx, t, 'ds', x, y + floatY(t), 100, EV.ds_badge, null, {side: 'below', nameSize: 48});
};

VIS[102] = (ctx, t, s) => {
  // 口播压暗虚化，两张 Token 卡一起甩进来，数字滚动
  const u = seg(t, s.start, s.start + .3), uo = seg(t, s.end - .25, s.end + .1);
  const k = u * (1 - uo);
  aroll(ctx, t);
  if (k > 0) {
    const v = arollFrame(t); if (E.ready(v)) E.blurDraw(ctx, v, 14 * k, 0, 0, W, H, k, 'source-over');
    ctx.fillStyle = `rgba(6,8,14,${.42 * k})`; ctx.fillRect(0, 0, W, H);
  }
  const [x, y] = POS.ds_r;
  badge(ctx, 'ds', x, y + floatY(t), 100, 1 - k, {side: 'below', nameSize: 48});
  tokenCard(ctx, t, EV.tok, s.end - .35, 960, 345, 244589332, 1, 0);
  tokenCard(ctx, t, EV.tok, s.end - .35, 960, 680, 245891058, 1, .12);
};

VIS[103] = (ctx, t, s) => {
  aroll(ctx, t);
  // DeepSeek 徽章从右侧滑到左侧，给对手让位
  const m = eInOut(seg(t, s.start, s.start + .65));
  const x = lerp(POS.ds_r[0], POS.ds_l[0], m), y = lerp(POS.ds_r[1], POS.ds_l[1], m) - Math.sin(m * Math.PI) * 60;
  badge(ctx, 'ds', x, y + floatY(t), 100, 1, {side: 'below', nameSize: 48});
  badgePop(ctx, t, 'gpt', POS.gpt[0], POS.gpt[1] + floatY(t, 1), 92, EV.gpt_badge, null, {side: 'below', nameSize: 46});
  badgePop(ctx, t, 'op', POS.op[0], POS.op[1] + floatY(t, 2), 92, EV.op_badge, null, {side: 'below', nameSize: 46});
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
