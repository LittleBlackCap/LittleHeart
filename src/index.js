/* 
必須改進:
1.長條形攻擊目前沒有碰撞就不會重新生成，且生成位置希望是連續不斷但又能躲過去的，最好是可以越來越快
  目前會重新生成了，但設定還有些問題，也還不會變快
2.印象中在攻擊撞到小心心的時候會減速很多，有點怪
  ㄟ，好像是沒有了，不知道為什麼
3.沒有任何贏的方式，可以看要用計時還是什麼當作計分方式🤔；也不知道最後要有怎樣的畫面
  用計時作為結束畫面，可能算是贏了(?
4.小心心目前用score來計算被撞了幾次，但這樣感覺不太直覺、會以為是得分而不是扣血；而且小心心的變化只有3段，但現在有5條命
  三條命遞減且改變數名為life
5.init要再加上遊玩規則說明，可能放在小心心的上方背景(?)
  上下加了三條，主要是遊玩方式，可能再看看有沒有別的要加的；遊戲過程也加上不能碰白色的了
6.over的原因還沒寫上去，可能可以把寫上去的生命數去掉(有點醜)，而且該頁面可以再加一點文字比如"You lose...."之類的
  有了
7.現在重新開始的時候，第二局或第三局很大機率那顆切換mode的球球會突然不見，然後就沒了
  我的長方形攻擊加上自動生成的功能了，但如果在長方形模式死亡，切換模式攻擊還是無法生成，我不知道為什麼
  我知道了，因為我切換模式的那個東西不像其他東東一樣會確認模式、模式不同就重新生成，所以我讓它的半徑歸零，一旦半徑為零則重新生成

期望改進:
1.要加入開場動畫，預計用three.js讓一顆3D愛心放大旋轉一圈再旋轉著縮小回去
  我加了，但有點怪，目前無法和原本的canvas接在一起
2.要加入失敗動畫，預計用three.js讓我們的小心心放大裂開(然後我就不知道了)
3.要加入切換模式動畫，讓框框的變化是連續的，等框框變化完才會開始攻擊
  姑且算是可以，但只有兩個模式切換間能成功，而且變化結束會有奇妙的停頓，我不知道為什麼
4.希望可以加入藍色攻擊(只要不動就可以不會扣血)
5.Music按鍵可以再逗趣一點
6.攻擊方式再還原(原作)一點 
*/

// 儲存變更方式是在"D:\tool\workspace\HTML\WWW programing\Project"輸入"npx webpack"
// 用 Go Server 執行會更方便，只要有儲存都會自動變更畫面
import ModeSwitch from './modeSwitch.js';
import Heart from './heart.js';
import Square from './square.js';
import Attack from './attack.js';
import Animation from './animation.js';
import './style.css';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

let img1 = new Image();
img1.src = 'images/LittleHeart1.png';
let img2 = new Image();
img2.src = 'images/LittleHeart2.png';
let img3 = new Image();
img3.src = 'images/LittleHeart3.png';

const gameMusic = new Audio('sound/bg.mp3'); // 創建音樂元素
gameMusic.loop = true; // 設定音樂循環播放
gameMusic.volume = 0.5;
const collidedSound = new Audio('sound/collides.mp3');
collidedSound.loop = false;
const collidedSound2 = new Audio('sound/collides2.mp3');
collidedSound2.loop = false;

let collided = false;
let attacks = [];
let startTime = null;
let drawTimer, recorder;
let state = false;
let init = true;
let over = false;

//生成各種物件
let requestId;
let modeSwitch = new ModeSwitch(canvas, ctx);
let heart = new Heart(canvas, ctx, modeSwitch.mode, img1, img2, img3);
let square = new Square(canvas, ctx, modeSwitch.mode);
for (let i = 0; i < 4; i++) {
    attacks.push(new Attack(canvas, ctx, modeSwitch.mode)); // 各種需要改，Mode2問題很大:無法再生，各種重生攻擊的方式需要改
}
let animation = new Animation(canvas);

// 各種按鈕們
const start = function () {
    let rectWidth = 180;
    let rectHeight = 90;
    let x = (canvas.width - rectWidth) / 2;
    let y = (canvas.height - rectHeight) / 7 * 6;

    return {
        x: x,
        y: y,
        width: rectWidth,
        height: rectHeight
    };
}

