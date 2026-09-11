const questions = [
    "Who would disappear when the bill arrives? 💸",
    "Who would expose the group chat? 📱",
    "Who would sell their friend for $100? 💸",
    "Who would betray the gang for biriyani? 🍛",
    "Who would say 'I'm on the way' while still at home? 😂",
    "Who acts innocent but knows everything? 🤫",
    "Who is secretly the final boss of this friend group? 😈",
    "Who is most suspicious right now? 👀"
];

const punishments = [
    "Do a funny dance for 10 seconds 💃",
    "Tell the worst joke you know 😂",
    "Act like a movie villain for 20 seconds 😈",
    "Make your funniest pose 📸",
    "Act like a snake for 15 seconds 🐍",
    "Let the gang choose your funny nickname 😂"
];

const app = document.getElementById("app");
const state = {
    players: JSON.parse(localStorage.getItem("susmate-players") || "[]"),
    scores: {},
    questionNumber: 0,
    currentPlayerIndex: 0
};

function savePlayers() {
    localStorage.setItem("susmate-players", JSON.stringify(state.players));
}

function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
    }[character]));
}

function renderHome() {
    app.innerHTML = `
        <div class="bg-shape shape1"></div>
        <div class="bg-shape shape2"></div>
        <section class="home-container">
            <div class="top-text">FRIENDS • QUESTIONS • SUS • FUN</div>
            <div class="crown">👑</div>
            <h1 class="logo">SUS<span>MATE</span></h1>
            <p class="tagline">Scan your circle.<br>spot the snake!</p>
            <div class="snake-home">🐍</div>
            <button class="start-game-btn" id="start-game"><span class="btn-icon"></span><span>START THE GAME</span><span class="arrow">→</span></button>
            <div class="game-warning"><div class="warning-line">⚡ NO FRIENDSHIP IS SAFE ⚡</div><h2>WHO IS THE BIGGEST <span>SNAKE</span> IN YOUR GANG?</h2><p>Add your squad. Answer the questions. Expose the SUS one. 🐍</p></div>
        </section>`;
    document.getElementById("start-game").addEventListener("click", renderPlayers);
}

function renderPlayers() {
    const playerMarkup = state.players.map((player) => `
        <div class="player-card"><span>👤 ${escapeHtml(player)}</span><span class="player-status">READY 🔥</span></div>
    `).join("");
    const ready = state.players.length >= 3;
    app.innerHTML = `
        <section class="page-container">
            <button class="back-btn" id="back-home">← BACK</button>
            <div class="mini-logo">SUS<span>MATE</span></div>
            <div class="crown-small">👑</div>
            <h1>WHO'S IN THE GANG?</h1>
            <p class="subtitle">Add your friends and start the madness! 😈</p>
            <form class="add-player-form" id="player-form"><input id="player-name" type="text" placeholder="Enter friend's name..." maxlength="24" required><button class="add-btn" type="submit">+ ADD FRIEND</button></form>
            <h2 class="gang-title">⚡ GANG MEMBERS ⚡</h2>
            <div class="players-list">${playerMarkup}</div>
            ${ready ? '<button class="begin-btn" id="begin-game">🎮 LET THE SUSPICION BEGIN →</button>' : '<p class="need-players">Add at least 3 friends to begin 👀</p>'}
        </section>`;
    document.getElementById("back-home").addEventListener("click", renderHome);
    document.getElementById("player-form").addEventListener("submit", (event) => {
        event.preventDefault();
        const input = document.getElementById("player-name");
        const name = input.value.trim();
        if (name && !state.players.includes(name)) {
            state.players.push(name);
            savePlayers();
            renderPlayers();
        }
    });
    if (ready) document.getElementById("begin-game").addEventListener("click", startGame);
}

function startGame() {
    state.questionNumber = 0;
    state.currentPlayerIndex = 0;
    state.scores = Object.fromEntries(state.players.map((player) => [player, 0]));
    renderGame();
}

