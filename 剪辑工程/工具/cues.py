"""配乐表与音效表（成片秒）。事件时间全部取自 plan.EV，口播改了会跟着走。

BGM 衔接按《音乐衔接教程》：
1. 停止 + 转移注意力 + 开始：上一首在重击/混响尾巴里停，用音效、画面或台词接住，再让下一首从强拍进来。
2. 「切割按钮」：上升音效（riser）收在新段落第一帧，提示观众要换歌了。
3. 相近情绪的两首可直接交叉，但要对齐鼓点，声音不要断。
"""
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from plan import EV, MV_AT, MV_LEN

ROOT = HERE.parent
MUS = ROOT / '音乐'
MEDIA = ROOT.parent / '素材'
DUCK_DB = -11

POW = str(MUS / 'Pow - William Baxter Noon.mp3')
LWT = str(MUS / "Let's Win This - BalloonPlanet.mp3")

# ① Pow：曲子 28.9 秒自带一记大鼓（前面 1.5 秒是停顿）→ 对齐 VS 重击那一帧
VS_SLAM = EV['vs_end'] - .55
POW_OFF = 28.9 - VS_SLAM

MUSIC = [
    dict(file=POW, src=POW_OFF, at=0.0, until=VS_SLAM + .45, level=-17, fade_in=.25, tail=1.6, ref_ss=10, ref_dur=30),
    # ② 眩晕片段原声当背景音（画面里视频同步播放）
    dict(file=str(MEDIA / '眩晕.mp4'), src=0, at=EV['ai_video'] - 1.2, until=MV_AT - .05, level=-20, fade_in=.6, fade_out=.5, ref_ss=0, ref_dur=30),
    # ② MV 播放：用 01-纸月亮_MV_1080p 的背景音，口播空档里满音量
    dict(file=str(MEDIA / 'Claude Opus5.5' / '01-纸月亮_MV_1080p.mp4'), src=0, at=MV_AT, until=MV_AT + MV_LEN, level=-15, fade_in=.05, fade_out=.35, duck=False, ref_ss=0, ref_dur=24),
    # ② 揭晓重击后，Let's Win This 从强拍进来，一直到 ③ 开头的转场
    dict(file=LWT, src=.075, at=EV['reveal'], until=EV['sec2'] + .3, level=-18, fade_in=.02, tail=1.2, ref_ss=0, ref_dur=30),
]

DIP = [(VS_SLAM - .12, VS_SLAM)]

S = lambda f, at, db=-10, align='start', **k: dict(file=f, at=at, db=db, align=align, **k)
SFX = [
    # ①
    S('pop', EV['ds_badge'], -9),
    S('whoosh_swipe', EV['tok'] - .05, -8), S('whoosh_swipe', EV['tok'] + .07, -11),
    S('whoosh_low', EV['gpt_badge'] - .45, -13, dur=.8),
    S('pop', EV['gpt_badge'], -9), S('pop', EV['op_badge'], -9),
    S('whoosh_deep', EV['task1'] - .9, -12, dur=1.4),
    S('whoosh_swipe', EV['task1'] - .2, -10), S('whoosh_swipe', EV['task2'] - .2, -10), S('whoosh_swipe', EV['task3'] - .2, -10),
    S('whoosh_deep', EV['vs_in'] - .35, -8, dur=1.6),
    S('zap', EV['vs_in'] + .1, -14, dur=1.2),
    S('impact', EV['vs_in'] + .55, -9),
    S('riser_short', VS_SLAM, -12, 'end'),
    S('hit_hard', VS_SLAM, -4, dur=2.6), S('lightning', VS_SLAM, -14, dur=1.5),
    # ②
    S('whoosh_low', EV['vs_end'] - .1, -9, dur=1.2),
    S('pop', EV['opus_domain'], -10),
    S('whoosh_swipe', EV['chase'] + .95, -9),
    S('pop_cartoon', EV['ds_q'] - .05, -6),
    S('whoosh_swipe', EV['stack'] - .35, -10), S('pop', EV['stack'] - .1, -14), S('pop', EV['stack'] + .08, -14), S('pop', EV['stack'] + .26, -14),
    S('drumroll', EV['count'] - 1.75, -16),
    S('tick', EV['count'], -10, dur=.25), S('tick', EV['count'] + 1, -10, dur=.25), S('tick', EV['count'] + 2, -10, dur=.25),
    S('impact', EV['reveal'], -6), S('sparkle_star', EV['reveal'] + .05, -16, dur=1.5),
    S('pop', EV['host_in'], -12),
    S('pop', EV['data_time'], -13), S('pop', EV['data_in'] + .35, -13), S('pop', EV['data_cost'], -13),
    S('sparkle_star', EV['lowest'], -13, dur=1.4),
    S('whoosh_low', EV['ds_front'], -11, dur=1),
    S('whoosh_deep', EV['sec2'] - .3, -9, dur=1.2),
]
