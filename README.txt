TEPPEI VISION BOARD — 朝のアファメーション（通常版）
=====================================================

■ これは何か
「見るビジョンボード」から、毎朝の自己設定と行動開始までを
1周で完結させるアプリ。文章・画像・色・高級感は従来のまま。

フロー：
  WAITING（タップで開始）
   → INTRO（呼吸リング 吸4秒/吐6秒・鳥アンカー 約20秒）
   → PLAYING（自声メインに合わせて15枚が進む）
   → ENDING（Peak-End 3フェーズ：もう決まってる！→約束→動くだけ）
   → ACTION（今日の一手＋実行意図＋コミットメント／端末に保存）
   → COMPLETE（完了。「もう一度見る」でだけ1枚目から再生）

無限ループは廃止。1周で終わる。


■ ファイル構成
  index.html            本体（画像はbase64埋め込み）
  sw.js                 Service Worker（オフライン用キャッシュ）
  manifest.json         PWA設定
  icons/                アプリアイコン（192 / 512）
  audio/
    main.m4a            自声アファメーション（差し替え可）
    bird.mp3            鳥の声アンカー（差し替え可）
  README.txt            これ


■ GitHub Pages で公開する（PWA・オフライン対応）
  1) このフォルダ一式をリポジトリへ push
  2) GitHub → Settings → Pages → Branch=main / root を選んで保存
  3) 発行された https://＜ユーザー名＞.github.io/＜リポジトリ＞/ を開く
     ※ PWA・Service Worker は https でないと動かない。GitHub Pagesはhttps。
  4) Android Chrome：メニュー →「アプリをインストール／ホーム画面に追加」
  5) 一度オンラインで開けば、以降はオフラインでも再生できる

  ※ ローカルの file:// で直接開くと Service Worker と音声読込が制限される。
    手元確認は簡易サーバ推奨：
        python3 -m http.server 8000
    → http://localhost:8000/ を開く


■ 自声を録り直したとき（同期の精度を上げる）
  index.html の中の設定を2か所いじるだけ。

  1) VOICE_DUR（自声の秒数）
        var VOICE_DUR = 87.5;   ← 実際の秒数に変更

  2) CUES（各スライドを出す秒。任意・精度アップ用）
        var CUES = null;        ← いまは声の長さを15等分（暫定）
     文や息継ぎの区切りに合わせたいときは、15個の秒を入れる：
        var CUES = [0, 5.8, 11.4, 17.0, 22.5, 28.0, 33.6, 39.2,
                    44.8, 50.4, 56.0, 61.6, 67.2, 72.8, 80.0];
     録り直しても、この配列を差し替えるだけで再同期できる。


■ 音声が読めない場合
  ネット未接続などで音声が読めなくても、画面は止まらず静音で進行する。


■ あとで「単一HTML（俺専用）」にしたいとき
  audio/ の2ファイルをbase64にして index.html の
      <audio id="voice" src="audio/main.m4a" ...>
      <audio id="bird"  src="audio/bird.mp3" ...>
  の src を data:URI に差し替えるだけ。ロジックは一切変えなくてよい。
  （販売版は分割構成のままが軽くておすすめ）


■ 保存されるデータ（この端末のみ・非破壊）
  localStorage:
    tvb_YYYYMMDD  … その日の一手/いつ/どこで/宣言フラグ
    tvb_last      … 最後に宣言した日付