function renderGame() {
    if (state.questionNumber >= questions.length) {
        renderReveal();
        return;
    }
    const currentPlayer = state.players[state.currentPlayerIndex];
    const suspects = state.players.filter((player) => player !== currentPlayer);
    app.innerHTML = `
        <section class="game-page">
            <div class="game-top"><div class="mini-logo">SUS<span>MATE</span></div><div class="question-number">QUESTION ${state.questionNumber + 1} OF ${questions.length}</div></div>
            <div class="progress-bar"><div class="progress" style="width: ${((state.questionNumber + 1) / questions.length) * 100}%"></div></div>
            <div class="turn-card"><p class="turn-small">🎤 CURRENT TURN</p><h2>👤 ${escapeHtml(currentPlayer).toUpperCase()}'S TURN</h2><p>Turn ${state.currentPlayerIndex + 1} of ${state.players.length}</p></div>
            <div class="question-card"><div class="question-snake">🐍</div><h1>${questions[state.questionNumber]}</h1><p class="choose-text">WHO DO YOU SUSPECT? 👀</p><p class="self-warning">🚫 You cannot choose yourself!</p></div>
            <div class="suspects">${suspects.map((player) => `<button class="suspect-btn" data-player="${escapeHtml(player)}"><span class="person-icon">👤</span>${escapeHtml(player)}<span class="sus-text">SUS 👀</span></button>`).join("")}</div>
            <p class="friendship-warning">😈 Choose carefully... Your friendship depends on it!</p>
        </section>`;
    document.querySelectorAll(".suspect-btn").forEach((button) => button.addEventListener("click", () => {
        state.scores[button.dataset.player] += 10;
        state.currentPlayerIndex += 1;
        if (state.currentPlayerIndex >= state.players.length) {
            state.currentPlayerIndex = 0;
            state.questionNumber += 1;
        }
        renderGame();
    }));
}

function renderReveal() {
    let count = 3;
    app.innerHTML = `<section class="reveal-body"><div class="reveal-container"><div class="analysis-text">🚨 SUSPICION ANALYSIS COMPLETE 🚨</div><div class="loading-snake">🐍</div><h1>ANALYZING THE GANG...</h1><p id="reveal-message">Checking suspicious behaviour... 👀</p><div id="countdown">${count}</div><p class="reveal-small">The gang has spoken...</p></div></section>`;
    const countdown = document.getElementById("countdown");
    const message = document.getElementById("reveal-message");
    const timer = setInterval(() => {
        if (count > 1) {
            count -= 1;
            countdown.textContent = count;
            message.textContent = count === 2 ? "Scanning suspicious behaviour... 🔍" : "TOO MUCH SUS DETECTED! 🚨";
        } else {
            clearInterval(timer);
            countdown.textContent = "🐍";
            message.textContent = "SNAKE FOUND!!!";
            setTimeout(renderResult, 1500);
        }
    }, 1500);
}

function renderResult() {
    const snake = Object.keys(state.scores).reduce((winner, player) => state.scores[player] > state.scores[winner] ? player : winner);
    const snakeScore = state.scores[snake];
    const snakeLevel = snakeScore <= 20 ? "Slightly Sus 👀" : snakeScore <= 40 ? "Suspicious Behaviour 🤨" : snakeScore <= 60 ? "Snake Behaviour 🐍" : "CERTIFIED SNAKE 😈🐍";
    const scoreMarkup = Object.entries(state.scores).map(([player, score]) => `<div class="score-row"><span>👤 ${escapeHtml(player)}</span><span>${score} SUS</span></div>`).join("");
    app.innerHTML = `<section class="result-container"><div class="result-top">🚨 THE GANG HAS SPOKEN 🚨</div><div class="winner-snake">🐍</div><p class="snake-is">THE SNAKE IS...</p><h1 class="winner-name">${escapeHtml(snake)}</h1><p class="sus-score">${snakeScore} SUS POINTS</p><div class="snake-level">👑 ${snakeLevel}</div><div class="scores-box"><h2>📊 FINAL SCORES</h2>${scoreMarkup}</div><div class="punishment-box"><p>⚠️ PUNISHMENT TIME</p><h2>${punishments[Math.floor(Math.random() * punishments.length)]}</h2><p class="punishment-small">Good luck, Snake! 😂🐍</p></div><div class="result-buttons"><button class="play-again-btn" id="play-again">🔄 PLAY AGAIN</button><button class="new-gang-btn" id="new-gang">👥 NEW GANG</button></div></section>`;
    document.getElementById("play-again").addEventListener("click", startGame);
    document.getElementById("new-gang").addEventListener("click", () => {
        state.players = [];
        savePlayers();
        renderHome();
    });
}

renderHome();
