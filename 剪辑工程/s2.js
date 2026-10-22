// ② AI 视频：Vibe Coding 片段 → DeepSeek 追得上吗 → 三条 MV 竞猜 → 同时播放 + 倒计时 → 揭晓 → 数据
// 演示部分不用 3D 视角；画面先居中铺满，出现新元素时再顺滑重新构图。
'use strict';

const MV_AT = X.mv[0], MV_LEN = X.mv[1];
// 三条视频从上到下：GPT、Opus、DeepSeek（分镜表顺序）
const MV_ROWS = [{m: 'gpt', key: 'mv_gpt'}, {m: 'op', key: 'mv_op'}, {m: 'ds', key: 'mv_ds'}];
// 基础画幅：上下铺满，画面加宽（视频按原比例裁切，不拉伸）
const MV = {w: 760, h: 346, ys: [180, 540, 900]};
const MV_STYLE = {border: 6, bezel: 8, radius: 20, col: '#16181d'};

// 眩晕片段：Opus 做的代码生成视频（原声做背景音）。大画幅铺满
const XY = {w: 1640, h: 922, cx: 960, cy: 515};
function xuanyunCard(ctx, t, o) {
  return windowCard(ctx, {t, key: 'xuanyun', w: XY.w, h: XY.h, flat: true, content: fillVideo('xuanyun', Math.max(0, t - EV.ai_video + 1.2)), ...o});
}

VIS[201] = (ctx, t, s) => {
  bgLight(ctx, t);
  xuanyunCard(ctx, t, {cx: XY.cx, cy: XY.cy, a: s.start + .02});
  // Opus 的绝对领域：Opus 徽章落在窗口右上角
  badgePop(ctx, t, 'op', 1735, 110, 78, EV.opus_domain, null, {side: 'left', theme: 'light', nameSize: 44});
  hostPop(ctx, t, s.start + .15, null);
};

// 窗口缩到左边，给追赶的 DeepSeek 让位
const XY2 = {cx: 700, cy: 470, s: .62};
VIS[202] = (ctx, t, s) => {
  bgLight(ctx, t);
  const m = eInOut(seg(t, s.start, s.start + .75));
  const cx = lerp(XY.cx, XY2.cx, m), cy = lerp(XY.cy, XY2.cy, m), sc = lerp(1, XY2.s, m);
  xuanyunCard(ctx, t, {cx, cy, scale: sc});
  // Opus 徽章跟着窗口右上角走
  const bx = cx + XY.w * sc / 2 - lerp(225, 30, m), by = cy - XY.h * sc / 2 + lerp(-295, 30, m);
  badge(ctx, 'op', bx, by, lerp(78, 64, m), 1, {side: m < .4 ? 'left' : 'none', theme: 'light', nameSize: 44});
  // DeepSeek 从右侧冲进来追赶，带速度线；说到「追上吗」冒问号
  const u = seg(t, EV.chase + 1.0, EV.chase + 1.9);
  const dx = lerp(700, 0, eOut(u, 3));
  const dsx = 1540 + dx, dsy = 540 + floatY(t);
  if (u > 0) {
    ctx.save(); ctx.globalAlpha = .55 * (1 - seg(t, EV.chase + 1.9, EV.chase + 2.6));
    for (let i = 0; i < 7; i++) { const yy = dsy - 120 + i * 40, L = 160 + (i * 53) % 120; E.line(ctx, [[dsx + 150 + (i % 3) * 20, yy], [dsx + 150 + L, yy]], [77, 107, 254], 1, 6); }
    ctx.restore();
  }
  badge(ctx, 'ds', dsx, dsy, 130, clamp(u * 3, 0, 1), {side: 'below', theme: 'light', nameSize: 52});
  const q = seg(t, EV.ds_q - .1, EV.ds_q + .35);
  if (q > 0) {
    const qs = backOut(q, 2.4); const wob = Math.sin((t - EV.ds_q) * 9) * .08 * Math.max(0, 1 - (t - EV.ds_q) / 1.2);
    ctx.save(); ctx.translate(dsx + 130, dsy - 180); ctx.rotate(.18 + wob); ctx.scale(qs, qs);
    ctx.font = '230px Title'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round'; ctx.lineWidth = 26; ctx.strokeStyle = '#fff'; ctx.strokeText('?', 0, 0);
    ctx.fillStyle = '#4d6bfe'; ctx.fillText('?', 0, 0); ctx.restore();
  }
  hostMorph(ctx, t, 1);
};

