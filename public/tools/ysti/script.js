(function () {
    const data = window.YSTI_DATA;
    if (!data) {
        throw new Error("YSTI_DATA is missing");
    }

    const {
        dimensionMeta,
        dimensionOrder,
        questions,
        TYPE_LIBRARY,
        NORMAL_TYPES,
        DIM_EXPLANATIONS
    } = data;

    const app = {
        answers: {},
        shuffledQuestions: []
    };

    const screens = {
        intro: document.getElementById("intro"),
        test: document.getElementById("test"),
        result: document.getElementById("result")
    };

    const questionList = document.getElementById("questionList");
    const progressBar = document.getElementById("progressBar");
    const progressText = document.getElementById("progressText");
    const submitBtn = document.getElementById("submitBtn");
    const testHint = document.getElementById("testHint");

    function showScreen(name) {
        Object.entries(screens).forEach(([key, element]) => {
            element.classList.toggle("active", key === name);
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function shuffle(list) {
        const next = [...list];
        for (let index = next.length - 1; index > 0; index -= 1) {
            const swapIndex = Math.floor(Math.random() * (index + 1));
            [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
        }
        return next;
    }

    function updateProgress() {
        const total = app.shuffledQuestions.length;
        const done = app.shuffledQuestions.filter((question) => app.answers[question.id] !== undefined).length;
        const percent = total ? (done / total) * 100 : 0;
        const complete = total > 0 && done === total;

        progressBar.style.width = `${percent}%`;
        progressText.textContent = `${done} / ${total}`;
        submitBtn.disabled = !complete;
        testHint.textContent = complete
            ? "准备好查看你的提瓦特风格画像了。"
            : "全部作答才能解锁结果，请认真回答每一题。";
    }

    function renderQuestions() {
        questionList.innerHTML = "";

        app.shuffledQuestions.forEach((question, index) => {
            const card = document.createElement("article");
            card.className = "question";
            card.innerHTML = `
                <div class="question-meta">
                    <div class="badge">第 ${index + 1} 题</div>
                    <div>维度已隐藏</div>
                </div>
                <div class="question-title">${question.text}</div>
                <div class="options">
                    ${question.options.map((option, optionIndex) => {
                        const code = ["A", "B", "C"][optionIndex];
                        const checked = app.answers[question.id] === option.value ? "checked" : "";
                        return `
                            <label class="option">
                                <input type="radio" name="${question.id}" value="${option.value}" ${checked}>
                                <div class="option-code">${code}</div>
                                <div>${option.label}</div>
                            </label>
                        `;
                    }).join("")}
                </div>
            `;
            questionList.appendChild(card);
        });

        questionList.querySelectorAll('input[type="radio"]').forEach((input) => {
            input.addEventListener("change", (event) => {
                const { name, value } = event.target;
                app.answers[name] = Number(value);
                updateProgress();
            });
        });

        updateProgress();
    }

    function scoreToLevel(score) {
        if (score <= 4) {
            return "L";
        }
        if (score <= 6) {
            return "M";
        }
        return "H";
    }

    function levelToNumber(level) {
        return { L: 1, M: 2, H: 3 }[level];
    }

    function parsePattern(pattern) {
        return pattern.split("-");
    }

    function computeResult() {
        const rawScores = {};
        const levels = {};

        dimensionOrder.forEach((dimension) => {
            rawScores[dimension] = 0;
        });

        questions.forEach((question) => {
            rawScores[question.dim] += Number(app.answers[question.id] || 0);
        });

        Object.entries(rawScores).forEach(([dimension, score]) => {
            levels[dimension] = scoreToLevel(score);
        });

        const userVector = dimensionOrder.map((dimension) => levelToNumber(levels[dimension]));
        const ranked = NORMAL_TYPES.map((type) => {
            const vector = parsePattern(type.pattern).map(levelToNumber);
            let distance = 0;
            let exact = 0;

            for (let index = 0; index < vector.length; index += 1) {
                const diff = Math.abs(userVector[index] - vector[index]);
                distance += diff;
                if (diff === 0) {
                    exact += 1;
                }
            }

            const similarity = Math.max(0, Math.round((1 - distance / 20) * 100));
            return {
                ...type,
                ...TYPE_LIBRARY[type.code],
                distance,
                exact,
                similarity
            };
        }).sort((left, right) => {
            if (left.distance !== right.distance) {
                return left.distance - right.distance;
            }
            if (right.exact !== left.exact) {
                return right.exact - left.exact;
            }
            return right.similarity - left.similarity;
        });

        const best = ranked[0];
        if (best.similarity < 50) {
            return {
                rawScores,
                levels,
                finalType: TYPE_LIBRARY.PAIMON,
                modeKicker: "系统兜底结果",
                badge: `标准角色库最高匹配仅 ${best.similarity}%`,
                sub: "你的维度组合比较跳脱，当前结果以趣味展示为主。"
            };
        }

        return {
            rawScores,
            levels,
            finalType: best,
            modeKicker: "你的原神人格",
            badge: `匹配度 ${best.similarity}% · 命中 ${best.exact}/10 维`,
            sub: best.exact >= 7
                ? "高度匹配，这就是提瓦特中的你。"
                : "维度匹配较高，当前结果可作为你的第一人格参考。"
        };
    }

    function renderResult() {
        const result = computeResult();
        const type = result.finalType;

        document.getElementById("resultModeKicker").textContent = result.modeKicker;
        document.getElementById("resultTypeName").textContent = `${type.code}（${type.cn}）`;
        document.getElementById("matchBadge").textContent = result.badge;
        document.getElementById("resultTypeSub").textContent = result.sub;
        document.getElementById("resultDesc").textContent = type.desc;

        const posterImg = document.getElementById("posterImg");
        posterImg.src = type.image || "";
        posterImg.alt = type.cn || type.code;

        document.getElementById("posterElementIcon").textContent = type.icon || "⭐";
        document.getElementById("posterElementName").textContent = `${type.element || "未知"}元素`;
        document.getElementById("posterBox").style.borderColor = type.elementColor || "#e6ac00";

        const dimList = document.getElementById("dimList");
        dimList.innerHTML = dimensionOrder.map((dimension) => {
            const level = result.levels[dimension];
            const explanation = DIM_EXPLANATIONS[dimension][level];
            return `
                <div class="dim-item">
                    <div class="dim-item-top">
                        <div class="dim-item-name">${dimensionMeta[dimension].name}</div>
                        <div class="dim-item-score">${level} / ${result.rawScores[dimension]} 分</div>
                    </div>
                    <p>${explanation}</p>
                </div>
            `;
        }).join("");

        showScreen("result");
    }

    function startTest() {
        app.answers = {};
        app.shuffledQuestions = shuffle(questions);
        renderQuestions();
        showScreen("test");
    }

    document.getElementById("startBtn").addEventListener("click", startTest);
    document.getElementById("backIntroBtn").addEventListener("click", () => showScreen("intro"));
    document.getElementById("submitBtn").addEventListener("click", renderResult);
    document.getElementById("restartBtn").addEventListener("click", startTest);
    document.getElementById("toTopBtn").addEventListener("click", () => showScreen("intro"));
}());
