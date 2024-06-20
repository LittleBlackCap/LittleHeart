import Square from './square.js';

export default class Heart {
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
        this.life = 3;
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
        if (this.life == 2) this.ctx.drawImage(this.img2, this.x, this.y, this.width, this.height);
        else if (this.life == 1) this.ctx.drawImage(this.img3, this.x, this.y, this.width, this.height);
        else this.ctx.drawImage(this.img1, this.x, this.y, this.width, this.height);
    }

    checkMode(mode) {
        this.tmp = this.mode;
        this.mode = mode;
        if (this.tmp !== this.mode) {
            this.x = (this.canvas.width - 50) / 2;
            this.y = (this.canvas.height - 50) / 2;
        }
        this.s.checkMode(mode, false);
    }
}