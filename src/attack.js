export default class Attack {
    constructor(canvas, ctx, mode) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.mode = mode;
        this.radius = 0;
        this.width = 0;
        this.height = 0;
        this.xs_mode2 = [];
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
        else return { x: 0, y: 0, width: 0, height: 0 };
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
            this.radius = Math.random() * 15 + 5;
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
        // if (this.radius === 0) this.random();
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
        const bottomLife = (this.canvas.height + 300) / 2 - 50;
        const topLife = (this.canvas.height - 300) / 2 + 50;
        this.width = 50;
        this.fx = Math.random() * (this.canvas.width - 600) / 2;
        // 還要調整，讓x不會擠在一起，得給玩家活著的可能
        this.x = Math.random() * (this.canvas.width - 600) / 2 + (this.canvas.width + 600) / 2;
        this.height = Math.random() * 50 + 200;
        do {
            this.y = Math.random() * this.canvas.height;
            // console.log("大於", topLife, "或 小於", bottomLife);
            // console.log("random : ", this.y, this.y + this.height);
        } while (this.y > (this.canvas.height + 300) / 2 || this.y + this.height < (this.canvas.height - 300) / 2 ||
            !(topLife > this.y || bottomLife < this.y + this.height)); // 重複的條件
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

        // 檢查是否超出畫面範圍，若是則重新設定位置
        if (this.x + this.width < this.fx) {
            this.random();
        }

        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}