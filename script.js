let secretPassword = "";
let aiGuessesLeft = 5;
let isGameOver = false;
let difficulty = "medium";
let botCount = 8;
let recentHint = "";

// Expanded AI Bot Logic Word Dictionary Bank
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

    // Pick a random bot to attempt the password breakthrough
    const actingBotNum = Math.floor(Math.random() * botCount) + 1;
    let aiGuess = "";

    // Core Decision Paths
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

    appendMessage(`🤖 Bot #${actingBotNum}`, `Scanning database... decryption guess: "${aiGuess}"`);

    if (aiGuess === secretPassword) {
        logAlert(`❌ BREAKTHROUGH! Bot #${actingBotNum} cracked your security password!`);
        endGame();
    } else if (aiGuessesLeft <= 0) {
        logSystem("🎉 MISSION ACCOMPLISHED! The AI bots depleted their guessing energy!");
        endGame();
    } else {
        logSystem(`Bot #${actingBotNum} failed encryption validation. Submit a clue input string.`);
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

    logSystem("AI cluster units are analyzing the new clue structure...");
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
