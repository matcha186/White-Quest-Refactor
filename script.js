var choiceLog = {
    player: '1P: キャラクターを選択してください',
    enemy: '2P: キャラクターを選択してください',
    cpu: 'CPU: キャラクターを選択してください'
}

var battleLog = {
    startNPC: ' が あらわれた！',
    playerFirst: 'あなたは先攻です。',
    cpuFirst: 'CPUが先攻です。',
    leftPlayerFirst: '1Pが先攻です。',
    rightPlayerFirst: '2Pが先攻です。',
    dicePlayer: 'ダイスを回してください。',
    diceEnemy: ' は ダイスを回した！',
    leftTurn: '1Pのターン',
    rightTurn: '2Pのターン',
    kintokiMoreTurnLog: 'きんときの追加ターン！'
}

var charaNumArray = {
    1: 'Nakamu',
    2: 'Broooock',
    3: 'シャークん',
    4: 'きんとき',
    5: 'スマイル',
    6: 'きりやん'
};

const logText = document.getElementById('log-text');
const heroChoice = document.getElementById('hero-choice');
const warriorChoice = document.getElementById('warrior-choice');
const thiefChoice = document.getElementById('thief-choice');
const fighterChoice = document.getElementById('fighter-choice');
const mageChoice = document.getElementById('mage-choice');
const devilChoice = document.getElementById('devil-choice');
const charaChoice = document.getElementsByClassName('choice-button');
const decideButton = document.getElementById('decide-button');
const randomButton = document.getElementById('random-button');
const nakamuChoice = document.getElementsByClassName('nakamu5');

const playerJobText = document.getElementById('player-job');
const playerNameText = document.getElementById('player-name');
const playerHPText = document.getElementById('player-hp');
const playerSPText = document.getElementById('player-sp');
const playerTurnText = document.getElementById('player-turn');

const enemyJobText = document.getElementById('enemy-job');
const enemyNameText = document.getElementById('enemy-name');
const enemyHPText = document.getElementById('enemy-hp');
const enemySPText = document.getElementById('enemy-sp');
const enemyTurnText = document.getElementById('enemy-turn');

const turnCountText = document.getElementById('turn-count');

const playerDiceButton = document.getElementById('player-dice-button');
const enemyDiceButton = document.getElementById('enemy-dice-button');

const playerCard = document.getElementById('player-card');
const enemyCard = document.getElementById('enemy-card');
const playerIcon = document.getElementById('player-icon');
const enemyIcon = document.getElementById('enemy-icon');
const playerDice = document.getElementById('player-dice');
const enemyDice = document.getElementById('enemy-dice');

const charaCard = document.getElementById('choice-card');
const nakamuCharaCard = document.getElementById('nakamu-choice-card');
// const playerDiceSelect = document.getElementById('player-dice-select');
// const enemyDiceSelect = document.getElementById('enemy-dice-select');

const rerollDialog = document.getElementById('reroll-dialog');

let currentChoice = '';
let currentChoicePlayer = 1;
let playerCharaNum = 0;
let firstPlayer = 'player';
let turnCount = 1;
let logEnd = false;
let cancelLog = false;
let isClick = false;
let currentPlayer = '';
let currentDiceNum = 0;

let playerDiceNum = 0;
let enemyDiceNum = 0;

let isTurnEnd = false;

let nakamuLevel = 1;
let isNakamuChoice = false;
let isNakamuSummon = 0;
let nakamuCoins = 3;
let nakamuMP = 3;
let currentGuest = '';
let currentNakamuChoice = '';
let isSharken6 = false;
let kintokiMoreTurn = false;
let isKintoki6 = false;
let isSmile2 = false;
let isSmile6 = false;
let isKiriyan2 = false;
let isKiriyan5 = false;
let isKiriyan6 = false;

let nakamuBeforeDamage = 0;

let logspeed = 20; // 初期75

let playMode = 1;
// playMode = 1 → 2人対戦
// playMode = 2 → CPU対戦

let player = {
    job: '',
    name: '',
    hp: 0,
    spName: '',
    spValue: 0,
    turn: '',
    img: '',
    iconImg: '',
    firstDice: '',
    shieldDamage: 0,
    turnSkip: false,
    playerNum: 1,
    invincible: false,
    marunomi: false
}

let enemy = {
    job: '',
    name: '',
    hp: 0,
    spName: '',
    spValue: 0,
    turn: '',
    img: '',
    iconImg: '',
    firstDice: '',
    shieldDamage: 0,
    turnSkip: false,
    playerNum: 2,
    invincible: false,
    marunomi: false
}

const actions = {
    Broooock: broooockAction,
    シャークん: sharkenAction,
    きんとき: kintokiAction,
    スマイル: smileAction
};

const imageMap = {
    'hero-choice': 'img/cards/Hero.png',
    'warrior-choice': 'img/cards/Warrior.png',
    'thief-choice': 'img/cards/Thief.png',
    'fighter-choice': 'img/cards/Fighter.png',
    'mage-choice': 'img/cards/Mage.png',
    'devil-choice': 'img/cards/Devil.png',
    'broooock': 'img/cards/Warrior.png',
    'sharken': 'img/cards/Thief.png',
    'kintoki': 'img/cards/Fighter.png',
    'smile': 'img/cards/Mage.png',
    'random-button': 'img/cards/Random.png'
};

const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

// playerDiceSelect.addEventListener('change', (event) => { // デバッグ用
//     playerDiceNum = parseInt(event.target.value);
// });

// enemyDiceSelect.addEventListener('change', (event) => { // デバッグ用
//     enemyDiceNum = parseInt(event.target.value);
// });

document.getElementById('log-speed-select').addEventListener('change', (event) => {
    logspeed = parseInt(event.target.value);
});

document.addEventListener('DOMContentLoaded', (event) => {
    decideButton.disabled = true;
    decideButton.classList.add('disabled');
    game();
});

// 画像を事前にロードする関数
function preloadImages(imageUrls) {
    imageUrls.forEach((url) => {
        const img = new Image();
        img.src = url;
    });
}

// 事前にロードする画像のパス
const diceImages = [
    'img/dice/dice1.png',
    'img/dice/dice2.png',
    'img/dice/dice3.png',
    'img/dice/dice4.png',
    'img/dice/dice5.png',
    'img/dice/dice6.png'
];

// ページロード時に画像を事前ロード
window.onload = () => {
    preloadImages(diceImages);
};

let isChoice = false;

function updateCardDisplay(id) {
    if (imageMap[id]) {
        if (id == 'random-button') {
            charaCard.style.imageRendering = 'pixelated';
        } else {
            charaCard.style.imageRendering = '';
        }
        charaCard.src = imageMap[id];
        charaCard.style.display = 'block';
    }
}

function nakamuUpdateCardDisplay(id) {
    if (imageMap[id]) {
        nakamuCharaCard.src = imageMap[id];
        nakamuCharaCard.style.display = 'block';
    }
}

for (let i = 0; i < charaChoice.length; i++) { // キャラ選択画面のボタン

    charaChoice[i].addEventListener('mouseenter', function() {
        if (!isChoice) {
            updateCardDisplay(this.id);
        }
    });

    charaChoice[i].addEventListener('mouseleave', function() {
        if (!isChoice) {
            charaCard.style.display = 'none';
        }
    });

    charaChoice[i].addEventListener('click', function() {
        if (!this.classList.contains('disabled')) {
            decideButton.disabled = false;
            decideButton.classList.remove('disabled');

            randomButton.classList.remove('disabled');
            randomButton.disabled = false;

            for (let j = 0; j < charaChoice.length; j++) {
                if (currentChoicePlayer == 1) { // 1人目選ぶ
                    charaChoice[j].classList.remove('disabled');
                    charaChoice[j].disabled = false;

                } else { // 2人目選ぶ
                    if (playerCharaNum == j + 1) {
                        continue;
                    } else {
                        charaChoice[j].classList.remove('disabled');
                        charaChoice[j].disabled = false;
                    }
                }
            }

            this.classList.add('disabled');
            this.disabled = true;
            isChoice = true;

            currentChoice = this.id;

            updateCardDisplay(this.id);
        }
    });
}

for (let i = 0; i < nakamuChoice.length; i++) {
    nakamuChoice[i].addEventListener('mouseenter', function() {
        if (!isNakamuChoice) {
            nakamuUpdateCardDisplay(this.id);
        }
    });

    nakamuChoice[i].addEventListener('mouseleave', function() {
        if (!isNakamuChoice) {
            nakamuCharaCard.style.display = 'none';
        }
    });

    nakamuChoice[i].addEventListener('click', function() {
        currentNakamuChoice = this.id;
        isNakamuChoice = true;
    });
}

