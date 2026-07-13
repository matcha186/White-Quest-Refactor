# White Quest バグ調査レポート

`script.js`（全2054行）を中心に静的読解でバグを洗い出した結果をまとめています。
ブラウザでの実動作確認はしていないため、「間違いなくバグ」というものと「条件次第で起きる可能性が高いもの」が混在します。それぞれ再現条件と根拠を書いているので、直すときの判断材料にしてください。

## 目次

- [A. ロジック / ゲームプレイに影響するバグ](#a-ロジック--ゲームプレイに影響するバグ)
  1. [`npcBattle()` のループ条件が `||`](#1-npcbattle-のループ条件が-)
  2. [`broooockAction` の暗黙グローバル変数](#2-broooockaction-case5-の暗黙グローバル変数)
  3. [`decideTurn()` の宣言漏れ](#3-decideturn-の-turndecidebutton-も同じ宣言漏れ)
  4. [`setChara()` のコピペミス](#4-setchara-内のコピペミス)
  5. [`kintokiAction()` が被ダメ記録を更新しない](#5-kintokiaction-が一度も-kintokidamage-を呼ばない)
  6. [「痛み分け」がシールド/無敵を無視する](#6-きんとき痛み分け-case4-が-filterdamage-を経由しない)
  7. [「丸飲み」の即死ギミックが発動不可能](#7-きりやん丸飲み-case6-の即死ギミックが実質発動不可能)
  8. [召喚シャークんの無敵が機能しない](#8-nakamuがシャークんを召喚しても雲隠れの無敵が機能しない)
  9. [召喚中のSP表示が壊れる](#9-nakamu召喚中のsp欄表示バグ)
  10. [お金0円時の誤ったログ表示](#10-シャークん高級な武器を購入-case5-のお金0時の誤表示)
  11. [`replay()` のリセット漏れ](#11-replay-と-returntop-のリセット漏れ)
  15. [Nakamu召喚時の回復がHPを削ってしまう（実装中に追加発見）](#15-nakamu召喚時シャークん雲隠れスマイル生命力吸収の回復がhpを削ってしまうことがある実装中に追加発見修正済み)
  16. [「盾で防ぎながらの攻撃」の防御バフ抜け（実装中に追加発見）](#16-nakamuの盾で防ぎながらの攻撃がシールドで完全ブロックされると防御バフ自体も発動しない実装中に追加発見修正済み)
  17. [きりやんの火傷ダメージの対象間違い（実装中に追加発見）](#17-きりやんの火傷継続ダメージが火傷を負った本人ではなくきりやん側の防御状態を参照していた実装中に追加発見修正済み)
  18. [友情コンボ後のレベル表示汚染（実装中に追加発見）](#18-nakamuの友情コンボ終了後召喚キャラのステータス変化がnakamu自身のレベル表示に残ってしまう実装中に追加発見修正済み)
- [B. タイポ・表示上の軽微なバグ](#b-タイポ表示上の軽微なバグ)
  12. [`<lavel>` タイポ](#12-indexhtml39-の-lavel-タイポ)
  13. [ダイスボタンのイベントリスナー蓄積](#13-rolldice-がクリックリスナーを毎ターン追加し続ける)
  14. [HPがマイナス表示になりうる](#14-hp表示がマイナス値になりうる)
- [C. コードスタイル・設計面の指摘](#c-コードスタイル設計面の指摘)
- [D. まとめの設計改善提案](#d-まとめの設計改善提案)

---

## A. ロジック / ゲームプレイに影響するバグ

### 1. `npcBattle()` のループ条件が `||`

**該当箇所**: `script.js:432`

```js
while (player.hp > 0 || enemy.hp > 0) {
    await turnStart();
}
```

同じ役割の `enemyBattle()`（440行目）は正しく次のように書かれています。

```js
while (player.hp > 0 && enemy.hp > 0) {
```

**原因**: `||` だと「どちらか片方でも生きていれば続行」という条件になり、両者のHPが同時に0以下にならない限りループが終わりません。本来は「両方生きている間は続行」＝`&&`が正しい。

**現状の影響**: `playMode` は108行目で `let playMode = 1;` と固定され、コード中のどこでも再代入されていません。`playMode == 2` のときに呼ばれる `npcBattle()` は現状**呼び出されることがない未到達コード**です。また `turnStart()` という関数自体も定義されていません（`turnStartEnemy()` の呼び間違いと思われる）。つまりこの関数は現状「動かして初めて気づく」二重のバグを抱えたまま放置されています。CPU対戦モードを実装・有効化する際に必ず作り直しが必要です。

**修正方法**:

```js
while (player.hp > 0 && enemy.hp > 0) {
    await turnStartEnemy(); // turnStart() は未定義なので存在する関数に合わせる
}
```

---

### 2. `broooockAction` case5 の暗黙グローバル変数

**該当箇所**: `script.js:1279`

```js
case 5: // 捨て身の攻撃
    await log(actor.name + 'の捨て身の攻撃！');
    actor.hp -= 20;
    await damageEffect(actor);
    displayHPandSP();
    await log(actor.name + 'は20ダメージを受けた。');
    currentDamage5 = await filterDamage(70, target);   // ← let/const が無い
```

同じ関数の他のケースはすべて `let currentDamageN = ...` の形で宣言していますが、ここだけ宣言キーワードが抜けています。

**原因**: JavaScriptは非strictモードだと、宣言なしで変数に代入すると自動的に `window.currentDamage5` のようなグローバル変数を作ってしまいます（`'use strict'` がこのファイルには一切無いため、エラーにならず静かに実行される）。

**現状の影響**: 今のところ他に `currentDamage5` という名前を使っている場所が無いので実害はまだ表面化していませんが、今後別の関数でうっかり同名のローカル変数を使うと、意図せず値を共有してしまうバグの温床になります。

**修正方法**:

```js
let currentDamage5 = await filterDamage(70, target);
```

あわせてファイル冒頭に `'use strict';` を入れておくと、今後同種のミスをした瞬間に `ReferenceError` で気づけるようになります。

---

### 3. `decideTurn()` の `turnDecideButton` も同じ宣言漏れ

**該当箇所**: `script.js:873`

```js
function decideTurn() {
    turnDecideButton = document.getElementById('turn-decide-button');
```

**原因・影響**: 上記②とまったく同じパターン（暗黙グローバル）です。ファイル全体を検索した限りこの2箇所が該当しました。個別の実害は薄いですが、`'use strict'` が無いことの弊害が2箇所で実際に出ているという事実として、根本原因（①strictモード無し ②宣言忘れをチェックする仕組みが無い）をセットで直すべき例です。

**修正方法**:

```js
function decideTurn() {
    const turnDecideButton = document.getElementById('turn-decide-button');
```

---

### 4. `setChara()` 内のコピペミス

**該当箇所**: `script.js:723-724`

```js
case 'シャークん':
    enemy.job = '盗賊';
    enemy.hp = 150;
    enemy.hp = 150;   // ← 同じ行が2回
    enemy.spName = 'お金: ';
```

**原因**: `player` 用のswitch文をコピーして `enemy` 用に書き換えた際、1行消し忘れたと思われます。

**現状の影響**: 同じ値を2回代入しているだけなので実害はありません。ただし「コピペで書き換えた後に消し忘れる」というミスの実例なので、`setChara()` の2つの並行switch文（`player` 用・`enemy` 用）が丸ごと重複しているという設計自体を見直す動機として扱ってください（→ [D章](#d-まとめの設計改善提案) のデータテーブル化提案）。

**修正方法**: 重複行を削除するだけで十分ですが、根本対策は D章を参照。

---

### 5. `kintokiAction()` が一度も `kintokiDamage()` を呼ばない

**該当箇所**: `script.js:1441-1534`（きんときのアクション関数全体）

他の全キャラクターのアクション関数（`nakamuAction`, `broooockAction`, `sharkenAction`, `smileAction`, `kiriyanAction`）は、ダメージを与えた直後に必ず次の1行を呼んでいます。

```js
kintokiDamage(currentDamage, target);
```

ところが `kintokiAction()` の5つのダメージケース（正拳突き・マッハパンチ・カウンター・痛み分け・決死の一撃）は、どれもこの呼び出しをしていません。

**原因**: `kintokiDamage()`（script.js:1831-1837）は次のような、被ダメージ側のキャラクター名で分岐する関数です。

```js
async function kintokiDamage(damage, target) {
    if (target.name == 'きんとき') {
        target.spValue = damage; // きんときの「被ダメ」表示・カウンター用の値
    } else if (target.name == 'Nakamu') {
        nakamuBeforeDamage = damage; // Nakamuのカウンター用の値
    }
}
```

きんとき自身のアクション関数からだけ、この呼び出しが漏れています。単純な実装漏れです。

**現状の影響**:
- きんとき（本人、または召喚されたきんとき）が別のきんときを攻撃しても、相手の `spValue`（被ダメ表示・「カウンター」case3で使う値）が更新されない
- きんとき（本人、または召喚されたきんとき）がNakamuを攻撃しても `nakamuBeforeDamage` が更新されず、Nakamuが後でカウンター系の効果を使う際に「攻撃を受けていない」扱いになってしまう

**修正方法**: 各ダメージ処理の直後に他の関数と同様の1行を追加します。例えば case1（正拳突き）：

```js
case 1: // 正拳突き
    await log(actor.name + 'の正拳突き！');
    let currentDamage = await filterDamage(50, target);
    if (currentDamage != 0) {
        await damageEffect(target);
        target.hp -= currentDamage;
        displayHPandSP();
        await log(target.name + 'に' + currentDamage + 'ダメージ！');
        kintokiDamage(currentDamage, target); // ← 追加
    }
    break;
```

同様に case2・case3・case4・case5 のダメージ処理にもそれぞれ追加してください。

---

### 6. きんとき「痛み分け」(case4) が `filterDamage()` を経由しない

**該当箇所**: `script.js:1498-1513`

```js
case 4: // 痛み分け
    await log(actor.name + 'の痛み分け！');
    if(actor.hp < target.hp) {
        let currentDamage4 = target.hp - actor.hp;
        await damageEffect(target);
        target.hp -= currentDamage4;   // ← filterDamage() を通していない
        displayHPandSP();
        await log(target.name + 'に' + currentDamage4 + 'ダメージ！');
    } else {
        ...
    }
    break;
```

**原因**: このゲームの全ダメージ処理は本来 `filterDamage(damage, target)` を経由することで、Broooockの「防御態勢」（shieldDamage）やシャークんの「雲隠れ」（invincible）による軽減・無効化を反映する設計になっています。「痛み分け」だけ `target.hp -=` を直接書いてしまっており、このルールから漏れています。

**現状の影響**: 相手がBroooockの防御態勢中（次のダメージを-50する状態）やシャークんの雲隠れ中（次のダメージを0にする状態）でも、「痛み分け」のダメージは無条件に貫通してしまいます。他の全技が防御・無敵を尊重するのに、この技だけ貫通するのはバランス上も明らかに意図しない挙動です。

**修正方法**:

```js
case 4: // 痛み分け
    await log(actor.name + 'の痛み分け！');
    if (actor.hp < target.hp) {
        let rawDamage = target.hp - actor.hp;
        let currentDamage4 = await filterDamage(rawDamage, target);
        if (currentDamage4 != 0) {
            await damageEffect(target);
            target.hp -= currentDamage4;
            displayHPandSP();
            await log(target.name + 'に' + currentDamage4 + 'ダメージ！');
            kintokiDamage(currentDamage4, target); // ⑤の修正とあわせて
        }
    } else {
        ...
    }
    break;
```

---

### 7. きりやん「丸飲み」(case6) の即死ギミックが実質発動不可能

**該当箇所**: `script.js:1736-1749`（技本体）と `script.js:595-601`（毎ターン終了時のリセット処理）

技の意図（コード中のログ文言より）:

> 1回目: 「次の自分のターンに6が出たら相手のHPを0にする！」→ `actor.marunomi = true`
> 2回目（自分の次のターンで再度6が出たら）: 相手を丸飲みしてHP0にする

```js
case 6: // 丸飲み
    if (actor.marunomi == false) {
        await log(actor.name + 'は大きく口を開けた！');
        await log('次の自分のターンに6が出たら/相手のHPを0にする！');
        actor.marunomi = true;
    } else {
        // 丸飲み実行（相手のHPを0にする）
        ...
    }
    break;
```

ところが `turnStartEnemy()` は**毎ターンの終わりに必ず**次の処理を実行します。

```js
otherActor.invincible = false;
otherActor.marunomi = false;   // ← 無条件で毎ターンリセット
```

**原因**: このゲームは1対1で手番が厳密に交互に回るため、きりやんが「丸飲み」で `marunomi = true` にした直後は必ず「相手の手番」が挟まります。その相手の手番が終わった瞬間、きりやんは `otherActor`（今の手番ではない側）に該当するため、上記コードによって `marunomi` が問答無用で `false` に戻されます。きりやん自身の次の手番が来る前に、必ずこのリセットが先に走ってしまう順序になっています。

`invincible`（シャークんの雲隠れ）も同じ行で一緒にリセットされていますが、こちらは「セットした本人が“次の相手の攻撃”を1回だけ防ぐ」という設計なので、このタイミングでのリセットで正しく動きます。`marunomi` だけ「自分の次の自分の手番まで保持したい」という別の設計意図なのに、同じリセットのタイミングに巻き込まれてしまっているのが根本原因です。

**現状の影響**: 通常のプレイフローでは、丸飲みの即死ギミック（2回目の6）に**絶対に到達できません**。実質的に「丸飲みは常に1回目の演出だけで終わる、当たり判定のない技」になっています。おそらく実装時に想定していなかった重大な仕様バグです。

**修正方法**: `marunomi` は「相手の手番によるリセット対象」から外し、きりやん自身の手番の中で消費（または明示的にリセット）するようにします。例えば `otherActor.marunomi = false;` の行を削除し、代わりに丸飲み実行時（2回目のcase6の中）で使い終わったら `false` に戻す形にします。

```js
// turnStartEnemy() 側
otherActor.invincible = false;
// otherActor.marunomi = false;  ← この行を削除

// kiriyanAction() 側
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
        actor.marunomi = false; // ここで明示的にリセット
    }
    break;
```

なお、きりやんが「1」を立てた後に他の技（1〜5）を使った場合や、複数ターンにまたがって温存する場合にどう扱うか（そのターンで丸飲みしなければ効果が消えるのか、ずっと持ち越すのか）は元の仕様意図を確認して決めてください。上の修正は「消費されるまで保持し続ける」実装です。

---

### 8. Nakamuがシャークんを召喚しても「雲隠れ」の無敵が機能しない

**該当箇所**: `filterDamage()` の無敵判定（`script.js:1804`）と `nakamu5Action()` 内の名前の一時書き換え・復元（`script.js:1887`, `1922`）

`filterDamage()` の無敵チェックは次のように、フラグだけでなくキャラクター名まで固定でチェックしています。

```js
async function filterDamage(damage, target) {
    if (target.invincible && target.name == 'シャークん') {
        await log('シャークんは隠れているため、/攻撃を与えられなかった！');
        target.invincible = false;
        return 0;
    }
    ...
}
```

一方 `nakamu5Action()`（Nakamuの「友情コンボ」で他キャラを1ターンだけ借りる技）は、召喚中だけ `actor.name` を一時的に書き換え、処理が終わったら元に戻します。

```js
actor.name = characters[guest].name; // 例: 'シャークん' に一時変更
...
await actions[currentGuest](currentNum, actor, target, true);
...
actor.name = 'Nakamu'; // ← ここで元に戻す（同じ関数の最後）
```

**原因**: シャークんの「雲隠れ」（`sharkenAction` case4）は `actor.invincible = true;` をセットするだけで、この効果は召喚中の1ターンではなく**次の相手のターン**に発動するのが正しい流れです。しかし `nakamu5Action()` は召喚アクションが終わった時点（＝相手のターンが来るより前）で `actor.name` を `'Nakamu'` に戻してしまうため、実際に攻撃を受ける相手のターンの時点では `target.name` はすでに `'Nakamu'` になっており、`filterDamage()` の `target.name == 'シャークん'` に一致しません。結果として無敵フラグ (`invincible`) はONのままなのに、名前判定に阻まれてダメージが素通りします。

**現状の影響**: Nakamuの友情コンボでシャークんを呼び「雲隠れ」（4の目）を引いても、次の相手ターンで普通にダメージを受けてしまいます。本家シャークんが直接プレイする場合はこの問題は起きません（名前が最初から`'シャークん'`のまま変わらないため）。

**修正方法**: 無敵判定からキャラクター名の縛りを外し、フラグだけで判定するのが一番シンプルです。

```js
async function filterDamage(damage, target) {
    if (target.invincible) {
        await log((target.name == 'シャークん' ? 'シャークん' : target.name) + 'は隠れているため、/攻撃を与えられなかった！');
        target.invincible = false;
        return 0;
    }
    ...
}
```

（ログ文言を誰が呼んでも自然になるよう調整するか、あるいは「雲隠れ」を使ったキャラ名を別変数で覚えておいてログに使う、といった対応も可能です。）

---

### 9. Nakamu召喚中のSP欄表示バグ

**該当箇所**: `displayHPandSP()`（`script.js:1753-1801`）

```js
if (player.name == 'Nakamu' || isNakamuSummon == 1) {
    if (player.spValue == 1) {
        playerSPText.innerHTML = player.spName + '<span style="color: white;">' + player.spValue + '(+' + ((nakamuLevel - 1) * 10) + ')' + '</span>';
    } else if (player.spValue == 2) {
        ...
    } else if (player.spValue == 3) {
        ...
    } else if (player.spValue >= 4) {
        ...
    }
    // ← spValue が 0 のときに一致する分岐が無い
} else {
    ...
}
```

**原因**: この色分け表示は本来「Nakamu自身のレベル（`spValue = nakamuLevel`、最小値1）」専用に作られたロジックで、`1/2/3/4以上` の4パターンしか用意されていません。ところが条件式が `player.name == 'Nakamu' || isNakamuSummon == 1` となっているため、**Nakamuが誰かを召喚している間もこの分岐がそのまま使われます**。召喚可能な4人のうちBroooock（`spValue`＝軽減値、初期0）ときんとき（`spValue`＝被ダメ値、初期0）は `spValue` が0からスタートするため、どの分岐にも一致せず `innerHTML` の更新が丸ごとスキップされます。

**現状の影響**:
- 召喚直後（Broooock/きんときの`spValue`が0の間）はSP欄の表示が更新されず、召喚前の古い表示のまま固まる
- `spValue` が1〜3や4以上になった場合も、Nakamu用の「`(+レベルボーナス)`」という文言が、軽減値・被ダメ値には無関係な形でくっついて表示されてしまう（例:「軽減: 50(+0)」）

**修正方法**: 召喚中は召喚キャラクター本来の表示ロジック（`else` 側、きんときの赤字ハイライトなど）を使うようにし、Nakamu専用の色分け表示は `player.name == 'Nakamu'`（本人が実際にNakamuのとき）だけに絞ります。

```js
if (player.name == 'Nakamu' && isNakamuSummon != 1) {
    // Nakamu本人のレベル表示（従来どおり）
    ...
} else {
    // 召喚中も含め、通常のキャラクター表示ロジックを使う
    if (player.name == 'きんとき' || isNakamuSummon == 1 /* かつ召喚キャラがきんとき */) {
        ...
    } else {
        playerSPText.innerHTML = player.spName + player.spValue;
    }
}
```

（召喚中にどのキャラが呼ばれているかは `currentGuest` 変数で判定できます。表示仕様をどこまで作り込むかは好みですが、最低限「0のとき表示が固まる」バグだけは直す必要があります。）

---

### 10. シャークん「高級な武器を購入」(case5) のお金0時の誤表示

**該当箇所**: `script.js:1410-1432`

```js
case 5: // 高級な武器を購入
    await log(actor.name + 'は高級な武器を購入し、/それを使って攻撃した！');
    await log('お金×10ダメージ！');
    if (isNakamu) {
        let currentDamage5 = await filterDamage(nakamuCoins * 10, target);
        ...
    } else {
        let currentDamage5 = await filterDamage(actor.spValue * 10, target); // spValue=0でも素通し
        ...
    }
    break;
```

比較として、同じ構造を持つスマイルの「魔力の奔流」(`smileAction` case5, script.js:1612-1642) には次のガードがあります。

```js
case 5: // 魔力の奔流
    await log(actor.name + 'は自身の魔力を集め始めた！');
    if (actor.spValue == 0) {
        await log('しかし、スマイルの魔力は空っぽだった！');
    } else {
        ...
        let currentDamage5 = await filterDamage(actor.spValue * 20, target);
        ...
    }
    break;
```

**原因**: `filterDamage(damage, target)` は「ダメージが0かどうか」と「シールドで軽減されて0になったかどうか」を区別せず、渡された `damage` が0であればそのまま `return 0`（かつ相手にシールドが立っていれば「軽減してノーダメージだった」という文言を出す分岐に入ってしまう）という作りになっています。スマイル側は `spValue == 0` を事前にチェックして「空っぽだった」ログを出し、`filterDamage` の呼び出し自体をスキップしているためこの問題を回避できていますが、シャークんの同種処理にはこのガードがありません。

**現状の影響**: シャークんの所持金が0円のときに「高級な武器を購入」を使い、かつ相手がその時点でシールド（`shieldDamage > 0`）を持っている場合、`filterDamage(0, target)` が「シールドで軽減してノーダメージだった」という**事実と異なる**ログを出します（本当はお金が無かっただけ）。

**修正方法**: スマイル側と同じガードを追加します。

```js
case 5: // 高級な武器を購入
    await log(actor.name + 'は高級な武器を購入し、/それを使って攻撃した！');
    const coins = isNakamu ? nakamuCoins : actor.spValue;
    if (coins == 0) {
        await log('しかし、お金が無く/武器を購入できなかった！');
    } else {
        await log('お金×10ダメージ！');
        let currentDamage5 = await filterDamage(coins * 10, target);
        if (currentDamage5 != 0) {
            await damageEffect(target);
            target.hp -= currentDamage5;
            displayHPandSP();
            await log(target.name + 'に' + currentDamage5 + 'ダメージ！');
            kintokiDamage(currentDamage5, target);
        }
    }
    break;
```

---

### 11. `replay()` と `returnTop()` のリセット漏れ

**該当箇所**: `replay()`（`script.js:1925-1946`）、`returnTop()`（`script.js:1948-2009`）

どちらも「次の試合のためにグローバル変数を手作業で1個ずつ初期値に戻す」という同じ目的の関数ですが、リセットしている変数のリストが食い違っています。`returnTop()` には次のような行があります。

```js
nakamuBeforeDamage = 0;

player.shieldDamage = 0;
player.turnSkip = false;
player.invincible = false;
player.marunomi = false;
enemy.shieldDamage = 0;
enemy.turnSkip = false;
enemy.invincible = false;
enemy.marunomi = false;
```

ところが `replay()` にはこれらの行が**1つもありません**。`replay()` がリセットしているのは `nakamuLevel`, `isNakamuChoice`, `nakamuCoins`, `nakamuMP`, `isSharken6` 系のフラグ群と `turnCount` のみです。

**原因**: 恐らく `returnTop()` を書いたあとに追加で気づいた項目を `returnTop()` にだけ書き足し、先に存在していた `replay()` 側への反映を忘れたと考えられます（2つの関数で同じ内容を別々にメンテナンスしていることそのものが原因）。

**現状の影響**: 「同じキャラでリプレイ」ボタン（`replay()`）を使った場合、前の試合の終了時点で `player`/`enemy` の `shieldDamage`（被ダメ軽減）・`turnSkip`（行動不能）・`invincible`（無敵）・`marunomi`（丸飲み待機）・`nakamuBeforeDamage`（Nakamuの被ダメ記録）が**そのまま次の試合に持ち越されます**。例えば「前の試合の最終ターンでBroooockが防御態勢（`shieldDamage = 50`）を使って試合が終わった直後にリプレイした」場合、新しい試合の最初のダメージが理由もなく軽減される、といった不具合が起こり得ます。

**修正方法**: 一番安全なのは、`returnTop()` が持っているリセット処理を丸ごと `replay()` からも呼べる共通関数に切り出すことです。

```js
function resetBattleState() {
    nakamuBeforeDamage = 0;

    player.shieldDamage = 0;
    player.turnSkip = false;
    player.invincible = false;
    player.marunomi = false;
    enemy.shieldDamage = 0;
    enemy.turnSkip = false;
    enemy.invincible = false;
    enemy.marunomi = false;
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
    resetBattleState(); // ← 追加
    setChara();
    turnCount = 1;
    playerIcon.style.opacity = '1';
    enemyIcon.style.opacity = '1';
    enemyBattle();
}
```

`returnTop()` 側も同じ `resetBattleState()` を呼ぶ形に置き換えれば、以後この2つの関数のリセット項目が二度とズレなくなります（→ D章の「単一リセット関数」提案そのものです）。

---

### 15. Nakamu召喚時、シャークん「雲隠れ」・スマイル「生命力吸収」の回復がHPを削ってしまうことがある（実装中に追加発見・修正済み）

**該当箇所**: `sharkenAction` case4（雲隠れ）、`smileAction` case3（生命力吸収）

Broooockの「宿屋で睡眠」(case6) は次のように、Nakamuが召喚した場合とBroooock本人の場合とで回復の上限HPを分けています。

```js
if (isNakamu) {
    // Nakamu本人の最大HP(170)を基準に回復させる
    actor.hp = Math.min(actor.hp + 100, 170);
} else {
    // Broooock本人の最大HP(180)を基準に回復させる
    actor.hp = Math.min(actor.hp + 100, 180);
}
```

ところが同じ「Nakamuに召喚されて回復技を使う」ケースを持つシャークん（雲隠れ）とスマイル（生命力吸収）には、この `isNakamu` による分岐が実装されておらず、常に自分自身（シャークん150 / スマイル140）の最大HPで固定してキャップしていました。

**原因**: `nakamu5Action()` はNakamuの実体（`actor.hp`）を保ったまま `actor.name` だけを一時的に召喚キャラ名へ書き換える仕組みです。Nakamu本人の最大HPは170とシャークん(150)・スマイル(140)より高いため、Nakamuの現在HPが151〜170（雲隠れの場合）や141〜170（生命力吸収の場合）の状態でこれらの技を使うと、`Math.min(actor.hp + 回復量, 150または140)` の計算結果が召喚キャラの上限に強制的に切り下げられ、**回復のはずが実際にはHPが減ってしまう**という実害のあるバグでした。

**修正方法**: Broooockと同じ `isNakamu` 分岐を追加し、Nakamu召喚時はNakamu自身の最大HPを基準にするよう修正しました（`CHARACTERS['Nakamu'].maxHp` を参照）。

---

### 16. Nakamuの「盾で防ぎながらの攻撃」がシールドで完全ブロックされると防御バフ自体も発動しない（実装中に追加発見・修正済み）

**該当箇所**: `nakamuAction` case3（盾で防ぎながらの攻撃）

```js
if (currentDamage3_1 != 0) {
    ...
    actor.shieldDamage = 20; // ダメージが通った場合だけ防御バフが発動していた
    ...
} else {
    await log(actor.name + 'は次の相手ターンに受ける/ダメージを-20した。'); // ログでは発動したかのように表示されるが…
}
```

**原因**: `actor.shieldDamage = 20;`（次の相手ターンの被ダメージを-20する防御バフ）が `if` ブロックの中、つまり「攻撃のダメージが実際に通った場合」にしか実行されていませんでした。相手が既にシールドを張っていて攻撃が完全にブロックされた（`currentDamage3_1 == 0`）場合、`else` 側のログでは「ダメージを-20した」と表示されるにもかかわらず、実際には `actor.shieldDamage` が設定されず防御バフが発動していませんでした。

**影響**: この技は「盾で防ぎながら攻撃する」という名前の通り、攻撃と防御が本来セットの技です。攻撃がブロックされたケースでのみ防御側の効果が抜け落ちるという、ログ表示と実際の効果が食い違うバグでした。

**修正方法**: `actor.shieldDamage = 20;` を `if`/`else` の外に出し、ダメージが通ったかどうかに関わらず常に防御バフが発動するように修正しました。

---

### 17. きりやんの火傷継続ダメージが、火傷を負った本人ではなくきりやん側の防御状態を参照していた（実装中に追加発見・修正済み）

**該当箇所**: `turnStartEnemy()` 内の「きりやん火傷」処理

```js
if (isKiriyan2) { // きりやん火傷
    if (currentActor.name != 'きりやん') {
        await log(currentActor.name + 'は火傷による/継続ダメージを受けた！');
        let currentDamage = await filterDamage(10, otherActor); // ← otherActor(=きりやん側)を渡していた
        if (currentDamage != 0) {
            ...
            currentActor.hp -= currentDamage; // ダメージは currentActor(火傷を負った本人)に適用される
            ...
        }
    }
}
```

**原因**: 実際にダメージを受けるのは `currentActor`（火傷を負っている本人、その手番のプレイヤー）なのに、`filterDamage()` に渡すシールド軽減・無敵判定の対象が `otherActor`（火傷を負わせた側＝きりやん）になっていました。変数名の付け間違いによる典型的なコピペミスです。

**影響**: きりやん自身は自分に対してシールドや無敵を張る技を持たないため、通常プレイでは`filterDamage`の結果自体はほぼ変わらず（常に10ダメージがそのまま通る）実害が目立ちにくいバグでしたが、**本来は「火傷を負った本人が、その時点でBroooockの防御態勢やシャークんの雲隠れなどの効果を持っていれば、火傷ダメージも軽減されるべき」ところが、常に無視されて素通りしてしまう**という誤りでした。

**修正方法**: `filterDamage()` の対象を `otherActor` から `currentActor`（実際にダメージを受ける本人）に修正しました。

---

### 18. Nakamuの友情コンボ終了後、召喚キャラのステータス変化がNakamu自身のレベル表示に残ってしまう（実装中に追加発見・修正済み）

**該当箇所**: `nakamu5Action()` の末尾

```js
actor.name = 'Nakamu'; // nameだけ戻す
// actor.spValue はここで戻していなかった
```

**原因**: `nakamu5Action()` はNakamuの実体（`player`/`enemy` オブジェクト）の `.name` を一時的に召喚キャラ名へ書き換えて、そのキャラの技をそのまま実行する仕組みです。召喚キャラの技の中には自分自身の `actor.spValue` を書き換えるものが多くあります（例: Broooockの防御態勢は `actor.spValue = -50`、シャークんはお金を稼ぐと `actor.spValue += 3`、スマイルは魔力を使うと `actor.spValue = 0` 等）。ところが召喚が終わって `actor.name` を `'Nakamu'` に戻す際、`actor.spValue`（Nakamuの「レベル」表示に使われる値）は戻していませんでした。

**影響**: 友情コンボで誰か（特にBroooock・きんとき等、`spValue` が0や負の値になりうるキャラ）を召喚した後、Nakamu自身のSP欄が「レベル: 1」ではなく「レベル: -50」のような召喚キャラの残り値のまま表示され続けてしまいます（次にNakamuがレベルアップ技（6の目）を引くまで直りません）。

**修正方法**: `actor.name = 'Nakamu';` の直後に `actor.spValue = nakamuLevel;` を追加し、Nakamu本来のレベル値を明示的に復元するようにしました。

---

## B. タイポ・表示上の軽微なバグ

### 12. `index.html:39` の `<lavel>` タイポ

```html
<lavel for="log-speed-select">ログの速さ設定</lavel>
```

**原因**: `<label>` のタイプミス。`<lavel>` はHTMLの標準タグではないため、ブラウザは「未知のタグ」として中身のテキストだけをそのまま表示します（見た目上はほぼ違和感なく表示されてしまうため気づきにくい）。

**影響**: 本来の `<label for="...">` が持つ「ラベル文字列をクリックすると対応する `<select>` にフォーカスが移る」という機能が働きません。実用上の影響は小さいですが、アクセシビリティ・UX上の劣化です。

**修正方法**:

```html
<label for="log-speed-select">ログの速さ設定</label>
```

---

### 13. `rollDice()` がクリックリスナーを毎ターン追加し続ける

**該当箇所**: `script.js:957` 以降

```js
async function rollDice() {
    ...
    if (currentPlayer == 'player') {
        playerDiceButton.addEventListener('click', () => { ... });
    } else if (currentPlayer == 'enemy') {
        enemyDiceButton.addEventListener('click', () => { ... });
    }
    ...
}
```

`rollDice()` はダイスを振るたびに（＝ほぼ毎ターン）呼ばれる関数ですが、呼ばれるたびに新しい無名関数を `addEventListener` で追加するだけで、一度も `removeEventListener` していません。

対して、同じ「1回限りのクリック待ち」という構造を持つ `decideName()`（`script.js:373-374`）は正しく書けています。

```js
decideButton.removeEventListener('click', handleClick);
decideButton.addEventListener('click', handleClick);
```

**原因**: `rollDice()` の中のクリックハンドラが無名関数（`() => {...}`）なので、そもそも後から `removeEventListener` で狙って外すことができません（`removeEventListener` は登録時と同一の関数参照が必要です）。

**現状の影響**: 対戦が長引く（ターン数が増える）ほど、`playerDiceButton`/`enemyDiceButton` に登録されたクリックリスナーの数が増えていきます。1回のクリックで過去に登録された分すべてのハンドラが実行されるため、ダイスの「止める」操作をした瞬間に同じ処理が複数回走り、意図しない副作用（多重に`isDice = true`をセットする等、今回は実害が見えにくい作りですが）が起きるリスクがあります。ゲームが長時間・多ターンになるほど症状が顕在化しやすいタイプの不具合です。

**修正方法**: `decideName()` と同じパターンで、名前付き関数を使って明示的に外してから登録します。

```js
async function rollDice() {
    ...
    function onPlayerDiceClick() { /* 元のクリック処理 */ }
    function onEnemyDiceClick() { /* 元のクリック処理 */ }

    if (currentPlayer == 'player') {
        playerDiceButton.removeEventListener('click', onPlayerDiceClick);
        playerDiceButton.addEventListener('click', onPlayerDiceClick);
    } else if (currentPlayer == 'enemy') {
        enemyDiceButton.removeEventListener('click', onEnemyDiceClick);
        enemyDiceButton.addEventListener('click', onEnemyDiceClick);
    }
    ...
}
```

---

### 14. HP表示がマイナス値になりうる

**該当箇所**: 各キャラクターのダメージ処理全般（例: `script.js:1116` `target.hp -= currentDamage1;` など多数）

**原因**: ダメージを引く処理に下限クランプ（`Math.max(0, ...)`）が一切無いため、HPがぴったり0で止まらず、負の値（例:`-15`）になることがあります。

**影響**: 実害はほぼ無く、勝敗判定（`hp <= 0`）自体は負の値でも正しく機能します。ただし試合終了直前の1フレームで `HP: -15` のような表示が一瞬出る可能性があり、見た目の一貫性の問題として軽く触れておきます。

**修正方法**: 表示直前の `displayHPandSP()` で `Math.max(0, hp)` してから描画する、もしくはダメージ適用時に `target.hp = Math.max(0, target.hp - damage);` の形に統一する、のどちらかで対応できます。

---

## C. コードスタイル・設計面の指摘

ここからは「これがあるからゲームが壊れる」という直接的なバグではなく、**同じ種類のミスを今後も生みやすい書き方のクセ**です。上記A・Bのバグの多くは、実はここに挙げる根本原因のいずれかから派生しています。

1. **`var`/`let`/`const` の混在、`'use strict'` が無い**
   `rollDice()`（script.js:958付近）だけ `var` を使い、他は `let`/`const` です。またファイル全体に `'use strict';` の宣言がありません。strictモードが無いことで、②③の「宣言忘れによる暗黙グローバル」がエラーにならずすり抜けています。**まずファイルの先頭に `'use strict';` を1行足すだけで、今後同種のミスをした瞬間にコンソールでエラーとして検出できるようになります。**

2. **緩い等価演算子 `==`/`!=` の多用**
   ファイル全体で `==`/`!=` が約78箇所、`===`/`!==` が約22箇所という比率で、特に `turnStartEnemy()` に集中しています。今回のバグの直接原因にはなっていませんが、`==` は左右の型が違うときに暗黙変換が起きるため（例: `0 == ''` は `true`）、将来的な事故の火種になりやすいです。文字列・数値・真偽値の比較は基本的に `===`/`!==` に統一することを推奨します。

3. **グローバルミュータブル変数が30個近く存在する**
   `script.js:72-106` にかけて宣言されている `let` 変数（`currentChoice`, `isTurnEnd`, `isSharken6`, `isKintoki6`, `isSmile2`, `isKiriyan2` ...）はすべてトップレベルのグローバル変数で、ファイル内のどの関数からも自由に読み書きできます。⑦・⑪のバグのように「どのタイミングで誰が false に戻すか」が把握しづらくなっている根本原因です。

4. **`while (!flag) { await sleep(1); }` 形式のビジーウェイトが複数箇所にある**
   `isClick`（script.js:382）、`isTurnEnd`（script.js:591）、`isNakamuChoice`（script.js:1194）などで同じパターンが使われています。1ミリ秒間隔でひたすらポーリングし続けるのは動きはしますが無駄が多く、コードの意図も読み取りにくくなります。`promptReroll()`（script.js:624-642）がすでに「クリックされたら `resolve()` する」という正しいPromiseパターンで書かれているので、これを他の待機処理にも展開できます。

5. **最大HPなどのマジックナンバーが直書きされている**
   `actor.hp == 170`（Nakamu）、`== 180`（Broooock）、`== 150`（シャークん）...のように、各キャラクターの最大HPがコード中に散在しています。`setChara()` で一度セットした値を再利用する仕組みが無いため、将来HPバランスを調整するときに直し漏れが起きやすい状態です。

6. **未使用変数が残っている**
   `isKiriyan6`（script.js:102）と `logEnd`（script.js:77）は宣言されているだけで、値を読み取っている箇所がありません（`logEnd` は `returnTop()` で `false` に再代入されるだけ）。実装を試みて途中でやめた名残と思われます。使わないなら削除、使うつもりなら実装を仕上げるべきです。

7. **エラーハンドリング・null チェックが一切ない**
   ファイル全体で `try/catch` が使われておらず、`document.getElementById(...)` の戻り値も常にnullでない前提でそのまま使われています。今回の対象範囲では実害は見つかりませんでしたが、HTML側のid変更などがあった際にサイレントに壊れる（`TypeError: Cannot read properties of null` がコンソールに出るだけで画面は固まる）リスクがあります。

8. **2054行の単一ファイルに全部が同居している**
   状態管理・DOM参照・UI描画・ゲームロジック・キャラクター別アクションがすべて `script.js` 1ファイルに混在しており、見たい処理を探すだけでも一苦労になっています。D章でファイル分割の方向性を提案します。

---

## D. まとめの設計改善提案

個別の指摘とは別に、俯瞰した改善の方向性です。今回はリファクタリング自体は実施しておらず、あくまで次に手を入れるときの指針としてまとめています。

1. **キャラクターデータをテーブル化する**
   `setChara()`（script.js:644-807）は `player` 用・`enemy` 用でほぼ同一のswitch文を2つ並べており、④のようなコピペミスが起きやすい構造です。次のような1つのデータテーブルにまとめ、`player`/`enemy` 共通の関数で参照する形にすると、コピペそのものが不要になります。

   ```js
   const CHARACTERS = {
       'Nakamu':   { job: '勇者', maxHp: 170, spName: 'レベル: ', img: 'img/cards/HeroDetail.png', iconImg: 'img/cards/HeroIcon.png', firstDice: 'img/dice/dice1.png' },
       'Broooock': { job: '戦士', maxHp: 180, spName: '軽減: ',  img: 'img/cards/WarriorDetail.png', iconImg: 'img/cards/WarriorIcon.png', firstDice: 'img/dice/dice2.png' },
       // ...以下同様
   };

   function applyCharacter(actor, name) {
       const data = CHARACTERS[name];
       actor.name = name;
       actor.job = data.job;
       actor.hp = data.maxHp;
       actor.spName = data.spName;
       actor.img = data.img;
       actor.iconImg = data.iconImg;
       actor.firstDice = data.firstDice;
   }
   ```

   これで最大HPの参照元も1箇所にまとまるため、⑤の「マジックナンバー散在」も同時に解消できます（`actor.hp == CHARACTERS[actor.name].maxHp` のように書ける）。

2. **状態リセットを1つの関数に統一する**
   ⑪で説明した通り、`replay()`/`returnTop()` の食い違いは「同じ内容を2箇所で個別にメンテナンスしている」ことが根本原因です。ゲームの可変状態（`player`/`enemy` オブジェクトの戦闘系フィールドや、各種フラグ）を1つの `resetBattleState()`（提案済み、⑪参照）にまとめ、両方の関数から呼び出す形に統一してください。可能であれば、キャラクター別フラグ（`isSharken6`, `isKintoki6` など）も1つの `abilityFlags = {}` オブジェクトにまとめておくと、「リセットし忘れ」自体が構造的に起きにくくなります。

3. **ビジーウェイトをやめてPromiseベースの待機に統一する**
   `promptReroll()`（script.js:624-642）は理想的な書き方の実例としてすでにコード内にあります。

   ```js
   function promptReroll() {
       return new Promise((resolve) => {
           rerollButton.onclick = () => resolve(true);
           noRerollButton.onclick = () => resolve(false);
       });
   }
   ```

   `isClick`・`isTurnEnd`・`isNakamuChoice` を使ったポーリング待機も、同じ形（クリック時に `resolve()` を呼ぶPromiseを返す）に書き換えることで、`sleep(1)` の無限ループを無くせます。

4. **ダメージ処理は必ず `filterDamage()` を経由させる規約にする**
   ⑥・⑩で見たように、ダメージ処理が約20箇所に分散しているため、一部だけ `filterDamage()` を呼び忘れる／ガード漏れが起きています。理想的には「ダメージを与える」処理を1つの共通関数（例: `applyDamage(rawDamage, target)`）にまとめ、`filterDamage` によるシールド・無敵判定と `kintokiDamage` による被ダメ記録更新を**その関数の中で必ず両方実行する**ようにすれば、⑤・⑥のような「一部の技だけ呼び忘れる」バグが構造的に起きなくなります。

   ```js
   async function applyDamage(rawDamage, target) {
       const damage = await filterDamage(rawDamage, target);
       if (damage != 0) {
           await damageEffect(target);
           target.hp = Math.max(0, target.hp - damage);
           displayHPandSP();
           await log(target.name + 'に' + damage + 'ダメージ！');
           kintokiDamage(damage, target);
       }
       return damage;
   }
   ```

   各 `...Action()` 内のほぼ同じ4〜5行の繰り返し（`filterDamage` → `if != 0` → `damageEffect` → `target.hp -=` → `displayHPandSP` → `log` → `kintokiDamage`）をこの1関数の呼び出しに置き換えるだけで、コード量もかなり減らせます。

5. **将来的にはファイルを分割する**
   今回はリファクタリングの範囲外ですが、方向性として：
   - `state.js` … `player`/`enemy`/各種フラグなどのゲーム状態
   - `characters.js` … 上記1のキャラクターデータテーブル＋各 `...Action()`
   - `dice.js` … `rollDice()` まわり
   - `ui.js` … `log()`, `displayHPandSP()`, `damageEffect()` などのDOM操作
   - `main.js` … `game()`, `turnStartEnemy()` などの全体進行

   のように役割ごとに分けると、2054行を1画面で追いかける必要が無くなり、今回見つかったような「片方だけ直し忘れる」系のバグ自体が減っていきます（`<script type="module">` を使えばビルドツール無しでも分割可能です）。
