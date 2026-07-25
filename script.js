// ==========================================
// 1. GLOBAL STATE VARIABLES & SYSTEM PARAMETERS
// ==========================================
let secretPassword = "";
let aiGuessesLeft = 5;
let isGameOver = false;
let difficulty = "medium";
let botCount = 8;
let recentHint = "";
let timerInterval = null;
let timeLeft = 30;
let currentGameMode = "host"; 

// ==========================================
// 2. UNDERTALE TRACK ROSTER & AUDIO MANAGEMENT
// ==========================================
const playlist = [
    { title: "Megalovania", url: "https://archive.org" },
    { title: "Bonetrousle", url: "https://archive.org" },
    { title: "Spear of Justice", url: "https://archive.org" },
    { title: "Death by Glamour", url: "https://archive.org" }
];
let currentTrackIndex = 0;
let isMuted = false;

// ==========================================
// 3. NEON AI OPPONENT PROFILES & AVATARS
// ==========================================
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

// ==========================================
// 4. DICTIONARY WORD MATRIX
// ==========================================
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

// ==========================================
// 5. SETUP SCREEN COMPONENT UI INTERACTIONS
// ==========================================
function toggleRoleSettings() {
    const mode = document.getElementById('game-mode').value;
    const botGroup = document.getElementById('bot-count-group');
    const passGroup = document.getElementById('password-group');
    
    if (mode === "guesser") {
        botGroup.classList.add('hidden');
        passGroup.classList.add('hidden');
    } else {
        botGroup.classList.remove('hidden');
        passGroup.classList.remove('hidden');
    }
}

function toggleMute() {
    const audio = document.getElementById('bg-music');
    const btn = document.getElementById('mute-btn');
    isMuted = !isMuted;
    audio.muted = isMuted;
    btn.innerText = isMuted ? "🔇" : "🔊";
}

function playNextTrack() {
    const audio = document.getElementById('bg-music');
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    audio.src = playlist[currentTrackIndex].url;
    document.getElementById('track-name').innerText = `🎵 ${playlist[currentTrackIndex].title}`;
    audio.play().catch(e => console.log("Audio waiting for trigger loop..."));
}
// ==========================================
// 6. GAME INITIALIZATION ENGINE
// ==========================================
function startAiGame() {
    currentGameMode = document.getElementById('game-mode').value;
    difficulty = document.getElementById('difficulty').value;
    
    const audio = document.getElementById('bg-music');
    audio.src = playlist[currentTrackIndex].url;
    audio.play().catch(e => console.log("Audio bound to user action context."));

    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('game-play').classList.remove('hidden');

    if(!document.getElementById('timer-display')) {
        const timerEl = document.createElement('h4');
        timerEl.id = "timer-display";
        timerEl.style.textAlign = "center";
        timerEl.style.color = "#ff3366";
        timerEl.style.textShadow = "0 0 5px #ff3366";
        timerEl.innerHTML = "⏳ Session T-Minus: <span id='seconds-left'>30</span>s";
        document.getElementById('game-play').insertBefore(timerEl, document.getElementById('chat-box'));
    }

    if (currentGameMode === "host") {
        const passField = document.getElementById('secret-password');
        secretPassword = passField.value.trim().toLowerCase();
        if(!secretPassword) {
            window.location.reload();
            return alert("Please type a password first!");
        }
        
        botCount = parseInt(document.getElementById('ai-count').value);
        aiGuessesLeft = 5 + (botCount * 2);
        document.getElementById('guesses-left').innerText = aiGuessesLeft;
        
        document.querySelector('#game-play h3').innerHTML = `Total Collective Guesses Left: <span id="guesses-left">${aiGuessesLeft}</span>`;
        document.getElementById('chat-input').placeholder = "Give the bots a text hint...";
        
        logSystem(`Host Matrix Configured. 1v${botCount} Simulation initialized.`);
        startRoundTimer();
        setTimeout(triggerAiTurn, 1200);
    } else {
        botCount = 1;
        aiGuessesLeft = 5;
        document.getElementById('guesses-left').innerText = aiGuessesLeft;
        
        document.querySelector('#game-play h3').innerHTML = `Your Tries Remaining: <span id="guesses-left">${aiGuessesLeft}</span>`;
        document.getElementById('chat-input').placeholder = "Type your password guess here...";
        
        secretPassword = vocabulary[Math.floor(Math.random() * vocabulary.length)];
        const activeBot = botProfiles[0];
        
        appendBotMessage(activeBot.avatar, activeBot.name, activeBot.color, `I have initialized an encrypted mainframe password! It has exactly ${secretPassword.length} characters.`);
        logSystem("Type a guess word in the box below to attempt a security breakthrough!");
        startRoundTimer();
    }
}

