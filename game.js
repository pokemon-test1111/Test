// Full Pokémon-Style Game with Battles, Items, Types

const TYPES = {
    fire: { weak: ['water', 'rock', 'ground'], strong: ['grass', 'bug', 'ice', 'steel'] },
    water: { weak: ['electric', 'grass'], strong: ['fire', 'ground', 'rock'] },
    grass: { weak: ['fire', 'bug', 'flying', 'ice', 'poison'], strong: ['water', 'ground', 'rock'] },
    electric: { weak: ['ground'], strong: ['water', 'flying'] },
    psychic: { weak: ['bug', 'ghost', 'dark'], strong: ['fighting', 'poison'] },
    normal: { weak: ['fighting'], strong: [] },
    flying: { weak: ['electric', 'rock', 'ice'], strong: ['fighting', 'bug', 'grass'] },
    ground: { weak: ['water', 'grass', 'ice'], strong: ['fire', 'poison', 'rock', 'electric'] },
    rock: { weak: ['water', 'grass', 'fighting', 'ground', 'steel'], strong: ['fire', 'bug', 'flying', 'ice'] },
    bug: { weak: ['fire', 'flying', 'rock'], strong: ['grass', 'psychic', 'dark'] },
    poison: { weak: ['ground', 'psychic'], strong: ['grass', 'bug', 'fairy'] },
    ghost: { weak: ['ghost', 'dark'], strong: ['psychic', 'ghost'] },
    dragon: { weak: ['ice', 'dragon'], strong: ['dragon'] },
    dark: { weak: ['fighting', 'bug', 'fairy'], strong: ['psychic', 'ghost'] },
    steel: { weak: ['fire', 'water', 'ground'], strong: ['ice', 'flying', 'rock', 'fairy'] },
    fairy: { weak: ['poison', 'steel'], strong: ['fighting', 'bug', 'dark'] }
};

// Base Pokémon with stats
const pokemonBase = [
    { id: 1, name: 'Bulbasaur', type: 'grass', hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45, catchRate: 45 },
    { id: 4, name: 'Charmander', type: 'fire', hp: 39, atk: 52, def: 43, spa: 60, spd: 50, spe: 65, catchRate: 45 },
    { id: 7, name: 'Squirtle', type: 'water', hp: 44, atk: 48, def: 65, spa: 50, spd: 64, spe: 43, catchRate: 45 },
    { id: 25, name: 'Pikachu', type: 'electric', hp: 35, atk: 55, def: 40, spa: 50, spd: 50, spe: 90, catchRate: 190 },
    { id: 58, name: 'Growlithe', type: 'fire', hp: 55, atk: 70, def: 43, spa: 70, spd: 54, spe: 60, catchRate: 190 },
    { id: 63, name: 'Abra', type: 'psychic', hp: 25, atk: 20, def: 15, spa: 105, spd: 55, spe: 90, catchRate: 200 },
    { id: 69, name: 'Bellsprout', type: 'grass', hp: 35, atk: 75, def: 35, spa: 70, spd: 30, spe: 40, catchRate: 190 },
    { id: 133, name: 'Eevee', type: 'normal', hp: 55, atk: 55, def: 50, spa: 45, spd: 65, spe: 55, catchRate: 190 },
    { id: 95, name: 'Onix', type: 'rock', hp: 35, atk: 45, def: 160, spa: 30, spd: 45, spe: 70, catchRate: 45 },
    { id: 102, name: 'Exeggcute', type: 'grass', hp: 60, atk: 40, def: 80, spa: 60, spd: 85, spe: 40, catchRate: 190 }
];

const items = {
    pokeball: { name: 'Pokéball', price: 200, type: 'catch', power: 1 },
    greatball: { name: 'Great Ball', price: 600, type: 'catch', power: 1.5 },
    ultraball: { name: 'Ultra Ball', price: 1200, type: 'catch', power: 2 },
    potion: { name: 'Potion', price: 300, type: 'heal', heal: 20 },
    superpotion: { name: 'Super Potion', price: 700, type: 'heal', heal: 50 },
    revive: { name: 'Revive', price: 1500, type: 'heal', heal: 25 },
    antidote: { name: 'Antidote', price: 100, type: 'status', cures: 'poison' }
};

