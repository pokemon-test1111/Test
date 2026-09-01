// Full Pokémon-Style Game with Nintendo Game Boy Controls & Authentic Battle UI

const TYPES = {
    fire: { weak: ['water', 'rock', 'ground'], strong: ['grass', 'bug', 'ice', 'steel'], color: '#FF6B35' },
    water: { weak: ['electric', 'grass'], strong: ['fire', 'ground', 'rock'], color: '#004E89' },
    grass: { weak: ['fire', 'bug', 'flying', 'ice', 'poison'], strong: ['water', 'ground', 'rock'], color: '#1B4332' },
    electric: { weak: ['ground'], strong: ['water', 'flying'], color: '#FFD60A' },
    psychic: { weak: ['bug', 'ghost', 'dark'], strong: ['fighting', 'poison'], color: '#A61E4D' },
    normal: { weak: ['fighting'], strong: [], color: '#A8A878' },
    flying: { weak: ['electric', 'rock', 'ice'], strong: ['fighting', 'bug', 'grass'], color: '#6F8FBF' },
    ground: { weak: ['water', 'grass', 'ice'], strong: ['fire', 'poison', 'rock', 'electric'], color: '#9D8B5F' },
    rock: { weak: ['water', 'grass', 'fighting', 'ground', 'steel'], strong: ['fire', 'bug', 'flying', 'ice'], color: '#B8860B' },
    bug: { weak: ['fire', 'flying', 'rock'], strong: ['grass', 'psychic', 'dark'], color: '#6B8E23' },
    poison: { weak: ['ground', 'psychic'], strong: ['grass', 'bug', 'fairy'], color: '#8B008B' },
    ghost: { weak: ['ghost', 'dark'], strong: ['psychic', 'ghost'], color: '#483D8B' },
    dragon: { weak: ['ice', 'dragon'], strong: ['dragon'], color: '#4169E1' },
    dark: { weak: ['fighting', 'bug', 'fairy'], strong: ['psychic', 'ghost'], color: '#1C1C1C' },
    steel: { weak: ['fire', 'water', 'ground'], strong: ['ice', 'flying', 'rock', 'fairy'], color: '#808080' },
    fairy: { weak: ['poison', 'steel'], strong: ['fighting', 'bug', 'dark'], color: '#FF69B4' }
};

const pokemonBase = [
    { id: 1, name: 'Bulbasaur', type: 'grass', hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45, catchRate: 45, color: '#78C850' },
    { id: 4, name: 'Charmander', type: 'fire', hp: 39, atk: 52, def: 43, spa: 60, spd: 50, spe: 65, catchRate: 45, color: '#F08030' },
    { id: 7, name: 'Squirtle', type: 'water', hp: 44, atk: 48, def: 65, spa: 50, spd: 64, spe: 43, catchRate: 45, color: '#6890F0' },
    { id: 25, name: 'Pikachu', type: 'electric', hp: 35, atk: 55, def: 40, spa: 50, spd: 50, spe: 90, catchRate: 190, color: '#F8D030' },
    { id: 58, name: 'Growlithe', type: 'fire', hp: 55, atk: 70, def: 43, spa: 70, spd: 54, spe: 60, catchRate: 190, color: '#F57038' },
    { id: 63, name: 'Abra', type: 'psychic', hp: 25, atk: 20, def: 15, spa: 105, spd: 55, spe: 90, catchRate: 200, color: '#A890F0' },
    { id: 69, name: 'Bellsprout', type: 'grass', hp: 35, atk: 75, def: 35, spa: 70, spd: 30, spe: 40, catchRate: 190, color: '#78C850' },
    { id: 133, name: 'Eevee', type: 'normal', hp: 55, atk: 55, def: 50, spa: 45, spd: 65, spe: 55, catchRate: 190, color: '#C8A068' },
    { id: 95, name: 'Onix', type: 'rock', hp: 35, atk: 45, def: 160, spa: 30, spd: 45, spe: 70, catchRate: 45, color: '#B8A038' },
    { id: 102, name: 'Exeggcute', type: 'grass', hp: 60, atk: 40, def: 80, spa: 60, spd: 85, spe: 40, catchRate: 190, color: '#A8B820' }
];

