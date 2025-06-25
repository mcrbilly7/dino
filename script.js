const dino = document.getElementById("dino");
const game = document.getElementById("game");
const scoreDisplay = document.getElementById("score");
const gameOverEl = document.getElementById("game-over");
const startScreen = document.getElementById("start-screen");
const startBtn = document.getElementById("start-btn");

let score = 0;
let isJumping = false;
let isGameRunning = false;
let speed = 5;
let spawnDelay = 2000;

startBtn.addEventListener("click", () => {
  startScreen.style.display = "none";
  startGame();
});

function startGame() {
  isGameRunning = true;
  score = 0;
  speed = 5;
  spawnDelay = 2000;
  scoreDisplay.textContent = "Score: 0";
  gameOverEl.style.display = "none";
  document.querySelectorAll(".obstacle").forEach(o => o.remove());
  dino.style.bottom = "20px";
  document.addEventListener("keydown", jump);
  document.addEventListener("touchstart", jump);
  spawnObstacle();
}

function jump() {
  if (isJumping || !isGameRunning) return;
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
        dino.style.bottom = position + 20 + "px";
      }, 20);
    }
    position += 5;
    dino.style.bottom = position + 20 + "px";
  }, 20);
}

function spawnObstacle() {
  if (!isGameRunning) return;

  const obstacle = document.createElement("div");
  obstacle.classList.add("obstacle");

  // Random obstacle type
  const type = Math.random();
  if (type < 0.4) {
    obstacle.classList.add("cactus-small");
  } else if (type < 0.8) {
    obstacle.classList.add("cactus-large");
  } else {
    obstacle.classList.add("bird");
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
      endGame();
      clearInterval(move);
    }

    if (pos < -50) {
      obstacle.remove();
      score++;
      scoreDisplay.textContent = "Score: " + score;

      // Increase difficulty over time
      if (score % 5 === 0 && speed < 15) speed += 0.5;
      if (score % 5 === 0 && spawnDelay > 700) spawnDelay -= 100;
    }
  }, 20);

  setTimeout(spawnObstacle, spawnDelay);
}

function endGame() {
  isGameRunning = false;
  gameOverEl.style.display = "block";
}

function restartGame() {
  startGame();
}
