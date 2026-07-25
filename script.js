// ==========================================
// 1. FIREBASE CONFIGURATION & INITIALIZATION
// ==========================================

// If config.js is loaded, use its values. Otherwise, initialize in offline safe mode.
if (typeof firebaseConfig !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    window.database = firebase.database();
    console.log("Firebase connected successfully!");
} else {
    window.database = null;
    console.warn("Firebase config not found. Running in local/offline sandbox mode.");
}

// Extract the room ID from the URL path parameters (e.g., hi.html?room=cyber-ghost)
const urlParams = new URLSearchParams(window.location.search);
const roomID = urlParams.get('room') || 'lobby';
const roomRef = window.database ? window.database.ref('rooms/' + roomID) : null;

// ==========================================
// 2. CORE GAME STATE VARIABLES
// ==========================================
let myRole = '';
let targetPassword = '';
let guessesLeft = 5;
let gameOver = false;

// ==========================================
// 3. GAMEPLAY FUNCTIONS & ACTIONS
// ==========================================

function setRole(role) {
    myRole = role;
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('game-play').classList.remove('hidden');
    
    if (role === 'host') {
        document.getElementById('host-screen').classList.remove('hidden');
        logSystem(`You joined as the Host in room: ${roomID}. Set a password!`);
    } else {
        document.getElementById('guesser-screen').classList.remove('hidden');
        logSystem(`You joined as the Guesser in room: ${roomID}. Cracking code with 5 tries!`);
    }
    
    // Begin listening for real-time multiplayer updates across the cloud
    listenForRoomUpdates();
}

function lockPassword() {
    if (gameOver) return;
    const passInput = document.getElementById('secret-password');
    if (!passInput.value) return;
    
    const formattedPassword = passInput.value.trim().toLowerCase();
    
    if (window.database && roomRef) {
        // ONLINE GLOBAL MODE: Sync everything over the internet
        roomRef.child('chat').remove(); // Clear old chats from previous rounds
        roomRef.update({
            password: formattedPassword,
            guessesLeft: 5,
            status: "active"
        });
        sendSystemNotification("Host has locked in the secret password online!");
    } else {
        // OFFLINE BACKUP MODE: Handle mechanics inside this browser tab
        targetPassword = formattedPassword;
        logSystem("Host locked in password locally (Offline Mode)!");
    }
    
    document.getElementById('host-status').innerText = "Password locked in darkness!";
    passInput.disabled = true;
}

function submitGuess() {
    if (gameOver) return;
    const guessInput = document.getElementById('guess-input');
    const guess = guessInput.value.trim().toLowerCase();
    if (!guess) return;

    if (window.database && roomRef) {
        // ONLINE GLOBAL MODE
        sendGlobalMessage("Guesser (Guess)", guess);

        roomRef.once('value', (snapshot) => {
            const data = snapshot.val();
            if (!data) return;

            let currentGuesses = data.guessesLeft - 1;
            
            if (guess === data.password) {
                roomRef.update({ status: "won" });
                sendSystemNotification("🎉 CORRECT! The guesser cracked the password!");
            } else if (currentGuesses <= 0) {
                roomRef.update({ guessesLeft: 0, status: "lost" });
                sendSystemNotification(`❌ GAME OVER! The password was: ${data.password}`);
            } else {
                roomRef.update({ guessesLeft: currentGuesses });
                sendSystemNotification(`Wrong guess! Tries remaining: ${currentGuesses}`);
            }
        });
    } else {
        // OFFLINE BACKUP MODE
        guessesLeft--;
        document.getElementById('guesses-left').innerText = guessesLeft;
        appendMessage("Guesser (Guess)", guess);
        
        if (targetPassword && guess === targetPassword) {
            logSystem("🎉 CORRECT! You cracked it locally!");
            endGame();
        } else if (guessesLeft <= 0) {
            logAlert(`❌ GAME OVER! The password was: ${targetPassword || "[Not set]"}`);
            endGame();
        } else {
            logAlert(`Wrong guess! Tries remaining: ${guessesLeft}`);
        }
    }
    
    guessInput.value = '';
}

function sendChat() {
    const chatInput = document.getElementById('chat-input');
    if (!chatInput.value) return;
    
    const sender = myRole === 'host' ? 'Host' : 'Guesser';
    
    if (window.database && roomRef) {
        // Send to online database room
        sendGlobalMessage(sender, chatInput.value);
    } else {
        // Show directly in local interface
        appendMessage(sender, chatInput.value);
    }
    
    chatInput.value = '';
}

// ==========================================
// 4. DATABASE SYNC & NETWORK EVENT LISTENERS
// ==========================================

function sendGlobalMessage(sender, text) {
    if (!roomRef) return;
    const msgRef = roomRef.child('chat').push();
    msgRef.set({ sender: sender, text: text, type: "user" });
}

function sendSystemNotification(text) {
    if (!roomRef) return;
    const msgRef = roomRef.child('chat').push();
    msgRef.set({ text: text, type: "system" });
}

function listenForRoomUpdates() {
    if (!window.database || !roomRef) return;

    // Remove existing event attachments to stay optimized
    roomRef.child('chat').off();
    
    // Handle real-time incoming chat traffic streams
    roomRef.child('chat').on('child_added', (snapshot) => {
        const msg = snapshot.val();
        if (msg.type === "system") {
            logSystem(msg.text);
        } else {
            appendMessage(msg.sender, msg.text);
        }
    });

    // Listen to changing parameters (match endpoints, score tallies)
    roomRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        if (data.guessesLeft !== undefined) {
            document.getElementById('guesses-left').innerText = data.guessesLeft;
        }
        
        if (data.status === "won" || data.status === "lost") {
            endGame();
        }
    });
}

// ==========================================
// 5. INTERFACE MANIPULATION & LOGS
// ==========================================

function appendMessage(sender, text) {
    const chatBox = document.getElementById('chat-box');
    const msg = document.createElement('div');
    msg.style.marginBottom = '5px';
    msg.innerHTML = `<strong style="color: #df80ff;">${sender}:</strong> ${text}`;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function logSystem(text) {
    const chatBox = document.getElementById('chat-box');
    const msg = document.createElement('div');
    msg.className = 'system-msg';
    msg.style.marginBottom = '5px';
    msg.innerText = `System: ${text}`;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function logAlert(text) {
    const chatBox = document.getElementById('chat-box');
    const msg = document.createElement('div');
    msg.className = 'alert-msg';
    msg.style.marginBottom = '5px';
    msg.innerText = `System: ${text}`;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function endGame() {
    gameOver = true;
    const guessBtn = document.getElementById('guess-btn');
    const guessInput = document.getElementById('guess-input');
    if (guessBtn) guessBtn.disabled = true;
    if (guessInput) guessInput.disabled = true;
    
    // Reveal the reset links/buttons container
    document.getElementById('action-panel').classList.remove('hidden');
}
