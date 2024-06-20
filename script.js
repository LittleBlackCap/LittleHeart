class ModeSwitch {
    constructor(canvas, ctx) {
        // console.log("Modeset");
        this.canvas = canvas;
        this.ctx = ctx;
        this.correntMode = 'mode1';
        this.x = 0;
        this.y = 0;
        this.random();
    }

    switch() {
        if (this.correntMode === 'mode1') this.correntMode = 'mode2';
        else if (this.correntMode === 'mode2') this.correntMode = 'mode1';
        this.random();
        this.draw();
        return this.correntMode;
    }

    random() {
        // console.log("random " + `${this.mode}`);
        if (this.correntMode === 'mode1') return this.randomMode1();
        else if (this.correntMode === 'mode2') return this.randomMode2();
    }

    draw() {
        // console.log("draw " + `${this.mode}`);
        if (this.correntMode === 'mode1') this.drawMode1();
        else if (this.correntMode === 'mode2') this.drawMode2();
    }

    update() {
        if (this.correntMode === 'mode1') return this.updateMode1();
        else if (this.correntMode === 'mode2') return this.updateMode2();
    }

    randomMode1() {
        // console.log("randomMode1");
        function isInsideSquare(canvas, x, y, radius) {
            const squareLeft = (canvas.width - 300) / 2;
            const squareRight = squareLeft + 300;
            const squareTop = (canvas.height - 300) / 2;
            const squareBottom = squareTop + 300;
            return x - radius > squareLeft && x + radius < squareRight && y - radius > squareTop && y + radius < squareBottom;
        }

        // 隨機生成位置
        do {
            this.x = Math.random() * this.canvas.width;
            this.y = Math.random() * this.canvas.height;
            do {
                this.radius = Math.random() * 200;
            } while (this.radius < 5 || this.radius > 20)
        } while (isInsideSquare(this.canvas, this.x, this.y, this.radius));

        // 計算方向向量，朝向方框的中心移動
        this.dx = (this.canvas.width / 2) - this.x;
        this.dy = (this.canvas.height / 2) - this.y;
        this.distanceToCenter = Math.sqrt(this.dx * this.dx + this.dy * this.dy);

        this.angle = Math.atan2(this.dy, this.dx);
        this.speedMagnitude = Math.random() * 7 + 1; // 速度大小為 1 到 8

        // 如果圓心到方框中心的距離小於一定值，則加上一個倍率以確保它遠離方框
        if (this.distanceToCenter < 150) this.speedMagnitude *= 1.5;

        this.speed = {
            x: Math.cos(this.angle) * this.speedMagnitude,
            y: Math.sin(this.angle) * this.speedMagnitude
        };
    }

    drawMode1() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = 'yellow';
        this.ctx.fill();
    }

    updateMode1() {
        // console.log(`${this.correntMode}`)
        // 移動攻擊物件
        this.x += this.speed.x;
        this.y += this.speed.y;

        // 檢查是否超出畫面範圍，若是則重新設定位置
        if (this.x - this.radius > this.canvas.width || this.x + this.radius < 0 ||
            this.y - this.radius > this.canvas.height || this.y + this.radius < 0) {
            this.random();
        }
        // return this.correntMode;
        return {
            x: this.x,
            y: this.y,
            radius: this.radius
        }
    }

    randomMode2() {
        // console.log("randomMode2");
        this.width = 50;
        this.height = Math.random() * 50 + 200;
        do {
            this.x = Math.random() * (this.canvas.width - 600) / 2 + (this.canvas.width + 600) / 2;
            // 還要調整，讓x不會擠在一起，得給玩家活著的可能
            this.y = Math.random() * this.canvas.height;
        } while ((this.canvas.height - 300) / 2 + 300 < this.y ||
            (this.canvas.height + 300) / 2 - 300 > this.y + this.height);
    }

    drawMode2() {
        // console.log("drawMode2");
        this.ctx.beginPath();
        this.ctx.fillStyle = 'yellow';
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    updateMode2() {
        // console.log("updateMode2");
        this.speed = 2;
        this.x -= this.speed;
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

class Heart {
    constructor(canvas, ctx, mode, img1, img2, img3) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.mode = mode;
        this.x = (this.canvas.width - 50) / 2;
        this.y = (this.canvas.height - 50) / 2;
        this.speed = 5;
        this.width = 50;
        this.height = 50;
        this.img1 = img1;
        this.img2 = img2;
        this.img3 = img3;
        this.score = 0;
        this.s = new Square(canvas, ctx, mode);

        // 初始化 keyPressed
        this.keyPressed = {};
        document.body.addEventListener('keydown', (event) => {
            this.keyPressed[event.key] = true;
        });
        document.body.addEventListener('keyup', (event) => {
            this.keyPressed[event.key] = false;
        });
    }

    update() {
        const squareLeft = (this.canvas.width - this.s.rectWidth) / 2;
        const squareRight = squareLeft + this.s.rectWidth;
        const squareTop = (this.canvas.height - this.s.rectHeight) / 2;
        const squareBottom = squareTop + this.s.rectHeight;

        if ((this.keyPressed['w'] || this.keyPressed['ArrowUp']) && this.y > squareTop) this.y -= this.speed;
        else if ((this.keyPressed['s'] || this.keyPressed['ArrowDown']) && this.y < squareBottom - this.height) this.y += this.speed;
        if ((this.keyPressed['a'] || this.keyPressed['ArrowLeft']) && this.x > squareLeft) this.x -= this.speed;
        else if ((this.keyPressed['d'] || this.keyPressed['ArrowRight']) && this.x < squareRight - this.width) this.x += this.speed;

        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
            radius: this.width / 2
        };
    }

    draw() {
        if (this.score == 0) this.ctx.drawImage(this.img1, this.x, this.y, this.width, this.height);
        else if (this.score == 1) this.ctx.drawImage(this.img2, this.x, this.y, this.width, this.height);
        else if (this.score == 2) this.ctx.drawImage(this.img3, this.x, this.y, this.width, this.height);
        else this.ctx.drawImage(this.img1, this.x, this.y, this.width, this.height);
    }

    checkMode(mode) {
        this.tmp = this.mode;
        this.mode = mode;
        if (this.tmp !== this.mode) {
            this.x = (this.canvas.width - 50) / 2;
            this.y = (this.canvas.height - 50) / 2;
        }
        this.s.checkMode(mode);
    }
}

