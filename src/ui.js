import { state } from './state.js';

export const elements = {
    logText: document.getElementById('log-text'),
    heroChoice: document.getElementById('hero-choice'),
    warriorChoice: document.getElementById('warrior-choice'),
    thiefChoice: document.getElementById('thief-choice'),
    fighterChoice: document.getElementById('fighter-choice'),
    mageChoice: document.getElementById('mage-choice'),
    devilChoice: document.getElementById('devil-choice'),
    charaChoice: document.getElementsByClassName('choice-button'),
    decideButton: document.getElementById('decide-button'),
    randomButton: document.getElementById('random-button'),
    nakamuChoice: document.getElementsByClassName('nakamu5'),
    playerJobText: document.getElementById('player-job'),
    playerNameText: document.getElementById('player-name'),
    playerHPText: document.getElementById('player-hp'),
    playerSPText: document.getElementById('player-sp'),
    playerTurnText: document.getElementById('player-turn'),
    enemyJobText: document.getElementById('enemy-job'),
    enemyNameText: document.getElementById('enemy-name'),
    enemyHPText: document.getElementById('enemy-hp'),
    enemySPText: document.getElementById('enemy-sp'),
    enemyTurnText: document.getElementById('enemy-turn'),
    turnCountText: document.getElementById('turn-count'),
    playerDiceButton: document.getElementById('player-dice-button'),
    enemyDiceButton: document.getElementById('enemy-dice-button'),
    playerCard: document.getElementById('player-card'),
    enemyCard: document.getElementById('enemy-card'),
    playerIcon: document.getElementById('player-icon'),
    enemyIcon: document.getElementById('enemy-icon'),
    playerDice: document.getElementById('player-dice'),
    enemyDice: document.getElementById('enemy-dice'),
    charaCard: document.getElementById('choice-card'),
    nakamuCharaCard: document.getElementById('nakamu-choice-card'),
    playerDiceSelect: document.getElementById('player-dice-select'),
    enemyDiceSelect: document.getElementById('enemy-dice-select'),
    rerollDialog: document.getElementById('reroll-dialog')
};

const {
    logText, playerHPText, playerSPText, playerTurnText, enemyHPText, enemySPText,
    enemyTurnText, playerDiceButton, enemyDiceButton, playerIcon, enemyIcon,
    charaCard, nakamuCharaCard
} = elements;

const imageMap = {
    'hero-choice': 'img/cards/Hero.png',
    'warrior-choice': 'img/cards/Warrior.png',
    'thief-choice': 'img/cards/Thief.png',
    'fighter-choice': 'img/cards/Fighter.png',
    'mage-choice': 'img/cards/Mage.png',
    'devil-choice': 'img/cards/Devil.png',
    broooock: 'img/cards/Warrior.png',
    sharken: 'img/cards/Thief.png',
    kintoki: 'img/cards/Fighter.png',
    smile: 'img/cards/Mage.png',
    'random-button': 'img/cards/Random.png'
};

const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

export const diceImages = [
    'img/dice/dice1.png',
    'img/dice/dice2.png',
    'img/dice/dice3.png',
    'img/dice/dice4.png',
    'img/dice/dice5.png',
    'img/dice/dice6.png'
];


export function preloadImages(imageUrls) {
    imageUrls.forEach((url) => {
        const img = new Image();
        img.src = url;
    });
}

export function updateCardDisplay(id) {
    if (imageMap[id]) {
        if (id === 'random-button') {
            charaCard.style.imageRendering = 'pixelated';
        } else {
            charaCard.style.imageRendering = '';
        }
        charaCard.src = imageMap[id];
        charaCard.style.display = 'block';
    }
}

export function nakamuUpdateCardDisplay(id) {
    if (imageMap[id]) {
        nakamuCharaCard.src = imageMap[id];
        nakamuCharaCard.style.display = 'block';
    }
}