document.getElementById('player-summon-detail').addEventListener('mouseenter', function() {
    switch (currentGuest) {
        case 'Broooock':
            nakamuUpdateCardDisplay('broooock');
            break;
        case 'シャークん':
            nakamuUpdateCardDisplay('sharken');
            break;
        case 'きんとき':
            nakamuUpdateCardDisplay('kintoki');
            break;
        case 'スマイル':
            nakamuUpdateCardDisplay('smile');
            break;
    }
});

document.getElementById('player-summon-detail').addEventListener('mouseleave', function() {
    nakamuCharaCard.style.display = 'none';
});

randomButton.addEventListener('mouseenter', function() {
    if (!isChoice) {
        updateCardDisplay('random-button');
    }
});

randomButton.addEventListener('mouseleave', function() {
    if (currentChoice == '') {
        charaCard.style.display = 'none';
    }
});

async function game() {
    await choice();
    turnCountText.innerHTML = '1ターン目';
    buttonAble(0);
    document.getElementById('choice-display').style.display = 'none';
    if (playMode == 1) {
        await enemyBattle(); // 2人対戦
    } else {
        await npcBattle(); // NPC対戦
    }
}

async function choice() {
    const playerLogPromise = log(choiceLog.player, true);
    player.name = await decideName();
    currentChoicePlayer = 2;
    decideButton.disabled = true;
    decideButton.classList.add('disabled');

    isClick = false;
    
    await playerLogPromise;
    cancelLog = false;

    let enemyLogPromise;
    if (playMode == 1) {
        enemyLogPromise = await log(choiceLog.enemy, true);
    } else {
        enemyLogPromise = await log(choiceLog.cpu, true);
    }
    enemy.name = await decideName();

    randomDecide();
    setChara();
    
    await enemyLogPromise;
    cancelLog = false;
}

async function decideName() {
    let result = null;

    decideButton.removeEventListener('click', handleClick);
    decideButton.addEventListener('click', handleClick);

    function handleClick() {
        cancelLog = true;
        charaCard.style.display = 'none';
        isClick = true;
    }

    while (!isClick) {
        await sleep(1);
    }

    switch (currentChoice) {
        case 'hero-choice':
            result = 'Nakamu';
            playerCharaNum = 1;
            break;
        case 'warrior-choice':
            result = 'Broooock';
            playerCharaNum = 2;
            break;
        case 'thief-choice':
            result = 'シャークん';
            playerCharaNum = 3;
            break;
        case 'fighter-choice':
            result = 'きんとき';
            playerCharaNum = 4;
            break;
        case 'mage-choice':
            result = 'スマイル';
            playerCharaNum = 5;
            break;
        case 'devil-choice':
            result = 'きりやん';
            playerCharaNum = 6;
            break;
        case 'random-button':
            result = 'ランダム';
            break;
    }

    randomButton.classList.remove('disabled');
    randomButton.disabled = false;

    isChoice = false;
    return result;
}

async function npcBattle() {
    await log(enemy.job + enemy.name + battleLog.startNPC);

    if (player.turn == '先攻') {
        await log(battleLog.playerFirst + '/' + battleLog.dicePlayer, true);
    } else {
        await log(battleLog.cpuFirst + '/' + enemy.name + battleLog.diceEnemy, true);
    }
    
    while (player.hp > 0 || enemy.hp > 0) {
        await turnStart();
    }
}

async function enemyBattle() {
    await log(player.job + player.name + ' vs ' + enemy.job + enemy.name + '/' + '戦いの開幕だ！');
    
    while (player.hp > 0 && enemy.hp > 0) {
        playerDiceButton.style.pointerEvents = 'none';
        enemyDiceButton.style.pointerEvents = 'none';
        playerDiceButton.innerText = "回す";
        enemyDiceButton.innerText = "回す";
        await turnStartEnemy();
        displayHPandSP();
    }

    if (player.hp <= 0 && enemy.hp <= 0) {
        await log('2人は同時に倒れた。/勝負は引き分け！');
    } else if (player.hp <= 0) {
        playerIcon.style.opacity = '0.5';
        await log(player.name + 'は力尽きた。');
        await log(enemy.name + 'の勝利！', true);
    } else if (enemy.hp <= 0) {
        enemyIcon.style.opacity = '0.5';
        await log(enemy.name + 'は力尽きた。');
        await log(player.name + 'の勝利！', true);
    }

    document.getElementById('replay-dialog').style.display = 'block';
}

async function turnStartEnemy() {
    isTurnEnd = false;
    console.log(turnCount + 'ターン目開始');
    turnCountText.innerHTML = Math.floor((turnCount + 1) / 2) + 'ターン目';
    // turnCountText.innerHTML = (turnCount + 1) / 2 + 'ターン目';

    let currentActor, otherActor, currentTurn, logMessage;

    if (turnCount === 1) {
        currentActor = (player.turn === '先攻') ? player : enemy;
        otherActor = (player.turn === '先攻') ? enemy : player;
        if (kintokiMoreTurn != true) {
            logMessage = (currentActor === player) ? battleLog.leftPlayerFirst : battleLog.rightPlayerFirst;
        }
    } else {
        if (turnCount % 2 === 1) {
            currentTurn = '先攻';
        } else {
            currentTurn = '後攻';
        }
        currentActor = (player.turn === currentTurn) ? player : enemy;
        otherActor = (player.turn === currentTurn) ? enemy : player;
        logMessage = (currentActor === player) ? battleLog.leftTurn : battleLog.rightTurn;
    }

    if (isSmile2) {
        if (currentActor.name == 'きりやん') {
            if (currentActor.turnSkip == true) {
                await log('きりやんは凍結されており、/さらに眼鏡を落として慌てている！');
            } else {
                await log(currentActor.name + 'は凍結されている！/このターンは行動できない。');
            }
        } else if (currentActor.name == 'Broooock') {
            if (currentActor.turnSkip == true) {
                await log('Broooockは宿屋で爆睡し、/さらに凍結されている！');
            } else {
                await log(currentActor.name + 'は凍結されている！/このターンは行動できない。');
            }
        } else {
            await log(currentActor.name + 'は凍結されている！/このターンは行動できない。');
        }
        otherActor.shieldDamage = 0;
        console.log(turnCount + 'ターン目終了');
        if (kintokiMoreTurn != true) {
            turnCount++;
        }
        isSmile2 = false;
        currentActor.turnSkip = false;
        return;
    }

    if (!currentActor.turnSkip) {
        currentPlayer = currentActor === player ? 'player' : 'enemy';
        buttonAble(currentPlayer === 'player' ? 1 : 2);
        if (kintokiMoreTurn == true) {
            await log(battleLog.kintokiMoreTurnLog + '/' + battleLog.dicePlayer, true);
            kintokiMoreTurn = false;
        } else {
            await log(logMessage + '/' + battleLog.dicePlayer, true);
        }
        if (currentPlayer === 'player') {
            playerDiceButton.style.pointerEvents = 'auto';
        } else {
            enemyDiceButton.style.pointerEvents = 'auto';
        }
        if (isSmile6 && currentActor.name != 'スマイル') { // スマイル振り直し
            currentDiceNum = await rollDice();
            await log('【スマイル】ダイスを振り直させますか？', true);
            const shouldReroll = await promptReroll();
            if (shouldReroll) {
                rerollDialog.style.display = 'none';
                playerDiceButton.innerText = "回す";
                enemyDiceButton.innerText = "回す";
                await log('【' + currentActor.name + '】ダイスを振り直してください', true);
                currentDiceNum = await rollDice();
            } else {
                rerollDialog.style.display = 'none';
            }
            isSmile6 = false;
            isSharken6 = false;
        } else {
            if (isSharken6 && currentActor.name == 'シャークん') { // シャークん振り直し
                currentDiceNum = await rollDice();
                await log('【シャークん】ダイスを振り直しますか？', true);
                const shouldReroll = await promptReroll();
                if (shouldReroll) {
                    playerDiceButton.innerText = "回す";
                    enemyDiceButton.innerText = "回す";
                    rerollDialog.style.display = 'none';
                    await log('ダイスを振り直してください', true);
                    currentDiceNum = await rollDice();
                } else {
                    rerollDialog.style.display = 'none';
                }
                isSharken6 = false;
                isSmile6 = false;
            } else {
                currentDiceNum = await rollDice();
            }
        }
        buttonAble(0);
        if (currentPlayer === 'player') {
            playerDiceButton.style.pointerEvents = 'none';
        } else {
            enemyDiceButton.style.pointerEvents = 'none';
        }
        await charaAction(currentDiceNum, currentActor, otherActor);
    } else {
        await skipBroKiri(currentActor);
    }

    if (isKiriyan2) { // きりやん火傷
        if (currentActor.name != 'きりやん') {
            await log(currentActor.name + 'は火傷による/継続ダメージを受けた！');
            let currentDamage = await filterDamage(10, otherActor);
            if (currentDamage != 0) {
                await damageEffect(currentActor);
                currentActor.hp -= currentDamage;
                displayHPandSP();
                await log(currentActor.name + 'に' + currentDamage + 'ダメージ！');
                kintokiDamage(currentDamage, currentActor);
            }
        }
    }

    otherActor.shieldDamage = 0;

    while (!isTurnEnd) {
        await sleep(1);
    }

    if (otherActor.name == 'Broooock') {
        otherActor.spValue = 0;
    }

    otherActor.invincible = false;
    otherActor.marunomi = false;
    toggleCloudEffect(currentActor);

    console.log(turnCount + 'ターン目終了');
    if (kintokiMoreTurn != true) {
        turnCount++;
    }
}

