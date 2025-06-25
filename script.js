// === ELEMENTS ===
const dino = document.getElementById("dino");
const game = document.getElementById("game");
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("high-score");
const timerDisplay = document.getElementById("timer");
const recentRuns = document.getElementById("recent-runs");
const gameOverEl = document.getElementById("game-over");
const startScreen = document.getElementById("start-screen");
const skinSelect = document.getElementById("skin-select");
const jumpBtn = document.getElementById("jump-btn");
const themeBtn = document.getElementById("theme-btn");
const musicBtn = document.getElementById("music-btn");
const homeBtn = document.getElementById("home-btn");
const shopBtn = document.getElementById("shop-btn");
const shopScreen = document.getElementById("shop-screen");
const buyBtns = document.querySelectorAll(".buy-btn");
const buyThemeBtns = document.querySelectorAll(".buy-theme-btn");
const closeShopBtn = document.getElementById("close-shop");
const coinBalanceDisplay = document.getElementById("coin-balance");
const jumpSound = document.getElementById("jump-sound");
const hitSound = document.getElementById("hit-sound");
const music = document.getElementById("bg-music");

// === STATE ===
let score = 0, highScore = 0, isJumping = false, isGameRunning = false;
let speed = 3, spawnDelay = 3000, level = 1;
let startTime = 0, timerInterval;
let unlockedSkins = JSON.parse(localStorage.getItem("unlockedSkins") || '["green"]');
let coinBalance = parseInt(localStorage.getItem("coinBalance") || "0");

// === UI EVENTS ===
jumpBtn.onclick = () => jump();
themeBtn.onclick = () => document.body.classList.toggle("dark");
musicBtn.onclick = () => music.paused ? music.play() : music.pause();
homeBtn.onclick = () => location.reload();
skinSelect.onchange = () => {
  dino.className = "dino " + skinSelect.value;
  localStorage.setItem("selectedSkin", skinSelect.value);
};
shopBtn.onclick = () => {
  startScreen.style.display = "none";
  shopScreen.classList.remove("hidden");
};
closeShopBtn.onclick = () => {
  shopScreen.classList.add("hidden");
  startScreen.style.display = "flex";
};
document.getElementById("start-btn").onclick = () => {
  startScreen.style.display = "none";
  startGame();
};

// === BUY BUTTONS ===
buyBtns.forEach(btn => {
  btn.onclick = () => {
    const skin = btn.parentElement.getAttribute("data-skin");
    const cost = skin === "blue" ? 10 : skin === "red" ? 25 : 50;
    if (coinBalance >= cost && !unlockedSkins.includes(skin)) {
      coinBalance -= cost;
      unlockedSkins.push(skin);
      saveProgress();
      alert(`${skin} skin unlocked!`);
    } else {
      alert("Not enough coins or already owned.");
    }
  };
});

buyThemeBtns.forEach(btn => {
  btn.onclick = () => {
    if (coinBalance >= 15) {
      coinBalance -= 15;
      document.body.classList.add("dark");
      saveProgress();
      alert("Dark mode unlocked!");
    } else {
      alert("Not enough coins.");
    }
  };
});

function saveProgress() {
  localStorage.setItem("unlockedSkins", JSON.stringify(unlockedSkins));
  localStorage.setItem("coinBalance", coinBalance);
  updateCoinUI();
}

function updateCoinUI() {
  coinBalanceDisplay.textContent = `Coins: ${coinBalance}`;
}

// === GAME START ===
function startGame() {
  isGameRunning = true;
  score = 0;
  speed = 3;
  spawnDelay = 3000;
  level = 1;
  dino.className = "dino " + (localStorage.getItem("selectedSkin") || "green");
  gameOverEl.style.display = "none";
  document.querySelectorAll(".obstacle, .coin").forEach(el => el.remove());
  highScore = parseInt(localStorage.getItem("highScore") || "0");
  highScoreDisplay.textContent = "High: " + highScore;
  scoreDisplay.textContent = "Score: 0";
  recentRuns.innerHTML = "";
  updateCoinUI();
  startTimer();
  spawnObstacle();
  scheduleEvents();
}

// === JUMP ===
function jump() {
  if (isJumping || !isGameRunning) return;
  jumpSound.play();
  isJumping = true;
  let pos = 0;
  let up = setInterval(() => {
    if (pos >= 150) {
      clearInterval(up);
      let down = setInterval(() => {
        if (pos <= 0) {
          clearInterval(down);
          isJumping = false;
        }
        pos -= 5;
        dino.style.bottom = pos + 60 + "px";
      }, 20);
    }
    pos += 5;
    dino.style.bottom = pos + 60 + "px";
  }, 20);
}

// === OBSTACLE ===
function spawnObstacle() {
  if (!isGameRunning) return;
  const el = document.createElement("div");
  el.classList.add("obstacle", "cactus-small");
  game.appendChild(el);
  let pos = game.offsetWidth;
  el.style.left = pos + "px";

  let move = setInterval(() => {
    if (!isGameRunning) return clearInterval(move);
    pos -= speed;
    el.style.left = pos + "px";

    const d = dino.getBoundingClientRect(), o = el.getBoundingClientRect();
    if (d.right > o.left && d.left < o.right && d.bottom > o.top && d.top < o.bottom) {
      endGame();
      clearInterval(move);
    }

    if (pos < -50) {
      el.remove();
      score++;
      scoreDisplay.textContent = "Score: " + score;
      if (score > highScore) {
        highScore = score;
        highScoreDisplay.textContent = "High: " + highScore;
        localStorage.setItem("highScore", highScore);
      }
      if (score % 5 === 0) spawnCoin();
    }
  }, 20);

  setTimeout(spawnObstacle, spawnDelay);
}

// === COIN ===
function spawnCoin() {
  const coin = document.createElement("div");
  coin.classList.add("coin");
  game.appendChild(coin);
  let pos = game.offsetWidth;
  coin.style.left = pos + "px";
  coin.style.top = "120px";

  let move = setInterval(() => {
    if (!isGameRunning) return clearInterval(move);
    pos -= speed;
    coin.style.left = pos + "px";

    const d = dino.getBoundingClientRect(), c = coin.getBoundingClientRect();
    if (c.left < d.right && c.right > d.left && c.bottom > d.top) {
      coin.remove();
      coinBalance++;
      saveProgress();
      clearInterval(move);
    }

    if (pos < -30) {
      coin.remove();
      clearInterval(move);
    }
  }, 20);
}

// === TIMER ===
function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const t = ((Date.now() - startTime) / 1000).toFixed(2);
    timerDisplay.textContent = `Time: ${t}s`;
  }, 100);
}

// === DIFFICULTY + EVENTS ===
function scheduleEvents() {
  setInterval(() => {
    if (!isGameRunning) return;
    level++;
    if (spawnDelay > 1000) spawnDelay -= 300;
    if (speed < 15) speed += 0.5;
  }, 30000);
}

// === END ===
function endGame() {
  isGameRunning = false;
  hitSound.play();
  clearInterval(timerInterval);
  const runTime = ((Date.now() - startTime) / 1000).toFixed(2);
  const last = `Score: ${score} – Time: ${runTime}s`;
  recentRuns.innerHTML = `<strong>Last Run:</strong><br>${last}`;
  gameOverEl.style.display = "block";
  saveProgress();
}
