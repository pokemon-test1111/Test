// Pokémon Gold/Silver Game Boy - Authentic Recreation

let gameState = {
    playerId: null,
    playerName: 'Player',
    pokemonTeam: [],
    level: 5,
    x: 5,
    y: 4,
    moving: false,
    inBattle: false,
    encounters: 0,
    direction: 'down'
};

let gameLoopRunning = false;
let gameInterval = null;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 160;
canvas.height = 144;

// Game Boy Color palette (authentic)
const COLORS = {
    black: '#000000',
    darkGray: '#424242',
    lightGray: '#B4B4B4',
    white: '#FFFFFF',
    darkGreen: '#558B2F',
    mediumGreen: '#7CB342',
    lightGreen: '#9ACE6B',
    darkBlue: '#1976D2',
    mediumBlue: '#2196F3',
    darkBrown: '#663300',
    brown: '#997755',
    red: '#FF0000',
    yellow: '#FFFF00'
};

// Pokémon encounters
const pokemonList = [
    { name: 'Pikachu', level: 5, color: '#FFFF00', symbol: 'P' },
    { name: 'Eevee', level: 5, color: '#996633', symbol: 'E' },
    { name: 'Growlithe', level: 5, color: '#FF9900', symbol: 'G' },
    { name: 'Abra', level: 5, color: '#9966FF', symbol: 'A' },
    { name: 'Bellsprout', level: 5, color: '#00CC33', symbol: 'B' }
];

// Map (40x36 tiles, showing 10x9)
const worldMap = [
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 3, 3, 0, 4, 4, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 1, 1, 0, 0, 2],
    [2, 0, 0, 0, 0, 1, 1, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
];

// Tile types: 0=grass, 1=water, 2=border/tree, 3=building, 4=rock
const TILE_GRASS = 0;
const TILE_WATER = 1;
const TILE_BORDER = 2;
const TILE_BUILDING = 3;
const TILE_ROCK = 4;

// DOM Elements
const authScreen = document.getElementById('authScreen');
const gameScreen = document.getElementById('gameScreen');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signupBtn = document.getElementById('signupBtn');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const playerNameDisplay = document.getElementById('playerName');
const pokemonCountDisplay = document.getElementById('pokemonCount');
const playerLevelDisplay = document.getElementById('playerLevel');

function showError(message) {
    alert(message);
    console.error(message);
}

function waitForFirebase() {
    return new Promise((resolve) => {
        let attempts = 0;
        const check = setInterval(() => {
            if (window.auth && window.db && window.createUserWithEmailAndPassword) {
                clearInterval(check);
                resolve();
            }
            attempts++;
            if (attempts > 50) clearInterval(check);
        }, 100);
    });
}

async function setupAuth() {
    await waitForFirebase();

    signupBtn.addEventListener('click', async () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        if (!email || !password) {
            showError('Enter email and password');
            return;
        }
        if (password.length < 6) {
            showError('Password must be 6+ chars');
            return;
        }

        try {
            signupBtn.disabled = true;
            const userCredential = await window.createUserWithEmailAndPassword(window.auth, email, password);
            const user = userCredential.user;
            gameState.playerId = user.uid;
            gameState.playerName = email.split('@')[0];
            
            await window.addDoc(window.collection(window.db, 'players'), {
                uid: user.uid,
                email: email,
                name: gameState.playerName,
                level: 5,
                pokemonTeam: [],
                createdAt: new Date()
            });
            
            loadGame();
        } catch (error) {
            showError('Sign up failed: ' + error.message);
            signupBtn.disabled = false;
        }
    });

    loginBtn.addEventListener('click', async () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        if (!email || !password) {
            showError('Enter email and password');
            return;
        }

        try {
            loginBtn.disabled = true;
            const userCredential = await window.signInWithEmailAndPassword(window.auth, email, password);
            const user = userCredential.user;
            gameState.playerId = user.uid;
            gameState.playerName = email.split('@')[0];
            loadGame();
        } catch (error) {
            showError('Login failed: ' + error.message);
            loginBtn.disabled = false;
        }
    });

    logoutBtn.addEventListener('click', async () => {
        try {
            stopGame();
            await window.signOut(window.auth);
            authScreen.classList.add('active');
            gameScreen.classList.remove('active');
            emailInput.value = '';
            passwordInput.value = '';
            signupBtn.disabled = false;
            loginBtn.disabled = false;
        } catch (error) {
            showError('Logout failed: ' + error.message);
        }
    });
}