async function skipBroKiri(actor) {
    const messages = {
        'Broooock': '宿屋でぐっすり寝ている！',
        'きりやん': '眼鏡を探しながら慌てている！',
        'Nakamu': '宿屋でぐっすり寝ている！'
    };
    if (actor.playerNum == 1) {
        await log(battleLog.leftTurn + `/${actor.name}は${messages[actor.name]}`);
    } else {
        await log(battleLog.rightTurn + `/${actor.name}は${messages[actor.name]}`);
    }
    actor.turnSkip = false;
    isTurnEnd = true;
}

async function promptReroll() {
    return new Promise((resolve) => {

        const rerollButton = document.getElementById('reroll-button');
        const noRerollButton = document.getElementById('no-reroll-button');

        rerollDialog.style.display = 'block';

        // 振り直すボタンがクリックされたら
        rerollButton.onclick = () => {
            resolve(true);
        };

        // 振り直さないボタンがクリックされたら
        noRerollButton.onclick = () => {
            resolve(false);
        };
    });
}

async function setChara() {
    
    switch (player.name) {
        case 'Nakamu':
            player.job = '勇者';
            player.hp = 170;
            player.spName = 'レベル: ';
            player.spValue = nakamuLevel;
            player.img = 'img/cards/HeroDetail.png';
            player.iconImg = 'img/cards/HeroIcon.png';
            player.firstDice = 'img/dice/dice1.png';
            break;
        case 'Broooock':
            player.job = '戦士';
            player.hp = 180;
            player.spName = '軽減: ';
            player.spValue = 0;
            player.img = 'img/cards/WarriorDetail.png';
            player.iconImg = 'img/cards/WarriorIcon.png';
            player.firstDice = 'img/dice/dice2.png';
            break;
        case 'シャークん':
            player.job = '盗賊';
            player.hp = 150;
            player.spName = 'お金: ';
            player.spValue = 3;
            player.img = 'img/cards/ThiefDetail.png';
            player.iconImg = 'img/cards/ThiefIcon.png';
            player.firstDice = 'img/dice/dice3.png';
            break;
        case 'きんとき':
            player.job = '武闘家';
            player.hp = 160;
            player.spName = '被ダメ: ';
            player.spValue = 0;
            player.img = 'img/cards/FighterDetail.png';
            player.iconImg = 'img/cards/FighterIcon.png';
            player.firstDice = 'img/dice/dice4.png';
            break;
        case 'スマイル':
            player.job = '賢者';
            player.hp = 140;
            player.spName = '魔力: ';
            player.spValue = 3;
            player.img = 'img/cards/MageDetail.png';
            player.iconImg = 'img/cards/MageIcon.png';
            player.firstDice = 'img/dice/dice5.png';
            break;
        case 'きりやん':
            player.job = '魔王';
            player.hp = 200;
            player.spName = '火炎: ';
            player.spValue = 'OFF';
            player.img = 'img/cards/DevilDetail.png';
            player.iconImg = 'img/cards/DevilIcon.png';
            player.firstDice = 'img/dice/dice6.png';
            break;
    }
    switch (enemy.name) {
        case 'Nakamu':
            enemy.job = '勇者';
            enemy.hp = 170;
            enemy.spName = 'レベル: ';
            enemy.spValue = nakamuLevel;
            enemy.img = 'img/cards/HeroDetail.png';
            enemy.iconImg = 'img/cards/HeroIcon.png';
            enemy.firstDice = 'img/dice/dice1.png';
            break;
        case 'Broooock':
            enemy.job = '戦士';
            enemy.hp = 180;
            enemy.spName = '軽減: ';
            enemy.spValue = 0;
            enemy.img = 'img/cards/WarriorDetail.png';
            enemy.iconImg = 'img/cards/WarriorIcon.png';
            enemy.firstDice = 'img/dice/dice2.png';
            break;
        case 'シャークん':
            enemy.job = '盗賊';
            enemy.hp = 150;
            enemy.hp = 150;
            enemy.spName = 'お金: ';
            enemy.spValue = 3;
            enemy.img = 'img/cards/ThiefDetail.png';
            enemy.iconImg = 'img/cards/ThiefIcon.png';
            enemy.firstDice = 'img/dice/dice3.png';
            break;
        case 'きんとき':
            enemy.job = '武闘家';
            enemy.hp = 160;
            enemy.spName = '被ダメ: ';
            enemy.spValue = 0;
            enemy.img = 'img/cards/FighterDetail.png';
            enemy.iconImg = 'img/cards/FighterIcon.png';
            enemy.firstDice = 'img/dice/dice4.png';
            break;
        case 'スマイル':
            enemy.job = '賢者';
            enemy.hp = 140;
            enemy.spName = '魔力: ';
            enemy.spValue = 3;
            enemy.img = 'img/cards/MageDetail.png';
            enemy.iconImg = 'img/cards/MageIcon.png';
            enemy.firstDice = 'img/dice/dice5.png';
            break;
        case 'きりやん':
            enemy.job = '魔王';
            enemy.hp = 200;
            enemy.spName = '火炎: ';
            enemy.spValue = 'OFF';
            enemy.img = 'img/cards/DevilDetail.png';
            enemy.iconImg = 'img/cards/DevilIcon.png';
            enemy.firstDice = 'img/dice/dice6.png';
            break;
    }

    if (firstPlayer == '') {
        let turnNum = Math.floor(Math.random() * 2) + 1;

        if (turnNum === 1) {
            firstPlayer = 'player';
            player.turn = '先攻';
            enemy.turn = '後攻';
        } else {
            firstPlayer = 'enemy';
            player.turn = '後攻';
            enemy.turn = '先攻';
        }
    } else if (firstPlayer == 'player') {
        firstPlayer = 'player';
        player.turn = '先攻';
        enemy.turn = '後攻';
    } else if (firstPlayer == 'enemy') {
        firstPlayer = 'enemy';
        player.turn = '後攻';
        enemy.turn = '先攻';
    }

    playerJobText.innerHTML = player.job;
    playerNameText.innerHTML = player.name;
    playerHPText.innerHTML = 'HP: ' + player.hp;
    if (player.name == 'Nakamu') {
        playerSPText.innerHTML = player.spName + player.spValue + '(+' + ((nakamuLevel - 1) * 10) + ')';
    } else {
        playerSPText.innerHTML = player.spName + player.spValue;
    }
    enemyJobText.innerHTML = enemy.job;
    enemyNameText.innerHTML = enemy.name;
    enemyHPText.innerHTML = 'HP: ' + enemy.hp;
    if (enemy.name == 'Nakamu') {
        enemySPText.innerHTML = enemy.spName + enemy.spValue + '(+' + ((nakamuLevel - 1) * 10) + ')';
    } else {
        enemySPText.innerHTML = enemy.spName + enemy.spValue;
    }
    playerTurnText.innerHTML = player.turn;
    enemyTurnText.innerHTML = enemy.turn;

    playerCard.src = player.img;
    enemyCard.src = enemy.img;
    playerIcon.src = player.iconImg;
    enemyIcon.src = enemy.iconImg;
    playerDice.src = player.firstDice;
    enemyDice.src = enemy.firstDice;
}

async function log(text, isEndless) {
    let logArray = text.split('');
    let currentLog = '';
    let sleepTime = logspeed;

    logClear();
    
    for (let i = 0; i < logArray.length; i++) {
        if (cancelLog) {
            break;
        }
        currentLog += logArray[i];
        logText.innerHTML = currentLog.replace('/', '</br>');
        await sleep(sleepTime);
    }

    if (!isEndless) {
        await sleep(1000);
        logClear();
    }
}

