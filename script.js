const dino = document.getElementById("dino");
const game = document.getElementById("game");
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("high-score");
const timerDisplay = document.getElementById("timer");
const recentRuns = document.getElementById("recent-runs");
const gameOverEl = document.getElementById("game-over");
const startScreen = document.getElementById("start-screen");

const jumpSound = document.getElementById("jump-sound");
const hitSound = document.getElementById("hit-sound");
const music = document.getElementById("bg-music");

const skinSelect = document.getElementById("skin-select");
const jumpBtn = document.getElementById("jump-btn");
const themeBtn = document.getElementById("theme-btn");
const musicBtn = document.getElementById("music-btn");

let score = 0, highScore = 0, isJumping = false, isGameRunning = false;
let speed = 5, spawnDelay = 2000, shieldActive = false, nightMode = false;
let startTime = 0, timerInterval = null;
let lastRuns = [];

jumpBtn.onclick = jump;
themeBtn.onclick = () => game.classList.toggle("dark");
musicBtn.onclick = () => music.paused ? music.play() : music.pause();
skinSelect.onchange = () => {
  dino.classList.remove("green", "blue", "red");
  dino.classList.add(skinSelect.value);
};
document.getElementById("start-btn").onclick = () => {
  startScreen.style.display = "none";
  startGame();
};

function startGame() {
  isGameRunning = true;
  score = 0;
  speed = 5;
  spawnDelay = 2000;
  shieldActive = false;
  dino.className = "dino " + skinSelect.value;
  gameOverEl.style.display = "none";
  scoreDisplay.textContent = "Score: 0";
  timerDisplay.textContent = "Time: 0.00s";
  highScore = localStorage.getItem("highScore") || 0;
  highScoreDisplay.textContent = "High: " + highScore;
  document.querySelectorAll(".obstacle,.power-up").forEach(el => el.remove());
  dino.style.bottom = "60px";
  dino.style.border = "none";
  recentRuns.innerHTML = "";
  startTimer();
  spawnObstacle();
  spawnPowerUp();
  toggleDayNight();
  document.addEventListener("keydown", jump);
  document.addEventListener("touchstart", jump);
}

function jump() {
  if (isJumping || !isGameRunning) return;
  jumpSound.play();
  isJumping = true;
  let position = 0;
  let up = setInterval(() => {
    if (position >= 150) {
      clearInterval(up);
      let down = setInterval(() => {
        if (position <= 0) {
          clearInterval(down);
          isJumping = false;
        }
        position -= 5;
        dino.style.bottom = position + 60 + "px";
      }, 20);
    }
    position += 5;
    dino.style.bottom = position + 60 + "px";
  }, 20);
}

function spawnObstacle() {
  if (!isGameRunning) return;
  const el = document.createElement("div");
  el.classList.add("obstacle");
  const t = Math.random();
  if (t < 0.4) el.classList.add("cactus-small");
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
        el.remove(); return;
      }
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
      if (score % 5 === 0) {
        if (speed < 20) speed += 0.5;
        if (spawnDelay > 700) spawnDelay -= 100;
      }
    }
  }, 20);
  setTimeout(spawnObstacle, spawnDelay);
}

function spawnPowerUp() {
  if (!isGameRunning) return;
  const p = document.createElement("div");
  p.classList.add("power-up");
  const t = Math.random();
  p.classList.add(t < 0.5 ? "shield" : "boost");
  game.appendChild(p);
  let pos = game.offsetWidth;
  p.style.left = pos + "px";
  p.style.bottom = (t < 0.5 ? 90 : 150) + "px";
  let move = setInterval(() => {
    if (!isGameRunning) return clearInterval(move);
    pos -= speed;
    p.style.left = pos + "px";
    const d = dino.getBoundingClientRect(), r = p.getBoundingClientRect();
    if (r.left < d.right && r.right > d.left && r.bottom > d.top) {
      if (p.classList.contains("shield")) {
        shieldActive = true;
        dino.style.border = "4px solid cyan";
      } else {
        speed += 3;
        setTimeout(() => speed -= 3, 3000);
      }
      p.remove(); clearInterval(move);
    }
    if (pos < -50) { p.remove(); clearInterval(move); }
  }, 20);
  setTimeout(spawnPowerUp, Math.random() * 10000 + 5000);
}

function animateBird(bird) {
  let flap = true;
  setInterval(() => {
    bird.style.transform = flap ? "translateY(-5px)" : "translateY(5px)";
    flap = !flap;
  }, 200);
}

function toggleDayNight() {
  setInterval(() => {
    nightMode = !nightMode;
    game.classList.toggle("dark", nightMode);
  }, 20000);
}

function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const t = ((Date.now() - startTime) / 1000).toFixed(2);
    timerDisplay.textContent = `Time: ${t}s`;
  }, 100);
}

function endGame() {
  isGameRunning = false;
  hitSound.play();
  clearInterval(timerInterval);
  const runTime = ((Date.now() - startTime) / 1000).toFixed(2);
  lastRuns.unshift({ score, time: runTime });
  lastRuns = lastRuns.slice(0, 5);
  recentRuns.innerHTML = `<strong>Last 5 Runs:</strong><br>` + lastRuns.map(r => `Score: ${r.score} — Time: ${r.time}s`).join("<br>");
  gameOverEl.style.display = "block";
}

function restartGame() {
  startGame();
}
