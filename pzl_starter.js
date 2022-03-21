// 変数の宣言
var block = [0, 0, 0, 1, 2, 3]; // 操作するブロックと次に落ちてくるブロック
var myBlockX; // マス目上のブロックの位置を管理
var myBlockY; // マス目上のブロックの位置を管理
var dropSpd; // ブロックの落下速度を管理する変数

var gameProc = 0; // 処理の流れを管理する変数
var gameTime = 0; // 時間の進行を管理する変数

var score = 0; // スコア
var rensa = 0; // 連鎖回数
var points = 0; // ブロックを消した時の得点
var eftime = 0; // ブロックを消す演出時間
var idx = 0; // 全体の処理の進行を管理する変数
var timer = 0; // 全体の時間の進行を管理
var hiscore = 0; // ハイスコアを保持
var extend = 0; // 条件を満たしたとき、増えるタイムの値を代入


var tapKey = [0, 0, 0, 0]; // タップ判定用の配列

// エフェクトを管理する変数の宣言
var RAINBOW = ['#ff0000', '#e08000', '#c0e000', '#00ff00', '#00c0e0', '#0040ff', '#8000e0'];
var EFF_MAX = 100;
var effX = new Array(EFF_MAX);
var effY = new Array(EFF_MAX);
var effT = new Array(EFF_MAX);
var effN = 0;
for(var i = 0;i < EFF_MAX;i++) effT[i] = 0;

// ゲーム開始時の値を代入
function initVar(){
  // ブロックの初期位置
  myBlockX = 4;
  myBlockY = 1;
  // 最初の落下速度
  dropSpd = 40;

  // 現在のブロック
  block[0] = 1;
  block[1] = 2;
  block[2] = 3;

  // 次のブロック
  block[3] = 2;
  block[4] = 3;
  block[5] = 4;

  gameProc = 0;
  gameTime = 30 * 60 * 3;
  score = 0;
}

// 起動時の処理
function setup(){
  canvasSize(960, 1200);
  loadImg(0, 'image/bg.png');
  var BLOCK = ['tako', 'wakame', 'kurage', 'sakana', 'uni', 'ika'];
  for(var i = 0;i < 6;i++){
    loadImg(1 + i, 'image/' + BLOCK[i] + '.png');
  }
  loadImg(7, 'image/title.png');
  initVar();
}

// メインループ
function mainloop(){
  timer++;
  drawPzl();
  drawEffect();
  switch(idx){
    // タイトル画面
    case 0:
      drawImgC(7, 480, 400);
      if(timer % 40 < 20) fText('TAP TO START.', 480, 680, 80, 'pink');
      if(key[32] > 0 || tapC > 0){
        clrBlock();
        initVar();
        idx = 1;
        timer = 0;
      }
      break;

    // ゲームをプレイ
    case 1:
      if(procPzl() == 0){
        idx = 2;
        timer = 0;
      }
      break;

    // ゲームオーバー
    case 2:
      fText('GAME OVER', 480, 420, 100, 'violet');
      if(timer > 30 * 5) idx = 0;
      break;
  }
}

// マス目を管理する配列
var masu = new Array(13);

// 絵柄が揃ったかを判定する配列
var kesu = new Array(13);

// 二次元配列の作成
for(var y = 0;y < 13;y++){
  masu[y] = new Array(9);
  kesu[y] = new Array(9);
}

// 二次元配列を初期化する関数
function clrBlock(){
  var x, y;
  for(y = 0;y <= 12;y++){
    for(x = 0; x <= 8;x++){
      masu[y][x] = -1;
    }
  }
  for(y = 1;y <= 11;y++){
    for(x = 1; x <= 7;x++){
      masu[y][x] = 0;
      kesu[y][x] = 0;
    }
  }
}