function logClear() {
    logText.innerHTML = '';
}

function damageEffect(target) {
    const gameContainer = document.getElementById('game-container');
    const targetHPText = (target === player) ? playerHPText : enemyHPText;

    gameContainer.classList.add('shake');
    targetHPText.style.color = 'red';
  
    setTimeout(() => {
        targetHPText.classList.add('damage-fade');
    }, 100);
    
    setTimeout(() => {
        targetHPText.classList.remove('damage-fade');
        targetHPText.style.color = '';
    }, 600);

    gameContainer.addEventListener('animationend', () => {
        gameContainer.classList.remove('shake');
    }, { once: true });
}

function healEffect(actor) {
    const actorHPText = (actor === player) ? playerHPText : enemyHPText;

    actorHPText.style.color = 'rgb(0, 255, 0)';

    setTimeout(() => {
        actorHPText.classList.add('heal-fade');
    }, 100);
    
    setTimeout(() => {
        actorHPText.classList.remove('heal-fade');
        actorHPText.style.color = '';
    }, 600);

}

function decideTurn() {
    turnDecideButton = document.getElementById('turn-decide-button');

    if (firstPlayer == '') {
        turnDecideButton.innerHTML = '1P';
        firstPlayer = 'player';
    } else if (firstPlayer == 'player') {
        if (playMode == 1) {
            turnDecideButton.innerHTML = '2P';
        } else {
            turnDecideButton.innerHTML = 'CPU';
        }
        firstPlayer = 'enemy';
    } else if (firstPlayer == 'enemy') {
        turnDecideButton.innerHTML = '?';
        firstPlayer = '';
    }
}

function randomButtonEnter() {
    const buttons = document.querySelectorAll('.choice-button');

    charaCard.style.imageRendering = 'pixelated';

    isChoice = true;

    charaCard.src = 'img/cards/Random.png';

    decideButton.disabled = false;
    decideButton.classList.remove('disabled');
    
    buttons.forEach(button => {
        for (let j = 0; j < charaChoice.length; j++) {
            if (currentChoicePlayer == 1) { // 1人目選ぶ
                randomButton.classList.add('disabled');
                randomButton.disabled = true;
                charaChoice[j].classList.remove('disabled');
                charaChoice[j].disabled = false;
            } else { // 2人目選ぶ
                if (playerCharaNum == j + 1) {
                    continue;
                } else {
                    randomButton.classList.add('disabled');
                    randomButton.disabled = true;
                    charaChoice[j].classList.remove('disabled');
                    charaChoice[j].disabled = false;
                }
            }
        }
        currentChoice = 'random-button';
    });
}

function randomDecide() {

    const numbers = Object.keys(charaNumArray).map(Number);

    if (player.name == 'ランダム' && enemy.name == 'ランダム') {
        const randomIndex1 = Math.floor(Math.random() * numbers.length);
        let randomIndex2 = Math.floor(Math.random() * numbers.length);

        while (randomIndex1 === randomIndex2) {
            randomIndex2 = Math.floor(Math.random() * numbers.length);
        }

        const randomElement1 = charaNumArray[numbers[randomIndex1]];
        const randomElement2 = charaNumArray[numbers[randomIndex2]];

        player.name = randomElement1;
        enemy.name = randomElement2;
    } else if (player.name == 'ランダム' && enemy.name != 'ランダム') {

        let filteredNumbers = numbers.filter(number => charaNumArray[number] !== enemy.name);
        const randomIndex = Math.floor(Math.random() * filteredNumbers.length);
        player.name = charaNumArray[filteredNumbers[randomIndex]];

    } else if (player.name != 'ランダム' && enemy.name == 'ランダム') {

        let filteredNumbers = numbers.filter(number => charaNumArray[number] !== player.name);
        const randomIndex = Math.floor(Math.random() * filteredNumbers.length);
        enemy.name = charaNumArray[filteredNumbers[randomIndex]];

    }
}

async function rollDice() {
    var isDice = false;
    var isRollStarted = false;
    var diceInterval;
    var previousDiceNumber = null;
    var diceResult;

    var playerDiceImage = document.getElementById('player-dice');
    var enemyDiceImage = document.getElementById('enemy-dice');

    const rollDiceLogic = (diceNum, setImageSrc) => {
        if (diceNum === 0) {
            // Random roll
            let diceNumber;
            do {
                diceNumber = Math.floor(Math.random() * 6) + 1;
            } while (diceNumber === previousDiceNumber);
            setImageSrc(`img/dice/dice${diceNumber}.png`);
            return diceNumber;
        } else {
            // Set to specified number
            setImageSrc(`img/dice/dice${diceNum}.png`);
            return diceNum;
        }
    };

    if (currentPlayer == 'player') {
        playerDiceButton.addEventListener('click', () => {
            if (isRollStarted) {
                clearInterval(diceInterval);
                isRollStarted = false;
                diceResult = previousDiceNumber;
                playerDiceImage.src = `img/dice/dice${diceResult}.png`;
                isDice = true;
            } else {
                diceInterval = setInterval(() => {
                    previousDiceNumber = rollDiceLogic(playerDiceNum, src => playerDiceImage.src = src);
                }, 100);
                isRollStarted = true;
                playerDiceButton.innerText = "止める";
            }
        });
    } else if (currentPlayer == 'enemy') {
        enemyDiceButton.addEventListener('click', () => {
            if (isRollStarted) {
                clearInterval(diceInterval);
                isRollStarted = false;
                diceResult = previousDiceNumber;
                enemyDiceImage.src = `img/dice/dice${diceResult}.png`;
                isDice = true;
            } else {
                diceInterval = setInterval(() => {
                    previousDiceNumber = rollDiceLogic(enemyDiceNum, src => enemyDiceImage.src = src);
                }, 100);
                isRollStarted = true;
                enemyDiceButton.innerText = "止める";
            }
        });
    }

    while (!isDice) {
        await sleep(1);
    }

    isDice = false;

    return diceResult;
}

function buttonAble(num) {
    if (num == 0) {
        playerDiceButton.style.display = 'none';
        enemyDiceButton.style.display = 'none';
    } else if (num == 1) {
        playerDiceButton.style.display = 'block';
        enemyDiceButton.style.display = 'none';
    } else {
        playerDiceButton.style.display = 'none';
        enemyDiceButton.style.display = 'block';
    }
}

function preloadImage(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.src = src;
    });
}

async function charaAction(dice, actor, target) {
    await log("ダイスの出目: " + dice);

    if (isKintoki6) {
        if (dice == 1) {
            await log('1が出たため、きんときの挑発は/意味を成さなかった...');
            isKintoki6 = false;
        } else {
            fadeOutDice(actor).then(() => {
                if (actor.playerNum == 1) {
                    playerDice.src = 'img/dice/dice1.png';
                } else {
                    enemyDice.src = 'img/dice/dice1.png';
                }
                fadeInDice(actor);
            });
    
            await log('しかし、きんときの挑発により/1として扱われる！');
            dice = 1;
            await log("ダイスの出目: " + dice);
            isKintoki6 = false;
        }
    } else {
        if (isKiriyan5) {
            await log('しかし、きりやんが出目を裏返した！');
            dice = 7 - dice;
            await log("ダイスの出目: " + dice);
            isKiriyan5 = false;
        }
    }

    switch (actor.name) {
        case 'Nakamu':
            await nakamuAction(dice, actor, target);
            isTurnEnd = true;
            break;
        case 'Broooock':
            await broooockAction(dice, actor, target);
            isTurnEnd = true;
            break;
        case 'シャークん':
            await sharkenAction(dice, actor, target);
            isTurnEnd = true;
            break;
        case 'きんとき':
            await kintokiAction(dice, actor, target);
            isTurnEnd = true;
            break;
        case 'スマイル':
            await smileAction(dice, actor, target);
            isTurnEnd = true;
            break;
        case 'きりやん':
            await kiriyanAction(dice, actor, target);
            isTurnEnd = true;
            break;
    }
}

