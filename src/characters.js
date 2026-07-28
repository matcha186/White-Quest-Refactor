import { state, CHARACTERS } from './state.js';
import {
    elements,
    log,
    attackEffect,
    damageEffect,
    showDamagePopup,
    healEffect,
    displayHPandSP,
    toggleCloudEffect,
    fadeOutDice,
    fadeInDice,
    buttonAble
} from './ui.js';
import { rollDice } from './dice.js';

const {
    logText, heroChoice, warriorChoice, thiefChoice, fighterChoice, mageChoice,
    devilChoice, charaChoice, decideButton, randomButton, nakamuChoice,
    playerJobText, playerNameText, playerHPText, playerSPText, playerTurnText,
    enemyJobText, enemyNameText, enemyHPText, enemySPText, enemyTurnText,
    turnCountText, playerDiceButton, enemyDiceButton, playerCard, enemyCard,
    playerIcon, enemyIcon, playerDice, enemyDice, charaCard, nakamuCharaCard,
    playerDiceSelect, enemyDiceSelect, rerollDialog
} = elements;

const actions = {
    Broooock: broooockAction,
    シャークん: sharkenAction,
    きんとき: kintokiAction,
    スマイル: smileAction
};

export function initialSpValue(name) {
    switch (name) {
        case 'Nakamu': return state.nakamuLevel;
        case 'シャークん': return 3;
        case 'スマイル': return 3;
        case 'きりやん': return 'OFF';
        default: return 0; // Broooock, きんとき
    }
}

export function applyCharacterData(actor) {
    const data = CHARACTERS[actor.name];
    actor.job = data.job;
    actor.hp = data.maxHp;
    actor.maxHp = data.maxHp;
    actor.spName = data.spName;
    actor.spValue = initialSpValue(actor.name);
    actor.img = data.img;
    actor.iconImg = data.iconImg;
    actor.firstDice = data.firstDice;
}

export function waitForNakamuChoice() {
    return new Promise((resolve) => {
        state.resolveNakamuChoice = resolve;
    });
}

export async function charaAction(dice, actor, target) {
    await log("ダイスの出目: " + dice);

    if (state.isKintoki6) {
        if (dice === 1) {
            await log('1が出たため、きんときの挑発は/意味を成さなかった...');
            state.isKintoki6 = false;
        } else {
            fadeOutDice(actor).then(() => {
                if (actor.playerNum === 1) {
                    playerDice.src = 'img/dice/dice1.png';
                } else {
                    enemyDice.src = 'img/dice/dice1.png';
                }
                fadeInDice(actor);
            });

            await log('しかし、きんときの挑発により/1として扱われる！');
            dice = 1;
            await log("ダイスの出目: " + dice);
            state.isKintoki6 = false;
        }
    } else {
        if (state.isKiriyan5) {
            await log('しかし、きりやんが出目を裏返した！');
            dice = 7 - dice;
            await log("ダイスの出目: " + dice);
            state.isKiriyan5 = false;
        }
    }

    switch (actor.name) {
        case 'Nakamu':
            await nakamuAction(dice, actor, target);
            break;
        case 'Broooock':
            await broooockAction(dice, actor, target);
            break;
        case 'シャークん':
            await sharkenAction(dice, actor, target);
            break;
        case 'きんとき':
            await kintokiAction(dice, actor, target);
            break;
        case 'スマイル':
            await smileAction(dice, actor, target);
            break;
        case 'きりやん':
            await kiriyanAction(dice, actor, target);
            break;
    }
}