// Sprite image URLs from PokeSprite
const spriteUrls = {
    1: 'https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-icon/pokemon/001.png',
    4: 'https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-icon/pokemon/004.png',
    7: 'https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-icon/pokemon/007.png',
    25: 'https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-icon/pokemon/025.png',
    58: 'https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-icon/pokemon/058.png',
    63: 'https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-icon/pokemon/063.png',
    69: 'https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-icon/pokemon/069.png',
    133: 'https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-icon/pokemon/133.png',
    95: 'https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-icon/pokemon/095.png',
    102: 'https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-icon/pokemon/102.png'
};

const spriteCache = {};

function loadSpriteImage(id) {
    if (!spriteCache[id]) {
        const img = new Image();
        img.src = spriteUrls[id];
        img.crossOrigin = 'anonymous';
        spriteCache[id] = img;
    }
    return spriteCache[id];
}

let gameState = {
    playerId: null,
    playerName: 'Trainer',
    team: [],
    items: { pokeball: 5, greatball: 2, ultraball: 1, potion: 2, superpotion: 1 },
    money: 1000,
    level: 1,
    currentMap: 'world',
    inBattle: false,
    currentBattle: null,
    dex: [],
    gameMode: 'explore',
    menuOpen: false,
    selectedMenuItem: 0
};

let battleState = {
    playerPokemon: null,
    enemyPokemon: null,
    battleLog: [],
    turn: 0,
    playerTurn: true,
    battleType: 'wild'
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 320;
canvas.height = 288;

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

const dpadUp = document.getElementById('dpadUp');
const dpadDown = document.getElementById('dpadDown');
const dpadLeft = document.getElementById('dpadLeft');
const dpadRight = document.getElementById('dpadRight');
const btnA = document.getElementById('btnA');
const btnB = document.getElementById('btnB');
const btnX = document.getElementById('btnX');
const btnY = document.getElementById('btnY');
const selectBtn = document.getElementById('selectBtn');
const startBtn = document.getElementById('startBtn');

function showError(msg) { alert(msg); console.error(msg); }

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
        
        if (!email || !password) { showError('Enter email and password'); return; }
        if (password.length < 6) { showError('Password must be 6+ chars'); return; }

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
                team: [],
                items: { pokeball: 5, greatball: 2, ultraball: 1, potion: 2, superpotion: 1 },
                money: 1000,
                level: 1,
                dex: [],
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
        
        if (!email || !password) { showError('Enter email and password'); return; }

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

function createPokemon(base, level = 5) {
    return {
        id: base.id,
        name: base.name,
        type: base.type,
        level: level,
        currentHp: base.hp,
        maxHp: base.hp,
        atk: base.atk,
        def: base.def,
        spa: base.spa,
        spd: base.spd,
        spe: base.spe,
        catchRate: base.catchRate,
        status: null,
        moves: ['Tackle', 'Scratch', 'Ember', 'Water Gun', 'Vine Whip'],
        color: base.color,
        exp: 0
    };
}

async function loadGame() {
    authScreen.classList.remove('active');
    gameScreen.classList.add('active');
    playerNameDisplay.textContent = gameState.playerName;
    
    try {
        const q = window.query(window.collection(window.db, 'players'), window.where('uid', '==', gameState.playerId));
        const snapshot = await window.getDocs(q);
        
        if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            gameState.team = data.team || [];
            gameState.items = data.items || { pokeball: 5, greatball: 2, ultraball: 1, potion: 2, superpotion: 1 };
            gameState.money = data.money || 1000;
            gameState.level = data.level || 1;
            gameState.dex = data.dex || [];
        }
    } catch (error) {
        console.error('Load error:', error);
    }
    
    pokemonBase.forEach(pok => {
        loadSpriteImage(pok.id);
    });
    
    if (gameState.team.length === 0) {
        startPokemonSelection();
    } else {
        startExploration();
    }
}

function startPokemonSelection() {
    const starter = pokemonBase[Math.floor(Math.random() * 3)];
    gameState.team.push(createPokemon(starter, 5));
    startExploration();
}