async function nakamuAction(dice, actor, target) {
    let addDamage = ((nakamuLevel - 1) * 10);

    switch (dice) {
        case 1: // 素早い剣さばき
            await log(actor.name + 'の素早い剣さばき！');
            let currentDamage = 40 + addDamage;
            let currentDamage1 = await filterDamage(currentDamage, target);
            if (currentDamage1 != 0) {
                await damageEffect(target);
                target.hp -= currentDamage1;
                displayHPandSP();
                await log(target.name + 'に' + currentDamage1 + 'ダメージ！');
                kintokiDamage(currentDamage1, target);
            }
            break;
        case 2: // 光の魔法を発動
            await log(actor.name + 'が光の魔法を発動！' + '/' + 'サイコロの目×10ダメージ！', true);
            if (actor == player) {
                buttonAble(1);
            } else if (actor == enemy) {
                buttonAble(2);
            }
            playerDiceButton.innerText = "回す";
            enemyDiceButton.innerText = "回す";
            playerDiceButton.style.pointerEvents = 'auto';
            enemyDiceButton.style.pointerEvents = 'auto';
            let currentNum = await rollDice();
            let currentDamage2 = (currentNum * 10) + addDamage;
            buttonAble(0);
            playerDiceButton.style.pointerEvents = 'none';
            enemyDiceButton.style.pointerEvents = 'none';
            await log("ダイスの出目: " + currentNum);
            let currentDamage2_1 = await filterDamage(currentDamage2, target);
            if (currentDamage2_1 != 0) {
                await damageEffect(target);
                target.hp -= currentDamage2_1;
                displayHPandSP();
                await log(target.name + 'に' + currentDamage2_1 + 'ダメージ！');
                kintokiDamage(currentDamage2_1, target);
            }
            break;
        case 3: // 盾で防ぎながらの攻撃
            await log(actor.name + 'の盾で防ぎながらの攻撃！');
            let currentDamage3 = 20 + addDamage;
            let currentDamage3_1 = await filterDamage(currentDamage3, target);
            if (currentDamage3_1 != 0) {
                await damageEffect(target);
                target.hp -= currentDamage3_1;
                displayHPandSP();
                await log(target.name + 'に' + currentDamage3_1 + 'ダメージ！/次の相手ターンに受けるダメージを-20した。');
                actor.shieldDamage = 20;
                kintokiDamage(currentDamage3_1, target);
            } else {
                await log(actor.name + 'は次の相手ターンに受ける/ダメージを-20した。');
            }
            break;
        case 4: // 回復魔法で傷を癒す
            await log(actor.name + 'が回復魔法を発動！');
            if (actor.hp == 170) {
                await log('しかし、これ以上回復できない！');
            } else {
                let beforeHP = actor.hp;
                await healEffect(actor);
                actor.hp = Math.min(actor.hp + 40, 170);
                displayHPandSP();
                await log(actor.name + 'のHPが' + beforeHP + 'から' + actor.hp + 'に回復！');
            }
            break;
        case 5: // 仲間と共に友情コンボ
            isNakamuSummon = actor.playerNum;
            await log('Nakamuの仲間と共に友情コンボ！');
            await log('キャラクターを選択してください。', true);
            switch (target.name) {
                case 'Broooock':
                    document.getElementById('broooock').style.display = 'none';
                    break;
                case 'シャークん':
                    document.getElementById('sharken').style.display = 'none';
                    break;
                case 'きんとき':
                    document.getElementById('kintoki').style.display = 'none';
                    break;
                case 'スマイル':
                    document.getElementById('smile').style.display = 'none';
                    break;
            }
            document.getElementById('chara-select-dialog').style.display = 'flex';
            while(!isNakamuChoice) {
                await sleep(1);
            }
            document.getElementById('chara-select-dialog').style.display = 'none';
            isNakamuChoice = false;
            switch (currentNakamuChoice) {
                case 'broooock':
                    await nakamu5Action(1, actor, target);
                    break;
                case 'sharken':
                    await nakamu5Action(2, actor, target);
                    break;
                case 'kintoki':
                    await nakamu5Action(3, actor, target);
                    break;
                case 'smile':
                    await nakamu5Action(4, actor, target);
                    break;
            }
            displayHPandSP();
            isNakamuSummon = 0;
            break;
        case 6: // レベルアップ！
            nakamuLevel++;
            actor.spValue = nakamuLevel;
            await log('レベルアップ！/' + actor.name + 'が与えるダメージが10上昇した。');
            displayHPandSP();
            break;
    }
}

async function broooockAction(dice, actor, target, isNakamu) {
    switch (dice) {
        case 1: // 重みのある斬撃
            await log(actor.name + 'の重みのある斬撃！');
            let currentDamage = await filterDamage(50, target);
            if (currentDamage != 0) {
                await damageEffect(target);
                target.hp -= currentDamage;
                displayHPandSP();
                await log(target.name + 'に' + currentDamage + 'ダメージ！');
                kintokiDamage(currentDamage, target);
            }
            break;
        case 2: // 空振り
            await log(actor.name + 'は空振りした！');
            break;
        case 3: // 巨神斬りの構え
            await log(actor.name + 'の巨神斬りの構え！/サイコロを振り奇数が出れば80ダメージ！', true);
            if (actor == player) {
                buttonAble(1);
            } else if (actor == enemy) {
                buttonAble(2);
            }
            playerDiceButton.style.pointerEvents = 'auto';
            enemyDiceButton.style.pointerEvents = 'auto';
            let currentNum = await rollDice();
            buttonAble(0);
            playerDiceButton.style.pointerEvents = 'none';
            enemyDiceButton.style.pointerEvents = 'none';
            await log("ダイスの出目: " + currentNum);
            if (currentNum % 2 == 0) {
                await log('偶数だったため、何も起こらなかった。');
            } else {
                let currentDamage3 = await filterDamage(80, target);
                if (currentDamage3 != 0) {
                    await damageEffect(target);
                    target.hp -= currentDamage3;
                    displayHPandSP();
                    await log(target.name + 'に' + currentDamage3 + 'ダメージ！');
                    kintokiDamage(currentDamage3, target);
                }
            }
            break;
        case 4: // 防御態勢
            await log(actor.name + 'は防御態勢を取った！/次のターンに受けるダメージを-50した。');
            actor.shieldDamage = 50;
            actor.spValue = -50;
            break;
        case 5: // 捨て身の攻撃
            await log(actor.name + 'の捨て身の攻撃！');
            actor.hp -= 20;
            await damageEffect(actor);
            displayHPandSP();
            await log(actor.name + 'は20ダメージを受けた。');
            currentDamage5 = await filterDamage(70, target);
            if (currentDamage5 != 0) {
                target.hp -= currentDamage5;
                await damageEffect(target);
                displayHPandSP();
                await log(target.name + 'に' + currentDamage5 + 'ダメージ！');
                kintokiDamage(currentDamage5, target);
            }
            break;
        case 6: // 宿屋で睡眠
            if (isNakamu) {
                await log('Nakamuは宿屋で寝た。');
                if (actor.hp == 170) {
                    await log('しかし、これ以上回復できない！/次のターン行動できなくなった。');
                } else {
                    let beforeHP = actor.hp;
                    await healEffect(actor);
                    actor.hp = Math.min(actor.hp + 100, 170);
                    displayHPandSP();
                    await log('NakamuのHPが' + beforeHP + 'から' + actor.hp + 'に回復！/次のターン行動できなくなった。');
                }
            } else {
                await log(actor.name + 'は宿屋で寝た。');
                if (actor.hp == 180) {
                    await log('しかし、これ以上回復できない！');
                } else {
                    let beforeHP = actor.hp;
                    await healEffect(actor);
                    actor.hp = Math.min(actor.hp + 100, 180);
                    displayHPandSP();
                    await log(actor.name + 'のHPが' + beforeHP + 'から' + actor.hp + 'に回復！/次のターン行動できなくなった。');
                }
            }
            actor.turnSkip = true;
            break;
    }
}

