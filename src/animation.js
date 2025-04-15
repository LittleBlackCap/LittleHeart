// 我放棄掙扎了，可能是webpack的設定有問題，我必須在html導入所需的模組網址才能將spotlight顯示，我不懂為什麼
// import * as THREE from 'three';

export default class Animation {
    constructor(canvas) {
        this.requestID;

        this.scene = new THREE.Scene(); // 建立場景
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); // 設置鏡頭
        // this.renderer = new THREE.WebGLRenderer(); // 建立渲染器
        this.renderer = new THREE.WebGLRenderer({ alpha: true }); // 建立渲染器，啟用透明背景，沒用
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        // this.renderer.setClearColor('#000000'); // 背景色設置為黑色
        this.renderer.setClearColor(0x000000, 0); // 背景色設置為透明
        this.renderer.shadowMap.enabled = true;

        this.camera.position.set(0, 0, 20); // 移動相機的Z軸

        this.ambientLight = new THREE.AmbientLight('#ffffff', 0.4); // 建立環境光，數字越小光線越弱
        this.scene.add(this.ambientLight);

        // 設定聚光燈的位置和屬性
        this.spotLight = new THREE.SpotLight('#ffffff'); // 建立聚光燈
        this.spotLight.position.set(20, 30, 20); // 將聚光燈移到愛心的右上角
        this.spotLight.angle = Math.PI / 20; // 調整聚光燈的角度，使其更聚光燈
        this.spotLight.penumbra = 1.0; // 調整聚光燈的半影，讓光線更柔和
        this.scene.add(this.spotLight);

        // 幫助查看聚光燈路線
        // const spotLightHelper = new THREE.SpotLightHelper(this.spotLight);
        // this.scene.add(spotLightHelper);

        this.canvas = canvas;

        this.infoElement = document.createElement('div');
        this.infoElement.innerText = '>   press SPACE to continue   <';
        this.infoElement.style.position = 'absolute';
        this.infoElement.style.top = '50%';
        this.infoElement.style.left = '50%';
        this.infoElement.style.transform = 'translate(-50%, -50%)';
        this.infoElement.style.fontFamily = 'Cubic_11';
        this.infoElement.style.color = 'white';
        this.infoElement.style.fontSize = '24px';
        this.infoElement.style.textShadow =
            /* White glow */
            '0 0 7px white',
            '0 0 10px white',
            '0 0 21px white',
            /* Green glow */
            '0 0 42px red',
            '0 0 82px red',
            '0 0 92px red',
            '0 0 102px red',
            '0 0 151px red';
        this.infoElement.style.display = 'block';

        this.opening = new Audio('sound/opening.mp3');
        this.opening.loop = false;
        this.opening.volume = 0.8;

