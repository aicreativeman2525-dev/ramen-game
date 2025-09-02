// HTML要素の取得
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');
const startButton = document.getElementById('start-button');
const serveButton = document.getElementById('serve-button');
const retryButton = document.getElementById('retry-button');
const toppingButtons = document.querySelectorAll('.topping-button');
const timerDisplay = document.getElementById('timer-display');
const scoreDisplay = document.getElementById('score-display');
const finalScoreDisplay = document.getElementById('final-score');
const orderVegetableDisplay = document.getElementById('order-vegetable');
const orderGarlicDisplay = document.getElementById('order-garlic');
const orderFatDisplay = document.getElementById('order-fat');
const orderKarameDisplay = document.getElementById('order-karame');
const bowlContainer = document.getElementById('bowl-container');
const soundClick = document.getElementById('sound-click');
const soundCorrect = document.getElementById('sound-correct');
const soundStart = document.getElementById('sound-start');

// ゲームの状態を管理する変数
let score = 0;
let timeLeft = 60;
let timerId = null;

const toppingLevels = {
    vegetable: ['抜き', '普通', 'マシ', 'マシマシ'],
    garlic: ['抜き', '普通', 'マシ', 'マシマシ'],
    fat: ['抜き', '普通', 'マシ', 'マシマシ'],
    karame: ['なし', 'あり']
};

let currentToppings = {
    vegetable: 1, garlic: 1, fat: 1, karame: 0
};
let order = {
    vegetable: 1, garlic: 1, fat: 1, karame: 0
};

// ゲームの主要な関数
function playSound(sound) {
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(error => console.error("音声の再生に失敗:", error));
    }
}

function startGame() {
    playSound(soundStart);
    startScreen.style.display = 'none';
    resultScreen.style.display = 'none';
    gameScreen.style.display = 'flex';
    score = 0;
    timeLeft = 60;
    scoreDisplay.textContent = `スコア: ${score}`;
    timerDisplay.textContent = `時間: ${timeLeft}`;
    currentToppings = { vegetable: 1, garlic: 1, fat: 1, karame: 0 };
    updateAllButtonStyles();
    updateRamenImage();
    generateOrder();
    clearInterval(timerId);
    timerId = setInterval(countdown, 1000);
}

function countdown() {
    timeLeft--;
    timerDisplay.textContent = `時間: ${timeLeft}`;
    if (timeLeft <= 0) endGame();
}

function endGame() {
    clearInterval(timerId);
    gameScreen.style.display = 'none';
    resultScreen.style.display = 'block';
    finalScoreDisplay.textContent = score;
}

function generateOrder() {
    order.vegetable = Math.floor(Math.random() * 4);
    order.garlic = Math.floor(Math.random() * 4);
    order.fat = Math.floor(Math.random() * 4);
    order.karame = Math.floor(Math.random() * 2);

    orderVegetableDisplay.textContent = `ヤサイ：${toppingLevels.vegetable[order.vegetable]}`;
    orderGarlicDisplay.textContent = `ニンニク：${toppingLevels.garlic[order.garlic]}`;
    orderFatDisplay.textContent = `アブラ：${toppingLevels.fat[order.fat]}`;
    orderKarameDisplay.textContent = `カラメ：${toppingLevels.karame[order.karame]}`;
}


// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★★★ これが新しい「left/top方式」の画像表示ロジックです ★★★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
function updateRamenImage() {
    bowlContainer.innerHTML = '';

    // レイヤー1: ベース画像
    const baseImage = document.createElement('img');
    baseImage.src = 'images/base_ramen.png';
    baseImage.className = 'topping-image';
    baseImage.style.zIndex = 1;
    bowlContainer.appendChild(baseImage);

    // ★★★ 各トッピングの「スタート位置」と「ズレる距離」をここで一括管理 ★★★
    const positionSettings = {
        vegetable: { startX: 0, startY: -5, shiftX: 0, shiftY: -10, scale: 0, size: 100 },
        fat:       { startX: 0, startY: -30, shiftX: 0, shiftY: -3, scale: 0, size: 25 },
        garlic:    { startX: -15, startY: 0, shiftX: 3, shiftY: 0, scale: 0.1, size: 30 },
        karame:    { startX: -8, startY: -12, shiftX: 0, shiftY: 0, scale: 0, size: 50 }
    };

    // レイヤー順に処理
    const toppingsInOrder = ['vegetable', 'fat', 'garlic', 'karame'];
    let zIndexCounter = 2;

    toppingsInOrder.forEach(toppingName => {
        const level = currentToppings[toppingName];
        const settings = positionSettings[toppingName];

        if (level > 0) {
            const maxImages = (toppingName === 'karame') ? 1 : level;
            
            for (let i = 0; i < maxImages; i++) {
                const image = document.createElement('img');
                image.src = `images/${toppingName}.png`;
                image.className = 'topping-image';
                image.style.zIndex = zIndexCounter++;

                // ★★★ leftとtopを直接計算 ★★★
                // (スタート位置 + (ズレる距離 * 何枚目か))
                const posX = settings.startX + (settings.shiftX * i);
                const posY = settings.startY + (settings.shiftY * i);
                const scale = 1.0 + (settings.scale * i);
                
                // スタイルを直接設定
                image.style.width = `${settings.size}%`;
                image.style.height = `${settings.size}%`;
                // 中央を基準にするため、画像の半分のサイズを引く
                image.style.left = `calc(50% - ${settings.size / 2}% + ${posX}%)`;
                image.style.top = `calc(50% - ${settings.size / 2}% + ${posY}%)`;
                image.style.transform = `scale(${scale})`; // 拡大・縮小だけtransformで行う
                
                bowlContainer.appendChild(image);
            }
        }
    });
}
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

function handleToppingSelect(event) {
    playSound(soundClick);
    const { topping, level } = event.target.dataset;
    currentToppings[topping] = parseInt(level, 10);
    updateButtonStyles(topping);
    updateRamenImage();
}

function updateButtonStyles(topping) {
    const buttons = document.querySelectorAll(`.topping-button[data-topping="${topping}"]`);
    buttons.forEach(button => {
        const level = parseInt(button.dataset.level, 10);
        if (level === currentToppings[topping]) {
            button.classList.add('selected-topping');
        } else {
            button.classList.remove('selected-topping');
        }
    });
}

function updateAllButtonStyles() {
    Object.keys(toppingLevels).forEach(updateButtonStyles);
}

function serveRamen() {
    const isCorrect = Object.keys(order).every(t => order[t] === currentToppings[t]);
    if (isCorrect) {
        playSound(soundCorrect);
        score += 10;
        scoreDisplay.textContent = `スコア: ${score}`;
    } else {
        playSound(soundStart);
    }
    generateOrder();
}

// ボタンにイベント処理を割り当てる
startButton.addEventListener('click', startGame);
serveButton.addEventListener('click', serveRamen);
retryButton.addEventListener('click', startGame);
toppingButtons.forEach(button => {
    button.addEventListener('click', handleToppingSelect);
});

console.log("二郎系ラーメンゲーム（left/top方式版）、起動準備完了！");