async function sharkenAction(dice, actor, target, isNakamu) {
    switch (dice) {
        case 1: // ナイフで敵を切り裂く
            await log(actor.name + 'はナイフで敵を切り裂いた！');
            let currentDamage = await filterDamage(40, target);
            if (currentDamage != 0) {
                await damageEffect(target);
                target.hp -= currentDamage;
                displayHPandSP();
                await log(target.name + 'に' + currentDamage + 'ダメージ！');
                kintokiDamage(currentDamage, target);
            }
            break;
        case 2: // 急所を狙った攻撃
            await log(actor.name + 'の急所を狙った攻撃！');
            let currentDamage2 = await filterDamage(20, target);
            if (currentDamage2 != 0) {
                await damageEffect(target);
                target.hp -= currentDamage2;
                displayHPandSP();
                await log(target.name + 'に' + currentDamage2 + 'ダメージ！');
                kintokiDamage(currentDamage2, target);
            }
            await log('サイコロを振り偶数が出れば40ダメージ！/ダイスを回してください。', true);
            playerDiceButton.innerText = "回す";
            enemyDiceButton.innerText = "回す";
            if (actor == player) {
                buttonAble(1);
            } else if (actor == enemy) {
                buttonAble(2);
            }
            playerDiceButton.style.pointerEvents = 'auto';
            enemyDiceButton.style.pointerEvents = 'auto';
            let currentNum = await rollDice();
            buttonAble(0);
            playerDiceButton.style.pointerEvents = 'none';
            enemyDiceButton.style.pointerEvents = 'none';
            await log("ダイスの出目: " + currentNum);
            if (currentNum % 2 == 1) {
                await log('奇数だったため、何も起こらなかった。');
            } else {
                let currentDamage2_1 = await filterDamage(40, target);
                if (currentDamage2_1 != 0) {
                    await damageEffect(target);
                    target.hp -= currentDamage2_1;
                    displayHPandSP();
                    await log(target.name + 'に' + currentDamage2_1 + 'ダメージ！');
                    kintokiDamage(currentDamage2_1, target);
                }
            }
            break;
        case 3: // すれ違いざまの一撃
            await log(actor.name + 'のすれ違いざまの一撃！');
            let currentDamage3 = await filterDamage(30, target);
            if (currentDamage3 != 0) {
                await damageEffect(target);
                target.hp -= currentDamage3;
                
                displayHPandSP();
                if (isNakamu) {
                    await log(target.name + 'に' + currentDamage3 + 'ダメージ！');
                    await log('シャークんは奪ったお金をNakamuにあげた。/Nakamuのお金が3増えた！');
                    nakamuCoins += 3;
                } else {
                    await log(target.name + 'に' + currentDamage3 + 'ダメージ！/お金が3増えた。');
                    actor.spValue += 3;
                }
                kintokiDamage(currentDamage3, target);
            } else {
                if (isNakamu) {
                    await log('シャークんは奪ったお金をNakamuにあげた。/Nakamuのお金が3増えた！');
                    nakamuCoins += 3;
                } else {
                    await log(actor.name + 'のお金が3増えた。');
                    actor.spValue += 3;
                }
            }
            break;
        case 4: // 雲隠れ
            await log(actor.name + 'の雲隠れ！');
            if (actor.hp == 150) {
                await log('しかし、これ以上回復できない！');
            } else {
                let beforeHP = actor.hp;
                await healEffect(actor);
                actor.hp = Math.min(actor.hp + 20, 150);
                displayHPandSP();
                await log(actor.name + 'のHPが' + beforeHP + 'から' + actor.hp + 'に回復！');
            } 
            await log(actor.name + 'は次のターンに/受けるダメージを0にした！');
            actor.invincible = true;
            toggleCloudEffect(actor);
            break;
        case 5: // 高級な武器を購入
            await log(actor.name + 'は高級な武器を購入し、/それを使って攻撃した！');
            await log('お金×10ダメージ！');
            if (isNakamu) {
                let currentDamage5 = await filterDamage(nakamuCoins * 10, target);
                if (currentDamage5 != 0) {
                    await damageEffect(target);
                    target.hp -= currentDamage5;
                    displayHPandSP();
                    await log(target.name + 'に' + currentDamage5 + 'ダメージ！');
                    kintokiDamage(currentDamage5, target);
                }
            } else {
                let currentDamage5 = await filterDamage(actor.spValue * 10, target);
                if (currentDamage5 != 0) {
                    await damageEffect(target);
                    target.hp -= currentDamage5;
                    displayHPandSP();
                    await log(target.name + 'に' + currentDamage5 + 'ダメージ！');
                    kintokiDamage(currentDamage5, target);
                }
            }
            break;
        case 6: // イカサマ
            await log(actor.name + 'のイカサマ！');
            await log('次に自分が振るサイコロを/一度振り直すことができる！');
            isSharken6 = true;
            break;
    }
}

async function kintokiAction(dice, actor, target, isNakamu) {
    switch (dice) {
        case 1: // 正拳突き
            await log(actor.name + 'の正拳突き！');
            let currentDamage = await filterDamage(50, target);
            if (currentDamage != 0) {
                await damageEffect(target);
                target.hp -= currentDamage;
                displayHPandSP();
                await log(target.name + 'に' + currentDamage + 'ダメージ！');
            }
            break;
        case 2: // マッハパンチ
            await log(actor.name + 'はマッハパンチを繰り出した！');
            let currentDamage2 = await filterDamage(20, target);
            if (currentDamage2 != 0) {
                await damageEffect(target);
                target.hp -= currentDamage2;
                displayHPandSP();
                await log(target.name + 'に' + currentDamage2 + 'ダメージ！');
            }
            if (target.hp > 0) {
                await log(actor.name + 'はもう一度/ターンを行うことができる！');
                kintokiMoreTurn = true;
            }
            break;
        case 3: // カウンター
            await log(actor.name + 'のカウンター！');
            await log('最後に相手から受けた攻撃の/2倍のダメージを与える！');
            if (isNakamu) {
                if (nakamuBeforeDamage == 0) {
                    await log('しかし、Nakamuは/攻撃を与えられていなかった！');
                } else {
                    let currentDamage3 = await filterDamage(nakamuBeforeDamage * 2, target);
                    if (currentDamage3 != 0) {
                        await damageEffect(target);
                        target.hp -= currentDamage3;
                        displayHPandSP();
                        await log(target.name + 'に' + currentDamage3 + 'ダメージ！');
                    }
                }
            } else {
                if (actor.spValue == 0) {
                    await log('しかし、きんときは/攻撃を与えられていなかった！');
                } else {
                    console.log(actor.spValue);
                    let currentDamage3 = await filterDamage(actor.spValue * 2, target);
                    console.log(currentDamage3);
                    if (currentDamage3 != 0) {
                        await damageEffect(target);
                        target.hp -= currentDamage3;
                        displayHPandSP();
                        await log(target.name + 'に' + currentDamage3 + 'ダメージ！');
                    }
                }
            }
            break;
        case 4: // 痛み分け
            await log(actor.name + 'の痛み分け！');
            if(actor.hp < target.hp) {
                let currentDamage4 = target.hp - actor.hp;
                await damageEffect(target);
                target.hp -= currentDamage4;
                displayHPandSP();
                await log(target.name + 'に' + currentDamage4 + 'ダメージ！');
            } else {
                if (actor.hp == target.hp) {
                    await log('HPが同じだったため、/何も起こらなかった。');
                } else {
                    await log('HPが相手より高いため、/何も起こらなかった。');
                }
            }
            break;
        case 5: // 決死の一撃
            await log(actor.name + 'の決死の一撃！');
            if (actor.hp <= 30) {
                let currentDamage5 = await filterDamage(100, target);
            if (currentDamage5 != 0) {
                await damageEffect(target);
                target.hp -= currentDamage5;
                displayHPandSP();
                await log(target.name + 'に' + currentDamage5 + 'ダメージ！');
            }
            } else {
                await log('しかし、何も起こらなかった。');
            }
            break;
        case 6: // 挑発
            await log(actor.name + 'の挑発！');
            await log('次に相手が出す/サイコロの目を1として扱う！');
            isKintoki6 = true;
            break;
    }
}

