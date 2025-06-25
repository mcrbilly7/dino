const dino = document.getElementById("dino");
const game = document.getElementById("game");
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("high-score");
const gameOverEl = document.getElementById("game-over");
const startScreen = document.getElementById("start-screen");
const startBtn = document.getElementById("start-btn");
const jumpSound = document.getElementById("jump-sound");
const hitSound = document.getElementById("hit-sound");

let score = 0;
let highScore = 0;
let isJumping = false;
let isGameRunning = false;
let speed = 5;
let spawnDelay = 2000;
let shieldActive = false;
let nightMode = false;

startBtn.addEventListener("click", () => {
  startScreen.style.display = "none";
  startGame();
});

function startGame() {
  isGameRunning = true;
  score = 0;
  speed = 5;
  spawnDelay = 2000;
  shieldActive = false;
  scoreDisplay.textContent = "Score: 0";
  highScoreDisplay.textContent = "High Score: " + highScore;
  gameOverEl.style.display = "none";
  document.querySelectorAll(".obstacle").forEach(o => o.remove());
  document.querySelectorAll(".power-up").forEach(p => p.remove());
  dino.style.bottom = "60px";
  dino.style.backgroundColor = "transparent";
  document.addEventListener("keydown", jump);
  document.addEventListener("touchstart", jump);
  spawnObstacle();
  spawnPowerUp();
  toggleDayNight();
}

function jump() {
  if (isJumping || !isGameRunning) return;
  jumpSound.play();
  isJumping = true;
  let position = 0;
  let upInterval = setInterval(() => {
    if (position >= 150) {
      clearInterval(upInterval);
      let downInterval = setInterval(() => {
        if (position <= 0) {
          clearInterval(downInterval);
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

  const obstacle = document.createElement("div");
  obstacle.classList.add("obstacle");

  const type = Math.random();
  if (type < 0.4) {
    obstacle.classList.add("cactus-small");
  } else if (type < 0.8) {
    obstacle.classList.add("cactus-large");
  } else {
    obstacle.classList.add("bird");
    animateBird(obstacle);
  }

  game.appendChild(obstacle);
  let pos = game.offsetWidth;
  obstacle.style.left = pos + "px";

  const move = setInterval(() => {
    if (!isGameRunning) {
      clearInterval(move);
      obstacle.remove();
      return;
    }

    pos -= speed;
    obstacle.style.left = pos + "px";

    const dinoRect = dino.getBoundingClientRect();
    const obsRect = obstacle.getBoundingClientRect();

    if (
      obsRect.left < dinoRect.right &&
      obsRect.right > dinoRect.left &&
      obsRect.bottom > dinoRect.top
    ) {
      if (shieldActive) {
        obstacle.remove();
        shieldActive = false;
        dino.style.border = "none";
        return;
      }
      endGame();
      clearInterval(move);
    }

    if (pos < -50) {
      obstacle.remove();
      score++;
      scoreDisplay.textContent = "Score: " + score;
      if (score > highScore) {
        highScore = score;
        highScoreDisplay.textContent = "High Score: " + highScore;
      }

      if (score % 5 === 0 && speed < 20) speed += 0.5;
      if (score % 5 === 0 && spawnDelay > 700) spawnDelay -= 100;
    }
  }, 20);

  setTimeout(spawnObstacle, spawnDelay);
}

function animateBird(bird) {
  let flap = true;
  setInterval(() => {
    bird.style.transform = flap ? "translateY(-5px)" : "translateY(5px)";
    flap = !flap;
  }, 200);
}

function spawnPowerUp() {
  if (!isGameRunning) return;

  const power = document.createElement("div");
  power.classList.add("power-up");

  const type = Math.random();
  power.classList.add(type < 0.5 ? "shield" : "boost");

  game.appendChild(power);
  let pos = game.offsetWidth;
  power.style.left = pos + "px";
  power.style.bottom = (type < 0.5 ? 90 : 150) + "px";

  const move = setInterval(() => {
    if (!isGameRunning) {
      clearInterval(move);
      power.remove();
      return;
    }

    pos -= speed;
    power.style.left = pos + "px";

    const dinoRect = dino.getBoundingClientRect();
    const powerRect = power.getBoundingClientRect();

    if (
      powerRect.left < dinoRect.right &&
      powerRect.right > dinoRect.left &&
      powerRect.bottom > dinoRect.top
    ) {
      power.remove();
      if (power.classList.contains("shield")) {
        shieldActive = true;
        dino.style.border = "4px solid cyan";
      } else {
        speed += 3;
        setTimeout(() => {
          speed -= 3;
        }, 3000);
      }
      clearInterval(move);
    }

    if (pos < -50) {
      power.remove();
      clearInterval(move);
    }
  }, 20);

  setTimeout(spawnPowerUp, Math.random() * 10000 + 5000);
}

function toggleDayNight() {
  setInterval(() => {
    nightMode = !nightMode;
    game.style.background = nightMode
      ? "linear-gradient(#222, #444)"
      : "linear-gradient(#cce, #eef)";
  }, 20000);
}

function endGame() {
  isGameRunning = false;
  hitSound.play();
  gameOverEl.style.display = "block";
}

function restartGame() {
  startGame();
}