// ---------------------------------------------------------------- 三条 MV 的构图（随时间连续变化）
// 竞猜/播放：居中铺满；揭晓后：缩一点移到左侧给徽章；出数据：再让一点给数据列
function mvLayout(t) {
  const k1 = eInOut(seg(t, EV.reveal + .05, EV.reveal + .75));
  const k2 = eInOut(seg(t, EV.data_in - .35, EV.data_in + .35));
  const cx = lerp(lerp(960, 735, k1), 690, k2), s = lerp(lerp(1, .86, k1), .8, k2);
  return {cx, s, y: i => 540 + (MV.ys[i] - 540) * s, right: cx + MV.w * s / 2, left: cx - MV.w * s / 2};
}
// focus: 放大到前面的那一条（DeepSeek = 2）
function mvStack(ctx, t, {aIn = null, focusK = 0, focus = 2} = {}) {
  const L = mvLayout(t);
  const order = focusK > 0 ? [0, 1, 2].filter(i => i !== focus).concat([focus]) : [0, 1, 2];
  for (const i of order) {
    const r = MV_ROWS[i];
    const ts = t >= MV_AT ? (t - MV_AT) % MV_LEN : .6;   // 插入段三条同时开始；之后继续循环（静音）
    const f = i === focus ? eInOut(focusK) : 0;
    const cx = lerp(L.cx, 1010, f), cy = lerp(L.y(i), 465, f), sc = lerp(L.s, 1.78, f);
    const al = focusK > 0 && i !== focus ? 1 - .6 * eInOut(focusK) : 1;
    windowCard(ctx, {t, key: 'mv' + i, cx, cy, w: MV.w, h: MV.h, a: aIn == null ? null : aIn + i * .16, flat: true, scale: sc,
      alpha: al, style: MV_STYLE, content: fillVideo(r.key, ts, 1, .5, .5)});
  }
}
// 竞猜编号（大号数字）
function guessNums(ctx, t, a, b) {
  const [ui, uo] = env(t, a, b, .4, .3);
  if (ui <= 0 || uo >= 1) return;
  const L = mvLayout(t);
  MV.ys.forEach((y, i) => {
    const u = seg(t, a + i * .16, a + i * .16 + .4);
    ctx.save(); ctx.globalAlpha = clamp(u * 3, 0, 1) * (1 - uo); ctx.translate(L.left - 110, L.y(i)); ctx.scale(backOut(u, 2), backOut(u, 2));
    ctx.font = '200px Num'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#c3c9d4'; ctx.fillText(String(i + 1), 0, 8); ctx.restore();
  });
}

VIS[203] = (ctx, t, s) => {
  bgLight(ctx, t);
  xuanyunCard(ctx, t, {cx: XY2.cx, cy: XY2.cy, scale: XY2.s, b: s.start - .05, dOut: .45});
  mvStack(ctx, t, {aIn: EV.guess + .2});
  guessNums(ctx, t, EV.guess + .45, null);
  hostMorph(ctx, t, 1);
};

// 倒计时：大数字 + 圆环（在右侧空处）
function countdown(ctx, t, t0) {
  const k = t - t0; if (k < -.3 || k >= 3) return;
  const ap = seg(k, -.3, 0);
  const n = 3 - Math.max(0, Math.floor(k)), f = Math.max(0, k) % 1;
  const cx = 1650, cy = 540;
  ctx.save(); ctx.globalAlpha = ap;
  ctx.lineWidth = 16; ctx.strokeStyle = 'rgba(21,23,28,.12)'; ctx.beginPath(); ctx.arc(cx, cy, 165, 0, 7); ctx.stroke();
  ctx.strokeStyle = '#4d6bfe'; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(cx, cy, 165, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - f)); ctx.stroke();
  const s = lerp(1.5, 1, eOut(seg(f, 0, .25), 4));
  ctx.translate(cx, cy + 10); ctx.scale(s, s); ctx.globalAlpha = ap * clamp((1 - f) * 4, 0, 1);
  ctx.font = '250px Num'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#15171c'; ctx.fillText(String(n), 0, 0);
  ctx.restore();
}

VIS[204] = (ctx, t, s) => {
  bgLight(ctx, t);
  mvStack(ctx, t);
  guessNums(ctx, t, -10, s.end - .4);
  // 插入段没有口播，人像淡出；最后 3 秒倒计时
  const hk = 1 - seg(t, s.start, s.start + .4);
  if (hk > 0) { ctx.save(); ctx.globalAlpha = hk; hostMorph(ctx, t, 1); ctx.restore(); }
  countdown(ctx, t, EV.count);
};

