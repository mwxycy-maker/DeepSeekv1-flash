// ⑥ 海岸：三景并列 → 提示词出现（三景缩小让位）→ 「PUA 老板」回到口播
// ⑦ 赛车：三款游戏依次推镜 → Opus / GPT / DeepSeek 各自演示 → 排最后 → 同屏金额对比
'use strict';

// ---------------------------------------------------------------- ⑥ 海岸
const COAST_KEY = {gpt: 'coast_gpt', op: 'coast_op', ds: 'coast_ds'};
const PROMPT = '给我做个实时海岸模拟，要求极度真实，要做的完美。';
function coastContent(i, t) { const m = P3.order[i]; return fillZoom(COAST_KEY[m], .2 + Math.max(0, t - EV.coast_in), 1, .5, .5); }
// 提示词出现时，三景整体缩小下移，提示词放在上方
function coastLayout(t) { const k = eInOut(seg(t, EV.prompt_in, EV.prompt_in + .7)); return {dx: lerp(0, 60, k), dy: lerp(0, 92, k), s: lerp(1, .86, k)}; }
function promptCard(ctx, t) {
  const ui = seg(t, EV.prompt_in + .2, EV.prompt_in + .8); if (ui <= 0) return;
  const k = eOut(ui, 4);
  const x = 470, y = 70, w = 1300, h = 120;
  ctx.save(); ctx.globalAlpha = clamp(ui * 2, 0, 1); ctx.translate(0, (1 - k) * -40);
  ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
  rr(ctx, x, y, w, h, 60); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.lineWidth = 3; ctx.strokeStyle = '#d5d9e2'; ctx.stroke();
  // 打字：按字逐个出现
  const n = Math.floor(PROMPT.length * seg(t, EV.prompt_in + .5, EV.prompt_in + 2.3));
  const txt = PROMPT.slice(0, n);
  ctx.font = '50px Black'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const tx = x + 56, ty = y + h / 2 + 2;
  // 高亮「极度真实」「完美」（字下面画荧光条）
  for (const [word, ev] of [['极度真实', 'hl_real'], ['完美', 'hl_perfect']]) {
    const u = seg(t, EV[ev], EV[ev] + .4); const idx = PROMPT.indexOf(word);
    if (u <= 0 || idx + word.length > n) continue;
    const x0 = tx + ctx.measureText(PROMPT.slice(0, idx)).width, ww = ctx.measureText(word).width;
    ctx.fillStyle = 'rgba(255,210,60,.65)'; ctx.fillRect(x0 - 4, ty - 4, (ww + 8) * eOut(u, 3), 30);
  }
  ctx.fillStyle = '#15171c'; ctx.fillText(txt, tx, ty);
  if (n < PROMPT.length || Math.floor(t * 2) % 2 === 0) { const cw = ctx.measureText(txt).width; ctx.fillRect(tx + cw + 6, ty - 28, 4, 56); }
  ctx.restore();
}
VIS[601] = (ctx, t, s) => {
  bgLight(ctx, t);
  triPanels(ctx, t, {kind: 'cs', aIn: EV.coast_in, aOut: EV.pua - .55, content: coastContent, layout: coastLayout});
  promptCard(ctx, t);
  // 三景退场的同时，头像已经开始放大回全屏（不留空画面）
  hostMorph(ctx, t, seg(t, s.start, s.start + .7) * (1 - eInOut(seg(t, EV.pua - .45, EV.pua + .2))));
};
// 「是不是像极了你那个贼会 PUA 的老板」：回到口播，说到 PUA 时猛推一下
VIS[605] = (ctx, t, s) => {
  bgLight(ctx, t);
  const z = 1 + .14 * eOut(seg(t, EV.pua_hit - .05, EV.pua_hit + .2), 3);
  const u = 1 - eInOut(seg(t, EV.pua - .45, EV.pua + .2));
  if (u > 0) hostMorph(ctx, t, u);
  else aroll(ctx, t, {zoom: z, fx: .5, fy: .28});
  if (t > EV.pua_hit) E.shake(ctx, Math.max(0, 1 - (t - EV.pua_hit) / .3) * .6, Math.floor(t * 30));
};

