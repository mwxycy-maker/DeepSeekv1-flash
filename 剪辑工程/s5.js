// ⑧ Blender 建模：Opus 退赛、GPT 升级成 Astra → 参考图 → 反转：两张结果同角度对比
// ⑨ 总结：消耗截图 → 有来有回 → 很能打 → 梁圣表情包
// ⑩ 内心戏：max 档位 → 思考过程截图逐条高亮
'use strict';

const CAR_BG = '#e8e9ec';
// 浅灰底上居中放图（透明图和不透明图放在同一底色上，保证并排时观感一致）
const carContent = (name, pad = .04, zoom = 1, fx = .5, fy = .5) => (g, x, y, w, h) => {
  const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#f1f2f4'); gr.addColorStop(1, '#dcdee2');
  g.fillStyle = gr; g.fillRect(x, y, w, h);
  const im = E.img(name); if (!E.ready(im)) return;
  const [iw, ih] = E.sizeOf(im); const s = Math.min(w * (1 - 2 * pad) / iw, h * (1 - 2 * pad) / ih) * zoom;
  const dw = iw * s, dh = ih * s;
  g.drawImage(im, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
};

// ---------------------------------------------------------------- ⑧ 退赛与升级（口播为主，徽章动画）
VIS[801] = (ctx, t, s) => {
  bgLight(ctx, t);
  hostMorph(ctx, t, 1 - seg(t, s.start, s.start + .7));
  // Opus：出现 → 说到「退赛」变灰往下掉出画面
  const oi = seg(t, EV.op_in8, EV.op_in8 + .45);
  if (oi > 0) {
    const fall = easeIn(seg(t, EV.op_out8, EV.op_out8 + .9), 2);
    const gray = seg(t, EV.op_out8 - .2, EV.op_out8 + .15);
    ctx.save();
    if (gray > 0) ctx.filter = `grayscale(${gray})`;
    badge(ctx, 'op', 1600, 330 + fall * 900, 100, clamp(oi * 3, 0, 1) * (1 - seg(fall, .7, 1)), {side: 'below', nameSize: 48, s: backOut(oi, 2), rot: fall * .9});
    ctx.restore();
  }
  // DeepSeek 左边，GPT 右边；GPT-6.1 Sol 升级成 GPT-6 Astra
  badgePop(ctx, t, 'ds', 300, 360, 100, EV.ds_in8, null, {side: 'below', nameSize: 48});
  const gi = seg(t, EV.gpt_in8, EV.gpt_in8 + .45);
  if (gi > 0) {
    const up = seg(t, EV.astra_up, EV.astra_up + .5);
    const pulse = Math.max(0, 1 - Math.abs(t - EV.astra_up - .25) / .4);
    // 升级光环
    if (up > 0 && up < 1) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 3; k++) { const r = 100 + eOut(seg(up, k * .15, 1)) * 160; ctx.globalAlpha = (1 - up) * .7; E.ring(ctx, 1600, 330, r, [120, 230, 200], 1, 8 - k * 2); }
      ctx.restore();
    }
    const m = up < .5 ? 'gpt' : 'astra';
    badge(ctx, m, 1600, 330 + floatY(t, 1), 100 * (1 + .25 * pulse), clamp(gi * 3, 0, 1), {side: 'below', nameSize: 48, s: backOut(gi, 2)});
    E.flash(ctx, pulse * .25);
  }
};

// 参考图：大窗口铺满，Astra「拿手绝活」徽章落在右上角
const REF = {w: 1500, h: 844, cx: 1010, cy: 500};
VIS[805] = (ctx, t, s) => {
  bgLight(ctx, t);
  windowCard(ctx, {t, key: 'ref', cx: REF.cx, cy: REF.cy, w: REF.w, h: REF.h, a: EV.ref_in - .15, flat: true, content: carContent('建模参考图', .05)});
  badgePop(ctx, t, 'astra', 1680, 130, 78, EV.astra_skill, null, {side: 'left', theme: 'light', nameSize: 44});
  hostMorph(ctx, t, seg(t, s.start, s.start + .7));
};