export async function log(text, isEndless) {
    let logArray = text.split('');
    let currentLog = '';
    let sleepTime = state.logspeed;

    logClear();

    for (let i = 0; i < logArray.length; i++) {
        if (state.cancelLog) {
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

export function logClear() {
    logText.innerHTML = '';
}

export function attackEffect(target) {
    const attacker = target === state.player ? state.enemy : state.player;
    const attackerElement = attacker.playerNum === 1 ? playerIcon : enemyIcon;
    const animationClass = attacker.playerNum === 1 ? 'attack-right' : 'attack-left';

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return Promise.resolve();
    }

    attackerElement.classList.remove('attack-right', 'attack-left');
    void attackerElement.offsetWidth;
    attackerElement.classList.add(animationClass);

    return new Promise((resolve) => {
        const finish = (event) => {
            if (event && event.target !== attackerElement) return;
            attackerElement.removeEventListener('animationend', finish);
            attackerElement.classList.remove(animationClass);
            clearTimeout(fallbackTimer);
            resolve();
        };

        const fallbackTimer = setTimeout(() => finish(), 450);
        attackerElement.addEventListener('animationend', finish);
    });
}

export function damageEffect(target) {
    const gameContainer = document.getElementById('game-container');
    const targetHPText = (target === state.player) ? playerHPText : enemyHPText;

    gameContainer.classList.remove('shake');
    void gameContainer.offsetWidth;
    gameContainer.classList.add('shake');
    targetHPText.style.color = 'red';

    setTimeout(() => {
        targetHPText.classList.add('damage-fade');
    }, 100);

    setTimeout(() => {
        targetHPText.classList.remove('damage-fade');
        targetHPText.style.color = '';
    }, 600);

    const finishShake = (event) => {
        if (event.target !== gameContainer) return;
        gameContainer.classList.remove('shake');
        gameContainer.removeEventListener('animationend', finishShake);
    };
    gameContainer.addEventListener('animationend', finishShake);
}

export function showDamagePopup(target, damage) {
    const gameDisplay = document.getElementById('game-display');
    const popup = document.createElement('span');
    const sideClass = target.playerNum === 1
        ? 'damage-popup-player'
        : 'damage-popup-enemy';

    popup.classList.add('damage-popup', sideClass);
    popup.textContent = `-${damage}`;
    gameDisplay.appendChild(popup);

    const removePopup = () => popup.remove();
    popup.addEventListener('animationend', removePopup, { once: true });
    setTimeout(removePopup, 1100);
}

export function healEffect(actor) {
    const actorHPText = (actor === state.player) ? playerHPText : enemyHPText;

    actorHPText.style.color = 'rgb(0, 255, 0)';

    setTimeout(() => {
        actorHPText.classList.add('heal-fade');
    }, 100);

    setTimeout(() => {
        actorHPText.classList.remove('heal-fade');
        actorHPText.style.color = '';
    }, 600);

}

export function buttonAble(num) {
    if (num === 0) {
        playerDiceButton.style.display = 'none';
        enemyDiceButton.style.display = 'none';
    } else if (num === 1) {
        playerDiceButton.style.display = 'block';
        enemyDiceButton.style.display = 'none';
    } else {
        playerDiceButton.style.display = 'none';
        enemyDiceButton.style.display = 'block';
    }
}

export function preloadImage(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.src = src;
    });
}

function updateHPDisplay(actor, element) {
    const maxHp = Math.max(1, actor.maxHp);
    const percentage = Math.max(0, Math.min(100, (actor.hp / maxHp) * 100));
    const levelClass = percentage > 50
        ? 'hp-gauge-high'
        : percentage > 25
            ? 'hp-gauge-medium'
            : 'hp-gauge-low';

    const value = document.createElement('span');
    value.className = 'hp-value';
    value.textContent = `HP: ${actor.hp} / ${maxHp}`;

    const gauge = document.createElement('span');
    gauge.className = 'hp-gauge';
    gauge.setAttribute('role', 'progressbar');
    gauge.setAttribute('aria-label', `${actor.name}のHP`);
    gauge.setAttribute('aria-valuemin', '0');
    gauge.setAttribute('aria-valuemax', String(maxHp));
    gauge.setAttribute('aria-valuenow', String(actor.hp));

    const fill = document.createElement('span');
    fill.classList.add('hp-gauge-fill', levelClass);
    fill.style.width = `${percentage}%`;
    gauge.appendChild(fill);

    element.replaceChildren(value, gauge);
}