function startExploration() {
    gameState.gameMode = 'explore';
    gameState.menuOpen = false;
    updateUI();
    drawExploration();
    setupGameControls();
}

function updateUI() {
    playerNameDisplay.textContent = gameState.playerName;
    pokemonCountDisplay.textContent = gameState.team.length;
    playerLevelDisplay.textContent = gameState.level;
}

function drawExploration() {
    ctx.fillStyle = '#7CB342';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#558B2F';
    for (let i = 0; i < 8; i++) {
        ctx.fillRect(40 + i * 35, 80 + (i % 2) * 30, 30, 50);
    }
    
    drawPlayerSprite(150, 140);
    
    ctx.fillStyle = '#B4B4B4';
    ctx.fillRect(0, 0, canvas.width, 24);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(gameState.playerName.substring(0, 16), 4, 18);
    ctx.fillText('$' + gameState.money, canvas.width - 80, 18);
    
    ctx.fillStyle = '#000';
    ctx.font = '10px monospace';
    ctx.fillText('START: Menu  A: Battle', 4, 270);
}

function drawPlayerSprite(x, y) {
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(x + 6, y, 8, 10);
    
    ctx.fillStyle = '#0066CC';
    ctx.fillRect(x + 4, y + 10, 12, 10);
    
    ctx.fillStyle = '#FFCC99';
    ctx.fillRect(x, y + 10, 4, 6);
    ctx.fillRect(x + 16, y + 10, 4, 6);
    
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 4, y + 20, 4, 8);
    ctx.fillRect(x + 8, y + 20, 4, 8);
}

function setupGameControls() {
    dpadUp.onclick = () => gameState.inBattle ? null : showError('D-Pad Up');
    dpadDown.onclick = () => gameState.inBattle ? null : showError('D-Pad Down');
    dpadLeft.onclick = () => gameState.inBattle ? null : showError('D-Pad Left');
    dpadRight.onclick = () => gameState.inBattle ? null : showError('D-Pad Right');
    
    btnA.onclick = () => handleButtonA();
    btnB.onclick = () => handleButtonB();
    btnX.onclick = () => handleButtonX();
    btnY.onclick = () => handleButtonY();
    
    selectBtn.onclick = () => showItems();
    startBtn.onclick = () => openMainMenu();
    
    document.addEventListener('keydown', handleKeyPress);
}

function handleButtonA() {
    if (gameState.gameMode === 'battle') {
        playerAttack();
    } else if (gameState.gameMode === 'explore') {
        startRandomBattle();
    }
}

function handleButtonB() {
    if (gameState.gameMode === 'battle') {
        runAway();
    } else {
        gameState.menuOpen = false;
    }
}

function handleButtonX() {
    showTeam();
}

function handleButtonY() {
    if (gameState.gameMode === 'battle') {
        useItemInBattle();
    }
}

function handleKeyPress(e) {
    if (!gameScreen.classList.contains('active')) return;
    
    switch(e.key.toLowerCase()) {
        case 'arrowup':
            dpadUp.click();
            break;
        case 'arrowdown':
            dpadDown.click();
            break;
        case 'arrowleft':
            dpadLeft.click();
            break;
        case 'arrowright':
            dpadRight.click();
            break;
        case 'z':
        case 'a':
            btnA.click();
            break;
        case 'x':
            btnB.click();
            break;
        case 's':
            btnX.click();
            break;
        case 'c':
            btnY.click();
            break;
        case 'enter':
            startBtn.click();
            break;
        case ' ':
            selectBtn.click();
            break;
    }
}

function startRandomBattle() {
    if (gameState.team.length === 0) { showError('No Pokémon!'); return; }
    
    const enemyBase = pokemonBase[Math.floor(Math.random() * pokemonBase.length)];
    const enemyLevel = 2 + Math.floor(Math.random() * 5);
    
    gameState.inBattle = true;
    gameState.gameMode = 'battle';
    battleState.playerPokemon = gameState.team[0];
    battleState.enemyPokemon = createPokemon(enemyBase, enemyLevel);
    battleState.battleType = 'wild';
    battleState.battleLog = [];
    battleState.turn = 0;
    battleState.playerTurn = true;
    
    drawBattle();
}

