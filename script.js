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
const jumpSound = document.getElementById("jump-sound");
const hitSound = document.getElementById("hit-sound");
const music = document.getElementById("bg-music");

// === GAME STATE ===
let score = 0, highScore = 0, isJumping = false, isGameRunning = false;
let speed = 3, spawnDelay = 3000, level = 1;
let startTime = 0, timerInterval = null, difficultyInterval;
let shieldActive = false, nightMode = false;
let lastRuns = [], unlockedSkins = JSON.parse(localStorage.getItem("unlockedSkins") || '["green"]');
let coinStage = false, bossStage = false;

// === UI CONTROLS ===
jumpBtn.onclick = () => jump();
themeBtn.onclick = () => game.classList.toggle("dark");
musicBtn.onclick = () => music.paused ? music.play() : music.pause();
skinSelect.onchange = () => {
  dino.classList.remove("green", "blue", "red", "gold");
  dino.classList.add(skinSelect.value);
};
document.getElementById("start-btn").onclick = () => {
  startScreen.style.display = "none";
  startGame();
};

// === GAME START ===
function startGame() {
  isGameRunning = true;
  score = 0;
  speed = 3;
  spawnDelay = 3000;
  level = 1;
  bossStage = false;
  coinStage = false;
  dino.className = "dino " + skinSelect.value;
  gameOverEl.style.display = "none";
  scoreDisplay.textContent = "Score: 0";
  timerDisplay.textContent = "Time: 0.00s";
  highScore = localStorage.getItem("highScore") || 0;
  highScoreDisplay.textContent = "High: " + highScore;
  document.querySelectorAll(".obstacle,.power-up,.coin").forEach(el => el.remove());
  dino.style.bottom = "60px";
  dino.style.border = "none";
  recentRuns.innerHTML = "";
  startTimer();
  spawnObstacle(true);
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
function spawnObstacle(force = false) {
  if (!isGameRunning || bossStage || coinStage) return;
  const el = document.createElement("div");
  el.classList.add("obstacle");

  const t = Math.random();
  if (level < 2) el.classList.add("cactus-small");
  else if (t < 0.4) el.classList.add("cactus-small");
  else if (t < 0.8) el.classList.add("cactus-large");
  else { el.classList.add("bird"); animateBird(el); }

  game.appendChild(el);
  let pos = game.offsetWidth;
  el.style.left = pos + "px";

  let move = setInterval(() => {
    if (!isGameRunning) return clearInterval(move);
    pos -= speed;
    el.style.left = pos + "px";

    const d = dino.getBoundingClientRect(), o = el.getBoundingClientRect();
    if (d.right > o.left && d.left < o.right && d.bottom > o.top && d.top < o.bottom) {
      if (shieldActive) {
        shieldActive = false;
        dino.style.border = "none";
        el.remove();
        clearInterval(move);
        return;
      }
      endGame();
      clearInterval(move);
    }
    if (pos < -50) {
      el.remove();
      score++;
      checkUnlocks();
      scoreDisplay.textContent = "Score: " + score;
      if (score > highScore) {
        highScore = score;
        highScoreDisplay.textContent = "High: " + highScore;
        localStorage.setItem("highScore", highScore);
      }
    }
  }, 20);

  const delay = Math.max(800, spawnDelay + Math.random() * 500);
  setTimeout(() => spawnObstacle(), delay);
}

// === COIN STAGE ===
function startCoinStage() {
  coinStage = true;
  showCutscene("COIN ZONE!");
  for (let i = 0; i < 10; i++) {
    setTimeout(spawnCoin, i * 600);
  }
  setTimeout(() => {
    coinStage = false;
    spawnObstacle();
  }, 10000);
}

function spawnCoin() {
  const coin = document.createElement("div");
  coin.classList.add("coin");
  coin.style.position = "absolute";
  coin.style.width = "20px";
  coin.style.height = "20px";
  coin.style.background = "gold";
  coin.style.borderRadius = "50%";
  coin.style.top = "100px";
  coin.style.left = game.offsetWidth + "px";
  game.appendChild(coin);
  let pos = game.offsetWidth;

  let move = setInterval(() => {
    if (!isGameRunning) return clearInterval(move);
    pos -= speed;
    coin.style.left = pos + "px";

    const d = dino.getBoundingClientRect(), c = coin.getBoundingClientRect();
    if (c.left < d.right && c.right > d.left && c.bottom > d.top) {
      coin.remove();
      score++;
      scoreDisplay.textContent = "Score: " + score;
      checkUnlocks();
      clearInterval(move);
    }
    if (pos < -30) {
      coin.remove();
      clearInterval(move);
    }
  }, 20);
}

// === BOSS STAGE ===
function startBossStage() {
  bossStage = true;
  showCutscene("BOSS INCOMING!");
  const boss = document.createElement("div");
  boss.classList.add("obstacle", "boss");
  boss.style.width = "100px";
  boss.style.height = "100px";
  boss.style.background = "darkred";
  boss.style.bottom = "60px";
  boss.style.position = "absolute";
  boss.style.left = game.offsetWidth + "px";
  game.appendChild(boss);
  let pos = game.offsetWidth;

  let move = setInterval(() => {
    if (!isGameRunning) return clearInterval(move);
    pos -= speed;
    boss.style.left = pos + "px";

    const d = dino.getBoundingClientRect(), b = boss.getBoundingClientRect();
    if (b.left < d.right && b.right > d.left && b.bottom > d.top && b.top < d.bottom) {
      if (shieldActive) {
        shieldActive = false;
        dino.style.border = "none";
        boss.remove();
        bossStage = false;
        spawnObstacle();
        clearInterval(move);
        return;
      }
      endGame();
      clearInterval(move);
    }

    if (pos < -120) {
      boss.remove();
      score += 10;
      checkUnlocks();
      scoreDisplay.textContent = "Score: " + score;
      bossStage = false;
      spawnObstacle();
      clearInterval(move);
    }
  }, 20);
}

// === UNLOCKS ===
function checkUnlocks() {
  if (score >= 25 && !unlockedSkins.includes("blue")) unlockedSkins.push("blue");
  if (score >= 50 && !unlockedSkins.includes("red")) unlockedSkins.push("red");
  if (score >= 100 && !unlockedSkins.includes("gold")) unlockedSkins.push("gold");
  localStorage.setItem("unlockedSkins", JSON.stringify(unlockedSkins));
}

// === CUTSCENE ===
function showCutscene(text) {
  const cut = document.createElement("div");
  cut.innerText = text;
  cut.style.position = "absolute";
  cut.style.top = "40%";
  cut.style.left = "50%";
  cut.style.transform = "translate(-50%, -50%)";
  cut.style.fontSize = "32px";
  cut.style.color = "white";
  cut.style.background = "rgba(0,0,0,0.8)";
  cut.style.padding = "20px";
  cut.style.zIndex = "1000";
  cut.style.borderRadius = "12px";
  game.appendChild(cut);
  setTimeout(() => cut.remove(), 3000);
}

// === DIFFICULTY ===
function scheduleEvents() {
  setInterval(() => {
    if (!isGameRunning) return;
    level++;
    if (spawnDelay > 1000) spawnDelay -= 300;
    if (speed < 15) speed += 0.5;
    showCutscene("Level Up! Stage " + level);
  }, 30000);

  setInterval(() => {
    if (isGameRunning) startCoinStage();
  }, 60000);

  setInterval(() => {
    if (isGameRunning) startBossStage();
  }, 90000);
}

// === TIMER ===
function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const t = ((Date.now() - startTime) / 1000).toFixed(2);
    timerDisplay.textContent = `Time: ${t}s`;
  }, 100);
}

// === END ===
function endGame() {
  isGameRunning = false;
  hitSound.play();
  clearInterval(timerInterval);
  const runTime = ((Date.now() - startTime) / 1000).toFixed(2);
  lastRuns.unshift({ score, time: runTime });
  lastRuns = lastRuns.slice(0, 5);
  recentRuns.innerHTML = `<strong>Last 5 Runs:</strong><br>` +
    lastRuns.map(r => `Score: ${r.score} — Time: ${r.time}s`).join("<br>");
  gameOverEl.style.display = "block";
}
function restartGame() {
  startGame();
}