class Square {
    constructor(canvas, ctx, mode) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.mode = mode;
        this.rectWidth = this.canvas.width;
        this.rectHeight = this.canvas.height;
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 5;
        this.ctx.strokeRect((this.canvas.width - this.rectWidth) / 2, (this.canvas.height - this.rectHeight) / 2, this.rectWidth, this.rectHeight);
    }

    checkMode(mode) {
        this.mode = mode;
        if (this.mode === 'mode1') {
            this.rectWidth = 300;
            this.rectHeight = 300;
        }
        else if (this.mode === 'mode2') {
            this.rectWidth = 600;
            this.rectHeight = 300;
        }
        else {
            this.rectWidth = this.canvas.width;
            this.rectHeight = this.canvas.height;
        }
    }
}

class Attack {
    constructor(canvas, ctx, mode) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.mode = mode;
        this.random();
    }

    random() {
        // console.log("random " + `${this.mode}`);
        if (this.mode === 'mode1') return this.randomMode1();
        else if (this.mode === 'mode2') return this.randomMode2();
    }

    draw() {
        // console.log("draw " + `${this.mode}`);
        if (this.mode === 'mode1') this.drawMode1();
        else if (this.mode === 'mode2') this.drawMode2();
    }

    update() {
        if (this.mode === 'mode1') return this.updateMode1();
        else if (this.mode === 'mode2') return this.updateMode2();
    }

    checkMode(mode) {
        // console.log("checkMode " + `${this.mode}`);
        this.tmp = this.mode;
        this.mode = mode;
        if (this.tmp !== this.mode) this.random();
    }

    randomMode1() {
        // console.log("randomMode1");
        function isInsideSquare(canvas, x, y, radius) {
            const squareLeft = (canvas.width - 300) / 2;
            const squareRight = squareLeft + 300;
            const squareTop = (canvas.height - 300) / 2;
            const squareBottom = squareTop + 300;
            return x - radius > squareLeft && x + radius < squareRight && y - radius > squareTop && y + radius < squareBottom;
        }

        // 隨機生成位置
        do {
            this.x = Math.random() * this.canvas.width;
            this.y = Math.random() * this.canvas.height;
            do {
                this.radius = Math.random() * 200;
            } while (this.radius < 5 || this.radius > 20)
        } while (isInsideSquare(this.canvas, this.x, this.y, this.radius));

        // 計算方向向量，朝向方框的中心移動
        this.dx = (this.canvas.width / 2) - this.x;
        this.dy = (this.canvas.height / 2) - this.y;
        this.distanceToCenter = Math.sqrt(this.dx * this.dx + this.dy * this.dy);

        this.angle = Math.atan2(this.dy, this.dx);
        this.speedMagnitude = Math.random() * 7 + 1; // 速度大小為 1 到 8

        // 如果圓心到方框中心的距離小於一定值，則加上一個倍率以確保它遠離方框
        if (this.distanceToCenter < 150) this.speedMagnitude *= 1.5;

        this.speed = {
            x: Math.cos(this.angle) * this.speedMagnitude,
            y: Math.sin(this.angle) * this.speedMagnitude
        };
    }

    drawMode1() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = 'white';
        this.ctx.fill();
    }

    updateMode1() {
        // 移動攻擊物件
        this.x += this.speed.x;
        this.y += this.speed.y;

        // 檢查是否超出畫面範圍，若是則重新設定位置
        if (this.x - this.radius > this.canvas.width || this.x + this.radius < 0 ||
            this.y - this.radius > this.canvas.height || this.y + this.radius < 0) {
            this.random();
        }

        return {
            x: this.x,
            y: this.y,
            radius: this.radius
        }
    }

    randomMode2() {
        // console.log("randomMode2");
        this.width = 50;
        this.height = Math.random() *50+200;
        do {
            this.x = Math.random() *(this.canvas.width-600) / 2+(this.canvas.width+600) / 2;
            // 還要調整，讓x不會擠在一起，得給玩家活著的可能
            this.y = Math.random() * this.canvas.height;
        } while ((this.canvas.height - 300) / 2 + 300 < this.y || 
                 (this.canvas.height + 300) / 2 - 300 > this.y + this.height);
    }

    drawMode2() {
        // console.log("drawMode2");
        this.ctx.beginPath();
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    updateMode2() {
        // console.log("updateMode2");
        this.speed = 2;
        this.x -= this.speed;
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

let score = 0; // Heart內的score沒定義過所以可能要再看看怎麼辦
let collided = false;
let attacks = [];
let mode = 'mode0';

let img1 = new Image();
img1.src = 'images/LittleHeart1.png';
let img2 = new Image();
img2.src = 'images/LittleHeart2.png';
let img3 = new Image();
img3.src = 'images/LittleHeart3.png';

const gameMusic = new Audio('sound/bg.mp3'); // 創建音樂元素
gameMusic.loop = true; // 設定音樂循環播放
// gameMusic.play(); // 播放音樂
// gameMusic.pause(); // 暫停音樂

// const playButton = document.getElementById('playButton');
// playButton.addEventListener('click', function () {
//     gameMusic.play().catch(function (error) {
//         console.error('Play error:', error);
//     });
// });

//生成各種物件
let modeSwitch = new ModeSwitch(canvas, ctx, mode);
let heart = new Heart(canvas, ctx, mode, img1, img2, img3);
let square = new Square(canvas, ctx, mode);
// let attack = new Attack(400, 200, 10);
for (let i = 0; i < 3; i++) {
    attacks.push(new Attack(canvas, ctx, mode));
}

// 首頁的按鈕們
const start = function () {
    let rectWidth = 110;
    let rectHeight = 60;
    let x = (canvas.width - rectWidth) / 2;
    let y = (canvas.height - rectHeight) / 5 * 4;

    ctx.beginPath();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 5;
    ctx.strokeRect(x, y, rectWidth, rectHeight);

    // 設置字體大小和樣式
    ctx.font = '50px HanyiSentyMarshmallowChalk-B';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Start', x + rectWidth / 2, y + rectHeight / 2);

    return {
        x: x,
        y: y,
        width: rectWidth,
        height: rectHeight
    };
}

// 遊戲迴圈
function gameLoop() {
    clearCanvas(canvas);

    if (mode === 'mode0') beforeStart();
    else {
        let lose = isOver();
        if (lose) {
            mode = 'mode0';
            // cancelAnimationFrame(requestId);
            return;
        }

        square.checkMode(mode);
        heart.checkMode(mode);
        attacks.forEach((attack, index) => {
            attack.checkMode(mode);
        });

        attacks.forEach((attack, index) => {
            if (!collided) if (collide(mode, attack.update(), heart.update())) {
                score++;
                attacks.splice(index, 1);
                attacks.push(new Attack(canvas, ctx, mode));
                collided = true;
            }
        });
        if (!collided) if (collide(mode, modeSwitch.update(), heart.update())) {
            mode = modeSwitch.switch(mode);
            collided = true;
        }
        if (collided) collided = false; // 重置碰撞狀態

        square.draw();
        heart.draw();
        modeSwitch.draw();
        attacks.forEach((attack, index) => {
            attack.draw();
        });

        drawscore();
    }

    requestId = requestAnimationFrame(gameLoop);
}

function beforeStart() {
    // clearCanvas(canvas);
    if (collide(mode, start(), heart.update())) {
        mode = 'mode1';
        // gameLoop();
    }
    heart.draw();
}

function isOver() {
    let Over = false;
    // 輸的條件以及輸了的結果畫面
    return Over;
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

function drawscore() {
    ctx.fillStyle = "white";
    ctx.font = "50px sans-serif";
    ctx.fillText(`Score: ${score}`, 100, 100);
}

let requestId = requestAnimationFrame(gameLoop); //  迴圈開始的入口