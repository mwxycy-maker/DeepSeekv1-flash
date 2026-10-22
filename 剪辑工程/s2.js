// ② AI 视频：Vibe Coding 片段 → DeepSeek 追得上吗 → 三条 MV 竞猜 → 同时播放 + 倒计时 → 揭晓 → 数据
'use strict';

const MV_AT = X.mv[0], MV_LEN = X.mv[1];
// 三条视频从上到下：GPT、Opus、DeepSeek（分镜表顺序）
const MV_ROWS = [{m: 'gpt', key: 'mv_gpt'}, {m: 'op', key: 'mv_op'}, {m: 'ds', key: 'mv_ds'}];
const MV_CARD = {x: 840, w: 520, h: 293, ys: [168, 478, 788]};

// 眩晕片段：Opus 做的代码生成视频（原声做背景音）
function xuanyunCard(ctx, t, o) {
  return windowCard(ctx, {t, key: 'xuanyun', w: 1200, h: 675, dir: 1, content: fillVideo('xuanyun', Math.max(0, t - EV.ai_video + 1.2)), ...o});
}

VIS[201] = (ctx, t, s) => {
  bgLight(ctx, t);
  xuanyunCard(ctx, t, {cx: 1010, cy: 470, a: s.start + .05, ry: -10, rx: 3});
  // Opus 的绝对领域：Opus 徽章落到窗口右上角
  badgePop(ctx, t, 'op', 1730, 300, 84, EV.opus_domain, null, {side: 'below', theme: 'light', nameSize: 44});
  // 口播从全屏收进左下角（承接 VS 后的白闪，用弹出）
  hostPop(ctx, t, s.start + .15, null);
};

VIS[202] = (ctx, t, s) => {
  bgLight(ctx, t);
  // 窗口往左让位，保持同一透视方向
  const m = eInOut(seg(t, s.start, s.start + .7));
  xuanyunCard(ctx, t, {cx: lerp(1010, 820, m), cy: lerp(470, 450, m), scale: lerp(1, .78, m), ry: lerp(-10, -16, m), rx: 3});
  badge(ctx, 'op', lerp(1730, 1310, m), lerp(300, 200, m), lerp(84, 70, m), 1, {side: m < .5 ? 'below' : 'none', theme: 'light', nameSize: 44});
  // DeepSeek 从右侧冲进来追赶，带速度线；说到「追上吗」冒问号
  const u = seg(t, EV.chase + 1.0, EV.chase + 1.9);
  const dx = lerp(700, 0, eOut(u, 3));
  const bx = 1560 + dx, by = 560 + floatY(t);
  if (u > 0) {
    ctx.save(); ctx.globalAlpha = .55 * (1 - seg(t, EV.chase + 1.9, EV.chase + 2.6));
    for (let i = 0; i < 7; i++) { const yy = by - 120 + i * 40, L = 160 + (i * 53) % 120; E.line(ctx, [[bx + 140 + (i % 3) * 20, yy], [bx + 140 + L, yy]], [77, 107, 254], 1, 6); }
    ctx.restore();
  }
  badge(ctx, 'ds', bx, by, 120, clamp(u * 3, 0, 1), {side: 'below', theme: 'light', nameSize: 50});
  const q = seg(t, EV.ds_q - .1, EV.ds_q + .35);
  if (q > 0) {
    const sc = backOut(q, 2.4); const wob = Math.sin((t - EV.ds_q) * 9) * .08 * Math.max(0, 1 - (t - EV.ds_q) / 1.2);
    ctx.save(); ctx.translate(bx + 120, by - 170); ctx.rotate(.18 + wob); ctx.scale(sc, sc);
    ctx.font = '220px Title'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round'; ctx.lineWidth = 26; ctx.strokeStyle = '#fff'; ctx.strokeText('?', 0, 0);
    ctx.fillStyle = '#4d6bfe'; ctx.fillText('?', 0, 0); ctx.restore();
  }
  hostMorph(ctx, t, 1);
};