// 反转：参考图缩到上方，两张结果同尺寸、同底色并排（左 Astra，右 DeepSeek）
VIS[810] = (ctx, t, s) => {
  bgLight(ctx, t);
  const m = eInOut(seg(t, s.start + .1, s.start + .8));
  windowCard(ctx, {t, key: 'ref', cx: lerp(REF.cx, 960, m), cy: lerp(REF.cy, 165, m), w: REF.w, h: REF.h, scale: lerp(1, .25, m), flat: true, content: carContent('建模参考图', .05)});
  const fk = seg(t, EV.detail - .1, EV.detail + .6);          // 「细节还原度」：DeepSeek 放大到前面
  const cards = [{m: 'astra', img: 'car_astra', cx: 500, d: 'astra'}, {m: 'ds', img: 'car_ds', cx: 1420, d: 'ds'}];
  cards.forEach((c, i) => {
    const isDs = c.m === 'ds', f = isDs ? eInOut(fk) : 0;
    const cx = lerp(c.cx, 960, f), cy = lerp(565, 545, f), sc = lerp(1, 1.3, f);
    const al = !isDs ? 1 - .55 * eInOut(fk) : 1;
    const d = X.data.car[c.d];
    const M = windowCard(ctx, {t, key: 'car' + i, cx, cy, w: 860, h: 484, scale: sc, a: EV.cars_in + i * .12, flat: true, alpha: al,
      content: carContent(c.img, .04), mark: {time: d[0], tok: d[1], cost: d[2]}});
    if (M) {
      const [bx, by] = E.mapPt(M, 60, 60);
      badge(ctx, c.m, bx, by, 40 * sc, seg(t, EV.cars_in + .3, EV.cars_in + .7) * al, {side: 'right', theme: 'light', nameSize: 30});
    }
  });
  // DeepSeek 更好：卡片外圈亮一下
  const gl = Math.max(0, 1 - Math.abs(t - EV.ds_better - .3) / .6);
  if (gl > 0 && fk < .2) { ctx.save(); ctx.globalAlpha = gl; ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(77,107,254,.9)'; ctx.shadowColor = 'rgba(77,107,254,.9)'; ctx.shadowBlur = 30; rr(ctx, 1420 - 438, 565 - 250, 876, 500, 34); ctx.stroke(); ctx.restore(); }
  // 对比期间头像先隐去，给两张大图让位
  const hk = 1 - seg(t, EV.cars_in - .3, EV.cars_in + .1);
  if (hk > 0) { ctx.save(); ctx.globalAlpha = hk; hostMorph(ctx, t, 1); ctx.restore(); }
};

// ---------------------------------------------------------------- ⑨ 总结
VIS[901] = (ctx, t, s) => {
  bgLight(ctx, t);
  hostMorph(ctx, t, 1 - seg(t, s.start, s.start + .7));
};
// 两张消耗截图（加工成大卡片），说到「5个亿」框 Tokens，说到「50多块钱」框金额
const COST = [{img: '消耗1', iw: 1950, ih: 418, y: 330}, {img: '消耗2', iw: 949, ih: 211, y: 700}];
VIS[902] = (ctx, t, s) => {
  bgLight(ctx, t);
  const W2 = 1380;
  COST.forEach((c, i) => {
    const h = W2 * c.ih / c.iw;
    const M = windowCard(ctx, {t, key: 'cost' + i, cx: 1060, cy: c.y, w: W2, h: h + 2 * 14, a: EV.cost_in + i * .15, flat: true,
      style: {border: 6, bezel: 8, radius: 26, col: '#16181d'}, content: fitImage(c.img, '#fff')});
    if (!M) return;
    // 高亮框：Tokens 在右三分之一，金额在左三分之一（截图里卡片位置）
    for (const [ev, x0, x1, col] of [['tok_hl', .66, .98, [77, 107, 254]], ['cny_hl', .01, .33, [22, 170, 110]]]) {
      const u = seg(t, EV[ev], EV[ev] + .4); if (u <= 0) continue;
      const fx0 = c.img === '消耗1' ? x0 : x0, y0 = c.img === '消耗1' ? .43 : .42;
      const q = E.quadOf(M, [W2 * fx0, (h + 28) * y0, W2 * lerp(fx0, x1, eOut(u, 3)), (h + 28) * .97]);
      ctx.save(); E.pathPoly(ctx, q); ctx.lineWidth = 6; ctx.strokeStyle = E.rgb(col); ctx.shadowColor = E.rgb(col, 1, .6); ctx.shadowBlur = 18; ctx.stroke(); ctx.restore();
    }
  });
  hostMorph(ctx, t, seg(t, s.start, s.start + .7));
};
// 有来有回：DeepSeek 在左，Opus、GPT 在右，一颗光球来回弹
VIS[905] = (ctx, t, s) => {
  bgLight(ctx, t);
  COST.forEach((c, i) => windowCard(ctx, {t, key: 'cost' + i, cx: 1060, cy: c.y, w: 1380, h: 1380 * c.ih / c.iw + 28, b: s.start - .05, dOut: .4, flat: true,
    style: {border: 6, bezel: 8, radius: 26, col: '#16181d'}, content: fitImage(c.img, '#fff')}));
  const ui = seg(t, EV.pingpong + .1, EV.pingpong + .6);
  badge(ctx, 'ds', 640, 500, 120, clamp(ui * 3, 0, 1), {side: 'below', theme: 'light', nameSize: 50, s: backOut(ui, 2)});
  badge(ctx, 'op', 1480, 330, 100, clamp(ui * 3, 0, 1), {side: 'below', theme: 'light', nameSize: 44, s: backOut(ui, 2)});
  badge(ctx, 'gpt', 1480, 700, 100, clamp(ui * 3, 0, 1), {side: 'below', theme: 'light', nameSize: 44, s: backOut(ui, 2)});
  if (ui >= 1) {
    const T0 = EV.pingpong + .6, per = .55, k = (t - T0) / per, n = Math.floor(k), f = k - n;
    const tgt = Math.floor(n / 2) % 2 === 0 ? [1360, 330] : [1360, 700];
    const fr = n % 2 === 0 ? [760, 500] : tgt, tt = n % 2 === 0 ? tgt : [760, 500];
    const x = lerp(fr[0], tt[0], ease(f)), y = lerp(fr[1], tt[1], ease(f)) - Math.sin(f * Math.PI) * 120;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let j = 6; j >= 0; j--) { const ff = Math.max(0, f - j * .04); const xx = lerp(fr[0], tt[0], ease(ff)), yy = lerp(fr[1], tt[1], ease(ff)) - Math.sin(ff * Math.PI) * 120; E.dot(ctx, xx, yy, 22 - j * 2.5, [255, 200, 90], (1 - j / 7) * .55); }
    ctx.restore();
    E.dot(ctx, x, y, 22, [255, 186, 60]);
  }
  hostMorph(ctx, t, 1);
};
VIS[907] = (ctx, t, s) => {
  bgLight(ctx, t);
  hostMorph(ctx, t, 1 - seg(t, s.start, s.start + .7));
  badgePop(ctx, t, 'ds', 1600, 330, 100, EV.strong + .3, null, {side: 'below', nameSize: 48});
};
// 梁圣：画面上只有表情包（低清图放进白边贴纸框，不铺满）
VIS[910] = (ctx, t, s) => {
  bgDark(ctx, t, [40, 28, 10], [10, 8, 4], [255, 190, 60]);
  // 背后放射光
  ctx.save(); ctx.translate(W / 2, H / 2 - 20); ctx.rotate(t * .25); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 16; i++) { ctx.rotate(Math.PI / 8); ctx.fillStyle = 'rgba(255,200,90,.06)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1400, -120); ctx.lineTo(1400, 120); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  const ui = seg(t, s.start, s.start + .5), hit = Math.max(0, 1 - Math.abs(t - EV.liang_hit) / .25);
  const im = E.img('liangsheng'); if (!E.ready(im)) return;
  const sc = 3.1 * backOut(ui, 1.8) * (1 + .1 * hit);
  ctx.save(); ctx.translate(W / 2, H / 2 - 30); ctx.rotate(-.05 + .03 * Math.sin(t * 2)); ctx.scale(sc, sc);
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 30 / sc; ctx.shadowOffsetY = 10 / sc;
  rr(ctx, -122.5 - 8, -102.5 - 8, 245 + 16, 205 + 16, 10); ctx.fillStyle = '#fff'; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.imageSmoothingQuality = 'high'; ctx.drawImage(im, -122.5, -102.5, 245, 205);
  ctx.restore();
  E.flash(ctx, hit * .35);
  if (t > EV.liang_hit) E.shake(ctx, Math.max(0, 1 - (t - EV.liang_hit) / .35), Math.floor(t * 30));
};

