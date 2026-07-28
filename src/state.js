export const choiceLog = {
    player: '1P: キャラクターを選択してください',
    enemy: '2P: キャラクターを選択してください',
    cpu: 'CPU: キャラクターを選択してください'
};

export const battleLog = {
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
};

export const charaNumArray = {
    1: 'Nakamu',
    2: 'Broooock',
    3: 'シャークん',
    4: 'きんとき',
    5: 'スマイル',
    6: 'きりやん'
};

export const CHARACTERS = {
    Nakamu: { job: '勇者', maxHp: 170, spName: 'レベル: ', img: 'img/cards/HeroDetail.png', iconImg: 'img/cards/HeroIcon.png', firstDice: 'img/dice/dice1.png' },
    Broooock: { job: '戦士', maxHp: 180, spName: '軽減: ', img: 'img/cards/WarriorDetail.png', iconImg: 'img/cards/WarriorIcon.png', firstDice: 'img/dice/dice2.png' },
    シャークん: { job: '盗賊', maxHp: 150, spName: 'お金: ', img: 'img/cards/ThiefDetail.png', iconImg: 'img/cards/ThiefIcon.png', firstDice: 'img/dice/dice3.png' },
    きんとき: { job: '武闘家', maxHp: 160, spName: '被ダメ: ', img: 'img/cards/FighterDetail.png', iconImg: 'img/cards/FighterIcon.png', firstDice: 'img/dice/dice4.png' },
    スマイル: { job: '賢者', maxHp: 140, spName: '魔力: ', img: 'img/cards/MageDetail.png', iconImg: 'img/cards/MageIcon.png', firstDice: 'img/dice/dice5.png' },
    きりやん: { job: '魔王', maxHp: 200, spName: '火炎: ', img: 'img/cards/DevilDetail.png', iconImg: 'img/cards/DevilIcon.png', firstDice: 'img/dice/dice6.png' }
};

const createActor = (playerNum) => ({
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
    playerNum,
    invincible: false,
    marunomi: false
});

export const player = createActor(1);
export const enemy = createActor(2);

export const state = {
    currentChoice: '',
    currentChoicePlayer: 1,
    playerCharaNum: 0,
    firstPlayer: 'player',
    turnCount: 1,
    cancelLog: false,
    currentPlayer: '',
    currentDiceNum: 0,
    playerDiceNum: 0,
    enemyDiceNum: 0,
    nakamuLevel: 1,
    isNakamuChoice: false,
    nakamuCoins: 3,
    nakamuMP: 3,
    currentGuest: '',
    currentNakamuChoice: '',
    isSharken6: false,
    kintokiMoreTurn: false,
    isKintoki6: false,
    isSmile2: false,
    isSmile6: false,
    isKiriyan2: false,
    isKiriyan5: false,
    nakamuBeforeDamage: 0,
    logspeed: 20,
    playMode: 1,
    isChoice: false,
    resolveNakamuChoice: null,
    resolveDecideNameClick: null,
    diceRollState: {
        isRollStarted: false,
        diceInterval: null,
        previousDiceNumber: null,
        diceResult: null,
        resolve: null
    },
    player,
    enemy
};