let gameState = {
    playerId: null,
    playerName: 'Trainer',
    team: [],
    items: { pokeball: 5, potion: 2 },
    money: 1000,
    level: 1,
    currentMap: 'world',
    inBattle: false,
    currentBattle: null,
    dex: []
};

let battleState = {
    playerPokemon: null,
    enemyPokemon: null,
    battleLog: [],
    turn: 0,
    playerTurn: true,
    battleType: 'wild' // wild or trainer
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 160;
canvas.height = 144;

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
                items: { pokeball: 5, potion: 2 },
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
        moves: ['Tackle', 'Scratch', 'Ember', 'Water Gun', 'Vine Whip']
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
            gameState.items = data.items || { pokeball: 5, potion: 2 };
            gameState.money = data.money || 1000;
            gameState.level = data.level || 1;
            gameState.dex = data.dex || [];
        }
    } catch (error) {
        console.error('Load error:', error);
    }
    
    if (gameState.team.length === 0) {
        startPokemonSelection();
    } else {
        startExploration();
    }
}

function startPokemonSelection() {
    const starter = pokemonBase[Math.floor(Math.random() * 3)]; // Random starter
    gameState.team.push(createPokemon(starter, 5));
    startExploration();
}

function startExploration() {
    updateUI();
    drawExploration();
    setupExplorationControls();
}

function updateUI() {
    playerNameDisplay.textContent = gameState.playerName;
    pokemonCountDisplay.textContent = gameState.team.length;
    playerLevelDisplay.textContent = gameState.level;
}

function drawExploration() {
    ctx.fillStyle = '#7CB342';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw map
    ctx.fillStyle = '#558B2F';
    ctx.fillRect(40, 40, 80, 64);
    
    // Draw player
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(75, 65, 10, 14);
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(70, 80, 20, 8);
    
    // Draw status
    ctx.fillStyle = '#B4B4B4';
    ctx.fillRect(0, 0, canvas.width, 12);
    ctx.fillStyle = '#000';
    ctx.font = '8px monospace';
    ctx.fillText(gameState.playerName.substring(0, 8), 2, 9);
    ctx.fillText('$' + gameState.money, canvas.width - 30, 9);
    
    // Instructions
    ctx.font = '6px monospace';
    ctx.fillText('A:Battle S:Items', 2, 135);
}

function setupExplorationControls() {
    document.addEventListener('keydown', handleExplorationKey);
    document.getElementById('upBtn').onclick = () => startRandomBattle();
    document.getElementById('downBtn').onclick = () => {};
    document.getElementById('leftBtn').onclick = () => showItems();
    document.getElementById('rightBtn').onclick = () => {};
}

function handleExplorationKey(e) {
    if (!gameScreen.classList.contains('active') || gameState.inBattle) return;
    
    if (e.key === 'a' || e.key === 'A') {
        startRandomBattle();
    } else if (e.key === 's' || e.key === 'S') {
        showItems();
    }
}

function startRandomBattle() {
    if (gameState.team.length === 0) { showError('No Pokémon!'); return; }
    
    const enemyBase = pokemonBase[Math.floor(Math.random() * pokemonBase.length)];
    const enemyLevel = 3 + Math.floor(Math.random() * 4);
    
    gameState.inBattle = true;
    battleState.playerPokemon = gameState.team[0];
    battleState.enemyPokemon = createPokemon(enemyBase, enemyLevel);
    battleState.battleType = 'wild';
    battleState.battleLog = [];
    battleState.turn = 0;
    battleState.playerTurn = true;
    
    drawBattle();
    setupBattleControls();
}