// ゲーム画面を描く関数
function drawPzl(){
  var x, y;
  // 背景画像を描画
  drawImg(0, 0, 0);
  // 次に落ちてくるブロックの表示
  for(x = 0;x < 3;x++){
    drawImg(block[3 + x], 672 + 80 * x, 50);
  }
  // タイムを表示
  fTextN('TIME\n' + int(gameTime / 30), 800, 280, 70, 60, 'white');
  // スコアを表示
  fTextN('SCORE\n' + score, 800, 500, 70, 60, 'white');
  // ハイスコアの表示
  fTextN('HI-SCORE\n' + hiscore, 800, 840, 70, 60, 'white');
  // ブロックの画像を描画
  for(y = 1;y <= 11;y++){
    for(x = 1;x <= 7;x++){
      if(masu[y][x] > 0){
        drawImgC(masu[y][x], 80 * x, 80 * y);
      }
    }
  }
  
  if(gameProc == 0){
    // 横に3つ並ぶブロックを描く
    for(x = -1;x <= 1;x++){
      drawImgC(block[1 + x], 80 * (myBlockX + x), 80 * myBlockY - 2);
    }
  }
  if(gameProc == 3){
    fText(points + 'pts', 320, 120, 50, RAINBOW[gameTime % 8]); // 得点
    // タイムが増えたときにその値を表示
    if(extend > 0) fText('TIME +' + extend + '!', 320, 240, 50, RAINBOW[timer % 8]);
  }
}