async function loadGame() {
    authScreen.classList.remove('active');
    gameScreen.classList.add('active');
    playerNameDisplay.textContent = gameState.playerName;
    
    try {
        const q = window.query(window.collection(window.db, 'players'), window.where('uid', '==', gameState.playerId));
        const querySnapshot = await window.getDocs(q);
        
        if (!querySnapshot.empty) {
            const playerData = querySnapshot.docs[0].data();
            gameState.level = playerData.level || 5;
            gameState.pokemonTeam = playerData.pokemonTeam || [];
        }
    } catch (error) {
        console.error('Error loading:', error);
    }
    
    updateUI();
    startGame();
}

function updateUI() {
    playerNameDisplay.textContent = gameState.playerName;
    pokemonCountDisplay.textContent = gameState.pokemonTeam.length;
    playerLevelDisplay.textContent = gameState.level;
}

function startGame() {
    stopGame();
    gameLoopRunning = true;
    draw();
    gameInterval = setInterval(() => {
        if (gameLoopRunning) draw();
    }, 1000 / 10); // 10 FPS authentic
}

function stopGame() {
    gameLoopRunning = false;
    if (gameInterval) clearInterval(gameInterval);
}

function draw() {
    try {
        // Game Boy green background
        ctx.fillStyle = COLORS.mediumGreen;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw map
        drawMap();
        
        // Draw player
        drawPlayer();
        
        // Draw status bar at top
        drawStatusBar();
        
    } catch (error) {
        console.error("Draw error:", error);
    }
}

function drawMap() {
    const tileWidth = 16;
    const tileHeight = 16;
    
    for (let ty = 0; ty < worldMap.length; ty++) {
        for (let tx = 0; tx < worldMap[ty].length; tx++) {
            const tile = worldMap[ty][tx];
            const px = tx * tileWidth;
            const py = ty * tileHeight + 8; // Leave room for status bar
            
            drawTile(px, py, tile);
        }
    }
}

function drawTile(x, y, type) {
    const size = 16;
    
    switch(type) {
        case TILE_GRASS:
            // Grass tile
            ctx.fillStyle = COLORS.mediumGreen;
            ctx.fillRect(x, y, size, size);
            // Grass pattern
            ctx.fillStyle = COLORS.darkGreen;
            ctx.fillRect(x + 2, y + 2, 2, 2);
            ctx.fillRect(x + 12, y + 12, 2, 2);
            break;
            
        case TILE_WATER:
            // Water tile
            ctx.fillStyle = COLORS.darkBlue;
            ctx.fillRect(x, y, size, size);
            ctx.fillStyle = COLORS.mediumBlue;
            ctx.fillRect(x + 2, y + 2, 6, 6);
            ctx.fillRect(x + 10, y + 10, 4, 4);
            break;
            
        case TILE_BORDER:
            // Border/tree
            ctx.fillStyle = COLORS.darkBrown;
            ctx.fillRect(x, y, size, size);
            ctx.fillStyle = COLORS.darkGreen;
            ctx.fillRect(x + 3, y + 3, 10, 10);
            break;
            
        case TILE_BUILDING:
            // House
            ctx.fillStyle = COLORS.brown;
            ctx.fillRect(x, y, size, size);
            ctx.fillStyle = COLORS.red;
            ctx.fillRect(x + 2, y + 2, 12, 8);
            ctx.fillStyle = COLORS.yellow;
            ctx.fillRect(x + 4, y + 4, 3, 2);
            ctx.fillRect(x + 9, y + 4, 3, 2);
            break;
            
        case TILE_ROCK:
            // Rock
            ctx.fillStyle = COLORS.darkGray;
            ctx.fillRect(x + 2, y + 2, 12, 12);
            ctx.fillStyle = COLORS.lightGray;
            ctx.fillRect(x + 4, y + 4, 4, 4);
            ctx.fillRect(x + 10, y + 8, 3, 3);
            break;
    }
}