async function smileAction(dice, actor, target, isNakamu) {
    switch (dice) {
        case 1: // 闇の魔術
            await log(actor.name + 'は闇の魔術を詠唱した！');
            let currentDamage = await filterDamage(50, target);
            if (currentDamage != 0) {
                await damageEffect(target);
                target.hp -= currentDamage;
                displayHPandSP();
                await log(target.name + 'に' + currentDamage + 'ダメージ！');
                kintokiDamage(currentDamage, target);
            }
            break;
        case 2: // 凍てつく大地
            await log(actor.name + 'の凍てつく大地！');
            let currentDamage2 = await filterDamage(40, target);
            if (currentDamage2 != 0) {
                await damageEffect(target);
                target.hp -= currentDamage2;
                displayHPandSP();
                await log(target.name + 'に' + currentDamage2 + 'ダメージ！');
                kintokiDamage(currentDamage2, target);
            }
            await log('サイコロを振り4以上なら/次のターン相手は行動できない！');
            playerDiceButton.innerText = "回す";
            enemyDiceButton.innerText = "回す";
            await log('ダイスを回してください。', true);
            if (actor == player) {
                buttonAble(1);
            } else if (actor == enemy) {
                buttonAble(2);
            }
            playerDiceButton.style.pointerEvents = 'auto';
            enemyDiceButton.style.pointerEvents = 'auto';
            let currentNum = await rollDice();
            buttonAble(0);
            playerDiceButton.style.pointerEvents = 'none';
            enemyDiceButton.style.pointerEvents = 'none';
            await log("ダイスの出目: " + currentNum);
            if (currentNum < 4) {
                await log('4以上ではないため、/何も起こらなかった。');
            } else {
                await log(target.name + 'は次のターン行動できなくなった！');
                isSmile2 = true;
            }
            break;
        case 3: // 生命力吸収
        await log(actor.name + 'はドレイン魔法を放った！');
            let currentDamage3 = await filterDamage(30, target);
            if (currentDamage3 != 0) {
                await damageEffect(target);
                target.hp -= currentDamage3;
                displayHPandSP();
                await log(target.name + 'に' + currentDamage3 + 'ダメージ！');
                kintokiDamage(currentDamage3, target);
            }
            if (actor.hp == 140) {
                await log('スマイルはこれ以上回復できない！');
            } else {
                let beforeHP = actor.hp;
                await healEffect(actor);
                actor.hp = Math.min(actor.hp + 30, 140);
                displayHPandSP();
                await log(actor.name + 'のHPが' + beforeHP + 'から' + actor.hp + 'に回復！');
            }
            break;
        case 4: // 精神統一
            await log(actor.name + 'の精神統一！');
            await log('次のターンに受けるダメージを-20した。/魔力が3増えた。')
            actor.shieldDamage = 20;
            if (isNakamu) {
                nakamuMP += 3;
            } else {
                actor.spValue += 3;
            }
            break;
        case 5: // 魔力の奔流
            await log(actor.name + 'は自身の魔力を集め始めた！');
            if (actor.spValue == 0) {
                await log('しかし、スマイルの魔力は空っぽだった！');
            } else {
                await log('魔力×20のダメージ！');
                if (isNakamu) {
                    let currentDamage5 = await filterDamage(nakamuMP * 20, target);
                    if (currentDamage5 != 0) {
                        await damageEffect(target);
                        target.hp -= currentDamage5;
                        displayHPandSP();
                        await log(target.name + 'に' + currentDamage5 + 'ダメージ！');
                        kintokiDamage(currentDamage5, target);
                        await log('スマイルの魔力が0になった。');
                    }
                    nakamuMP = 0;
                } else {
                    let currentDamage5 = await filterDamage(actor.spValue * 20, target);
                    if (currentDamage5 != 0) {
                        await damageEffect(target);
                        target.hp -= currentDamage5;
                        displayHPandSP();
                        await log(target.name + 'に' + currentDamage5 + 'ダメージ！');
                        kintokiDamage(currentDamage5, target);
                        await log('スマイルの魔力が0になった。');
                    }
                    actor.spValue = 0;
                }
            }
            break;
        case 6: // 時の呪文を詠唱
            await log(actor.name + 'は時の呪文を詠唱した！');
            await log('次に相手が振るサイコロを/一度振り直させることができる！');
            isSmile6 = true;
            break;
    }
}

async function kiriyanAction(dice, actor, target) {
    switch (dice) {
        case 1: // 鋭い爪で薙ぎ払う
            await log(actor.name + 'は鋭い爪で薙ぎ払った！');
            let currentDamage = await filterDamage(60, target);
            if (currentDamage != 0) {
                await damageEffect(target);
                target.hp -= currentDamage;
                displayHPandSP();
                await log(target.name + 'に' + currentDamage + 'ダメージ！');
                kintokiDamage(currentDamage, target);
            }
            break;
        case 2: // 火炎ブレス
            await log(actor.name + 'は激しい炎を吐き出した！');
            let currentDamage2 = await filterDamage(30, target);
            if (currentDamage2 != 0) {
                await damageEffect(target);
                target.hp -= currentDamage2;
                displayHPandSP();
                await log(target.name + 'に' + currentDamage2 + 'ダメージ！');
                kintokiDamage(currentDamage2, target);
            }
            if (isKiriyan2) {
                await log(target.name + 'はすでに火傷を負っている！');
            } else {
                actor.spValue = '<span style="color: red;"> ON </span>';
                await log(target.name + 'は火傷を負った。');
                isKiriyan2 = true;
            }
            break;
        case 3: // 魔王の眼光
            await log(actor.name + 'の魔王の眼光！');
            let currentDamage3 = await filterDamage(10, target);
            if (currentDamage3 != 0) {
                await damageEffect(target);
                target.hp -= currentDamage3;
                displayHPandSP();
                await log(target.name + 'に' + currentDamage3 + 'ダメージ！');
                kintokiDamage(currentDamage3, target);
            }
            if (actor.turn == '後攻') {
                actor.turn = '先攻';
                target.turn = '後攻';
                await log(actor.name + 'のターンが先攻になった！');
            } else {
                await log(actor.name + 'は先攻なので、/何も起こらなかった。');
            }
            break;
        case 4: // 眼鏡を落とす
            await log(actor.name + 'は眼鏡を落としてしまった！');
            await log('サイコロを振り3以下なら/次のターン行動できない！');
            await log('ダイスを回してください。', true);
            if (actor == player) {
                buttonAble(1);
            } else if (actor == enemy) {
                buttonAble(2);
            }
            playerDiceButton.style.pointerEvents = 'auto';
            enemyDiceButton.style.pointerEvents = 'auto';
            let currentNum = await rollDice();
            buttonAble(0);
            playerDiceButton.style.pointerEvents = 'none';
            enemyDiceButton.style.pointerEvents = 'none';
            await log("ダイスの出目: " + currentNum);
            if (currentNum <= 3) {
                await log(actor.name + 'は落とした眼鏡を見つけられない！');
                actor.turnSkip = true;
            } else {
                await log(actor.name + 'はすぐに/眼鏡を見つけることができた！');
            }
            break;
        case 5: // 天変地異を引き起こす
        await log(actor.name + 'は天変地異を引き起こした！');
            let currentDamage5 = await filterDamage(50, target);
            if (currentDamage5 != 0) {
                await damageEffect(target);
                target.hp -= currentDamage5;
                displayHPandSP();
                await log(target.name + 'に' + currentDamage5 + 'ダメージ！');
                kintokiDamage(currentDamage5, target);
            }
            await log(target.name + 'の次ターンの出目が裏返される！');
            isKiriyan5 = true;
            break;
        case 6: // 丸飲み
            if (actor.marunomi == false) {
                await log(actor.name + 'は大きく口を開けた！');
                await log('次の自分のターンに6が出たら/相手のHPを0にする！');
                actor.marunomi = true;
            } else {
                await log(actor.name + 'は' + target.name + 'を丸飲みした！');
                let currentDamage6 = target.hp;
                await damageEffect(target);
                target.hp -= currentDamage6;
                displayHPandSP();
                await log(target.name + 'のHPが0になった。');
            }
            break;
    } 
}

function displayHPandSP() {
    playerHPText.innerHTML = 'HP: ' + player.hp;
    enemyHPText.innerHTML = 'HP: ' + enemy.hp;
    playerTurnText.innerHTML = player.turn;
    enemyTurnText.innerHTML = enemy.turn;
    if (player.name == 'Nakamu' || isNakamuSummon == 1) {
        if (player.spValue == 1) {
            playerSPText.innerHTML = player.spName + '<span style="color: white;">' + player.spValue + '(+' + ((nakamuLevel - 1) * 10) + ')' + '</span>';
        } else if (player.spValue == 2) {
            playerSPText.innerHTML = player.spName + '<span style="color: yellow;">' + player.spValue + '(+' + ((nakamuLevel - 1) * 10) + ')' + '</span>';
        } else if (player.spValue == 3) {
            playerSPText.innerHTML = player.spName + '<span style="color: orange;">' + player.spValue + '(+' + ((nakamuLevel - 1) * 10) + ')' + '</span>';
        } else if (player.spValue >= 4) {
            playerSPText.innerHTML = player.spName + '<span style="color: red;">' + player.spValue + '(+' + ((nakamuLevel - 1) * 10) + ')' + '</span>';
        }
    } else {
        if (player.name == 'きんとき') {
            if (player.spValue != 0) {
                playerSPText.innerHTML = player.spName + '<span style="color: red;">' + player.spValue + '</span>';
            } else {
                playerSPText.innerHTML = player.spName + player.spValue;
            }
        } else {
            playerSPText.innerHTML = player.spName + player.spValue;
        }
    }

    if (enemy.name == 'Nakamu' || isNakamuSummon == 2) {
        if (enemy.spValue == 1) {
            enemySPText.innerHTML = enemy.spName + '<span style="color: white;">' + enemy.spValue + '(+' + ((nakamuLevel - 1) * 10) + ')' + '</span>';
        } else if (enemy.spValue == 2) {
            enemySPText.innerHTML = enemy.spName + '<span style="color: yellow;">' + enemy.spValue + '(+' + ((nakamuLevel - 1) * 10) + ')' + '</span>';
        } else if (enemy.spValue == 3) {
            enemySPText.innerHTML = enemy.spName + '<span style="color: orange;">' + enemy.spValue + '(+' + ((nakamuLevel - 1) * 10) + ')' + '</span>';
        } else if (enemy.spValue >= 4) {
            enemySPText.innerHTML = enemy.spName + '<span style="color: red;">' + enemy.spValue + '(+' + ((nakamuLevel - 1) * 10) + ')' + '</span>';
        }
    } else {
        if (enemy.name == 'きんとき') {
            if (enemy.spValue != 0) {
                enemySPText.innerHTML = enemy.spName + '<span style="color: red;">' + enemy.spValue + '</span>';
            } else {
                enemySPText.innerHTML = enemy.spName + enemy.spValue;
            }
        } else {
            enemySPText.innerHTML = enemy.spName + enemy.spValue;
        }
    }
}

