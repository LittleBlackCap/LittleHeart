export default class Square {
    constructor(canvas, ctx, mode) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.mode = mode;
        this.rectWidth = this.canvas.width; // 為了讓愛心可以滿屏跑
        this.rectHeight = this.canvas.height;
        this.animationDuration = 1000; // 動畫持續時間（毫秒）
        this.animationStartTime = null;
        this.mode = 'mode0';
    }

    draw() {
        // 切換框框動畫
        if (this.animationStartTime !== null) {
            let timestamp = performance.now();
            let progress = (timestamp - this.animationStartTime) / this.animationDuration;

            if (progress < 1) {
                this.rectWidth = this.startWidth + (this.targetWidth - this.startWidth) * progress;
                this.rectHeight = this.startHeight + (this.targetHeight - this.startHeight) * progress;
            } else {
                // console.log("timestamp", timestamp);
                this.rectWidth = this.targetWidth;
                this.rectHeight = this.targetHeight;
                this.animationStartTime = null; // 動畫完成
                // console.log("finish!");
            }
        }

        // 畫框框
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 5;
        this.ctx.strokeRect((this.canvas.width - this.rectWidth) / 2, (this.canvas.height - this.rectHeight) / 2, this.rectWidth, this.rectHeight);

        this.ctx.font = '30px Cubic_11';
        this.ctx.fillStyle = 'white';
        this.ctx.fillText("Don't Touch those WHITE Stuff....", this.canvas.width / 2, ((this.canvas.height + 300) / 2 + 50));
    }

    checkMode(mode, animation) {
        this.tmp = this.mode;
        this.mode = mode;
        this.startWidth = this.rectWidth;
        this.startHeight = this.rectHeight;

        if (this.mode === 'mode1') {
            this.rectWidth = 300;
            this.rectHeight = 300;
        }
        else if (this.mode === 'mode2') {
            this.rectWidth = 600;
            this.rectHeight = 300;
        }

        this.targetWidth = this.rectWidth;
        this.targetHeight = this.rectHeight;

        if (animation && this.tmp !== this.mode) {
            this.animationStartTime = performance.now(); // 開始動畫
            // console.log(this.tmp, this.mode);
            // console.log("start!");
            // console.log("animationStartTime", this.animationStartTime);
        }

        if (this.mode === 'mode0') {
            this.animationStartTime = null;
            this.rectWidth = this.canvas.width;
            this.rectHeight = this.canvas.height;
        }
    }
}