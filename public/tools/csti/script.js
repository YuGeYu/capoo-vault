const typesBelike = {
    aggressive: { donk: "assets/images/donk.webp", NiKo: "assets/images/niko.webp" },
    steady: { zont1x: "assets/images/zoont1x.webp", Twistzz: "assets/images/twistzz.webp" },
    team: { karrigan: "assets/images/karrigan.webp", Aleksib: "assets/images/aleksib.webp" },
    lone: { ropz: "assets/images/ropz.webp", kscerato: "assets/images/kscerato.webp" },
    tactical: { apEX: "assets/images/apex.webp", FalleN: "assets/images/fallen.webp" },
    troll: { InHuman: "assets/images/inhuman.jpg" },
    sniper: { s1mple: "assets/images/simple.webp", DANK1NG: "assets/images/danking.webp" },
    pp19: { PP19: "assets/images/nzs.webp" },
    all: { ZywOo: "assets/images/zywoo.webp" },
    forsaken: { Forsaken: "assets/images/forsaken.webp" }
};

const types = {
    aggressive: { name: "突破手", Image: typesBelike.aggressive, color: "#f44336", desc: "你是让对手闻风丧胆的突破手！信奉最好的防守就是进攻，宁愿站着死也不跪着生。一往无前的气势正是团队需要的！" },
    steady: { name: "稳健达人", Image: typesBelike.steady, color: "#2196f3", desc: "你是团队的定海神针！深知活着才有输出，每一个走位都经过深思熟虑。在你的守护下，队友们感到无比安心。" },
    team: { name: "团队指挥", Image: typesBelike.team, color: "#9c27b0", desc: "你是团队的粘合剂！始终把团队利益放在第一位，愿意为队友拉枪线、给道具。你的沟通能力让团队配合如臂使指。" },
    lone: { name: "自由人", Image: typesBelike.lone, color: "#ff9800", desc: "你是能独自carry全场的孤胆英雄！有着出色的个人能力，喜欢独自寻找机会。关键时刻总能站出来拯救世界。" },
    tactical: { name: "战术大师", Image: typesBelike.tactical, color: "#00bcd4", desc: "你是团队的战术大脑！对地图理解深刻，道具使用出神入化。你让团队的游戏变得更有层次，打得有条不紊。" },
    troll: { name: "非人类", Image: typesBelike.troll, color: "#795548", desc: "你是让队友又爱又恨的存在！对输赢看得很淡，更注重游戏的快乐。虽然有时候让人血压飙升，但带来的欢乐也是无可替代的。" },
    sniper: { name: "狙神", Image: typesBelike.sniper, color: "#ff5722", desc: "你是团队的狙击手！对地图理解深刻，道具使用出神入化。你让团队的游戏变得更有层次，做得有条不紊。" },
    pp19: { name: "牛战士", Image: typesBelike.pp19, color: "#4caf50", desc: "带头团队冲锋，又能在关键时刻为团队作出贡献，尽管有时候会无脑白给。" },
    all: { name: "六边形战士", Image: typesBelike.all, color: "#4caf50", desc: "你是团队的六边形战士！对地图理解深刻，道具使用出神入化。你让团队的游戏变得更有层次，做得有条不紊。" },
    forsaken: { name: "世一开", Image: typesBelike.forsaken, color: "#ff9800", desc: "没关就不算开，Donk见了也得挨几枪，为科技强国作新贡献。" }
};