// ---------------------------------------------------------------- ⑩ 内心戏
// 口播 + 档位条：Flash 定位 → 拉到 max
VIS[1001] = (ctx, t, s) => {
  aroll(ctx, t);
  const ui = seg(t, EV.flash_lbl, EV.flash_lbl + .5); if (ui <= 0) return;
  const x0 = 1250, y0 = 330, w = 560, h = 80;
  const lv = lerp(.25, 1, eInOut(seg(t, EV.max, EV.max + .6)));
  ctx.save(); ctx.globalAlpha = clamp(ui * 2, 0, 1); ctx.translate(0, (1 - eOut(ui)) * 30);
  rr(ctx, x0 - 28, y0 - 110, w + 56, h + 150, 32); ctx.fillStyle = 'rgba(12,14,22,.72)'; ctx.fill();
  for (let i = 0; i < 4; i++) { const on = (i + 1) / 4 <= lv + .01; rr(ctx, x0 + i * (w / 4) + 4, y0, w / 4 - 8, h, 10); ctx.fillStyle = on ? (i === 3 ? '#4d6bfe' : '#8ea2ff') : 'rgba(255,255,255,.15)'; ctx.fill(); }
  ctx.font = '86px Num'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.fillText('FLASH', x0, y0 - 50);
  ctx.textAlign = 'right'; ctx.fillStyle = lv > .95 ? '#8ea2ff' : 'rgba(255,255,255,.35)'; ctx.fillText('MAX', x0 + w, y0 - 50);
  ctx.restore();
};
// 思考截图：大窗口，镜头沿着思考过程往下走，说到哪条亮哪条
const THINK = {iw: 1866, ih: 1322};
const THINK_HL = [{ev: 'think_run', y: [190, 236], col: [255, 190, 60]}, {ev: 'think_find', y: [540, 630], col: [255, 120, 90]},
  {ev: 'think_fix', y: [720, 815], col: [46, 204, 212]}, {ev: 'think_fix', y: [900, 1000], col: [46, 204, 212], d: .6}, {ev: 'think_out', y: [1270, 1322], col: [22, 190, 120]}];
