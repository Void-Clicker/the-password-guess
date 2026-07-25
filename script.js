

// Automatically parse room names from the URL (e.g., hi.html?room=123)
// If no room is specified in the URL bar, defaults to room 'lobby'
const urlParams = new URLSearchParams(window.location.search);
const roomID = urlParams.get('room') || 'lobby';
const roomRef = database.ref('rooms/' + roomID);

let myRole = '';
let gameOver = false;

function setRole(role) {
    myRole = role;
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('game-play').classList.remove('hidden');
    
    if (role === 'host') {
        document.getElementById('host-screen').classList.remove('hidden');
    } else {
        document.getElementById('guesser-screen').classList.remove('hidden');
    }
    
    // Connect live database pipes
    listenForRoomUpdates();
}

function lockPassword() {
    const passInput = document.getElementById('secret-password');
    if (!passInput.value) return;
    
    // Clear old data and reset room states globally
    roomRef.child('chat').remove();
    
    roomRef.update({
        password: passInput.value.trim().toLowerCase(),
        guessesLeft: 5,
        status: "active"
    });
    
    document.getElementById('host-status').innerText = "Password locked online!";
    passInput.disabled = true;
    sendSystemNotification(`Host has locked in the secret password for room: ${roomID}!`);
}

function submitGuess() {
    if (gameOver) return;
    const guessInput = document.getElementById('guess-input');
    const guess = guessInput.value.trim().toLowerCase();
    if (!guess) return;

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

    guessInput.value = '';
}

function sendChat() {
    const chatInput = document.getElementById('chat-input');
    if (!chatInput.value) return;
    
    const sender = myRole === 'host' ? 'Host' : 'Guesser';
    sendGlobalMessage(sender, chatInput.value);
    chatInput.value = '';
}

function sendGlobalMessage(sender, text) {
    const msgRef = roomRef.child('chat').push();
    msgRef.set({ sender: sender, text: text, type: "user" });
}

function sendSystemNotification(text) {
    const msgRef = roomRef.child('chat').push();
    msgRef.set({ text: text, type: "system" });
}

function listenForRoomUpdates() {
    // Stop duplicate listener bindings
    roomRef.child('chat').off();
    
    // Stream message streams instantly
    roomRef.child('chat').on('child_added', (snapshot) => {
        const msg = snapshot.val();
        if (msg.type === "system") {
            logSystem(msg.text);
        } else {
            appendMessage(msg.sender, msg.text);
        }
    });

    // Sync live player states
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

function endGame() {
    gameOver = true;
    const guessBtn = document.getElementById('guess-btn');
    const guessInput = document.getElementById('guess-input');
    if (guessBtn) guessBtn.disabled = true;
    if (guessInput) guessInput.disabled = true;
    document.getElementById('action-panel').classList.remove('hidden');
}
