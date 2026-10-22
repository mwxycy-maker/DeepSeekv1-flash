"""本期镜头表与事件表：全部用口播锚点（某句里的某个词）定位，口播剪辑变化后自动跟随。

运行：python3 工具/plan.py → 写 project.json 并运行 build.py
"""
import json, subprocess, sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(HERE))
import timeline as tl
from timeline import A, AE, T, hold

MV_AT, MV_LEN = hold(38.40)[0], 24.30           # MV 插入段：成片起点
VS_HOLD = hold(18.59)

# ---------------------------------------------------------------- 镜头（id, 名称, 起点）
SHOTS = [
    (101, '开场 口播+DeepSeek', 0.0),
    (102, '开场 5亿Token', A(0, '我猛蹬') - .1),
    (103, '开场 三方徽章', A(0, '让它和') - .05),
    (104, '开场 三项比拼', A(0, '在相同') - .05),
    (105, '开场 VS 对决', A(1, '看看') - .12),
    (201, 'AI视频 Vibe Coding 片段', A(2, '首先') - .25),
    (202, 'AI视频 DeepSeek 追得上吗', A(2, '一般模型') - .05),
    (203, 'AI视频 三条视频竞猜', A(2, '先卖') - .1),
    (204, 'AI视频 MV 同时播放', MV_AT),
    (205, 'AI视频 揭晓与点评', MV_AT + MV_LEN),
    (206, 'AI视频 用时Token金额', A(5, '而且') - .05),
    (301, '3D建模 口播', A(6, '第二个') - .2),
]
SHOTS.append((999, '（待制作）', A(7, '我先让') - .1))

# ---------------------------------------------------------------- 事件（场景与音效共用）
EV = {
    'ds_badge': A(0, 'DeepSeek'), 'tok': A(0, '5亿') - .15,
    'tok_in': A(0, '我猛蹬') - .05, 'tok_full': AE(0, 'Token'), 'tok_out': AE(0, 'Token') + 1.5,
    'gpt_badge': A(0, 'GPT'), 'op_badge': A(0, 'Claude'),
    'task1': A(0, '建模') - .3, 'task2': A(0, '制作游戏'), 'task3': A(0, '制作视频'),
    'vs_in': A(1, '看看') - .05, 'vs_hit': A(1, '谁将'), 'vs_end': VS_HOLD[0] + VS_HOLD[1],
    'ai_video': A(2, 'AI视频'), 'opus_domain': A(2, '这可是'),
    'chase': A(2, '一般模型'), 'ds_q': A(2, '追上吗'),
    'guess': A(2, '先卖') , 'stack': A(3, '这三个') - .1,
    'mv': MV_AT, 'count': MV_AT + MV_LEN - 3.0, 'reveal': MV_AT + MV_LEN,
    'host_in': A(4, '怎么样') - .2, 'ds_good': A(4, 'DeepSeek'), 'op_smooth': A(4, 'Opus'), 'gpt_worse': A(4, 'GPT'),
    'data_in': A(5, '这次测试'), 'data_time': A(5, '所用的时间'), 'data_cost': A(5, '消耗的金额'), 'lowest': A(5, '全场最低'),
    'ds_front': A(5, '那平时'),
    'sec2': A(6, '第二个') - .2,
}
EV = {k: round(v, 3) for k, v in EV.items()}

# ---------------------------------------------------------------- 素材
SOURCES = {
    'aroll_a': 'media/aroll_a.mp4', 'aroll_b': 'media/aroll_b.mp4', 'person_a': 'media/person_a.mp4',
    'xuanyun': 'media/xuanyun.mp4',
    'mv_gpt': 'media/mv_gpt.mp4', 'mv_op': 'media/mv_op.mp4', 'mv_ds': 'media/mv_ds.mp4',
}
for p in sorted((ROOT / 'media' / 'demo').glob('*.mp4')):
    SOURCES[p.stem] = f'media/demo/{p.name}'
IMAGES = sorted(p.name for p in (ROOT / 'assets').iterdir() if p.suffix in ('.png', '.jpg'))

# 文档里的数据（用时 / Token 百万 / 金额 元）
DATA = {
    'store': {'ds': ['42:11', 58.4, 6.9], 'gpt': ['14:28', 5, 7.8], 'op': ['35:03', 3.5, 40]},
    'mv': {'ds': ['12:48', 17.9, 18.8], 'gpt': ['25:52', 9.6, 26.63], 'op': ['28:00', 9.2, 44.56]},
    'tower': {'ds': ['43:50', 26.3, 3.62], 'gpt': ['11:39', 2.4, 9.8], 'op': ['8:00', 1.2, 14]},
    'game': {'ds': ['1:10:28', 91.5, 9.2], 'gpt': ['19:24', 6.3, 21.74], 'op': ['55:00', 47, 321.12]},
    'car': {'ds': ['31:48', 12.7, 3], 'astra': ['5:38', 1.3, 17.59]},
}


def main():
    shots = []
    for k, (i, name, st) in enumerate(SHOTS):
        en = SHOTS[k + 1][2] if k + 1 < len(SHOTS) else tl.TOTAL
        shots.append({'i': i, 'start': round(st, 3), 'end': round(en, 3), 'text': name})
    subs = []
    for a, txt, b in tl.SUBS:
        sid = next(s['i'] for s in shots if s['start'] <= a < s['end'])
        subs.append([round(a, 3), txt, sid, round(b, 3)])
    p = json.loads((ROOT / 'project.json').read_text())
    p.update(title='DeepSeek V4.1 Flash 三模型 PK', fps=30, audio='mix.m4a' if (ROOT / 'mix.m4a').exists() else '_demo-clock.wav',
             sources=SOURCES, images=IMAGES, shots=shots, subs=subs, events=EV,
             sceneScripts=['s1.js', 's2.js'],
             fonts=['64px Sub', '40px Black', '120px Title', '80px Num'],
             extra={'pieces': tl.pieces, 'holds': tl.hold_at, 'data': DATA, 'mv': [MV_AT, MV_LEN]})
    (ROOT / 'project.json').write_text(json.dumps(p, ensure_ascii=False, indent=1) + '\n')
    (HERE / '_timeline.json').write_text(json.dumps({'pieces': tl.pieces, 'total': tl.TOTAL, 'events': EV, 'holds': tl.hold_at}, ensure_ascii=False, indent=1))
    subprocess.run([sys.executable, str(ROOT / 'build.py')], check=True)


if __name__ == '__main__':
    main()