const questions = [
    { q: "作为T方的你，手枪局输了，下一局你会选择？", options: [
        { t: "纯eco，为团队下一局考虑", type: "tactical" },
        { t: "起沙鹰，相信自己能翻盘", type: "aggressive" },
        { t: "半甲Tec10，稳扎稳打", type: "steady" },
        { t: "让队友发把枪，一起快乐", type: "troll" }
    ]},
    { q: "作为CT方的你，手枪局赢了，下一局你会选择？", options: [
        { t: "起野牛冲锋，冲就完事", type: "pp19" },
        { t: "起长枪打配合，坚守阵地", type: "steady" },
        { t: "起鸟狙+57，求稳拿信息", type: "sniper" },
        { t: "全甲沙鹰，下把直接起大狙", type: "lone" }
    ]},
    { q: "作为CT，对方rush B点，你是B点唯一防守者，你会？", options: [
        { t: "直接前顶，先秒一个是一个", type: "aggressive" },
        { t: "后撤等队友回防，保存实力", type: "team" },
        { t: "扔烟拖时间，疯狂报点求支援", type: "tactical" },
        { t: "找角度打游击，能杀几个是几个", type: "lone" }
    ]},
    { q: "队友全死了，你面对1v3残局，你会？", options: [
        { t: "冷静分析，寻找逐个击破的机会", type: "steady" },
        { t: "直接拉出去，反正输了也不亏", type: "troll" },
        { t: "保枪，为团队经济考虑", type: "team" },
        { t: "相信自己，这波能操作", type: "lone" }
    ]},
    { q: "队友起大狙经常白给，你会怎么做？", options: [
        { t: "提醒队友别再起狙了", type: "tactical" },
        { t: "让他把狙丢给我，我来carry", type: "sniper" },
        { t: "不管他，他爱咋玩就咋玩", type: "troll" },
        { t: "好好沟通，教他怎么架点", type: "all" }
    ]},
    { q: "进攻方，你更喜欢哪种打法？", options: [
        { t: "默认开局，收集信息再决定", type: "tactical" },
        { t: "直接rush，速度就是一切", type: "aggressive" },
        { t: "执行既定战术，按部就班", type: "team" },
        { t: "单摸找机会，制造多线压力", type: "lone" }
    ]},
    { q: "关于道具使用，你的态度是？", options: [
        { t: "必须买满，道具是战术核心", type: "tactical" },
        { t: "有剩余钱就买，没有就算了", type: "pp19" },
        { t: "给队友发道具，配合团队", type: "team" },
        { t: "烟闪随便扔，快乐最重要", type: "troll" }
    ]},
    { q: "连续输了5局，来到0:5的比分，你时常会？", options: [
        { t: "失去信心，开始摆烂", type: "troll" },
        { t: "冷静调整战术", type: "tactical" },
        { t: "开转开转，调高参数", type: "forsaken" },
        { t: "稳扎稳打，慢慢追分", type: "steady" }
    ]},
    { q: "你的经济管理习惯是？", options: [
        { t: "严格控制，确保每局都有长枪", type: "all" },
        { t: "该花就花，不保留遗憾", type: "aggressive" },
        { t: "根据团队情况灵活调整", type: "team" },
        { t: "有钱就起狙，没钱就沙鹰", type: "sniper" }
    ]},
    { q: "作为突破手，你冲进去发现3个敌人，你会？", options: [
        { t: "能换一个是一个，为队友创造机会", type: "team" },
        { t: "拉枪线硬刚，相信自己能秒完", type: "aggressive" },
        { t: "退回来重新组织进攻", type: "tactical" },
        { t: "找掩体打游击，拖延时间", type: "lone" }
    ]},
    { q: "你如何看待保枪这个行为？", options: [
        { t: "多一杆枪，多一份实力", type: "steady" },
        { t: "不到万不得已不会保", type: "aggressive" },
        { t: "看情况，该保就保", type: "lone" },
        { t: "不保枪，多杀一个是一个", type: "pp19" }
    ]},
    { q: "你的开麦沟通风格是？", options: [
        { t: "详细报点，包括血量、位置、武器", type: "team" },
        { t: "简单明了，只说关键信息", type: "tactical" },
        { t: "可惜兄弟、好枪兄弟", type: "troll" },
        { t: "偶尔开麦，更多靠意识", type: "lone" }
    ]},
    { q: "Nuke三楼看到黄房敌人大狙背身，你只有沙鹰，你会？", options: [
        { t: "瞄准头部，直接颗秒", type: "aggressive" },
        { t: "瞄准身体，降低容错率", type: "steady" },
        { t: "选择不打，多拿点信息", type: "lone" },
        { t: "拖延时间，为队友创造机会", type: "team" }
    ]},
    { q: "遇到对面开挂，你会？", options: [
        { t: "正常打，用实力说话", type: "tactical" },
        { t: "随便打，就当是练枪", type: "steady" },
        { t: "直接躺平，太晦气了", type: "troll" },
        { t: "你先开的，那我也开转", type: "forsaken" }
    ]},
    { q: "你最喜欢的武器组合是？", options: [
        { t: "AK/M4 + 满道具", type: "tactical" },
        { t: "大狙 + 沙鹰", type: "sniper" },
        { t: "野牛/P90，冲就完事", type: "pp19" },
        { t: "内格夫/连喷，快乐就完事", type: "troll" }
    ]},
    { q: "队友犯错了，你的反应是？", options: [
        { t: "压力队友，再乱搞就摆烂", type: "troll" },
        { t: "指出问题，教他正确做法", type: "all" },
        { t: "无所谓，谁都有失误", type: "steady" },
        { t: "默默叹气，自己多打几个", type: "lone" }
    ]},
    { q: "对于游戏输赢，你的态度是？", options: [
        { t: "必须赢，竞技游戏就是要上分", type: "aggressive" },
        { t: "输赢无所谓，量力而行即可", type: "all" },
        { t: "竞技游戏，配合到位即可", type: "team" },
        { t: "快乐第一，输赢随缘", type: "troll" }
    ]},
    { q: "你最想担任的团队位置是？", options: [
        { t: "突破手，第一个进点", type: "aggressive" },
        { t: "狙击手，架点控图", type: "sniper" },
        { t: "指挥，安排战术", type: "team" },
        { t: "自由人，独自游走", type: "lone" }
    ]},
    { q: "残局1v1，你和对手都残血，你会？", options: [
        { t: "主动出击，拼一枪", type: "aggressive" },
        { t: "耐心蹲守，等对手犯错", type: "steady" },
        { t: "静音游走，找时机偷袭", type: "lone" },
        { t: "直接开枪拼运气", type: "pp19" }
    ]},
    { q: "游戏中你最看重的是什么？", options: [
        { t: "战术与配合", type: "all" },
        { t: "个人操作与击杀", type: "aggressive" },
        { t: "团队胜利", type: "team" },
        { t: "游戏快乐", type: "troll" }
    ]},
    { q: "当你起了大狙，你会选择？", options: [
        { t: "架住关键过点", type: "sniper" },
        { t: "主动前顶找机会", type: "aggressive" },
        { t: "和队友同步推进", type: "team" },
        { t: "随便架点，开心就好", type: "troll" }
    ]},
    { q: "队友不说话、不交流，你会？", options: [
        { t: "主动指挥，带动气氛", type: "team" },
        { t: "自己玩自己的", type: "lone" },
        { t: "觉得无所谓", type: "steady" },
        { t: "开始互动整活", type: "troll" }
    ]},
    { q: "你觉得自己的定位更像？", options: [
        { t: "全能选手", type: "all" },
        { t: "专注狙击", type: "sniper" },
        { t: "冲锋突破", type: "pp19" },
        { t: "战术运营", type: "tactical" }
    ]},
    { q: "进攻时，你通常会？", options: [
        { t: "冲在最前面", type: "aggressive" },
        { t: "跟在队友身后补枪", type: "steady" },
        { t: "丢道具辅助队友", type: "team" },
        { t: "走另一条路线单带", type: "lone" }
    ]},
    { q: "如果能选一个技能，你选？", options: [
        { t: "枪枪爆头", type: "aggressive" },
        { t: "透视穿墙", type: "forsaken" },
        { t: "永远不死", type: "troll" },
        { t: "狗运战神", type: "pp19" }
    ]}
];