async function filterDamage(damage, target) {
    if (target.invincible && target.name == 'シャークん') {
        await log('シャークんは隠れているため、/攻撃を与えられなかった！');
        target.invincible = false;
        return 0;
    } else {
        if (target.shieldDamage == 0) {
            return damage;
        } else {
            if (damage <= target.shieldDamage) {
                damage = 0;
                await log(target.name + 'は' + target.shieldDamage + 'ダメージ軽減したため、/ノーダメージだった。');
                if (target.name == 'Broooock') {
                    target.spValue = 0;
                }
                return damage;
            } else {
                damage -= target.shieldDamage;
                await log(target.name + 'は' + target.shieldDamage + 'ダメージ軽減した。');
                if (target.name == 'Broooock') {
                    target.spValue = 0;
                }
                return damage;
            }
        }
    }
}

async function kintokiDamage(damage, target) {
    if (target.name == 'きんとき') {
        target.spValue = damage;
    } else if (target.name == 'Nakamu') {
        nakamuBeforeDamage = damage;
    }
}

async function nakamu5Action(guest, actor, target) {
    const playerSummonIcon = document.getElementById('player-summon-icon');
    const enemySummonIcon = document.getElementById('enemy-summon-icon');
    const playerSummonDetail = document.getElementById('player-summon-detail');
    const enemySummonDetail = document.getElementById('enemy-summon-detail');

    const characters = {
        1: { name: 'Broooock', icon: '/img/cards/WarriorIcon.png', type: '戦士' },
        2: { name: 'シャークん', icon: '/img/cards/ThiefIcon.png', type: '盗賊' },
        3: { name: 'きんとき', icon: '/img/cards/FighterIcon.png', type: '武闘家' },
        4: { name: 'スマイル', icon: '/img/cards/MageIcon.png', type: '賢者' }
    };

    async function summonCharacter(playerNum, charId) {
        const char = characters[charId];
        if (playerNum == 1) {
            playerSummonIcon.style.display = 'block';
            playerSummonDetail.style.display = 'block';
            playerSummonIcon.src = char.icon;
        } else {
            enemySummonIcon.style.display = 'block';
            enemySummonDetail.style.display = 'block';
            enemySummonIcon.src = char.icon;
        }
        await log(`Nakamuは${char.type}${char.name}を召還した！`);
        return char.name;
    }

    currentGuest = await summonCharacter(actor.playerNum, guest);

    await log('ダイスを回してください', true);
    if (actor === player) {
        buttonAble(1);
    } else if (actor === enemy) {
        buttonAble(2);
    }

    playerDiceButton.style.pointerEvents = 'auto';
    enemyDiceButton.style.pointerEvents = 'auto';

    let currentNum = await rollDice();

    buttonAble(0);
    playerDiceButton.style.pointerEvents = 'none';
    enemyDiceButton.style.pointerEvents = 'none';

    await log("ダイスの出目: " + currentNum);

    actor.name = characters[guest].name;

    if (actions[currentGuest]) {
        await actions[currentGuest](currentNum, actor, target, true);
    } else {
        console.error(`Action not found for currentGuest: ${currentGuest}`);
    }

    while (kintokiMoreTurn) {
        await log('きんときの追加ターン！/ダイスを回してください', true);
        if (actor === player) {
            buttonAble(1);
        } else if (actor === enemy) {
            buttonAble(2);
        }

        playerDiceButton.style.pointerEvents = 'auto';
        enemyDiceButton.style.pointerEvents = 'auto';

        let currentNum = await rollDice();

        buttonAble(0);
        playerDiceButton.style.pointerEvents = 'none';
        enemyDiceButton.style.pointerEvents = 'none';

        await log("ダイスの出目: " + currentNum);
        await kintokiAction(currentNum, actor, target, true);
        if (currentNum !== 2) {
            kintokiMoreTurn = false;
        }
    }
    playerSummonIcon.style.display = 'none';
    playerSummonDetail.style.display = 'none';
    enemySummonIcon.style.display = 'none';
    enemySummonDetail.style.display = 'none';
    actor.name = 'Nakamu';
}

function replay() {
    document.getElementById('replay-dialog').style.display = 'none';
    nakamuLevel = 1;
    isNakamuChoice = false;
    isNakamuSummon = 0;
    nakamuCoins = 3;
    nakamuMP = 3;
    currentGuest = '';
    currentNakamuChoice = '';
    isSharken6 = false;
    kintokiMoreTurn = false;
    isKintoki6 = false;
    isSmile2 = false;
    isSmile6 = false;
    isKiriyan2 = false;
    isKiriyan5 = false;
    setChara();
    turnCount = 1;
    playerIcon.style.opacity = '1';
    enemyIcon.style.opacity = '1';
    enemyBattle();
}

function returnTop() {
    currentChoice = '';
    currentChoicePlayer = 1;
    playerCharaNum = 0;
    firstPlayer = 'player';
    turnCount = 1;
    logEnd = false;
    cancelLog = false;
    isClick = false;
    currentPlayer = '';
    currentDiceNum = 0;

    isTurnEnd = false;

    nakamuLevel = 1;
    isNakamuChoice = false;
    isNakamuSummon = 0;
    nakamuCoins = 3;
    nakamuMP = 3;
    currentGuest = '';
    currentNakamuChoice = '';
    isSharken6 = false;
    kintokiMoreTurn = false;
    isKintoki6 = false;
    isSmile2 = false;
    isSmile6 = false;
    isKiriyan2 = false;
    isKiriyan5 = false;

    nakamuBeforeDamage = 0;

    player.name = '';
    enemy.name = '';
    player.shieldDamage =  0;
    player.turnSkip = false;
    player.invincible = false;
    player.marunomi = false;
    enemy.shieldDamage =  0;
    enemy.turnSkip = false;
    enemy.invincible = false;
    enemy.marunomi = false;

    heroChoice.classList.remove('disabled');
    heroChoice.disabled = false;
    warriorChoice.classList.remove('disabled');
    warriorChoice.disabled = false;
    thiefChoice.classList.remove('disabled');
    thiefChoice.disabled = false;
    fighterChoice.classList.remove('disabled');
    fighterChoice.disabled = false;
    mageChoice.classList.remove('disabled');
    mageChoice.disabled = false;
    devilChoice.classList.remove('disabled');
    devilChoice.disabled = false;

    document.getElementById('replay-dialog').style.display = 'none';
    document.getElementById('choice-display').style.display = 'block';

    playerIcon.style.opacity = '1';
    enemyIcon.style.opacity = '1';
    game();
}

function toggleCloudEffect(actor) {
    const playerEffectElement = document.getElementById('player-effect');
    const enemyEffectElement = document.getElementById('enemy-effect');
    if (actor.invincible) {
        if (actor.playerNum == 1) {
            playerEffectElement.style.display = 'block'; // 表示
        } else {
            enemyEffectElement.style.display = 'block'; // 表示
        }
        
    } else {
        playerEffectElement.style.display = 'none'; // 非表示
        enemyEffectElement.style.display = 'none'; // 非表示
    }
}

function fadeOutDice(actor) {
    return new Promise((resolve) => {
        let dice;
        if (actor.playerNum == 1) {
            dice = document.getElementById('player-dice');
        } else {
            dice = document.getElementById('enemy-dice');
        }
        dice.classList.add('hidden');
        setTimeout(() => {
            resolve();
        }, 500); // アニメーションの時間と同じに設定
    });
}

function fadeInDice(actor) {
    return new Promise((resolve) => {
        let dice;
        if (actor.playerNum == 1) {
            dice = document.getElementById('player-dice');
        } else {
            dice = document.getElementById('enemy-dice');
        }
        dice.classList.remove('hidden');
        setTimeout(() => {
            resolve();
        }, 500); // アニメーションの時間と同じに設定
    });
}