export async function nakamuAction(dice, actor, target) {
    let addDamage = ((state.nakamuLevel - 1) * 10);

    switch (dice) {
        case 1: // 素早い剣さばき
            await log(actor.name + 'の素早い剣さばき！');
            await applyDamage(40 + addDamage, target);
            break;
        case 2: // 光の魔法を発動
            await log(actor.name + 'が光の魔法を発動！' + '/' + 'サイコロの目×10ダメージ！', true);
            if (actor === state.player) {
                buttonAble(1);
            } else if (actor === state.enemy) {
                buttonAble(2);
            }
            playerDiceButton.innerText = "回す";
            enemyDiceButton.innerText = "回す";
            playerDiceButton.style.pointerEvents = 'auto';
            enemyDiceButton.style.pointerEvents = 'auto';
            let currentNum = await rollDice();
            buttonAble(0);
            playerDiceButton.style.pointerEvents = 'none';
            enemyDiceButton.style.pointerEvents = 'none';
            await log("ダイスの出目: " + currentNum);
            await applyDamage((currentNum * 10) + addDamage, target);
            break;
        case 3: // 盾で防ぎながらの攻撃
            await log(actor.name + 'の盾で防ぎながらの攻撃！');
            let currentDamage3_1 = await applyDamage(20 + addDamage, target, (d) => target.name + 'に' + d + 'ダメージ！/次の相手ターンに受けるダメージを-20した。');
            if (currentDamage3_1 === 0) {
                // シールドで完全に軽減された場合も、盾で防御しながらの攻撃なので防御バフ自体は発生する
                await log(actor.name + 'は次の相手ターンに受ける/ダメージを-20した。');
            }
            actor.shieldDamage = 20;
            break;
        case 4: // 回復魔法で傷を癒す
            await log(actor.name + 'が回復魔法を発動！');
            if (actor.hp === CHARACTERS['Nakamu'].maxHp) {
                await log('しかし、これ以上回復できない！');
            } else {
                let beforeHP = actor.hp;
                await healEffect(actor);
                actor.hp = Math.min(actor.hp + 40, CHARACTERS['Nakamu'].maxHp);
                displayHPandSP();
                await log(actor.name + 'のHPが' + beforeHP + 'から' + actor.hp + 'に回復！');
            }
            break;
        case 5: // 仲間と共に友情コンボ
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
            await waitForNakamuChoice();
            document.getElementById('chara-select-dialog').style.display = 'none';
            state.isNakamuChoice = false;
            switch (state.currentNakamuChoice) {
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
            break;
        case 6: // レベルアップ！
            state.nakamuLevel++;
            actor.spValue = state.nakamuLevel;
            await log('レベルアップ！/' + actor.name + 'が与えるダメージが10上昇した。');
            displayHPandSP();
            break;
    }
}

export async function broooockAction(dice, actor, target, isNakamu) {
    switch (dice) {
        case 1: // 重みのある斬撃
            await log(actor.name + 'の重みのある斬撃！');
            await applyDamage(50, target);
            break;
        case 2: // 空振り
            await log(actor.name + 'は空振りした！');
            break;
        case 3: // 巨神斬りの構え
            await log(actor.name + 'の巨神斬りの構え！/サイコロを振り奇数が出れば80ダメージ！', true);
            if (actor === state.player) {
                buttonAble(1);
            } else if (actor === state.enemy) {
                buttonAble(2);
            }
            playerDiceButton.style.pointerEvents = 'auto';
            enemyDiceButton.style.pointerEvents = 'auto';
            let currentNum = await rollDice();
            buttonAble(0);
            playerDiceButton.style.pointerEvents = 'none';
            enemyDiceButton.style.pointerEvents = 'none';
            await log("ダイスの出目: " + currentNum);
            if (currentNum % 2 === 0) {
                await log('偶数だったため、何も起こらなかった。');
            } else {
                await applyDamage(80, target);
            }
            break;
        case 4: // 防御態勢
            await log(actor.name + 'は防御態勢を取った！/次のターンに受けるダメージを-50した。');
            actor.shieldDamage = 50;
            actor.spValue = -50;
            break;
        case 5: // 捨て身の攻撃
            await log(actor.name + 'の捨て身の攻撃！');
            actor.hp = Math.max(0, actor.hp - 20);
            damageEffect(actor);
            showDamagePopup(actor, 20);
            displayHPandSP();
            await log(actor.name + 'は20ダメージを受けた。');
            await applyDamage(70, target);
            break;
        case 6: // 宿屋で睡眠
            if (isNakamu) {
                await log('Nakamuは宿屋で寝た。');
                if (actor.hp === CHARACTERS['Nakamu'].maxHp) {
                    await log('しかし、これ以上回復できない！/次のターン行動できなくなった。');
                } else {
                    let beforeHP = actor.hp;
                    await healEffect(actor);
                    actor.hp = Math.min(actor.hp + 100, CHARACTERS['Nakamu'].maxHp);
                    displayHPandSP();
                    await log('NakamuのHPが' + beforeHP + 'から' + actor.hp + 'に回復！/次のターン行動できなくなった。');
                }
            } else {
                await log(actor.name + 'は宿屋で寝た。');
                if (actor.hp === CHARACTERS[actor.name].maxHp) {
                    await log('しかし、これ以上回復できない！');
                } else {
                    let beforeHP = actor.hp;
                    await healEffect(actor);
                    actor.hp = Math.min(actor.hp + 100, CHARACTERS[actor.name].maxHp);
                    displayHPandSP();
                    await log(actor.name + 'のHPが' + beforeHP + 'から' + actor.hp + 'に回復！/次のターン行動できなくなった。');
                }
            }
            actor.turnSkip = true;
            break;
    }
}

export async function sharkenAction(dice, actor, target, isNakamu) {
    switch (dice) {
        case 1: // ナイフで敵を切り裂く
            await log(actor.name + 'はナイフで敵を切り裂いた！');
            await applyDamage(40, target);
            break;
        case 2: // 急所を狙った攻撃
            await log(actor.name + 'の急所を狙った攻撃！');
            await applyDamage(20, target);
            await log('サイコロを振り偶数が出れば40ダメージ！/ダイスを回してください。', true);
            playerDiceButton.innerText = "回す";
            enemyDiceButton.innerText = "回す";
            if (actor === state.player) {
                buttonAble(1);
            } else if (actor === state.enemy) {
                buttonAble(2);
            }
            playerDiceButton.style.pointerEvents = 'auto';
            enemyDiceButton.style.pointerEvents = 'auto';
            let currentNum = await rollDice();
            buttonAble(0);
            playerDiceButton.style.pointerEvents = 'none';
            enemyDiceButton.style.pointerEvents = 'none';
            await log("ダイスの出目: " + currentNum);
            if (currentNum % 2 === 1) {
                await log('奇数だったため、何も起こらなかった。');
            } else {
                await applyDamage(40, target);
            }
            break;
        case 3: // すれ違いざまの一撃
            await log(actor.name + 'のすれ違いざまの一撃！');
            if (isNakamu) {
                await applyDamage(30, target);
                await log('シャークんは奪ったお金をNakamuにあげた。/Nakamuのお金が3増えた！');
                state.nakamuCoins += 3;
            } else {
                const currentDamage3 = await applyDamage(30, target, (d) => target.name + 'に' + d + 'ダメージ！/お金が3増えた。');
                if (currentDamage3 === 0) {
                    await log(actor.name + 'のお金が3増えた。');
                }
                actor.spValue += 3;
            }
            break;
        case 4: // 雲隠れ
            await log(actor.name + 'の雲隠れ！');
            let sharkenMaxHp = isNakamu ? CHARACTERS['Nakamu'].maxHp : CHARACTERS[actor.name].maxHp;
            if (actor.hp === sharkenMaxHp) {
                await log('しかし、これ以上回復できない！');
            } else {
                let beforeHP = actor.hp;
                await healEffect(actor);
                actor.hp = Math.min(actor.hp + 20, sharkenMaxHp);
                displayHPandSP();
                await log(actor.name + 'のHPが' + beforeHP + 'から' + actor.hp + 'に回復！');
            }
            await log(actor.name + 'は次のターンに/受けるダメージを0にした！');
            actor.invincible = true;
            toggleCloudEffect(actor);
            break;
        case 5: // 高級な武器を購入
            await log(actor.name + 'は高級な武器を購入し、/それを使って攻撃した！');
            const coins = isNakamu ? state.nakamuCoins : actor.spValue;
            if (coins === 0) {
                await log('しかし、お金が無く/武器を購入できなかった！');
            } else {
                await log('お金×10ダメージ！');
                await applyDamage(coins * 10, target);
            }
            break;
        case 6: // イカサマ
            await log(actor.name + 'のイカサマ！');
            await log('次に自分が振るサイコロを/一度振り直すことができる！');
            state.isSharken6 = true;
            break;
    }
}

export async function kintokiAction(dice, actor, target, isNakamu) {
    switch (dice) {
        case 1: // 正拳突き
            await log(actor.name + 'の正拳突き！');
            await applyDamage(50, target);
            break;
        case 2: // マッハパンチ
            await log(actor.name + 'はマッハパンチを繰り出した！');
            await applyDamage(20, target);
            if (target.hp > 0) {
                await log(actor.name + 'はもう一度/ターンを行うことができる！');
                state.kintokiMoreTurn = true;
            }
            break;
        case 3: // カウンター
            await log(actor.name + 'のカウンター！');
            await log('最後に相手から受けた攻撃の/2倍のダメージを与える！');
            if (isNakamu) {
                if (state.nakamuBeforeDamage === 0) {
                    await log('しかし、Nakamuは/攻撃を与えられていなかった！');
                } else {
                    await applyDamage(state.nakamuBeforeDamage * 2, target);
                }
            } else {
                if (actor.spValue === 0) {
                    await log('しかし、きんときは/攻撃を与えられていなかった！');
                } else {
                    await applyDamage(actor.spValue * 2, target);
                }
            }
            break;
        case 4: // 痛み分け
            await log(actor.name + 'の痛み分け！');
            if (actor.hp < target.hp) {
                await applyDamage(target.hp - actor.hp, target);
            } else {
                if (actor.hp === target.hp) {
                    await log('HPが同じだったため、/何も起こらなかった。');
                } else {
                    await log('HPが相手より高いため、/何も起こらなかった。');
                }
            }
            break;
        case 5: // 決死の一撃
            await log(actor.name + 'の決死の一撃！');
            if (actor.hp <= 30) {
                await applyDamage(100, target);
            } else {
                await log('しかし、何も起こらなかった。');
            }
            break;
        case 6: // 挑発
            await log(actor.name + 'の挑発！');
            await log('次に相手が出す/サイコロの目を1として扱う！');
            state.isKintoki6 = true;
            break;
    }
}

export async function smileAction(dice, actor, target, isNakamu) {
    switch (dice) {
        case 1: // 闇の魔術
            await log(actor.name + 'は闇の魔術を詠唱した！');
            await applyDamage(50, target);
            break;
        case 2: // 凍てつく大地
            await log(actor.name + 'の凍てつく大地！');
            await applyDamage(40, target);
            await log('サイコロを振り4以上なら/次のターン相手は行動できない！');
            playerDiceButton.innerText = "回す";
            enemyDiceButton.innerText = "回す";
            await log('ダイスを回してください。', true);
            if (actor === state.player) {
                buttonAble(1);
            } else if (actor === state.enemy) {
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
                state.isSmile2 = true;
            }
            break;
        case 3: // 生命力吸収
            await log(actor.name + 'はドレイン魔法を放った！');
            await applyDamage(30, target);
            let smileMaxHp = isNakamu ? CHARACTERS['Nakamu'].maxHp : CHARACTERS[actor.name].maxHp;
            if (actor.hp === smileMaxHp) {
                await log('スマイルはこれ以上回復できない！');
            } else {
                let beforeHP = actor.hp;
                await healEffect(actor);
                actor.hp = Math.min(actor.hp + 30, smileMaxHp);
                displayHPandSP();
                await log(actor.name + 'のHPが' + beforeHP + 'から' + actor.hp + 'に回復！');
            }
            break;
        case 4: // 精神統一
            await log(actor.name + 'の精神統一！');
            await log('次のターンに受けるダメージを-20した。/魔力が3増えた。')
            actor.shieldDamage = 20;
            if (isNakamu) {
                state.nakamuMP += 3;
            } else {
                actor.spValue += 3;
            }
            break;
        case 5: // 魔力の奔流
            await log(actor.name + 'は自身の魔力を集め始めた！');
            if (actor.spValue === 0) {
                await log('しかし、スマイルの魔力は空っぽだった！');
            } else {
                await log('魔力×20のダメージ！');
                if (isNakamu) {
                    const currentDamage5 = await applyDamage(state.nakamuMP * 20, target);
                    if (currentDamage5 !== 0) {
                        await log('スマイルの魔力が0になった。');
                    }
                    state.nakamuMP = 0;
                } else {
                    const currentDamage5 = await applyDamage(actor.spValue * 20, target);
                    if (currentDamage5 !== 0) {
                        await log('スマイルの魔力が0になった。');
                    }
                    actor.spValue = 0;
                }
            }
            break;
        case 6: // 時の呪文を詠唱
            await log(actor.name + 'は時の呪文を詠唱した！');
            await log('次に相手が振るサイコロを/一度振り直させることができる！');
            state.isSmile6 = true;
            break;
    }
}

export async function kiriyanAction(dice, actor, target) {
    switch (dice) {
        case 1: // 鋭い爪で薙ぎ払う
            await log(actor.name + 'は鋭い爪で薙ぎ払った！');
            await applyDamage(60, target);
            break;
        case 2: // 火炎ブレス
            await log(actor.name + 'は激しい炎を吐き出した！');
            await applyDamage(30, target);
            if (state.isKiriyan2) {
                await log(target.name + 'はすでに火傷を負っている！');
            } else {
                actor.spValue = '<span style="color: red;"> ON </span>';
                await log(target.name + 'は火傷を負った。');
                state.isKiriyan2 = true;
            }
            break;
        case 3: // 魔王の眼光
            await log(actor.name + 'の魔王の眼光！');
            await applyDamage(10, target);
            if (actor.turn === '後攻') {
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
            if (actor === state.player) {
                buttonAble(1);
            } else if (actor === state.enemy) {
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
            await applyDamage(50, target);
            await log(target.name + 'の次ターンの出目が裏返される！');
            state.isKiriyan5 = true;
            break;
        case 6: // 丸飲み
            if (actor.marunomi === false) {
                await log(actor.name + 'は大きく口を開けた！');
                await log('次の自分のターンに6が出たら/相手のHPを0にする！');
                actor.marunomi = true;
            } else {
                await log(actor.name + 'は' + target.name + 'を丸飲みした！');
                let currentDamage6 = target.hp;
                await attackEffect(target);
                damageEffect(target);
                showDamagePopup(target, currentDamage6);
                target.hp -= currentDamage6;
                displayHPandSP();
                await log(target.name + 'のHPが0になった。');
                actor.marunomi = false;
            }
            break;
    }
}

export async function filterDamage(damage, target) {
    if (target.invincible) {
        await log(target.name + 'は隠れているため、/攻撃を与えられなかった！');
        target.invincible = false;
        return 0;
    } else {
        if (target.shieldDamage === 0) {
            return damage;
        } else {
            if (damage <= target.shieldDamage) {
                damage = 0;
                await log(target.name + 'は' + target.shieldDamage + 'ダメージ軽減したため、/ノーダメージだった。');
                if (target.name === 'Broooock') {
                    target.spValue = 0;
                }
                return damage;
            } else {
                damage -= target.shieldDamage;
                await log(target.name + 'は' + target.shieldDamage + 'ダメージ軽減した。');
                if (target.name === 'Broooock') {
                    target.spValue = 0;
                }
                return damage;
            }
        }
    }
}

export async function kintokiDamage(damage, target) {
    if (target.name === 'きんとき') {
        target.spValue = damage;
    } else if (target.name === 'Nakamu') {
        state.nakamuBeforeDamage = damage;
    }
}

export async function applyDamage(rawDamage, target, messageFn, options = {}) {
    if (options.animateAttack !== false) {
        await attackEffect(target);
    }

    const damage = await filterDamage(rawDamage, target);
    if (damage !== 0) {
        damageEffect(target);
        showDamagePopup(target, damage);
        target.hp = Math.max(0, target.hp - damage);
        displayHPandSP();
        const message = messageFn ? messageFn(damage) : (target.name + 'に' + damage + 'ダメージ！');
        await log(message);
        kintokiDamage(damage, target);
    }
    return damage;
}

export async function nakamu5Action(guest, actor, target) {
    const playerSummonIcon = document.getElementById('player-summon-icon');
    const enemySummonIcon = document.getElementById('enemy-summon-icon');
    const playerSummonDetail = document.getElementById('player-summon-detail');
    const enemySummonDetail = document.getElementById('enemy-summon-detail');

    const characters = {
        1: { name: 'Broooock', icon: 'img/cards/WarriorIcon.png', type: '戦士' },
        2: { name: 'シャークん', icon: 'img/cards/ThiefIcon.png', type: '盗賊' },
        3: { name: 'きんとき', icon: 'img/cards/FighterIcon.png', type: '武闘家' },
        4: { name: 'スマイル', icon: 'img/cards/MageIcon.png', type: '賢者' }
    };

    async function summonCharacter(playerNum, charId) {
        const char = characters[charId];
        if (playerNum === 1) {
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

    state.currentGuest = await summonCharacter(actor.playerNum, guest);

    await log('ダイスを回してください', true);
    if (actor === state.player) {
        buttonAble(1);
    } else if (actor === state.enemy) {
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

    if (actions[state.currentGuest]) {
        await actions[state.currentGuest](currentNum, actor, target, true);
    } else {
        console.error(`Action not found for currentGuest: ${state.currentGuest}`);
    }

    while (state.kintokiMoreTurn) {
        await log('きんときの追加ターン！/ダイスを回してください', true);
        if (actor === state.player) {
            buttonAble(1);
        } else if (actor === state.enemy) {
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
            state.kintokiMoreTurn = false;
        }
    }
    playerSummonIcon.style.display = 'none';
    playerSummonDetail.style.display = 'none';
    enemySummonIcon.style.display = 'none';
    enemySummonDetail.style.display = 'none';
    actor.name = 'Nakamu';
    // 召喚キャラの技(防御態勢・お金稼ぎ等)がactor.spValueを書き換えている場合があるため、
    // Nakamu自身のレベル値に復元する(復元しないとレベル表示が召喚キャラの値のまま残ってしまう)
    actor.spValue = state.nakamuLevel;
}
