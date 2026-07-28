import { state, choiceLog, battleLog, charaNumArray } from './state.js';
import {
    elements,
    diceImages,
    preloadImages,
    updateCardDisplay,
    nakamuUpdateCardDisplay,
    log,
    displayHPandSP,
    buttonAble,
    toggleCloudEffect
} from './ui.js';
import { promptReroll, rollDice } from './dice.js';
import { applyCharacterData, charaAction, applyDamage } from './characters.js';

const {
    logText, heroChoice, warriorChoice, thiefChoice, fighterChoice, mageChoice,
    devilChoice, charaChoice, decideButton, randomButton, nakamuChoice,
    playerJobText, playerNameText, playerHPText, playerSPText, playerTurnText,
    enemyJobText, enemyNameText, enemyHPText, enemySPText, enemyTurnText,
    turnCountText, playerDiceButton, enemyDiceButton, playerCard, enemyCard,
    playerIcon, enemyIcon, playerDice, enemyDice, charaCard, nakamuCharaCard,
    playerDiceSelect, enemyDiceSelect, rerollDialog
} = elements;

playerDiceSelect.addEventListener('change', (event) => { // デバッグ用
    state.playerDiceNum = parseInt(event.target.value);
});

enemyDiceSelect.addEventListener('change', (event) => { // デバッグ用
    state.enemyDiceNum = parseInt(event.target.value);
});

document.getElementById('log-speed-select').addEventListener('change', (event) => {
    state.logspeed = parseInt(event.target.value);
});

document.addEventListener('DOMContentLoaded', (event) => {
    decideButton.disabled = true;
    decideButton.classList.add('disabled');
    game();
});

// ページロード時に画像を事前ロード
window.onload = () => {
    preloadImages(diceImages);
};

for (let i = 0; i < charaChoice.length; i++) { // キャラ選択画面のボタン

    charaChoice[i].addEventListener('mouseenter', function() {
        if (!state.isChoice) {
            updateCardDisplay(this.id);
        }
    });

    charaChoice[i].addEventListener('mouseleave', function() {
        if (!state.isChoice) {
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
                if (state.currentChoicePlayer === 1) { // 1人目選ぶ
                    charaChoice[j].classList.remove('disabled');
                    charaChoice[j].disabled = false;

                } else { // 2人目選ぶ
                    if (state.playerCharaNum === j + 1) {
                        continue;
                    } else {
                        charaChoice[j].classList.remove('disabled');
                        charaChoice[j].disabled = false;
                    }
                }
            }

            this.classList.add('disabled');
            this.disabled = true;
            state.isChoice = true;

            state.currentChoice = this.id;

            updateCardDisplay(this.id);
        }
    });
}

for (let i = 0; i < nakamuChoice.length; i++) {
    nakamuChoice[i].addEventListener('mouseenter', function() {
        if (!state.isNakamuChoice) {
            nakamuUpdateCardDisplay(this.id);
        }
    });

    nakamuChoice[i].addEventListener('mouseleave', function() {
        if (!state.isNakamuChoice) {
            nakamuCharaCard.style.display = 'none';
        }
    });

    nakamuChoice[i].addEventListener('click', function() {
        state.currentNakamuChoice = this.id;
        state.isNakamuChoice = true;
        if (state.resolveNakamuChoice) {
            state.resolveNakamuChoice();
            state.resolveNakamuChoice = null;
        }
    });
}

