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

function updateRamenImage() {
    bowlContainer.innerHTML = '';

    const baseImage = document.createElement('img');
    baseImage.src = 'images/base_ramen.png';
    baseImage.className = 'topping-image';
    baseImage.style.zIndex = 1;
    bowlContainer.appendChild(baseImage);

    // ★★★ 各トッピングの「ズレる距離」を調整 ★★★
    const shiftAmount = {
        vegetable: { x: 0, y: -10, scale: 0 },
        fat: { x: 0, y: -15, scale: 0 },       // 上への移動距離を詰めた
        garlic: { x: 25, y: 0, scale: 0.1 },    // 右への移動距離を詰めた
        karame: { x: 0, y: -30, scale: 0 }
    };

    const toppingsInOrder = ['vegetable', 'fat', 'garlic', 'karame'];
    let zIndexCounter = 2;

    toppingsInOrder.forEach(toppingName => {
        const level = currentToppings[toppingName];
        if (level > 0) {
            const maxImages = (toppingName === 'karame') ? 1 : level;
            
            for (let i = 0; i < maxImages; i++) {
                const image = document.createElement('img');
                image.src = `images/${toppingName}.png`;
                image.className = `topping-image ${toppingName}-base`;
                image.style.zIndex = zIndexCounter++;

                const shiftX = shiftAmount[toppingName].x * i;
                const shiftY = shiftAmount[toppingName].y * i;
                const scale = 1.0 + (shiftAmount[toppingName].scale * i);
                
                // CSSの基本スタイルを取得
                const tempImg = document.createElement('img');
                tempImg.className = `topping-image ${toppingName}-base`;
                document.body.appendChild(tempImg);
                const baseTransform = getComputedStyle(tempImg).transform;
                document.body.removeChild(tempImg);
                
                const initialTransform = baseTransform === 'none' ? '' : baseTransform;

                image.style.transform = `${initialTransform} translateX(${shiftX}%) translateY(${shiftY}%) scale(${scale})`;
                
                bowlContainer.appendChild(image);
            }
        }
    });
}

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

console.log("二郎系ラーメンゲーム（距離調整版）、起動準備完了！");