// ゲーム中の処理を行う関数
function procPzl(){
  var c, i, n, x, y;
  // ボタンをタップしていたら
  if(tapC > 0 && 960 < tapY && tapY < 1200){
    // タップしたボタンの番号を代入
    c = int(tapX / 240);
    if(0 <= c && c <= 3) tapKey[c]++;
  }else{
    for(i = 0;i < 4;i++){
      // tapKeyの値をクリア
      tapKey[i] = 0;
    }
  }

  switch(gameProc){
    // ブロックの移動
    case 0:
      // 下キーを押し続けたときにブロックが即座に落ちることを防ぐ一文
      if(timer < 10) break;
      // キーでの操作
      // 左キー
      if(key[37] == 1 || key[37] > 4){
        key[37]++;
        if(masu[myBlockY][myBlockX - 2] == 0){
          myBlockX--;
        }
      }
      // 右キー
      if(key[39] == 1 || key[39] > 4){
        key[39]++;
        if(masu[myBlockY][myBlockX + 2] == 0){
          myBlockX++;
        }
      }
      if(key[32] == 1 || key[32] > 4){
        key[32]++;
        // ブロックの入れ替え
        i = block[2];
        block[2] = block[1];
        block[1] = block[0];
        block[0] = i;
      }
      // タップでの操作
      if(tapKey[0] == 1 || tapKey[0] > 8){
        if(masu[myBlockY][myBlockX - 2] == 0){
          myBlockX--;
        }
      }
      if(tapKey[2] == 1 || tapKey[2] > 8){
        if(masu[myBlockY][myBlockX + 2] == 0){
          myBlockX++;
        }
      }
      if(tapKey[3] == 1 || tapKey[3] > 8){
        // ブロックの入れ替え
        i = block[2];
        block[2] = block[1];
        block[1] = block[0];
        block[0] = i;
      }
      // 一定時間ごとあるいは下キーでブロックを落下させる
      if(gameTime % dropSpd == 0 || key[40] > 0 || tapKey[1] > 1){
        // 下に何もなければ落下させる
        if(masu[myBlockY + 1][myBlockX - 1] + masu[myBlockY + 1][myBlockX] + masu[myBlockY + 1][myBlockX + 1] == 0){
          myBlockY++;
        }else{
          // ブロックをマス目上に置く
          masu[myBlockY][myBlockX - 1] = block[0];
          masu[myBlockY][myBlockX] = block[1];
          masu[myBlockY][myBlockX + 1] = block[2];
          rensa = 1; // 連鎖回数を1に
          gameProc = 1; // 全体のブロックを落下させる処理へ
        }
      }
      break;

    // 下のマスが空いているブロックを落とす
    case 1:
      // 落としたブロックがあるか
      c= 0;
      // 下から上に向かって調べる
      for(y = 10;y >= 1;y--){
        for(x = 1;x <= 7;x++){
          if(masu[y][x] > 0 && masu[y + 1][x] == 0){
            masu[y + 1][x] = masu[y][x];
            masu[y][x] = 0;
            c = 1;
          }
        }
      }
      // すべて落としたら次へ
      if(c == 0){
        gameProc = 2;
      }
      break;

    // ブロックが揃ったかの判定
    case 2:
      for(y = 1;y <= 11;y++){
        for(x = 1;x <= 7;x++){
          c = masu[y][x];
          if(c > 0){
            // 縦に揃っている
            if(c == masu[y - 1][x] && c == masu[y + 1][x]){
              kesu[y][x] = 1;
              kesu[y - 1][x] = 1;
              kesu[y + 1][x] = 1;
            }
            // 横に揃っている
            if(c == masu[y][x - 1] && c == masu[y][x + 1]){
              kesu[y][x] = 1;
              kesu[y][x - 1] = 1;
              kesu[y][x + 1] = 1;
            }
            // 斜め／に揃っている
            if(c == masu[y + 1][x - 1] && c == masu[y - 1][x + 1]){
              kesu[y][x] = 1;
              kesu[y + 1][x - 1] = 1;
              kesu[y - 1][x + 1] = 1;
            }
            // 斜め＼に揃っている
            if(c == masu[y - 1][x - 1] && c == masu[y + 1][x + 1]){
              kesu[y][x] = 1;
              kesu[y - 1][x - 1] = 1;
              kesu[y + 1][x + 1] = 1;
            }
          }
        }
      }
      n = 0; // 揃ったブロックを数える
      for(y = 1;y <= 11;y++){
        for(x = 1;x <= 7;x++){
          if(kesu[y][x] == 1){
            n++;
            setEffect(80 * x, 80 * y); // エフェクト
          }
        }
      }
      // 揃った場合
      if(n > 0){
        if(rensa == 1 && dropSpd > 5) dropSpd--; // 消すごとに落下速度が増す
        points = 50 * n * rensa; // 基本点数は消した数*50
        score += points;
        if(score > hiscore) hiscore = score;
        extend = 0;
        if(n % 5 == 0) extend = 300;
        gameTime += extend;
        rensa = rensa * 2; // 連鎖したとき得点が倍々に増える
        eftime = 0;
        gameProc = 3; // 消す処理へ
      }else{
        // 次に落ちてくるブロックをセット
        myBlockX = 4;
        myBlockY = 1;
        if(masu[myBlockY][myBlockX-1] + masu[myBlockY][myBlockX] + masu[myBlockY][myBlockX+1] > 0) return 0;//ブロックが最上段にある
        block[0] = block[3];
        block[1] = block[4];
        block[2] = block[5];
        block[3] = 1 + rnd(6);//┬次のブロックのセット
        block[4] = 1 + rnd(6);//┤
        block[5] = 1 + rnd(6);//┘
        gameProc = 0; // 再びブロックの移動へ
      }
      break;

    // ブロックを消す処理
    case 3:
      eftime++;
      if(eftime == 20){
        for(y = 1;y <= 11;y++){
          for(x = 1;x <= 7;x++){
            if(kesu[y][x] == 1){
              kesu[y][x] = 0;
              masu[y][x] = 0;
            }
          }
        }
        gameProc = 1; // 再び落下処理を行う
      }
      break;

  }
  
  gameTime--;

  return gameTime;

}

// エフェクトをセットする関数
function setEffect(x, y){
  effX[effN] = x;
  effY[effN] = y;
  effT[effN] = 20;
  effN = (effN + 1) % EFF_MAX;
}

// エフェクトを描く関数
function drawEffect(){
  lineW(20);
  for(var i = 0;i < EFF_MAX;i++){
    if(effT[i] > 0){
      setAlp(effT[i] * 5);
      sCir(effX[i], effY[i], 110 - effT[i] * 5, RAINBOW[(effT[i] + 0) % 8]);
      sCir(effX[i], effY[i], 90 - effT[i] * 4, RAINBOW[(effT[i] + 1) % 8]);
      sCir(effX[i], effY[i], 70 - effT[i] * 3, RAINBOW[(effT[i] + 2) % 8]);
      effT[i]--;
    }
  }
  setAlp(100);
  lineW(1);
}