// 三条 MV 竖排卡片。play: 是否正在播放（插入段），否则停在封面帧
function mvStack(ctx, t, {aIn = null, play = false, dim = null, focus = -1, focusK = 0} = {}) {
  const order = focus >= 0 ? [0, 1, 2].filter(i => i !== focus).concat([focus]) : [0, 1, 2];
  for (const i of order) {
    const r = MV_ROWS[i];
    let ts = .6;
    if (t >= MV_AT) ts = (t - MV_AT) % MV_LEN;           // 插入段同时开始；之后继续循环播放（静音）
    const f = i === focus ? eInOut(focusK) : 0;
    const cx = lerp(MV_CARD.x, 900, f), cy = lerp(MV_CARD.ys[i], 470, f), sc = lerp(1, 1.95, f);
    const al = focus >= 0 && i !== focus ? 1 - .55 * eInOut(focusK) : 1;
    windowCard(ctx, {t, key: 'mv' + i, cx, cy, w: MV_CARD.w, h: MV_CARD.h, a: aIn == null ? null : aIn + i * .18, dir: 1, ry: -12 * (1 - f), rx: 3 * (1 - f), scale: sc,
      alpha: al, style: {border: 7, bezel: 9, radius: 22, col: '#16181d'}, content: fillVideo(r.key, ts)});
  }
}
// 竞猜编号（大号数字，不是小标签）
function guessNums(ctx, t, a, b) {
  const [ui, uo] = env(t, a, b, .4, .3);
  if (ui <= 0 || uo >= 1) return;
  MV_CARD.ys.forEach((y, i) => {
    const u = seg(t, a + i * .18, a + i * .18 + .4);
    ctx.save(); ctx.globalAlpha = clamp(u * 3, 0, 1) * (1 - uo); ctx.translate(520, y); ctx.scale(backOut(u, 2), backOut(u, 2));
    ctx.font = '170px Num'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#c9ced8'; ctx.fillText(String(i + 1), 0, 6); ctx.restore();
  });
}

VIS[203] = (ctx, t, s) => {
  bgLight(ctx, t);
  xuanyunCard(ctx, t, {cx: 820, cy: 450, scale: .78, ry: -16, rx: 3, b: s.start, dOut: .5});
  mvStack(ctx, t, {aIn: EV.guess + .25});
  guessNums(ctx, t, EV.guess + .45, null);
  hostMorph(ctx, t, 1);
};

// 倒计时：大数字 + 圆环
function countdown(ctx, t, t0) {
  const k = t - t0; if (k < 0 || k >= 3) return;
  const n = 3 - Math.floor(k), f = k % 1;
  const cx = 1500, cy = 488;
  ctx.save();
  ctx.lineWidth = 16; ctx.strokeStyle = 'rgba(21,23,28,.12)'; ctx.beginPath(); ctx.arc(cx, cy, 170, 0, 7); ctx.stroke();
  ctx.strokeStyle = '#4d6bfe'; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(cx, cy, 170, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - f)); ctx.stroke();
  const s = lerp(1.5, 1, eOut(seg(f, 0, .25), 4));
  ctx.translate(cx, cy + 10); ctx.scale(s, s); ctx.globalAlpha = clamp((1 - f) * 4, 0, 1);
  ctx.font = '260px Num'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#15171c'; ctx.fillText(String(n), 0, 0);
  ctx.restore();
}

VIS[204] = (ctx, t, s) => {
  bgLight(ctx, t);
  mvStack(ctx, t, {play: true});
  guessNums(ctx, t, -10, s.end - .4);
  // 插入段没有口播，人像淡出；最后 3 秒倒计时
  const hk = 1 - seg(t, s.start, s.start + .4);
  if (hk > 0) { ctx.save(); ctx.globalAlpha = hk; hostMorph(ctx, t, 1); ctx.restore(); }
  countdown(ctx, t, EV.count);
};

// 揭晓：模型徽章依次滑到对应视频右边
function revealBadges(ctx, t, {compact = 0, pulse = {}} = {}) {
  MV_ROWS.forEach((r, i) => {
    const u = seg(t, EV.reveal + i * .14, EV.reveal + i * .14 + .5); if (u <= 0) return;
    const x = lerp(1440, 1195, eOut(u, 4)), y = MV_CARD.ys[i];
    const pk = pulse[r.m] ? Math.max(0, 1 - Math.abs(t - pulse[r.m] - .25) / .45) : 0;
    const s = 1 + .14 * pk;
    const showName = 1 - compact;
    badge(ctx, r.m, x, y, lerp(66, 58, compact), clamp(u * 3, 0, 1), {side: showName > .5 ? 'right' : 'none', theme: 'light', nameSize: 50, s});
  });
}