        // 初始化 keyPressed
        this.keyPressed = {};
        document.body.addEventListener('keydown', (event) => {
            this.keyPressed[event.key] = true;
        });
        document.body.addEventListener('keyup', (event) => {
            this.keyPressed[event.key] = false;
        });
    }

    initHeartGroup() {
        this.heartPixels = [
            [0, 0, 3, 5, 5, 3, 0, 0, 0, 0, 0, 3, 5, 5, 3, 0, 0],
            [0, 3, 7, 7, 7, 7, 5, 0, 0, 0, 5, 7, 7, 7, 7, 3, 0],
            [3, 5, 7, 7, 7, 9, 9, 5, 0, 5, 9, 9, 7, 7, 7, 5, 3],
            [3, 5, 7, 7, 7, 9, 9, 9, 3, 9, 9, 9, 7, 7, 7, 5, 3],
            [3, 5, 7, 7, 7, 7, 9, 9, 9, 9, 9, 7, 7, 7, 7, 5, 3],
            [3, 5, 5, 5, 7, 7, 7, 9, 9, 9, 7, 7, 7, 5, 5, 5, 3],
            [1, 3, 5, 5, 5, 7, 7, 7, 9, 7, 7, 7, 5, 5, 5, 3, 1],
            [1, 3, 3, 3, 5, 5, 7, 7, 7, 7, 7, 5, 5, 3, 3, 3, 1],
            [0, 1, 1, 3, 3, 5, 5, 7, 7, 7, 5, 5, 3, 3, 1, 1, 0],
            [0, 0, 1, 1, 3, 3, 5, 5, 7, 5, 5, 3, 3, 1, 1, 0, 0],
            [0, 0, 0, 1, 1, 3, 3, 5, 5, 5, 3, 3, 1, 1, 0, 0, 0],
            [0, 0, 0, 0, 1, 1, 3, 3, 5, 3, 3, 1, 1, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 1, 1, 3, 1, 1, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0]
        ];
        this.centerX = this.heartPixels[0].length / 2;
        this.centerY = this.heartPixels.length / 2;
        this.geometry = new THREE.BoxGeometry(1, 1, 1);
        this.material = new THREE.MeshPhongMaterial({ color: '#FF0000' });
        // this.material = new THREE.MeshLambertMaterial({ color: '#FF0000' });
        this.numCube = 0;

        // 建立一個群組來包含所有的立方體
        this.heartGroup = new THREE.Group();
        for (this.y = 0; this.y < this.heartPixels.length; this.y++) {
            for (this.x = 0; this.x < this.heartPixels[this.y].length; this.x++) {
                this.centerZ = this.heartPixels[this.y][this.x] / 2;
                // 實心的885 -> 缺點東西362 -> 空心的472
                for (this.z = 0; this.z < this.heartPixels[this.y][this.x]; this.z++) {
                    if (this.y === 0 ||
                        this.y >= 1 && this.heartPixels[this.y][this.x] > this.heartPixels[this.y - 1][this.x] &&
                        (this.z <= (this.heartPixels[this.y][this.x] - this.heartPixels[this.y - 1][this.x]) / 2 ||
                            this.z >= (this.heartPixels[this.y][this.x] - 1 - this.heartPixels[this.y][this.x] - this.heartPixels[this.y - 1][this.x]) / 2) ||
                        this.x === 0 || this.x === this.heartPixels[this.y].length - 1 ||
                        this.z === 0 || this.z === this.heartPixels[this.y][this.x] - 1) {
                        this.cube = new THREE.Mesh(this.geometry, this.material);
                        this.cube.position.set(this.centerX - this.x, this.centerY - this.y, this.centerZ - this.z);
                        this.heartGroup.add(this.cube);
                        this.numCube += 1;
                    }
                }
            }
        }
        this.scene.add(this.heartGroup); // 將群組加入場景
        // console.log(this.numCube);
        // console.log(this.scene.children);
    }


    startAnimation(onComplete) {
        document.body.appendChild(this.renderer.domElement);
        document.body.appendChild(this.infoElement);

        this.initHeartGroup();

        const animate = () => {
            this.requestID = requestAnimationFrame(animate);
            this.heartGroup.rotation.y += 0.03; // 更新群組的旋轉角度

            // 計算螢幕上的大小
            const box = new THREE.Box3().setFromObject(this.heartGroup);
            const size = new THREE.Vector3();
            box.getSize(size);

            const distance = this.camera.position.distanceTo(this.heartGroup.position);
            const vFOV = this.camera.fov * Math.PI / 180; // 角度到弧度的轉換
            const height = 2 * Math.tan(vFOV / 2) * distance; // visible height
            const heightInPixels = window.innerHeight;
            const worldToPixels = heightInPixels / height;

            const targetSizeInPixels = 50; // 目標大小（50像素）
            const sizeInPixels = size.x * worldToPixels;

            this.renderer.render(this.scene, this.camera); // 渲染場景與鏡頭 

            if (this.keyPressed[' ']) {
                // this.infoElement.style.display = 'none';
                this.opening.play();
                this.heartGroup.scale.multiplyScalar(0.99); // 縮小愛心

                if (sizeInPixels <= targetSizeInPixels) {
                    // console.log(sizeInPixels, targetSizeInPixels);
                    cancelAnimationFrame(this.requestID);
                    document.body.removeChild(this.renderer.domElement);
                    document.body.removeChild(this.infoElement);
                    onComplete();
                }
            }
        };
        this.requestID = animate();
    }

    endAnimation(onComplete) {
        document.body.appendChild(this.renderer.domElement);

        let scaleFactor = 0.99;
        let phase = 'scaleUp';
        // let phase = 'explode';
        this.heartGroup.scale.set(scaleFactor, scaleFactor, scaleFactor);
    
        const animate = () => {
            this.requestID = requestAnimationFrame(animate);
    
            if (phase === 'scaleUp') {
                scaleFactor += 0.01;
                this.heartGroup.scale.set(scaleFactor, scaleFactor, scaleFactor);
    
                if (scaleFactor >= 1.0) {
                    // 切換到碎裂階段
                    phase = 'explode';
    
                    // 將心拆成左右
                    this.leftGroup = new THREE.Group();
                    this.rightGroup = new THREE.Group();
    
                    this.heartGroup.children.forEach(cube => {
                        if (cube.position.x < 0) {
                            this.leftGroup.add(cube);
                        } else {
                            this.rightGroup.add(cube);
                        }
                    });
    
                    this.scene.remove(this.heartGroup);
                    this.scene.add(this.leftGroup);
                    this.scene.add(this.rightGroup);
                }
            } else if (phase === 'explode') {
                // 🧨 你可以改成掉落式碎裂 or 旋轉碎裂
    
                this.leftGroup.children.forEach(cube => {
                    cube.rotation.z += 0.05;
                    cube.position.x -= 0.3;
                    cube.position.y += 0.2;
                });
    
                this.rightGroup.children.forEach(cube => {
                    cube.position.x += 0.3;
                    cube.position.y += 0.2;
                });
    
                // 判斷是否已經飛開夠遠
                if (this.leftGroup.children[0].position.y > 15) {
                    cancelAnimationFrame(this.requestID);
                    if (onComplete) {
                        onComplete(); // ✅ 結束時呼叫
                        document.body.removeChild(this.renderer.domElement);
                    }
                }
            }
    
            this.renderer.render(this.scene, this.camera);
        };
    
        animate();
    }
    
}