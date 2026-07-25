let secretPassword = "";
let aiGuessesLeft = 5;
let isGameOver = false;
let difficulty = "medium";
let botCount = 8;
let recentHint = "";
let timerInterval = null;
let timeLeft = 30;

// Unique avatars and neon hex codes for the AI bot roster
const botProfiles = [
    { name: "ByteSmasher", color: "#ff3366", avatar: "💥" },
    { name: "GlitchHunter", color: "#00ffcc", avatar: "🛰️" },
    { name: "CipherViper", color: "#33ff33", avatar: "🐍" },
    { name: "MatrixRebel", color: "#ffff33", avatar: "🕶️" },
    { name: "QuantumGhost", color: "#ff9933", avatar: "👻" },
    { name: "ShadowCode", color: "#cc33ff", avatar: "👤" },
    { name: "PixelRazor", color: "#3399ff", avatar: "⚔️" },
    { name: "NetBreaker", color: "#ff33cc", avatar: "⚡" }
];

const vocabulary = [
    "apple", "banana", "secret", "password", "gaming", "matrix", "shadow", "cyber", 
    "hacker", "portal", "wizard", "purple", "neon", "dragon", "castle", "pixels", 
    "player", "server", "glitch", "arcade", "engine", "coding", "vector", "screen",
    "orange", "burger", "cookie", "pizza", "coffee", "cheese", "butter", "pencil", 
    "camera", "guitar", "wallet", "jacket", "island", "planet", "galaxy", "rocket",
    "monkey", "spider", "rabbit", "kitten", "lizard", "falcon", "forest", "jungle", 
    "desert", "canyon", "ocean", "river", "winter", "summer", "autumn", "spring",
    "cipher", "vortex", "system", "crypto", "shield", "bypass", "access", "breach"
];

function startAiGame() {
    const passField = document.getElementById('secret-password');
    secretPassword = passField.value.trim().toLowerCase();
    if(!secretPassword) return alert("Please type a password first!");

    botCount = parseInt(document.getElementById('ai-count').value);
    difficulty = document.getElementById('difficulty').value;

    // Scale guess counts dynamically based on the total number of bots entered
    aiGuessesLeft = 5 + (botCount * 2);
    document.getElementById('guesses-left').innerText = aiGuessesLeft;

    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('game-play').classList.remove('hidden');

    logSystem(`Match Staged: 1v${botCount} (${difficulty.toUpperCase()}). Encryption pool scaled to ${aiGuessesLeft} collective tries!`);
    
    // Inject a visual structural box for the countdown timer if not present
    if(!document.getElementById('timer-display')) {
        const timerEl = document.createElement('h4');
        timerEl.id = "timer-display";
        timerEl.style.textAlign = "center";
        timerEl.style.color = "#ff3366";
        timerEl.style.textShadow = "0 0 5px #ff3366";
        timerEl.innerHTML = "⏳ Firewall T-Minus: <span id='seconds-left'>30</span>s";
        document.getElementById('game-play').insertBefore(timerEl, document.getElementById('chat-box'));
    }
    
    startRoundTimer();
    setTimeout(triggerAiTurn, 1200);
}

function startRoundTimer() {
    clearInterval(timerInterval);
    timeLeft = 30;
    document.getElementById('seconds-left').innerText = timeLeft;
    
    timerInterval = setInterval(() => {
        if(isGameOver) return clearInterval(timerInterval);
        timeLeft--;
        document.getElementById('seconds-left').innerText = timeLeft;
        
        if(timeLeft <= 0) {
            clearInterval(timerInterval);
            logAlert("⏰ TIME EXPIRED! You took too long to send a clue. The bots bypassed your turn!");
            setTimeout(triggerAiTurn, 1000);
        }
    }, 1000);
}

function triggerAiTurn() {
    if(isGameOver) return;

    aiGuessesLeft--;
    document.getElementById('guesses-left').innerText = aiGuessesLeft;

    const botIndex = Math.floor(Math.random() * botCount);
    const activeBot = botProfiles[botIndex];
    let aiGuess = "";

    if (difficulty === "easy") {
        aiGuess = vocabulary[Math.floor(Math.random() * vocabulary.length)];
    } 
    else if (difficulty === "medium") {
        const filtered = vocabulary.filter(w => w.length === secretPassword.length);
        if (filtered.length > 0) {
            aiGuess = filtered[Math.floor(Math.random() * filtered.length)];
        } else {
            aiGuess = vocabulary[Math.floor(Math.random() * vocabulary.length)];
        }
    } 
    else if (difficulty === "hard") {
        let pool = vocabulary.filter(w => w.length === secretPassword.length);
        if (recentHint) {
            let contextualMatches = pool.filter(w => [...recentHint].some(char => w.includes(char)));
            if (contextualMatches.length > 0) pool = contextualMatches;
        }
        if (pool.length > 0) {
            aiGuess = pool[Math.floor(Math.random() * pool.length)];
        } else {
            aiGuess = vocabulary[Math.floor(Math.random() * vocabulary.length)];
        }
    }

    appendBotMessage(activeBot.avatar, activeBot.name, activeBot.color, `Decryption guess structural analysis... "${aiGuess}"`);

    if (aiGuess === secretPassword) {
        logAlert(`❌ BREAKTHROUGH! ${activeBot.avatar} [${activeBot.name}] cracked your security password!`);
        endGame();
    } else if (aiGuessesLeft <= 0) {
        logSystem("🎉 MISSION ACCOMPLISHED! The AI core structures completely depleted their guessing resources!");
        endGame();
    } else {
        logSystem(`[${activeBot.name}] validation failure. Timer reset. Submit an adaptive clue configuration!`);
        startRoundTimer(); // Restart the countdown timer for the player's next move
    }
}

function sendPlayerHint() {
    if(isGameOver) return;
    const input = document.getElementById('chat-input');
    const hintText = input.value.trim().toLowerCase();
    if(!hintText) return;

    clearInterval(timerInterval); // Stop timer while processing turn jumps
    appendMessage("👑", "You (Host)", input.value);
    recentHint = hintText;
    input.value = "";

    logSystem("System: AI cluster nodes are adjusting target algorithms based on that trace...");
    setTimeout(triggerAiTurn, 1500);
}

function appendMessage(avatar, sender, text) {
    const box = document.getElementById('chat-box');
    const div = document.createElement('div');
    div.style.marginBottom = "8px";
    div.innerHTML = `<strong>${avatar} ${sender}:</strong> ${text}`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

function appendBotMessage(avatar, botName, botColor, text) {
    const box = document.getElementById('chat-box');
    const div = document.createElement('div');
    div.style.marginBottom = "8px";
    div.innerHTML = `<span style="color: ${botColor}; text-shadow: 0 0 5px ${botColor};"><strong>${avatar} ${botName}:</strong></span> ${text}`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

function logSystem(text) {
    const box = document.getElementById('chat-box');
    const div = document.createElement('div');
    div.className = "system-msg";
    div.style.marginBottom = "8px";
    div.innerText = `System: ${text}`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

function logAlert(text) {
    const box = document.getElementById('chat-box');
    const div = document.createElement('div');
    div.className = "alert-msg";
    div.style.marginBottom = "8px";
    div.innerText = `System: ${text}`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

function endGame() {
    isGameOver = true;
    clearInterval(timerInterval);
    document.getElementById('action-panel').classList.remove('hidden');
}