// 揭晓：模型徽章依次滑到对应视频右边；出数据时收起名字
function revealBadges(ctx, t, {pulse = {}} = {}) {
  const L = mvLayout(t);
  const comp = seg(t, EV.data_in - .35, EV.data_in);
  MV_ROWS.forEach((r, i) => {
    const u = seg(t, EV.reveal + .2 + i * .14, EV.reveal + .2 + i * .14 + .55); if (u <= 0) return;
    const x = L.right + lerp(300, 100, eOut(u, 4)) - 20 * comp, y = L.y(i);
    const pk = pulse[r.m] ? Math.max(0, 1 - Math.abs(t - pulse[r.m] - .25) / .45) : 0;
    badge(ctx, r.m, x, y, lerp(70, 56, comp), clamp(u * 3, 0, 1), {side: comp < .5 ? 'right' : 'none', theme: 'light', nameSize: 52, s: 1 + .14 * pk});
  });
}

VIS[205] = (ctx, t, s) => {
  bgLight(ctx, t);
  E.flash(ctx, Math.max(0, 1 - (t - EV.reveal) / .25) * .6);
  mvStack(ctx, t);
  revealBadges(ctx, t, {pulse: {ds: EV.ds_good, op: EV.op_smooth, gpt: EV.gpt_worse}});
  hostPop(ctx, t, EV.host_in, null);
};

// 用时 / Token / 金额：三列大数字，DeepSeek 两项最低的绿色高亮
function dataTable(ctx, t) {
  const D0 = X.data.mv, L = mvLayout(t);
  const x0 = L.right + 270;
  const cols = [{dx: 0, ev: 'data_time', f: d => d[0], low: true}, {dx: 245, ev: 'data_in', f: d => d[1] + 'M', low: false}, {dx: 490, ev: 'data_cost', f: d => '¥' + d[2], low: true}];
  const heads = ['用时', 'Token', '金额'];
  cols.forEach((c, j) => {
    const t0 = EV[c.ev] + (j === 1 ? .35 : 0);
    const u = seg(t, t0, t0 + .45); if (u <= 0) return;
    ctx.save(); ctx.globalAlpha *= clamp(u * 2, 0, 1); ctx.font = '50px Black'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#7d8492';
    ctx.fillText(heads[j], x0 + c.dx, L.y(0) - 120 * L.s - 30); ctx.restore();
    MV_ROWS.forEach((r, i) => {
      const uu = seg(t, t0 + i * .1, t0 + i * .1 + .5); if (uu <= 0) return;
      const isLow = c.low && r.m === 'ds' && t > EV.lowest;
      const lk = isLow ? seg(t, EV.lowest, EV.lowest + .35) : 0;
      ctx.save(); ctx.globalAlpha *= clamp(uu * 3, 0, 1);
      ctx.translate(x0 + c.dx, L.y(i) + (1 - eOut(uu)) * 40); const sc = 1 + .12 * lk; ctx.scale(sc, sc);
      if (lk > 0) { rr(ctx, -108, -52, 216, 104, 24); ctx.fillStyle = `rgba(22,190,120,${.16 * lk})`; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = `rgba(22,170,110,${lk})`; ctx.stroke(); }
      ctx.font = '84px Num'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = isLow ? E.rgb([14, 150, 92]) : '#15171c'; ctx.fillText(c.f(D0[r.m]), 0, 4);
      ctx.restore();
    });
  });
}
VIS[206] = (ctx, t, s) => {
  bgLight(ctx, t);
  const fk = seg(t, EV.ds_front, EV.ds_front + .75) * (1 - seg(t, s.end - .5, s.end));
  const tableK = 1 - eInOut(fk);
  ctx.save(); ctx.globalAlpha = tableK;
  revealBadges(ctx, t);
  dataTable(ctx, t);
  ctx.restore();
  mvStack(ctx, t, {focusK: fk});
  if (fk > .5) badge(ctx, 'ds', 1775, 880, 72, seg(fk, .5, 1), {side: 'left', theme: 'light', nameSize: 46});
  hostMorph(ctx, t, 1);
  const uo = seg(t, s.end - .3, s.end); if (uo > 0) E.whip(ctx, uo);
};

// ③ 开头：回到口播（从左下角圆窗放大回全屏，承接秋芝人像效果）
VIS[301] = (ctx, t, s) => {
  bgLight(ctx, t);
  hostMorph(ctx, t, 1 - seg(t, s.start, s.start + .7));
};