document.getElementById('player-summon-detail').addEventListener('mouseenter', function() {
    switch (state.currentGuest) {
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
    if (!state.isChoice) {
        updateCardDisplay('random-button');
    }
});

randomButton.addEventListener('mouseleave', function() {
    if (state.currentChoice === '') {
        charaCard.style.display = 'none';
    }
});

async function game() {
    await choice();
    turnCountText.innerHTML = '1ターン目';
    buttonAble(0);
    document.getElementById('choice-display').style.display = 'none';
    if (state.playMode === 1) {
        await enemyBattle(); // 2人対戦
    } else {
        await npcBattle(); // NPC対戦
    }
}

async function choice() {
    const playerLogPromise = log(choiceLog.player, true);
    state.player.name = await decideName();
    state.currentChoicePlayer = 2;
    decideButton.disabled = true;
    decideButton.classList.add('disabled');

    await playerLogPromise;
    state.cancelLog = false;

    let enemyLogPromise;
    if (state.playMode === 1) {
        enemyLogPromise = await log(choiceLog.enemy, true);
    } else {
        enemyLogPromise = await log(choiceLog.cpu, true);
    }
    state.enemy.name = await decideName();

    randomDecide();
    setChara();

    await enemyLogPromise;
    state.cancelLog = false;
}

function handleDecideNameClick() {
    state.cancelLog = true;
    charaCard.style.display = 'none';
    if (state.resolveDecideNameClick) {
        state.resolveDecideNameClick();
        state.resolveDecideNameClick = null;
    }
}

async function decideName() {
    let result = null;

    decideButton.removeEventListener('click', handleDecideNameClick);
    decideButton.addEventListener('click', handleDecideNameClick);

    await new Promise((resolve) => {
        state.resolveDecideNameClick = resolve;
    });

    switch (state.currentChoice) {
        case 'hero-choice':
            result = 'Nakamu';
            state.playerCharaNum = 1;
            break;
        case 'warrior-choice':
            result = 'Broooock';
            state.playerCharaNum = 2;
            break;
        case 'thief-choice':
            result = 'シャークん';
            state.playerCharaNum = 3;
            break;
        case 'fighter-choice':
            result = 'きんとき';
            state.playerCharaNum = 4;
            break;
        case 'mage-choice':
            result = 'スマイル';
            state.playerCharaNum = 5;
            break;
        case 'devil-choice':
            result = 'きりやん';
            state.playerCharaNum = 6;
            break;
        case 'random-button':
            result = 'ランダム';
            break;
    }

    randomButton.classList.remove('disabled');
    randomButton.disabled = false;

    state.isChoice = false;
    return result;
}

async function npcBattle() {
    await log(state.enemy.job + state.enemy.name + battleLog.startNPC);

    if (state.player.turn === '先攻') {
        await log(battleLog.playerFirst + '/' + battleLog.dicePlayer, true);
    } else {
        await log(battleLog.cpuFirst + '/' + state.enemy.name + battleLog.diceEnemy, true);
    }

    while (state.player.hp > 0 && state.enemy.hp > 0) {
        await turnStartEnemy();
    }
}

async function enemyBattle() {
    await log(state.player.job + state.player.name + ' vs ' + state.enemy.job + state.enemy.name + '/' + '戦いの開幕だ！');

    while (state.player.hp > 0 && state.enemy.hp > 0) {
        playerDiceButton.style.pointerEvents = 'none';
        enemyDiceButton.style.pointerEvents = 'none';
        playerDiceButton.innerText = "回す";
        enemyDiceButton.innerText = "回す";
        await turnStartEnemy();
        displayHPandSP();
    }

    if (state.player.hp <= 0 && state.enemy.hp <= 0) {
        await log('2人は同時に倒れた。/勝負は引き分け！');
    } else if (state.player.hp <= 0) {
        playerIcon.style.opacity = '0.5';
        await log(state.player.name + 'は力尽きた。');
        await log(state.enemy.name + 'の勝利！', true);
    } else if (state.enemy.hp <= 0) {
        enemyIcon.style.opacity = '0.5';
        await log(state.enemy.name + 'は力尽きた。');
        await log(state.player.name + 'の勝利！', true);
    }

    document.getElementById('replay-dialog').style.display = 'block';
}

async function turnStartEnemy() {
    console.log(state.turnCount + 'ターン目開始');
    turnCountText.innerHTML = Math.floor((state.turnCount + 1) / 2) + 'ターン目';
    // turnCountText.innerHTML = (turnCount + 1) / 2 + 'ターン目';

    let currentActor, otherActor, currentTurn, logMessage;

    if (state.turnCount === 1) {
        currentActor = (state.player.turn === '先攻') ? state.player : state.enemy;
        otherActor = (state.player.turn === '先攻') ? state.enemy : state.player;
        if (state.kintokiMoreTurn !== true) {
            logMessage = (currentActor === state.player) ? battleLog.leftPlayerFirst : battleLog.rightPlayerFirst;
        }
    } else {
        if (state.turnCount % 2 === 1) {
            currentTurn = '先攻';
        } else {
            currentTurn = '後攻';
        }
        currentActor = (state.player.turn === currentTurn) ? state.player : state.enemy;
        otherActor = (state.player.turn === currentTurn) ? state.enemy : state.player;
        logMessage = (currentActor === state.player) ? battleLog.leftTurn : battleLog.rightTurn;
    }

    if (state.isSmile2) {
        if (currentActor.name === 'きりやん') {
            if (currentActor.turnSkip === true) {
                await log('きりやんは凍結されており、/さらに眼鏡を落として慌てている！');
            } else {
                await log(currentActor.name + 'は凍結されている！/このターンは行動できない。');
            }
        } else if (currentActor.name === 'Broooock') {
            if (currentActor.turnSkip === true) {
                await log('Broooockは宿屋で爆睡し、/さらに凍結されている！');
            } else {
                await log(currentActor.name + 'は凍結されている！/このターンは行動できない。');
            }
        } else {
            await log(currentActor.name + 'は凍結されている！/このターンは行動できない。');
        }
        otherActor.shieldDamage = 0;
        console.log(state.turnCount + 'ターン目終了');
        if (state.kintokiMoreTurn !== true) {
            state.turnCount++;
        }
        state.isSmile2 = false;
        currentActor.turnSkip = false;
        return;
    }

    if (!currentActor.turnSkip) {
        state.currentPlayer = currentActor === state.player ? 'player' : 'enemy';
        buttonAble(state.currentPlayer === 'player' ? 1 : 2);
        if (state.kintokiMoreTurn === true) {
            await log(battleLog.kintokiMoreTurnLog + '/' + battleLog.dicePlayer, true);
            state.kintokiMoreTurn = false;
        } else {
            await log(logMessage + '/' + battleLog.dicePlayer, true);
        }
        if (state.currentPlayer === 'player') {
            playerDiceButton.style.pointerEvents = 'auto';
        } else {
            enemyDiceButton.style.pointerEvents = 'auto';
        }
        if (state.isSmile6 && currentActor.name !== 'スマイル') { // スマイル振り直し
            state.currentDiceNum = await rollDice();
            await log('【スマイル】ダイスを振り直させますか？', true);
            const shouldReroll = await promptReroll();
            if (shouldReroll) {
                rerollDialog.style.display = 'none';
                playerDiceButton.innerText = "回す";
                enemyDiceButton.innerText = "回す";
                await log('【' + currentActor.name + '】ダイスを振り直してください', true);
                state.currentDiceNum = await rollDice();
            } else {
                rerollDialog.style.display = 'none';
            }
            state.isSmile6 = false;
            state.isSharken6 = false;
        } else {
            if (state.isSharken6 && currentActor.name === 'シャークん') { // シャークん振り直し
                state.currentDiceNum = await rollDice();
                await log('【シャークん】ダイスを振り直しますか？', true);
                const shouldReroll = await promptReroll();
                if (shouldReroll) {
                    playerDiceButton.innerText = "回す";
                    enemyDiceButton.innerText = "回す";
                    rerollDialog.style.display = 'none';
                    await log('ダイスを振り直してください', true);
                    state.currentDiceNum = await rollDice();
                } else {
                    rerollDialog.style.display = 'none';
                }
                state.isSharken6 = false;
                state.isSmile6 = false;
            } else {
                state.currentDiceNum = await rollDice();
            }
        }
        buttonAble(0);
        if (state.currentPlayer === 'player') {
            playerDiceButton.style.pointerEvents = 'none';
        } else {
            enemyDiceButton.style.pointerEvents = 'none';
        }
        await charaAction(state.currentDiceNum, currentActor, otherActor);
    } else {
        await skipBroKiri(currentActor);
    }

    if (state.isKiriyan2) { // きりやん火傷
        if (currentActor.name !== 'きりやん') {
            await log(currentActor.name + 'は火傷による/継続ダメージを受けた！');
            await applyDamage(10, currentActor);
        }
    }

    otherActor.shieldDamage = 0;

    if (otherActor.name === 'Broooock') {
        otherActor.spValue = 0;
    }

    otherActor.invincible = false;
    // marunomi(きりやんの「丸飲み」待機フラグ)はここではリセットしない。
    // 「自分の次の自分のターンまで保持」する必要があるため、ここで毎ターンリセットすると
    // 相手の手番を挟んだ時点で常にfalseに戻ってしまい、即死ギミックが発動不可能になる(バグ⑦)。
    // 実際に丸飲みを実行した時点(kiriyanAction case6)でリセットする。
    toggleCloudEffect(currentActor);

    console.log(state.turnCount + 'ターン目終了');
    if (state.kintokiMoreTurn !== true) {
        state.turnCount++;
    }
}

async function skipBroKiri(actor) {
    const messages = {
        'Broooock': '宿屋でぐっすり寝ている！',
        'きりやん': '眼鏡を探しながら慌てている！',
        'Nakamu': '宿屋でぐっすり寝ている！'
    };
    if (actor.playerNum === 1) {
        await log(battleLog.leftTurn + `/${actor.name}は${messages[actor.name]}`);
    } else {
        await log(battleLog.rightTurn + `/${actor.name}は${messages[actor.name]}`);
    }
    actor.turnSkip = false;
}

async function setChara() {

    applyCharacterData(state.player);
    applyCharacterData(state.enemy);

    if (state.firstPlayer === '') {
        let turnNum = Math.floor(Math.random() * 2) + 1;

        if (turnNum === 1) {
            state.firstPlayer = 'player';
            state.player.turn = '先攻';
            state.enemy.turn = '後攻';
        } else {
            state.firstPlayer = 'enemy';
            state.player.turn = '後攻';
            state.enemy.turn = '先攻';
        }
    } else if (state.firstPlayer === 'player') {
        state.firstPlayer = 'player';
        state.player.turn = '先攻';
        state.enemy.turn = '後攻';
    } else if (state.firstPlayer === 'enemy') {
        state.firstPlayer = 'enemy';
        state.player.turn = '後攻';
        state.enemy.turn = '先攻';
    }

    playerJobText.innerHTML = state.player.job;
    playerNameText.innerHTML = state.player.name;
    playerHPText.innerHTML = 'HP: ' + state.player.hp;
    if (state.player.name === 'Nakamu') {
        playerSPText.innerHTML = state.player.spName + state.player.spValue + '(+' + ((state.nakamuLevel - 1) * 10) + ')';
    } else {
        playerSPText.innerHTML = state.player.spName + state.player.spValue;
    }
    enemyJobText.innerHTML = state.enemy.job;
    enemyNameText.innerHTML = state.enemy.name;
    enemyHPText.innerHTML = 'HP: ' + state.enemy.hp;
    if (state.enemy.name === 'Nakamu') {
        enemySPText.innerHTML = state.enemy.spName + state.enemy.spValue + '(+' + ((state.nakamuLevel - 1) * 10) + ')';
    } else {
        enemySPText.innerHTML = state.enemy.spName + state.enemy.spValue;
    }
    playerTurnText.innerHTML = state.player.turn;
    enemyTurnText.innerHTML = state.enemy.turn;

    playerCard.src = state.player.img;
    enemyCard.src = state.enemy.img;
    playerIcon.src = state.player.iconImg;
    enemyIcon.src = state.enemy.iconImg;
    playerDice.src = state.player.firstDice;
    enemyDice.src = state.enemy.firstDice;
}

function decideTurn() {
    const turnDecideButton = document.getElementById('turn-decide-button');

    if (state.firstPlayer === '') {
        turnDecideButton.innerHTML = '1P';
        state.firstPlayer = 'player';
    } else if (state.firstPlayer === 'player') {
        if (state.playMode === 1) {
            turnDecideButton.innerHTML = '2P';
        } else {
            turnDecideButton.innerHTML = 'CPU';
        }
        state.firstPlayer = 'enemy';
    } else if (state.firstPlayer === 'enemy') {
        turnDecideButton.innerHTML = '?';
        state.firstPlayer = '';
    }
}

function randomButtonEnter() {
    const buttons = document.querySelectorAll('.choice-button');

    charaCard.style.imageRendering = 'pixelated';

    state.isChoice = true;

    charaCard.src = 'img/cards/Random.png';

    decideButton.disabled = false;
    decideButton.classList.remove('disabled');

    buttons.forEach(button => {
        for (let j = 0; j < charaChoice.length; j++) {
            if (state.currentChoicePlayer === 1) { // 1人目選ぶ
                randomButton.classList.add('disabled');
                randomButton.disabled = true;
                charaChoice[j].classList.remove('disabled');
                charaChoice[j].disabled = false;
            } else { // 2人目選ぶ
                if (state.playerCharaNum === j + 1) {
                    continue;
                } else {
                    randomButton.classList.add('disabled');
                    randomButton.disabled = true;
                    charaChoice[j].classList.remove('disabled');
                    charaChoice[j].disabled = false;
                }
            }
        }
        state.currentChoice = 'random-button';
    });
}

function randomDecide() {

    const numbers = Object.keys(charaNumArray).map(Number);

    if (state.player.name === 'ランダム' && state.enemy.name === 'ランダム') {
        const randomIndex1 = Math.floor(Math.random() * numbers.length);
        let randomIndex2 = Math.floor(Math.random() * numbers.length);

        while (randomIndex1 === randomIndex2) {
            randomIndex2 = Math.floor(Math.random() * numbers.length);
        }

        const randomElement1 = charaNumArray[numbers[randomIndex1]];
        const randomElement2 = charaNumArray[numbers[randomIndex2]];

        state.player.name = randomElement1;
        state.enemy.name = randomElement2;
    } else if (state.player.name === 'ランダム' && state.enemy.name !== 'ランダム') {

        let filteredNumbers = numbers.filter(number => charaNumArray[number] !== state.enemy.name);
        const randomIndex = Math.floor(Math.random() * filteredNumbers.length);
        state.player.name = charaNumArray[filteredNumbers[randomIndex]];

    } else if (state.player.name !== 'ランダム' && state.enemy.name === 'ランダム') {

        let filteredNumbers = numbers.filter(number => charaNumArray[number] !== state.player.name);
        const randomIndex = Math.floor(Math.random() * filteredNumbers.length);
        state.enemy.name = charaNumArray[filteredNumbers[randomIndex]];

    }
}

// filterDamage(シールド軽減・無敵判定) → 被弾演出 → HP減算(0未満にならないようクランプ) → 表示更新 → ログ → kintokiDamage記録
// をまとめて行う共通処理。各キャラクターのダメージ技はすべてこれを経由させる。
// rawDamage: シールド軽減前の生ダメージ　target: ダメージを受ける側
// messageFn: ダメージが実際に発生した場合のログ文言を生成する関数 (damage) => string　省略時は標準文言
// 戻り値: 実際に与えたダメージ(シールド等で無効化された場合は0)
// 新しい試合を始める前に、キャラクター固有のアビリティフラグと player/enemy の戦闘状態をまとめてリセットする
// (旧実装では replay()/returnTop() がそれぞれ個別にリセットしており、項目の食い違いによる状態持ち越しバグがあった)
function resetBattleState() {
    state.nakamuLevel = 1;
    state.isNakamuChoice = false;
    state.nakamuCoins = 3;
    state.nakamuMP = 3;
    state.currentGuest = '';
    state.currentNakamuChoice = '';
    state.isSharken6 = false;
    state.kintokiMoreTurn = false;
    state.isKintoki6 = false;
    state.isSmile2 = false;
    state.isSmile6 = false;
    state.isKiriyan2 = false;
    state.isKiriyan5 = false;

    state.nakamuBeforeDamage = 0;

    state.player.shieldDamage = 0;
    state.player.turnSkip = false;
    state.player.invincible = false;
    state.player.marunomi = false;
    state.enemy.shieldDamage = 0;
    state.enemy.turnSkip = false;
    state.enemy.invincible = false;
    state.enemy.marunomi = false;
}

function replay() {
    document.getElementById('replay-dialog').style.display = 'none';
    resetBattleState();
    setChara();
    state.turnCount = 1;
    playerIcon.style.opacity = '1';
    enemyIcon.style.opacity = '1';
    enemyBattle();
}

function returnTop() {
    state.currentChoice = '';
    state.currentChoicePlayer = 1;
    state.playerCharaNum = 0;
    state.firstPlayer = 'player';
    state.turnCount = 1;
    state.cancelLog = false;
    state.currentPlayer = '';
    state.currentDiceNum = 0;

    resetBattleState();

    state.player.name = '';
    state.enemy.name = '';

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

document.getElementById('random-button').addEventListener('click', randomButtonEnter);
document.getElementById('turn-decide-button').addEventListener('click', decideTurn);
document.getElementById('replay').addEventListener('click', replay);
document.getElementById('top').addEventListener('click', returnTop);