// ==========================================
// 7. TIME CONTROLLER LOGIC
// ==========================================
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
            if (currentGameMode === "host") {
                logAlert("⏰ TIME EXPIRED! Bypassing straight to AI calculations.");
                setTimeout(triggerAiTurn, 1000);
            } else {
                logAlert("⏰ TIME EXPIRED! You failed to submit a guess in time. Deducting 1 penalty try!");
                processGuesserTurn("");
            }
        }
    }, 1000);
}

// ==========================================
// 8. BOTS INTERACTION & INTELLIGENCE BRACKETS
// ==========================================
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

    appendBotMessage(activeBot.avatar, activeBot.name, activeBot.color, `Decryption guess analysis... "${aiGuess}"`);

    if (aiGuess === secretPassword) {
        logAlert(`❌ BREAKTHROUGH! ${activeBot.avatar} [${activeBot.name}] cracked your security password!`);
        endGame();
    } else if (aiGuessesLeft <= 0) {
        logSystem("🎉 MISSION ACCOMPLISHED! The AI core structures completely depleted their guessing resources!");
        endGame();
    } else {
        logSystem(`[${activeBot.name}] validation failure. Timer reset. Submit an adaptive clue configuration!`);
        startRoundTimer();
    }
}

// ==========================================
// 9. GUESSER BEHAVIOR LOOP & LOGIC FEEDBACK
// ==========================================
function sendPlayerHint() {
    if(isGameOver) return;
    const input = document.getElementById('chat-input');
    const inputText = input.value.trim().toLowerCase();
    if(!inputText) return;

    clearInterval(timerInterval);

    if (currentGameMode === "host") {
        appendMessage("👑", "You (Host)", input.value);
        recentHint = inputText;
        input.value = "";
        logSystem("System: AI cluster nodes are adjusting target algorithms based on that trace...");
        setTimeout(triggerAiTurn, 1500);
    } else {
        appendMessage("👤", "You (Guesser)", input.value);
        input.value = "";
        processGuesserTurn(inputText);
    }
}

function processGuesserTurn(playerGuess) {
    if(isGameOver) return;

    if(playerGuess !== "") {
        aiGuessesLeft--;
        document.getElementById('guesses-left').innerText = aiGuessesLeft;
    }

    const mainBot = botProfiles[0];

    if (playerGuess === secretPassword) {
        logSystem("🎉 SEAMLESS DECRYPTION COMPLETE! You successfully bypassed the bot mainframe and won!");
        endGame();
    } else if (aiGuessesLeft <= 0) {
        logAlert(`❌ MAINBOARD LOCKOUT! You ran out of tries. The secret password was: "${secretPassword}"`);
        endGame();
    } else {
        let responseHint = "";
        if (difficulty === "easy" || playerGuess === "") {
            responseHint = "Access Denied. Incorrect signature token.";
        } else if (difficulty === "medium") {
            let sharedLetters = [...playerGuess].filter(char => secretPassword.includes(char)).length;
            responseHint = `Access Denied. Your entry contains ${sharedLetters} matching character signatures from my mainframe code.`;
        } else if (difficulty === "hard") {
            let matchesPosition = 0;
            for(let i=0; i<Math.min(playerGuess.length, secretPassword.length); i++) {
                if(playerGuess[i] === secretPassword[i]) matchesPosition++;
            }
            responseHint = `Access Denied. Structural analysis detects exactly ${matchesPosition} characters in the correct alignment slot positions.`;
        }
        
        setTimeout(() => {
            appendBotMessage(mainBot.avatar, mainBot.name, mainBot.color, responseHint);
            logSystem("Mainframe open for sequential injection. Timer reset.");
            startRoundTimer();
        }, 1000);
    }
}

// ==========================================
// 10. RE-USABLE VISUAL APARTMENT LAYOUT PRINTS
// ==========================================
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