VIS[1005] = (ctx, t, s) => {
  bgLight(ctx, t);
  const ui = seg(t, EV.think_in, EV.think_in + .7); const k = eOut(ui, 4);
  const w = THINK.iw * 1.5, h = w * THINK.ih / THINK.iw;   // 放大 1.5 倍，只看每行开头（字够大）
  // 镜头：从上往下平移（卡片在窗口里上移）
  const pan = keyed(t, [[0, {y: 0}], [EV.think_find - .3, {y: .28}], [EV.think_fix, {y: .5}], [EV.think_done, {y: .78}]], 1.0).y;
  const view = {x: 1030, y: 520, w: 1560, h: 900};
  ctx.save(); rr(ctx, view.x - view.w / 2, view.y - view.h / 2 + (1 - k) * 60, view.w, view.h, 30);
  ctx.globalAlpha = clamp(ui * 2, 0, 1);
  ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20; ctx.fillStyle = '#16181d'; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.clip();
  const im = E.img('雷峰塔思考');
  const top = view.y - view.h / 2 + 20 + (1 - k) * 60 - pan * (h - view.h + 40);
  const left = view.x - view.w / 2 - 120 * 1.5 + 30;
  if (E.ready(im)) ctx.drawImage(im, left, top, w, h);
  const sc = w / THINK.iw;
  for (const hl of THINK_HL) {
    const u = seg(t, EV[hl.ev] + (hl.d || 0), EV[hl.ev] + (hl.d || 0) + .6); if (u <= 0) continue;
    const y0 = top + hl.y[0] * sc, y1 = top + hl.y[1] * sc, x0 = left + 140 * sc;
    E.hlBar(ctx, x0, y0, view.x + view.w / 2, y1, u, hl.col, .5);
  }
  ctx.restore();
  hostMorph(ctx, t, seg(t, s.start, s.start + .7));
};