function drawBattle() {
    // Main battle background
    ctx.fillStyle = '#E8E8D0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const player = battleState.playerPokemon;
    const enemy = battleState.enemyPokemon;
    
    // Upper arena area
    ctx.fillStyle = '#A8D8A8';
    ctx.fillRect(0, 0, canvas.width, 160);
    
    // Enemy Pokémon arena - Top Right
    ctx.fillStyle = '#D4C9A8';
    ctx.fillRect(180, 20, 120, 100);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(180, 20, 120, 100);
    
    // Draw enemy sprite
    const enemySprite = spriteCache[enemy.id];
    if (enemySprite && enemySprite.complete) {
        try {
            ctx.drawImage(enemySprite, 200, 35, 80, 80);
        } catch (e) {
            ctx.fillStyle = enemy.color;
            ctx.fillRect(220, 50, 60, 60);
        }
    } else {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(220, 50, 60, 60);
    }
    
    // Enemy info box - Top Left
    ctx.fillStyle = '#F8F8D8';
    ctx.fillRect(10, 20, 160, 60);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 20, 160, 60);
    
    // Enemy name
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(enemy.name.toUpperCase(), 20, 42);
    
    // Enemy level
    ctx.font = '12px monospace';
    ctx.fillText('Lv' + enemy.level, 130, 42);
    
    // Enemy HP bar
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(20, 50, 80, 8);
    ctx.fillStyle = '#00AA00';
    const enemyHpPercent = Math.max(0, enemy.currentHp / enemy.maxHp);
    ctx.fillRect(20, 50, 80 * enemyHpPercent, 8);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 50, 80, 8);
    
    // Player Pokémon - Bottom Left
    ctx.fillStyle = '#D4C9A8';
    ctx.fillRect(20, 170, 120, 100);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 170, 120, 100);
    
    // Draw player sprite
    const playerSprite = spriteCache[player.id];
    if (playerSprite && playerSprite.complete) {
        try {
            ctx.drawImage(playerSprite, 40, 185, 80, 80);
        } catch (e) {
            ctx.fillStyle = player.color;
            ctx.fillRect(60, 205, 60, 60);
        }
    } else {
        ctx.fillStyle = player.color;
        ctx.fillRect(60, 205, 60, 60);
    }
    
    // Player info box - Bottom Right
    ctx.fillStyle = '#F8F8D8';
    ctx.fillRect(150, 170, 160, 100);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(150, 170, 160, 100);
    
    // Player name
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(player.name.toUpperCase(), 160, 192);
    
    // Player level
    ctx.font = '12px monospace';
    ctx.fillText('Lv' + player.level, 270, 192);
    
    // Player HP bar label
    ctx.font = '12px monospace';
    ctx.fillText('HP', 160, 210);
    
    // Player HP bar
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(190, 200, 110, 10);
    ctx.fillStyle = '#00AA00';
    const playerHpPercent = Math.max(0, player.currentHp / player.maxHp);
    ctx.fillRect(190, 200, 110 * playerHpPercent, 10);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(190, 200, 110, 10);
    
    // HP numbers
    ctx.font = '10px monospace';
    ctx.fillStyle = '#000';
    ctx.fillText(player.currentHp + '/' + player.maxHp, 160, 240);
    
    // EXP bar
    ctx.fillStyle = '#6B8FBF';
    ctx.fillRect(190, 245, 110, 8);
    ctx.fillStyle = '#FFD60A';
    ctx.fillRect(190, 245, 110 * 0.5, 8);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(190, 245, 110, 8);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#000';
    ctx.fillText('EXP', 160, 254);
    
    // Battle log box
    ctx.fillStyle = '#336699';
    ctx.fillRect(0, 275, canvas.width, 60);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 275, canvas.width, 60);
    
    // Battle message
    ctx.fillStyle = '#FFF';
    ctx.font = '12px monospace';
    const logMsg = battleState.battleLog.slice(-1)[0] || 'Go!';
    ctx.fillText(logMsg, 10, 305);
    
    // Battle options
    ctx.fillStyle = '#FFD60A';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('A:ATTACK  Y:ITEM  B:RUN', 10, 325);
}