export function displayHPandSP() {
    updateHPDisplay(state.player, playerHPText);
    updateHPDisplay(state.enemy, enemyHPText);
    playerTurnText.innerHTML = state.player.turn;
    enemyTurnText.innerHTML = state.enemy.turn;
    if (state.player.name === 'Nakamu') {
        if (state.player.spValue === 1) {
            playerSPText.innerHTML = state.player.spName + '<span style="color: white;">' + state.player.spValue + '(+' + ((state.nakamuLevel - 1) * 10) + ')' + '</span>';
        } else if (state.player.spValue === 2) {
            playerSPText.innerHTML = state.player.spName + '<span style="color: yellow;">' + state.player.spValue + '(+' + ((state.nakamuLevel - 1) * 10) + ')' + '</span>';
        } else if (state.player.spValue === 3) {
            playerSPText.innerHTML = state.player.spName + '<span style="color: orange;">' + state.player.spValue + '(+' + ((state.nakamuLevel - 1) * 10) + ')' + '</span>';
        } else if (state.player.spValue >= 4) {
            playerSPText.innerHTML = state.player.spName + '<span style="color: red;">' + state.player.spValue + '(+' + ((state.nakamuLevel - 1) * 10) + ')' + '</span>';
        }
    } else {
        if (state.player.name === 'きんとき') {
            if (state.player.spValue !== 0) {
                playerSPText.innerHTML = state.player.spName + '<span style="color: red;">' + state.player.spValue + '</span>';
            } else {
                playerSPText.innerHTML = state.player.spName + state.player.spValue;
            }
        } else {
            playerSPText.innerHTML = state.player.spName + state.player.spValue;
        }
    }

    if (state.enemy.name === 'Nakamu') {
        if (state.enemy.spValue === 1) {
            enemySPText.innerHTML = state.enemy.spName + '<span style="color: white;">' + state.enemy.spValue + '(+' + ((state.nakamuLevel - 1) * 10) + ')' + '</span>';
        } else if (state.enemy.spValue === 2) {
            enemySPText.innerHTML = state.enemy.spName + '<span style="color: yellow;">' + state.enemy.spValue + '(+' + ((state.nakamuLevel - 1) * 10) + ')' + '</span>';
        } else if (state.enemy.spValue === 3) {
            enemySPText.innerHTML = state.enemy.spName + '<span style="color: orange;">' + state.enemy.spValue + '(+' + ((state.nakamuLevel - 1) * 10) + ')' + '</span>';
        } else if (state.enemy.spValue >= 4) {
            enemySPText.innerHTML = state.enemy.spName + '<span style="color: red;">' + state.enemy.spValue + '(+' + ((state.nakamuLevel - 1) * 10) + ')' + '</span>';
        }
    } else {
        if (state.enemy.name === 'きんとき') {
            if (state.enemy.spValue !== 0) {
                enemySPText.innerHTML = state.enemy.spName + '<span style="color: red;">' + state.enemy.spValue + '</span>';
            } else {
                enemySPText.innerHTML = state.enemy.spName + state.enemy.spValue;
            }
        } else {
            enemySPText.innerHTML = state.enemy.spName + state.enemy.spValue;
        }
    }
}

export function toggleCloudEffect(actor) {
    const playerEffectElement = document.getElementById('player-effect');
    const enemyEffectElement = document.getElementById('enemy-effect');
    if (actor.invincible) {
        if (actor.playerNum === 1) {
            playerEffectElement.style.display = 'block'; // 表示
        } else {
            enemyEffectElement.style.display = 'block'; // 表示
        }

    } else {
        playerEffectElement.style.display = 'none'; // 非表示
        enemyEffectElement.style.display = 'none'; // 非表示
    }
}

export function fadeOutDice(actor) {
    return new Promise((resolve) => {
        let dice;
        if (actor.playerNum === 1) {
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

export function fadeInDice(actor) {
    return new Promise((resolve) => {
        let dice;
        if (actor.playerNum === 1) {
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