const music = function () {
    let rectWidth = 120;
    let rectHeight = 70;
    let x = (canvas.width - rectWidth) / 11;
    let y = (canvas.height - rectHeight) / 7;

    return {
        x: x,
        y: y,
        width: rectWidth,
        height: rectHeight
    };
}

const restart = function () {
    let rectWidth = 120;
    let rectHeight = 60;
    let x = (canvas.width - rectWidth) / 9 * 2;
    let y = (canvas.height - rectHeight) / 2;

    return {
        x: x,
        y: y,
        width: rectWidth,
        height: rectHeight
    };
}

const home = function () {
    let rectWidth = 120;
    let rectHeight = 60;
    let x = (canvas.width - rectWidth) / 9 * 7;
    let y = (canvas.height - rectHeight) / 2;

    return {
        x: x,
        y: y,
        width: rectWidth,
        height: rectHeight
    };
}

// 遊戲前的小動畫
animation.createHeartAnimation(onHeartAnimationComplete); // 呼叫建立心形動畫的函數
function onHeartAnimationComplete() {
    // console.log('createHeartAnimation is Completed.');
    requestId = requestAnimationFrame(gameLoop); //  迴圈開始的入口
}

// 遊戲迴圈
function gameLoop() {
    clearCanvas(canvas);
    if (init) beforeStart();
    if (over) isOver();
    if (modeSwitch.mode !== 'mode0') {
        if (heart.life === 0) {
            over = true;
        }

        square.checkMode(modeSwitch.mode, true);
        heart.checkMode(modeSwitch.mode);
        attacks.forEach((attack, index) => {
            attack.checkMode(modeSwitch.mode);
        });
        // checkAllAttacks(attacks, modeSwitch.mode); // 試圖藉由他們分開檢查狀態來讓它們可以在不同時間生成，讓它們分散，但JS是非同步，沒辦法，算了


        if (square.animationStartTime === null) {
            // console.log(collided);
            attacks.forEach((attack, index) => {
                if (!collided && collide(modeSwitch.mode, attack.update(), heart.update())) {
                    heart.life--;
                    attacks.splice(index, 1);
                    attack.xs_mode2 = []; // 删除相同索引位置的 x 坐标
                    attacks.push(new Attack(canvas, ctx, modeSwitch.mode)); // 看能不能改一下，換成重複利用的方式生成，比如撞到或是超出界線之後重新random出初始位置
                    collided = true;
                    collidedSound.play();
                }
            });
            if (!collided && collide(modeSwitch.mode, modeSwitch.update(), heart.update())) {
                modeSwitch.switch();
                collided = true;
                collidedSound2.play();
            }
            if (collided) collided = false; // 重置碰撞狀態
        }

        square.draw();
        heart.draw();
        modeSwitch.draw();
        attacks.forEach((attack, index) => {
            attack.draw();
        });
        drawLife();
        recorder = drawTimer();
    }
    requestId = requestAnimationFrame(gameLoop);
}

function beforeStart() {
    let s = start();
    let m = music();
    if (collide(modeSwitch.mode, s, heart.update())) {
        modeSwitch.mode = 'mode1';
        modeSwitch.radius = 0;
        init = false;
        startTime = Date.now();
        drawTimer = timer(startTime);
    }
    if (!collided && collide(modeSwitch.mode, m, heart.update())) {
        collided = true;
        if (!state) {
            state = true;
            gameMusic.play();
        } else {
            state = false;
            gameMusic.pause();
        }
    } else if (collided && !collide(modeSwitch.mode, m, heart.update())) collided = false;

    ctx.fillStyle = "white";
    ctx.font = "30px Cubic_11";
    ctx.fillText("Press ↑↓←→ or WASD to Move", canvas.width / 2, canvas.height / 8 * 2);
    ctx.fillText("Touch the Frame to Choose the Bottom", canvas.width / 2, canvas.height / 8 * 3);
    ctx.fillText("You have THREE lives....", canvas.width / 2, canvas.height / 8 * 5);
    drawButton(s, 'Start', true);
    drawButton(m, 'Music', state);
    heart.draw();
}

function drawButton(button, text, state) {
    ctx.beginPath();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 5;
    ctx.strokeRect(button.x, button.y, button.width, button.height);

    // 設置字體大小和樣式
    ctx.font = '30px Cubic_11';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, button.x + button.width / 2, button.y + button.height / 2);

    if (!state) {
        // 在方框上加上左上斜到右下的紅色直線
        ctx.beginPath();
        ctx.strokeStyle = 'red'; // 設置線條顏色為紅色
        ctx.lineWidth = 5; // 設置線條寬度
        ctx.moveTo(button.x - 10, button.y - 10); // 將路徑移動到方框的左上角
        ctx.lineTo(button.x + button.width + 10, button.y + button.height + 10); // 繪製直線到方框的右下角
        ctx.stroke(); // 繪製線條
    }
}