function playerAttack() {
    if (!battleState.playerTurn) return;
    
    const player = battleState.playerPokemon;
    const enemy = battleState.enemyPokemon;
    const damage = calculateDamage(player, enemy);
    
    enemy.currentHp -= damage;
    battleState.battleLog.push(`${player.name} used Tackle! ${damage} damage!`);
    
    if (enemy.currentHp <= 0) {
        endBattle(true);
        return;
    }
    
    battleState.playerTurn = false;
    setTimeout(() => enemyAttack(), 800);
}

function calculateDamage(attacker, defender) {
    const baseDamage = Math.max(1, attacker.atk - (defender.def / 2));
    const variance = 0.85 + Math.random() * 0.3;
    const typeAdvantage = TYPES[attacker.type].strong.includes(defender.type) ? 1.5 : (TYPES[defender.type].weak.includes(attacker.type) ? 0.75 : 1);
    
    return Math.max(1, Math.floor((baseDamage * variance * typeAdvantage) / 10) + 1);
}

function enemyAttack() {
    const player = battleState.playerPokemon;
    const enemy = battleState.enemyPokemon;
    const damage = calculateDamage(enemy, player);
    
    player.currentHp -= damage;
    battleState.battleLog.push(`${enemy.name} used Tackle! ${damage} damage!`);
    
    if (player.currentHp <= 0) {
        endBattle(false);
        return;
    }
    
    battleState.playerTurn = true;
    drawBattle();
}

function useItemInBattle() {
    if (gameState.items.potion <= 0) { showError('No Potions!'); return; }
    
    const heal = 20;
    battleState.playerPokemon.currentHp = Math.min(battleState.playerPokemon.maxHp, battleState.playerPokemon.currentHp + heal);
    gameState.items.potion--;
    
    battleState.battleLog.push(battleState.playerPokemon.name + ' used Potion!');
    battleState.playerTurn = false;
    setTimeout(() => enemyAttack(), 600);
    
    drawBattle();
}

function runAway() {
    const escape = Math.random() > 0.3;
    if (escape) {
        battleState.battleLog.push('Got away safely!');
        showError('Escaped from battle!');
        endBattle(false);
    } else {
        battleState.battleLog.push('Escape failed!');
        battleState.playerTurn = false;
        setTimeout(() => enemyAttack(), 600);
    }
    drawBattle();
}

function endBattle(won) {
    gameState.inBattle = false;
    
    if (won) {
        gameState.money += 50;
        gameState.level++;
        showError('Won Battle! +$50 +1 Level!');
    } else {
        gameState.money = Math.max(0, gameState.money - 25);
        showError('Lost Battle! -$25');
    }
    
    updateUI();
    startExploration();
}

function openMainMenu() {
    gameState.menuOpen = !gameState.menuOpen;
    if (gameState.menuOpen) {
        const menu = `
=== MAIN MENU ===

[SELECT] - Items
[X] - Team
[START] - Menu

A - Battle
B - Back
`;
        showError(menu);
    }
}

function showItems() {
    let itemsText = '=== ITEMS ===\n\n';
    itemsText += `Pokéballs: ${gameState.items.pokeball}\n`;
    itemsText += `Great Balls: ${gameState.items.greatball}\n`;
    itemsText += `Ultra Balls: ${gameState.items.ultraball}\n`;
    itemsText += `Potions: ${gameState.items.potion}\n`;
    itemsText += `Super Potions: ${gameState.items.superpotion}\n\n`;
    itemsText += `Money: $${gameState.money}`;
    alert(itemsText);
}

function showTeam() {
    let teamText = '=== YOUR TEAM ===\n\n';
    if (gameState.team.length === 0) {
        teamText = 'No Pokémon!';
    } else {
        gameState.team.forEach((pok, i) => {
            teamText += `${i + 1}. ${pok.name}\n`;
            teamText += `   Lv.${pok.level} [${pok.type.toUpperCase()}]\n`;
            teamText += `   HP: ${pok.currentHp}/${pok.maxHp}\n\n`;
        });
    }
    alert(teamText);
}

setupAuth();