VIS[205] = (ctx, t, s) => {
  bgLight(ctx, t);
  E.flash(ctx, Math.max(0, 1 - (t - EV.reveal) / .25) * .6);
  mvStack(ctx, t, {});
  revealBadges(ctx, t, {pulse: {ds: EV.ds_good, op: EV.op_smooth, gpt: EV.gpt_worse}});
  hostPop(ctx, t, EV.host_in, null);
};

// 用时 / Token / 金额：三列大数字，DeepSeek 两项最低的绿色高亮
function dataTable(ctx, t) {
  const D0 = X.data.mv;
  const cols = [{x: 1360, ev: 'data_time', f: d => d[0], low: true}, {x: 1575, ev: 'data_in', f: d => d[1] + 'M', low: false}, {x: 1790, ev: 'data_cost', f: d => '¥' + d[2], low: true}];
  const icons = ['用时', 'Token', '金额'];
  cols.forEach((c, j) => {
    const u = seg(t, EV[c.ev] + (j === 1 ? .35 : 0), EV[c.ev] + (j === 1 ? .35 : 0) + .45); if (u <= 0) return;
    // 列头图标（大）
    ctx.save(); ctx.globalAlpha *= clamp(u * 2, 0, 1); ctx.font = '50px Black'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#8a909c';
    ctx.fillText(icons[j], c.x, 40); ctx.restore();
    MV_ROWS.forEach((r, i) => {
      const uu = seg(t, EV[c.ev] + i * .1 + (j === 1 ? .35 : 0), EV[c.ev] + i * .1 + (j === 1 ? .35 : 0) + .5); if (uu <= 0) return;
      const isLow = c.low && r.m === 'ds' && t > EV.lowest;
      const lk = isLow ? seg(t, EV.lowest, EV.lowest + .35) : 0;
      ctx.save(); ctx.globalAlpha *= clamp(uu * 3, 0, 1);
      ctx.translate(c.x, MV_CARD.ys[i] + (1 - eOut(uu)) * 40); const sc = 1 + .12 * lk; ctx.scale(sc, sc);
      if (lk > 0) { rr(ctx, -100, -50, 200, 100, 24); ctx.fillStyle = `rgba(22,190,120,${.16 * lk})`; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = `rgba(22,170,110,${lk})`; ctx.stroke(); }
      ctx.font = '76px Num'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = isLow ? E.rgb([14, 150, 92]) : '#15171c'; ctx.fillText(c.f(D0[r.m]), 0, 4);
      ctx.restore();
    });
  });
}
VIS[206] = (ctx, t, s) => {
  bgLight(ctx, t);
  const fk = seg(t, EV.ds_front, EV.ds_front + .7) * (1 - seg(t, s.end - .5, s.end));
  const tableK = 1 - eInOut(fk);
  // 名字收起让出位置给数据
  const comp = seg(t, s.start, s.start + .4);
  ctx.save(); ctx.globalAlpha = tableK;
  revealBadges(ctx, t, {compact: comp});
  dataTable(ctx, t);
  ctx.restore();
  mvStack(ctx, t, {focus: fk > 0 ? 2 : -1, focusK: fk});
  if (fk > .5) badge(ctx, 'ds', 1690, 230, 80, seg(fk, .5, 1), {side: 'below', theme: 'light', nameSize: 46});
  hostMorph(ctx, t, 1);
  const uo = seg(t, s.end - .3, s.end); if (uo > 0) E.whip(ctx, uo);
};

// ③ 开头：回到口播（从左下角圆窗放大回全屏，承接秋芝人像效果）
VIS[301] = (ctx, t, s) => {
  bgLight(ctx, t);
  hostMorph(ctx, t, 1 - seg(t, s.start, s.start + .7));
};
