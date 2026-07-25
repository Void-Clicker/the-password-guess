let secretPassword = "";
let aiGuessesLeft = 5;
let isGameOver = false;
let difficulty = "medium";
let botCount = 8;
let recentHint = "";

// Distinct names and neon hex codes for up to 8 bots
const botProfiles = [
    { name: "ByteSmasher", color: "#ff3366" }, // Neon Pink
    { name: "GlitchHunter", color: "#00ffcc" }, // Neon Cyan
    { name: "CipherViper", color: "#33ff33" }, // Neon Green
    { name: "MatrixRebel", color: "#ffff33" }, // Neon Yellow
    { name: "QuantumGhost", color: "#ff9933" }, // Neon Orange
    { name: "ShadowCode", color: "#cc33ff" }, // Neon Purple
    { name: "PixelRazor", color: "#3399ff" }, // Neon Light Blue
    { name: "NetBreaker", color: "#ff33cc" }  // Neon Magenta
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

    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('game-play').classList.remove('hidden');

    logSystem(`Match Staged: 1v${botCount} (${difficulty.toUpperCase()} firewall matrix). Computing target analysis...`);
    setTimeout(triggerAiTurn, 1200);
}

function triggerAiTurn() {
    if(isGameOver) return;

    aiGuessesLeft--;
    document.getElementById('guesses-left').innerText = aiGuessesLeft;

    // Pick a random active bot from the allowed count limit
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

    appendBotMessage(activeBot.name, activeBot.color, `Scanning database... decryption guess: "${aiGuess}"`);

    if (aiGuess === secretPassword) {
        logAlert(`❌ BREAKTHROUGH! [${activeBot.name}] cracked your security password!`);
        endGame();
    } else if (aiGuessesLeft <= 0) {
        logSystem("🎉 MISSION ACCOMPLISHED! The AI cluster depleted their guessing cycles!");
        endGame();
    } else {
        logSystem(`[${activeBot.name}] failed encryption validation. Submit a new clue.`);
    }
}

function sendPlayerHint() {
    if(isGameOver) return;
    const input = document.getElementById('chat-input');
    const hintText = input.value.trim().toLowerCase();
    if(!hintText) return;

    appendMessage("👤 You (Host)", input.value);
    recentHint = hintText;
    input.value = "";

    logSystem("AI cluster units are adjusting scanning targets based on that clue...");
    setTimeout(triggerAiTurn, 1500);
}

function appendMessage(sender, text) {
    const box = document.getElementById('chat-box');
    const div = document.createElement('div');
    div.style.marginBottom = "8px";
    div.innerHTML = `<strong style="color: #df80ff;">${sender}:</strong> ${text}`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

function appendBotMessage(botName, botColor, text) {
    const box = document.getElementById('chat-box');
    const div = document.createElement('div');
    div.style.marginBottom = "8px";
    div.innerHTML = `<strong style="color: ${botColor}; text-shadow: 0 0 5px ${botColor};">🤖 ${botName}:</strong> ${text}`;
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
    document.getElementById('action-panel').classList.remove('hidden');
}
