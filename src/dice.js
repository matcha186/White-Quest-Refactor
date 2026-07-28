import { state } from './state.js';
import { elements } from './ui.js';

const {
    logText, heroChoice, warriorChoice, thiefChoice, fighterChoice, mageChoice,
    devilChoice, charaChoice, decideButton, randomButton, nakamuChoice,
    playerJobText, playerNameText, playerHPText, playerSPText, playerTurnText,
    enemyJobText, enemyNameText, enemyHPText, enemySPText, enemyTurnText,
    turnCountText, playerDiceButton, enemyDiceButton, playerCard, enemyCard,
    playerIcon, enemyIcon, playerDice, enemyDice, charaCard, nakamuCharaCard,
    playerDiceSelect, enemyDiceSelect, rerollDialog
} = elements;

export async function promptReroll() {
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

export function rollDiceLogic(diceNum, setImageSrc) {
    if (diceNum === 0) {
        // Random roll
        let diceNumber;
        do {
            diceNumber = Math.floor(Math.random() * 6) + 1;
        } while (diceNumber === state.diceRollState.previousDiceNumber);
        setImageSrc(`img/dice/dice${diceNumber}.png`);
        return diceNumber;
    } else {
        // Set to specified number
        setImageSrc(`img/dice/dice${diceNum}.png`);
        return diceNum;
    }
}

export function onPlayerDiceClick() {
    if (state.diceRollState.isRollStarted) {
        clearInterval(state.diceRollState.diceInterval);
        state.diceRollState.isRollStarted = false;
        state.diceRollState.diceResult = state.diceRollState.previousDiceNumber;
        playerDice.src = `img/dice/dice${state.diceRollState.diceResult}.png`;
        state.diceRollState.resolve(state.diceRollState.diceResult);
    } else {
        state.diceRollState.diceInterval = setInterval(() => {
            state.diceRollState.previousDiceNumber = rollDiceLogic(state.playerDiceNum, src => playerDice.src = src);
        }, 100);
        state.diceRollState.isRollStarted = true;
        playerDiceButton.innerText = "止める";
    }
}

export function onEnemyDiceClick() {
    if (state.diceRollState.isRollStarted) {
        clearInterval(state.diceRollState.diceInterval);
        state.diceRollState.isRollStarted = false;
        state.diceRollState.diceResult = state.diceRollState.previousDiceNumber;
        enemyDice.src = `img/dice/dice${state.diceRollState.diceResult}.png`;
        state.diceRollState.resolve(state.diceRollState.diceResult);
    } else {
        state.diceRollState.diceInterval = setInterval(() => {
            state.diceRollState.previousDiceNumber = rollDiceLogic(state.enemyDiceNum, src => enemyDice.src = src);
        }, 100);
        state.diceRollState.isRollStarted = true;
        enemyDiceButton.innerText = "止める";
    }
}

export async function rollDice() {
    return new Promise((resolve) => {
        state.diceRollState = {
            isRollStarted: false,
            diceInterval: null,
            previousDiceNumber: null,
            diceResult: null,
            resolve
        };

        if (state.currentPlayer === 'player') {
            playerDiceButton.removeEventListener('click', onPlayerDiceClick);
            playerDiceButton.addEventListener('click', onPlayerDiceClick);
        } else if (state.currentPlayer === 'enemy') {
            enemyDiceButton.removeEventListener('click', onEnemyDiceClick);
            enemyDiceButton.addEventListener('click', onEnemyDiceClick);
        }
    });
}
