# White Quest Webアプリ化ロードマップ

`IMPROVEMENT_IDEAS.md` の全アイデアを実装順に並べたチェックリストです。フェーズ順に上から進めることを推奨します（後のフェーズほど前のフェーズの成果物に乗っかる設計にしています）。

## 目次

- [前提：開発環境の変更](#前提開発環境の変更)
- [フェーズ1：Vite導入＋ファイル分割](#フェーズ1vite導入ファイル分割)
- [フェーズ2：低コスト・高効果のUI改善](#フェーズ2低コスト高効果のui改善)
- [フェーズ3：エフェクトの共通化](#フェーズ3エフェクトの共通化)
- [フェーズ4：サイドメニュー・デバッグ整理](#フェーズ4サイドメニューデバッグ整理)
- [フェーズ5：ゲーム機能の追加](#フェーズ5ゲーム機能の追加)
- [フェーズ6：CPU対戦](#フェーズ6cpu対戦)
- [フェーズ7：スマホ対応・PWA化](#フェーズ7スマホ対応pwa化)
- [フェーズ8：仕上げ・デプロイ・回帰テスト](#フェーズ8仕上げデプロイ回帰テスト)

---

## 前提：開発環境の変更

**Viteを導入することを決定済み。** 理由：ファイル分割を本格的なESモジュールで行え、ホットリロード付きの開発サーバーが使え、PWA化も`vite-plugin-pwa`で大幅に楽になるため。

- 今後は `npm run dev` で起動するのが基本になる（`http://localhost:5173`）
- **`index.html` を直接ダブルクリックして開く運用はできなくなる**（ESモジュールはfile://で読み込めないため）
- 本番公開用のビルドは `npm run build` → `dist/` に出力

---

## フェーズ1：Vite導入＋ファイル分割

土台となるフェーズ。他の全フェーズはこの上に積む前提。

- [x] `package.json` / `vite.config.js` を新規作成（`npm create vite`のスキャフォールドは既存ファイルと衝突するため手動セットアップ）
- [x] `.gitignore` に `node_modules/` / `dist/` を追加
- [x] `img/`, `fonts/`, `icon.ico` を Viteの `public/` 配下に移動（同じ相対パスのまま配信されるので、画像パス文字列の書き換え不要）
- [x] `script.js`（2000行超）を `src/` 配下に機能別分割する
  - [x] `src/state.js` — `player`/`enemy`オブジェクト、`CHARACTERS`テーブル、`choiceLog`/`battleLog`/`charaNumArray`、全ての可変`let`フラグ群
  - [x] `src/characters.js` — 6キャラ分の`...Action()`関数、`applyCharacterData`/`initialSpValue`、`nakamu5Action`、`actions`マップ、`filterDamage`/`applyDamage`/`kintokiDamage`
  - [x] `src/dice.js` — `rollDice()`、`rollDiceLogic`、`onPlayerDiceClick`/`onEnemyDiceClick`、`diceRollState`、`promptReroll`
  - [x] `src/ui.js` — `log()`/`logClear()`、`displayHPandSP()`、`damageEffect()`/`healEffect()`、`toggleCloudEffect()`、`fadeOutDice`/`fadeInDice`、`updateCardDisplay`系、`buttonAble`、`preloadImages`
  - [x] `src/main.js` — `game()`/`choice()`/`decideName()`/`turnStartEnemy()`/`skipBroKiri()`/`enemyBattle()`/`npcBattle()`/`setChara()`/`resetBattleState()`/`replay()`/`returnTop()`/`randomDecide()`/`randomButtonEnter()`/`decideTurn()`、トップレベルのイベントリスナー登録一式（Viteのエントリポイント）
- [x] `index.html` の `<script src="script.js">` を `<script type="module" src="/src/main.js">` に変更
- [x] `index.html` に残る4つのinline `onclick`属性（`random-button`/`turn-decide-button`/`replay`/`top`）を`addEventListener`方式に置き換え、inline onclickを全廃する（ESモジュールはトップレベル関数を自動でグローバル化しないため）
- [x] `npm install` → `npm run dev` で起動確認

**動作確認**: `npm run dev`で起動し、キャラ選択〜1試合を通しプレイしてコンソールエラーが無いことを確認。既存のPlaywrightスモークテスト（キャラ選択→数ターン操作、出目固定での丸飲み検証など）を`http://localhost:5173`向けに再実施する。

---

## フェーズ2：低コスト・高効果のUI改善

`applyDamage()`という単一窓口があるおかげで、以下は少ない変更点で全キャラに一括適用できる。

- [x] キャラ選択ボタン等のホバー演出（`transition: transform`＋`:hover`でscale/浮き上がり）
- [x] 攻撃時のアニメーション（player側は右、enemy側は左へ少し動いて戻る。`applyDamage()`に1箇所フックを追加）
- [ ] ダメージ数値のポップアップ表示（「-40」がふわっと浮かんで消える。同じく`applyDamage()`にフック）
- [ ] HPゲージ（バー）表示化（現状のテキスト表示から、残量に応じて緑→黄→赤に変わるバーへ。`displayHPandSP()`を修正）

**動作確認**: 6キャラ分の攻撃技を一通り試し、演出が全キャラに一貫して適用されることを確認。

---

## フェーズ3：エフェクトの共通化

- [ ] シャークんの霧エフェクトをCSSの`radial-gradient`ベースに置き換え、`img/effects/cloud.png`（フリー素材）への依存を解消
- [ ] `toggleCloudEffect()`を一般化した`applyStatusEffect(actor, effectName)`のような共通関数を設計
- [ ] 他キャラの状態にも見た目を追加
  - [ ] きりやんの火傷（赤〜オレンジの揺らめくオーバーレイ）
  - [ ] スマイルの凍結（水色の結晶/霜オーバーレイ）
  - [ ] Broooockの睡眠（"Zzz..."が浮かんで消える）
  - [ ] きんときの被ダメ蓄積（拳アイコンが赤く光る）
  - [ ] シールド展開中（周囲に光の輪のパルス）

**動作確認**: 各状態異常・バフを実際に発生させ、見た目が正しく表示/消去されることを確認。

---

## フェーズ4：サイドメニュー・デバッグ整理

- [ ] 現状常時表示の`#debug`パネルを、開閉トグル式の左サイドメニューに変更
- [ ] オプション設定（ログ速度、後続フェーズで追加する音量設定など）と、デバッグ専用機能（ダイス目強制）をメニュー内でセクション分けする
- [ ] 本番公開時にデバッグ機能が一般プレイヤーに見えないようゲートする（例: `?debug=1`が無ければデバッグセクション非表示）

**動作確認**: サイドメニューの開閉、オプション変更の反映、`?debug=1`無しでデバッグ機能が隠れることを確認。

---

## フェーズ5：ゲーム機能の追加

- [ ] タイトル画面の実装（`index.html`に既にある空の`<div id="start-display"></div>`を活用。ロゴ＋「はじめる」ボタン等）
- [ ] バトルログの蓄積表示（現状は表示→クリアの繰り返し。下に積み上げて後から見返せるように）
- [ ] キャラクター図鑑・遊び方画面（対戦前に全キャラの6技をまとめて確認できる画面）
- [ ] 効果音・BGMの追加（ダイス音、ダメージ音、勝利ファンファーレ。素材ライセンスに注意）
- [ ] 対戦成績・セーブ機能（`localStorage`にキャラ別勝敗数を記録）
- [ ] 画面遷移のフェード（キャラ選択画面↔バトル画面の切り替えに`opacity`トランジション）
- [ ] ダイスの3D風回転演出（`transform: rotate3d()`等で回転感を強化）
- [ ] キャラクターのアイドルモーション（立ち絵にごくわずかな上下の揺れ）

**動作確認**: 各機能を単体で触り、既存の対戦フローを壊していないことを確認。

---

## フェーズ6：CPU対戦

骨組み（`playMode`変数、`npcBattle()`関数、CPU向けメッセージ、`decideTurn()`の`'CPU'`表示）は既に存在。以下を実装すれば完成する。

- [ ] `playMode`を`2`に切り替えるUI（キャラ選択画面に「CPU対戦」ボタン等を追加）
- [ ] CPU側のダイス確定タイミング（短いディレイ後に自動で"止める"を実行）
- [ ] CPU側のリロール判断（`promptReroll()`をランダムまたは固定ルールで自動選択）
- [ ] CPU側の友情コンボ相手選択（`nakamu5Action()`のキャラ選択ダイアログを自動選択）
- [ ] （余力があれば）CPUの強さ調整・簡単な戦略ルールの追加

**動作確認**: CPU対戦を選択し、人間側の操作無しでCPU側のターンが自動進行して1試合が最後まで終わることを確認。

---

## フェーズ7：スマホ対応・PWA化

Vite導入済みのため`vite-plugin-pwa`を活用できる。

- [ ] `#game-container`全体を固定サイズの「キャンバス」とみなし、画面幅に応じて`transform: scale()`で縮小表示するラッパーを追加（既存の絶対配置レイアウトを崩さない方式）
- [ ] リサイズ時にスケール値を再計算する処理を追加
- [ ] タッチ操作での操作性を確認（ホバー前提のUIが無いか点検）
- [ ] 192×192・512×512のPWA用PNGアイコンを用意（既存の`img/cards/*Icon.png`等を流用可）
- [ ] `vite-plugin-pwa`を導入し`manifest.json`とService Workerを自動生成
- [ ] 「ホーム画面に追加」の動作確認、オフライン起動の確認

**動作確認**: スマホ実機またはブラウザのデバイスエミュレーションで表示・操作を確認し、PWAとしてホーム画面に追加できることを確認。

---

## フェーズ8：仕上げ・デプロイ・回帰テスト

- [ ] デバッグ機能の本番非表示化が機能しているか最終確認（フェーズ4の`?debug=1`ゲート）
- [ ] `npm run build`で本番ビルドを作成し、`dist/`の内容を静的ホスティング（GitHub Pages / Netlify / Vercel等）にデプロイ
- [ ] デプロイ先URLでPWAインストール・オフライン動作を最終確認
- [ ] Playwrightでの回帰テストスイートを整理し、以降の機能追加時に流用できる形にまとめる（`npm run dev`のURLを固定的に叩けるようスクリプト化）

**動作確認**: デプロイ先URLに実機（PC・スマホ）からアクセスし、キャラ選択〜CPU対戦〜1試合終了までの一連の流れを通しで確認する。
