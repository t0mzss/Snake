const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const box = 20;
const rows = canvas.width / box;

let snake, direction, food, specialFood, score;
let gameLoop = null;
let gameSpeed = 150;
let gameRunning = false;

function randomPosition() {
    return {
        x: Math.floor(Math.random() * rows) * box,
        y: Math.floor(Math.random() * rows) * box
    };
}

function startGame() {
    document.getElementById("menu").style.display = "none";
    document.getElementById("score").style.display = "block";

    gameSpeed = document.getElementById("speed").value;
    resetGame();
    startCountdown();
}

function resetGame() {
    snake = [{ x: 200, y: 200 }];
    direction = "RIGHT";
    food = [randomPosition()];
    specialFood = null;
    score = 0;
    gameRunning = false;

    document.getElementById("score").textContent = "Score: 0";
    clearInterval(gameLoop);
}

function startCountdown() {
    const countdownEl = document.getElementById("countdown");
    let count = 3;

    countdownEl.textContent = count;
    countdownEl.style.display = "flex";

    const countdownTimer = setInterval(() => {
        count--;

        if (count === 0) {
            clearInterval(countdownTimer);
            countdownEl.style.display = "none";
            beginLoop();
        } else {
            countdownEl.textContent = count;
        }
    }, 1000);
}

function beginLoop() {
    gameRunning = true;
    gameLoop = setInterval(draw, gameSpeed);
}

document.addEventListener("keydown", e => {
    if (!gameRunning) return;

    if ((e.key === "ArrowLeft" || e.key === "a") && direction !== "RIGHT") direction = "LEFT";
    if ((e.key === "ArrowUp" || e.key === "w") && direction !== "DOWN") direction = "UP";
    if ((e.key === "ArrowRight" || e.key === "d") && direction !== "LEFT") direction = "RIGHT";
    if ((e.key === "ArrowDown" || e.key === "s") && direction !== "UP") direction = "DOWN";
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Snake
    ctx.fillStyle = document.getElementById("snakeColor").value;
    snake.forEach(part => ctx.fillRect(part.x, part.y, box, box));

    // Food
    ctx.fillStyle = "red";
    food.forEach(f => ctx.fillRect(f.x, f.y, box, box));

    // Special food
    if (specialFood) {
        ctx.fillStyle = "gold";
        ctx.fillRect(specialFood.x, specialFood.y, box, box);
    }

    let head = { ...snake[0] };

    if (direction === "LEFT") head.x -= box;
    if (direction === "UP") head.y -= box;
    if (direction === "RIGHT") head.x += box;
    if (direction === "DOWN") head.y += box;

    const wallsEnabled = document.getElementById("walls").checked;

    if (wallsEnabled) {
        if (head.x < 0 || head.y < 0 || head.x >= canvas.width || head.y >= canvas.height) {
            return endGame();
        }
    } else {
        if (head.x < 0) head.x = canvas.width - box;
        if (head.y < 0) head.y = canvas.height - box;
        if (head.x >= canvas.width) head.x = 0;
        if (head.y >= canvas.height) head.y = 0;
    }

    if (snake.some(part => part.x === head.x && part.y === head.y)) {
        return endGame();
    }

    snake.unshift(head);

    let ateFood = false;

    food.forEach((f, index) => {
        if (head.x === f.x && head.y === f.y) {
            score += 10;
            ateFood = true;
            food[index] = randomPosition();
            if (Math.random() < 0.3) specialFood = randomPosition();
        }
    });

    if (specialFood && head.x === specialFood.x && head.y === specialFood.y) {
        score += 30;
        snake.push(...snake.slice(-2));
        specialFood = null;
        ateFood = true;
    }

    if (!ateFood) snake.pop();

    if (document.getElementById("multiFood").checked && food.length < 3) {
        food.push(randomPosition());
    }

    document.getElementById("score").textContent = "Score: " + score;
}

function endGame() {
    clearInterval(gameLoop);
    gameRunning = false;
    alert("Game Over! Score: " + score);
    document.getElementById("menu").style.display = "block";
    document.getElementById("score").style.display = "none";
}