let answers = new Array(questions.length).fill(null);

function init() {
    document.getElementById('question-total').textContent = questions.length;
    const container = document.getElementById('questions');
    questions.forEach((q, i) => {
        const div = document.createElement('div');
        div.className = 'question';
        div.innerHTML = `
            <div class="question-title">第 ${i + 1} 题</div>
            <div class="question-title">${q.q}</div>
            <div class="options">
                ${q.options.map((opt, j) => `
                    <div class="option" onclick="select(${i}, ${j}, '${opt.type}')">
                        <span class="option-label">${String.fromCharCode(65 + j)}</span>
                        <span class="option-text">${opt.t}</span>
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(div);
    });
}

function select(qIdx, optIdx, type) {
    answers[qIdx] = type;

    const question = document.querySelectorAll('.question')[qIdx];
    question.querySelectorAll('.option').forEach((opt, i) => {
        opt.classList.toggle('selected', i === optIdx);
    });

    updateProgress();
}

function updateProgress() {
    const answered = answers.filter(a => a !== null).length;
    document.getElementById('answered').textContent = answered;
    document.getElementById('progress').style.width = (answered / questions.length * 100) + '%';
    document.getElementById('submit').disabled = answered < questions.length;
}

function showResult() {
    const scores = { aggressive: 0, steady: 0, team: 0, lone: 0, tactical: 0, troll: 0, sniper: 0, pp19: 0, all: 0, forsaken: 0 };
    answers.forEach(type => {
        if (type && type in scores) scores[type] += 1;
    });

    let maxScore = 0;
    let resultType = '';
    for (const [type, score] of Object.entries(scores)) {
        if (score > maxScore) {
            maxScore = score;
            resultType = type;
        }
    }

    const match = Math.round(maxScore / questions.length * 100);
    const t = types[resultType];
    if (!t) return;

    const imageEntries = Object.entries(t.Image);
    const randomEntry = imageEntries[Math.floor(Math.random() * imageEntries.length)];
    const [playerName, imagePath] = randomEntry;

    document.getElementById('result-type').textContent = t.name;
    document.getElementById('result-match').textContent = `匹配度 ${match}% · ${playerName}`;
    document.getElementById('result-image').innerHTML = `<img src="${imagePath}" alt="${t.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 20px;">`;
    document.getElementById('result-desc').textContent = t.desc;

    const dimContainer = document.getElementById('dimensions');
    dimContainer.innerHTML = Object.entries(types).map(([key, info]) => {
        const score = scores[key];
        const pct = maxScore > 0 ? score / maxScore * 100 : 0;
        return `
            <div class="dim-item">
                <div class="dim-header">
                    <span>${info.name}</span>
                    <span>${score}分</span>
                </div>
                <div class="dim-bar">
                    <div class="dim-fill" style="width: 0%; background: ${info.color};" data-width="${pct}%"></div>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('quiz').classList.add('hide');
    document.getElementById('result').classList.add('show');

    setTimeout(() => {
        document.querySelectorAll('.dim-fill').forEach(el => {
            el.style.width = el.dataset.width;
        });
    }, 100);
}

function restart() {
    answers = new Array(questions.length).fill(null);
    document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
    updateProgress();
    document.getElementById('quiz').classList.remove('hide');
    document.getElementById('result').classList.remove('show');
    document.getElementById('result-image').innerHTML = '';
    window.scrollTo(0, 0);
}

document.addEventListener('DOMContentLoaded', init);