// ---------------------------------------------------------------- ⑦ 赛车
const GAME_KEY = {gpt: 'game_gpt', op: 'game_op', ds: 'game_ds'};
const GW = {w: 1640, h: 922, cx: 990, cy: 505};
// 循环时跳过素材第 0 秒（录制开头有一帧镜头复位）：在 [0.6, 10) 里循环
const gameContent = (m, ts, z = 1, fx = .5, fy = .5) => fillZoom(GAME_KEY[m], ts < 10 ? Math.max(ts, 0) : .6 + ((ts - .6) % 9.4), z, fx, fy);
function gameMark(m) { const d = X.data.game[m]; return {time: d[0], tok: d[1], cost: d[2]}; }
function gameWindow(ctx, t, m, o) {
  const M = windowCard(ctx, {t, key: 'game_' + (o.key || m), cx: GW.cx, cy: GW.cy, w: GW.w, h: GW.h, flat: true, mark: gameMark(m), ...o});
  if (M) { const [bx, by] = E.mapPt(M, 90, 90); badge(ctx, m, bx, by, 56 * (o.scale || 1), seg(t, (o.a || 0) + .3, (o.a || 0) + .7) * (o.alpha == null ? 1 : o.alpha), {side: 'right', nameSize: 42}); }
  return M;
}
// 开场三款游戏依次出现：轻微斜视角 + 推镜头（分镜要求），每款 2–3 秒
const G_INTRO = [['op', 'g1', 'g2'], ['gpt', 'g2', 'g3'], ['ds', 'g3', 'gop']];
VIS[701] = (ctx, t, s) => {
  bgDark(ctx, t, [16, 14, 34], [6, 6, 14], [255, 60, 160]);
  for (const [m, a, b] of G_INTRO) {
    if (t < EV[a] - .1 || t > EV[b] + .6) continue;
    const u = seg(t, EV[a], EV[b]);
    gameWindow(ctx, t, m, {key: 'intro_' + m, a: EV[a], b: EV[b] - .05, dIn: .6, dOut: .5, flat: false, dir: 1, scale: lerp(.82, .98, u), ry: lerp(-16, -6, u), rx: 4,
      content: gameContent(m, 1 + (t - EV[a]))});
  }
  hostMorph(ctx, t, seg(t, s.start, s.start + .7));
};
VIS[703] = (ctx, t, s) => {
  bgDark(ctx, t, [16, 14, 34], [6, 6, 14], [255, 60, 160]);
  const z = keyed(t, [[0, {z: 1}], [EV.gop_light, {z: 1.5}]], .8).z;
  gameWindow(ctx, t, 'op', {a: s.start, content: gameContent('op', 3 + (t - s.start), z, .5, .38)});
  hostMorph(ctx, t, 1);
};
VIS[704] = (ctx, t, s) => {
  bgDark(ctx, t, [16, 14, 34], [6, 6, 14], [255, 60, 160]);
  gameWindow(ctx, t, 'gpt', {a: s.start, content: gameContent('gpt', 3 + (t - s.start))});
  hostMorph(ctx, t, 1);
};
// DeepSeek：方向键提示（按左车往右）。录制时按键时刻（素材秒）：
const KEY_L = [[-.4, .3], [3.1, 3.6], [6.5, 7.1]], KEY_R = [[1.3, 2.0], [4.7, 5.3]];
const dsGameTs = t => t - EV.keys_rev + 6.5;      // 让第三次「按左」正好落在「这你受得了吗」
function keycap(ctx, x, y, label, on, a) {
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y + (on ? 6 : 0));
  rr(ctx, -62, -62, 124, 124, 22); ctx.fillStyle = on ? '#ff3b6b' : 'rgba(20,22,32,.82)'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = on ? '#ffd1dc' : 'rgba(255,255,255,.35)'; ctx.stroke();
  ctx.font = '84px Black'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.fillText(label, 0, 4);
  ctx.restore();
}
VIS[705] = (ctx, t, s) => {
  bgDark(ctx, t, [16, 14, 34], [6, 6, 14], [255, 60, 160]);
  const ts = dsGameTs(t);
  gameWindow(ctx, t, 'ds', {a: s.start, content: gameContent('ds', ts)});
  const ka = seg(t, EV.keys - .2, EV.keys + .3);
  if (ka > 0) {
    const on = iv => iv.some(([a, b]) => ts >= a && ts < b);
    keycap(ctx, 1560, 780, '←', on(KEY_L), ka); keycap(ctx, 1710, 780, '→', on(KEY_R), ka);
  }
  // 「它左右键是反的」：一只小虫子（bug）从右边爬进游戏画面
  markBug(ctx, t, EV.rev_word - .9, EV.rev_word + .1, [[1940, 360], [1660, 430], [1420, 470]], {size: 96, b: s.end - .3});
  hostMorph(ctx, t, 1);
};
// 排最后：三款缩成一排，DeepSeek 掉到最右并变灰
VIS[707] = (ctx, t, s) => {
  bgDark(ctx, t, [16, 14, 34], [6, 6, 14], [255, 60, 160]);
  const k = eInOut(seg(t, s.start, s.start + .7));
  const last = eInOut(seg(t, EV.rank_last, EV.rank_last + .7));
  const xs = [440, 980, 1520];
  const pos0 = {ds: xs[0], op: xs[1], gpt: xs[2]}, pos1 = {ds: xs[2], op: xs[0], gpt: xs[1]};
  ['op', 'gpt', 'ds'].forEach((m, i) => {
    let x = lerp(pos0[m], pos1[m], last), y = m === 'ds' ? lerp(470, 520, last) : 470;
    const ss = m === 'ds' ? lerp(1, .315, k) : .315;
    if (m === 'ds') { x = lerp(GW.cx, x, k); y = lerp(GW.cy, y, k); }
    const al = m === 'ds' ? 1 - .45 * last : 1;
    windowCard(ctx, {t, key: 'rank_' + m, cx: x, cy: y, w: GW.w, h: GW.h, scale: ss, a: m === 'ds' ? null : s.start + .1 + i * .1, flat: true, alpha: al, content: gameContent(m, 5 + (t - s.start))});
    badge(ctx, m, x, y + GW.h * ss / 2 + 70, 52, al * (m === 'ds' ? k : seg(t, s.start + .3, s.start + .7)), {side: 'none'});
  });
  if (last > 0) { ctx.save(); ctx.globalAlpha = last; ctx.font = '120px Num'; ctx.textAlign = 'center'; ctx.fillStyle = '#ff5577'; ctx.fillText('3', xs[2], 300); ctx.restore(); }
  hostMorph(ctx, t, 1);
};
// 同屏金额对比：左 DeepSeek 右 Opus，金额框出来，中间「×35」
VIS[708] = (ctx, t, s) => {
  bgDark(ctx, t, [16, 14, 34], [6, 6, 14], [255, 60, 160]);
  const sides = [{m: 'ds', cx: 520, ev: 'c_ds', cost: '¥9.2', col: [40, 220, 140]}, {m: 'op', cx: 1400, ev: 'c_op', cost: '¥321', col: [255, 80, 100]}];
  const crashK = t > EV.crash ? Math.max(0, 1 - (t - EV.crash) / .5) : 0;
  sides.forEach((c, i) => {
    const M = windowCard(ctx, {t, key: 'cmp_' + c.m, cx: c.cx + (c.m === 'ds' ? (E.rng(Math.floor(t * 40))() - .5) * 40 * crashK : 0), cy: 375, w: 860, h: 484,
      a: s.start + i * .15, flat: true, mark: gameMark(c.m), content: gameContent(c.m, 2 + (t - s.start))});
    if (M) { const [bx, by] = E.mapPt(M, 60, 60); badge(ctx, c.m, bx, by, 40, seg(t, s.start + .3, s.start + .7), {side: 'right', nameSize: 30}); }
    const u = seg(t, EV[c.ev], EV[c.ev] + .45); if (u <= 0) return;
    ctx.save(); ctx.translate(c.cx, 760); ctx.scale(backOut(u, 2), backOut(u, 2)); ctx.globalAlpha = clamp(u * 3, 0, 1);
    ctx.font = '150px Num'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const tw = ctx.measureText(c.cost).width;
    rr(ctx, -tw / 2 - 40, -95, tw + 80, 180, 26); ctx.lineWidth = 8; ctx.strokeStyle = E.rgb(c.col); ctx.shadowColor = E.rgb(c.col, 1, .8); ctx.shadowBlur = 30; ctx.stroke();
    ctx.shadowBlur = 20; ctx.fillStyle = '#fff'; ctx.fillText(c.cost, 0, 6); ctx.restore();
  });
  const x = seg(t, EV.x35 - .05, EV.x35 + .4);
  if (x > 0) {
    ctx.save(); ctx.translate(960, 760); const sc = lerp(1.8, 1, eOut(x, 5)); ctx.scale(sc, sc); ctx.globalAlpha = clamp(x * 3, 0, 1);
    ctx.font = '170px Num'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffd34d'; ctx.shadowColor = 'rgba(255,200,60,.9)'; ctx.shadowBlur = 40; ctx.fillText('×35', 0, 6); ctx.restore();
  }
  if (crashK > 0) E.shake(ctx, crashK, Math.floor(t * 30));
  hostMorph(ctx, t, 1);
};