function isOver() { // 輸了的結果畫面
    let r = restart();
    let h = home();
    heart.life = 3;
    modeSwitch.mode = 'mode0';
    modeSwitch.radius = 0;
    square.checkMode(modeSwitch.mode, true);
    heart.checkMode(modeSwitch.mode);
    attacks.forEach((attack, index) => {
        attack.checkMode(modeSwitch.mode);
    });
    square.animationStartTime = null;
    // console.log("set null");
    // 上面這東東好像沒用

    // 要補上小心心裂成兩半的動畫

    ctx.font = '60px Cubic_11';
    ctx.fillStyle = 'white';
    ctx.fillText(recorder, canvas.width / 2, canvas.height / 9 * 3);

    ctx.font = '60px Cubic_11';
    ctx.fillStyle = 'white';
    ctx.fillText("You lose....", canvas.width / 2, canvas.height / 9 * 6);

    if (collide(modeSwitch.mode, r, heart.update())) {
        over = false;
        modeSwitch.mode = 'mode1';
        startTime = Date.now();
        drawTimer = timer(startTime);
    } else if (collide(modeSwitch.mode, h, heart.update())) {
        over = false;
        init = true;
    }
    drawButton(r, 'Restart', true);
    drawButton(h, 'Home', true);
    heart.draw();
}

function clearCanvas(canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// attack碰撞heart，後者一定是用圓形做判定
function collide(mode, itemA, itemB) {
    // console.log("mode:", mode);
    // console.log("Item A:", itemA);
    // console.log("Item B:", itemB);
    let dx, dy;
    if (mode === 'mode1') {
        dx = itemA.x - itemB.x;
        dy = itemA.y - itemB.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        return distance < itemA.radius + itemB.radius;
    } else if (mode === 'mode2' || mode === 'mode0') {
        // 找出最接近的點
        let closestX = clamp(itemB.x, itemA.x, itemA.x + itemA.width);
        let closestY = clamp(itemB.y, itemA.y, itemA.y + itemA.height);

        // 計算圓心和最接近點之間的距離
        dx = itemB.x - closestX;
        dy = itemB.y - closestY;

        // 如果距離小於圓的半徑，則碰撞
        return (dx * dx + dy * dy) <= (itemB.radius * itemB.radius);
    }

    // 輔助函數，限制數值在範圍內
    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
}

function drawLife() {
    ctx.fillStyle = "white";
    ctx.font = "50px Cubic_11";
    ctx.fillText(recorder, canvas.width / 2, canvas.height / 9);

    ctx.fillStyle = "white";
    ctx.font = "50px Cubic_11";
    ctx.fillText(`life: ${heart.life}`, canvas.width / 10, canvas.height / 9);
}

// 定義一個計時器函式，顯示從計時開始到現在的時間（包含毫秒）
function timer(startTime) {
    function padZero(num, length) {
        let str = num.toString();
        return str.padStart(length, '0');
    }

    function formatTime(minutes, seconds, milliseconds) {
        return padZero(minutes, 2) + ':' + padZero(seconds, 2) + '.' + padZero(milliseconds, 3);
    }

    function getTimeElapsed() {
        let currentTime = Date.now();
        let elapsed = currentTime - startTime;
        let milliseconds = Math.floor(elapsed % 1000);
        let seconds = Math.floor(elapsed / 1000) % 60;
        let minutes = Math.floor(elapsed / (1000 * 60));
        return { minutes, seconds, milliseconds };
    }

    function update() {
        let { minutes, seconds, milliseconds } = getTimeElapsed();
        let formattedTime = formatTime(minutes, seconds, milliseconds);
        return formattedTime;
    }

    // 返回更新函式，讓外部可以使用它來更新顯示
    return update;
}

// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }
// const checkAllAttacks = async (attacks, mode) => {
//     for (let index = 0; index < attacks.length; index++) {
//         let attack = attacks[index];
//         attack.checkMode(mode);
//         await sleep(300); // 每次迴圈之間等待300毫秒
//     }
// }


// 啟用 HMR
if (module.hot) {
    module.hot.accept();
}