function drawBattle() {
    ctx.fillStyle = '#7CB342';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const player = battleState.playerPokemon;
    const enemy = battleState.enemyPokemon;
    
    // Enemy Pokémon
    ctx.fillStyle = '#FF6B6B';
    ctx.fillRect(100, 20, 40, 30);
    ctx.fillStyle = '#FFF';
    ctx.font = '6px monospace';
    ctx.fillText(enemy.name, 105, 28);
    ctx.fillText('Lv.' + enemy.level, 105, 36);
    
    // Enemy HP bar
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(105, 40, 30, 4);
    ctx.fillStyle = '#00AA00';
    const enemyHpPercent = Math.max(0, enemy.currentHp / enemy.maxHp);
    ctx.fillRect(105, 40, 30 * enemyHpPercent, 4);
    
    // Player Pokémon
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(20, 70, 40, 30);
    ctx.fillStyle = '#FFF';
    ctx.fillText(player.name, 25, 78);
    ctx.fillText('Lv.' + player.level, 25, 86);
    
    // Player HP bar
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(25, 90, 30, 4);
    ctx.fillStyle = '#00AA00';
    const playerHpPercent = Math.max(0, player.currentHp / player.maxHp);
    ctx.fillRect(25, 90, 30 * playerHpPercent, 4);
    ctx.fillStyle = '#FFF';
    ctx.font = '5px monospace';
    ctx.fillText(player.currentHp + '/' + player.maxHp, 25, 100);
    
    // Battle options
    ctx.fillStyle = '#B4B4B4';
    ctx.fillRect(0, 110, canvas.width, 34);
    ctx.fillStyle = '#000';
    ctx.font = '6px monospace';
    ctx.fillText('▲:Attack ▼:Item', 2, 120);
    ctx.fillText('◄:Catch ►:Run', 2, 132);
}

function setupBattleControls() {
    document.getElementById('upBtn').onclick = () => playerAttack();
    document.getElementById('downBtn').onclick = () => useItemInBattle();
    document.getElementById('leftBtn').onclick = () => throwPokeball();
    document.getElementById('rightBtn').onclick = () => runAway();
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
    const baseDamage = attacker.atk - (defender.def / 2);
    const variance = 0.85 + Math.random() * 0.3;
    const typeAdvantage = TYPES[attacker.type].strong.includes(defender.type) ? 1.5 : 1;
    const typeResist = TYPES[defender.type].weak.includes(attacker.type) ? 0.75 : 1;
    
    return Math.max(1, Math.floor((baseDamage * variance * typeAdvantage * typeResist) / 10));
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

function throwPokeball() {
    if (gameState.items.pokeball <= 0) { showError('No Pokéballs!'); return; }
    
    const enemy = battleState.enemyPokemon;
    const catchChance = (enemy.catchRate / (2 * enemy.maxHp)) * (enemy.maxHp / Math.max(1, enemy.currentHp)) * 150;
    const success = Math.random() * 255 < catchChance;
    
    gameState.items.pokeball--;
    
    if (success) {
        gameState.team.push(enemy);
        battleState.battleLog.push(`${enemy.name} was caught!`);
        showError(`Caught ${enemy.name}!`);
        endBattle(true);
    } else {
        battleState.battleLog.push('Ball shook and broke free!');
        battleState.playerTurn = false;
        setTimeout(() => enemyAttack(), 600);
    }
    
    drawBattle();
}

function useItemInBattle() {
    if (gameState.items.potion <= 0) { showError('No Potions!'); return; }
    
    const heal = 20;
    battleState.playerPokemon.currentHp = Math.min(battleState.playerPokemon.maxHp, battleState.playerPokemon.currentHp + heal);
    gameState.items.potion--;
    
    battleState.battleLog.push('Used Potion! +' + heal + ' HP');
    battleState.playerTurn = false;
    setTimeout(() => enemyAttack(), 600);
    
    drawBattle();
}

function runAway() {
    const escape = Math.random() > 0.3;
    if (escape) {
        showError('Got away safely!');
        endBattle(false);
    } else {
        battleState.battleLog.push('Cannot escape!');
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
        showError('Battle Won! +50 Money!');
    } else {
        gameState.money = Math.max(0, gameState.money - 25);
        showError('Battle Lost! -25 Money');
    }
    
    updateUI();
    startExploration();
}

function showItems() {
    let itemsText = 'Items:\n\n';
    itemsText += `Pokéballs: ${gameState.items.pokeball}\n`;
    itemsText += `Potions: ${gameState.items.potion}\n`;
    itemsText += `Money: $${gameState.money}`;
    alert(itemsText);
}

setupAuth();