function drawStatusBar() {
    // Status bar at top
    ctx.fillStyle = COLORS.lightGray;
    ctx.fillRect(0, 0, canvas.width, 8);
    
    // Player name
    ctx.fillStyle = COLORS.black;
    ctx.font = 'bold 6px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(gameState.playerName.substring(0, 8), 2, 7);
    
    // Level
    ctx.textAlign = 'right';
    ctx.fillText('Lv.' + gameState.level, canvas.width - 2, 7);
}

function drawPlayer() {
    const px = gameState.x * 16;
    const py = gameState.y * 16 + 8;
    
    // Draw Game Boy style trainer sprite (centered)
    ctx.fillStyle = COLORS.red;
    ctx.fillRect(px + 6, py + 2, 4, 4); // Head
    
    ctx.fillStyle = COLORS.blue;
    ctx.fillRect(px + 5, py + 6, 6, 4); // Body
    
    ctx.fillStyle = COLORS.yellow;
    ctx.fillRect(px + 3, py + 7, 2, 2); // Left arm
    ctx.fillRect(px + 11, py + 7, 2, 2); // Right arm
    
    ctx.fillStyle = COLORS.black;
    ctx.fillRect(px + 5, py + 10, 3, 3); // Left leg
    ctx.fillRect(px + 8, py + 10, 3, 3); // Right leg
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!gameScreen.classList.contains('active') || !gameLoopRunning) return;
    
    const oldX = gameState.x;
    const oldY = gameState.y;
    
    switch(e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
            gameState.y = Math.max(1, gameState.y - 1);
            gameState.direction = 'up';
            e.preventDefault();
            break;
        case 'arrowdown':
        case 's':
            gameState.y = Math.min(8, gameState.y + 1);
            gameState.direction = 'down';
            e.preventDefault();
            break;
        case 'arrowleft':
        case 'a':
            gameState.x = Math.max(1, gameState.x - 1);
            gameState.direction = 'left';
            e.preventDefault();
            break;
        case 'arrowright':
        case 'd':
            gameState.x = Math.min(8, gameState.x + 1);
            gameState.direction = 'right';
            e.preventDefault();
            break;
    }
    
    // Check for random encounter
    if ((gameState.x !== oldX || gameState.y !== oldY) && Math.random() < 0.05) {
        checkEncounter();
    }
});

// Button controls
document.getElementById('upBtn').addEventListener('click', () => {
    if (gameLoopRunning) gameState.y = Math.max(1, gameState.y - 1);
    checkEncounter();
});
document.getElementById('downBtn').addEventListener('click', () => {
    if (gameLoopRunning) gameState.y = Math.min(8, gameState.y + 1);
    checkEncounter();
});
document.getElementById('leftBtn').addEventListener('click', () => {
    if (gameLoopRunning) gameState.x = Math.max(1, gameState.x - 1);
    checkEncounter();
});
document.getElementById('rightBtn').addEventListener('click', () => {
    if (gameLoopRunning) gameState.x = Math.min(8, gameState.x + 1);
    checkEncounter();
});

function checkEncounter() {
    if (!gameState.inBattle && worldMap[gameState.y][gameState.x] === TILE_GRASS) {
        if (Math.random() < 0.1) {
            const pokemon = pokemonList[Math.floor(Math.random() * pokemonList.length)];
            startBattle(pokemon);
        }
    }
}

function startBattle(pokemon) {
    gameState.inBattle = true;
    stopGame();
    
    const message = `A wild ${pokemon.name} appeared!\n\nLv.${pokemon.level}`;
    alert(message);
    
    const caught = Math.random() > 0.4;
    if (caught) {
        alert(`${pokemon.name} was caught!`);
        gameState.pokemonTeam.push(pokemon);
    } else {
        alert(`${pokemon.name} got away!`);
    }
    
    gameState.inBattle = false;
    updateUI();
    startGame();
}

setupAuth();
