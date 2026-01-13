const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const box = 20;
const cols = canvas.width / box;
const rows = canvas.height / box;

let snake = [];
let direction = "RIGHT";
let nextDirection = "RIGHT";
let score = 0;

let foods = [];
let gameLoop = null;
let gameRunning = false;
let gameSpeed = 150;

function samePos(a, b) {
    return a.x === b.x && a.y === b.y;
}

function randomGridPos() {
    return {
        x: Math.floor(Math.random() * cols) * box,
        y: Math.floor(Math.random() * rows) * box
    };
}

function spawnSafePosition() {
    let pos;
    do {
        pos = randomGridPos();
    } while (
        snake.some(s => samePos(s, pos)) ||
        foods.some(f => samePos(f, pos))
    );
    return pos;
}

function spawnFood(type) {
    const now = Date.now();
    const pos = spawnSafePosition();

    const foodTypes = {
        normal: { color: "red", score: 10, grow: 1, life: Infinity },
        gold:   { color: "gold", score: 30, grow: 3, life: 5000 },
        poison: { color: "purple", score: -15, grow: -2, life: 5000 },
        bonus:  { color: "deepskyblue", score: 50, grow: 5, life: 4000 }
    };

    foods.push({
        ...pos,
        ...foodTypes[type],
        born: now
    });
}

function startGame() {
    document.getElementById("menu").style.display = "none";
    document.getElementById("score").style.display = "block";

    gameSpeed = Number(document.getElementById("speed").value);
    resetGame();
    startCountdown();
}

function resetGame() {
    snake = [{
        x: Math.floor(cols / 2) * box,
        y: Math.floor(rows / 2) * box
    }];

    direction = "RIGHT";
    nextDirection = "RIGHT";
    score = 0;
    foods = [];
    gameRunning = false;

    spawnFood("normal");

    document.getElementById("score").textContent = "Score: 0";
    clearInterval(gameLoop);
}

function startCountdown() {
    const cd = document.getElementById("countdown");
    let count = 3;

    cd.textContent = count;
    cd.style.display = "flex";

    const timer = setInterval(() => {
        count--;
        if (count === 0) {
            clearInterval(timer);
            cd.style.display = "none";
            beginLoop();
        } else {
            cd.textContent = count;
        }
    }, 1000);
}

function beginLoop() {
    gameRunning = true;
    gameLoop = setInterval(update, gameSpeed);
}

document.addEventListener("keydown", e => {
    if (!gameRunning) return;

    const map = {
        ArrowLeft: "LEFT",
        ArrowRight: "RIGHT",
        ArrowUp: "UP",
        ArrowDown: "DOWN",
        a: "LEFT",
        d: "RIGHT",
        w: "UP",
        s: "DOWN"
    };

    const newDir = map[e.key];
    if (!newDir) return;

    if (
        (newDir === "LEFT" && direction !== "RIGHT") ||
        (newDir === "RIGHT" && direction !== "LEFT") ||
        (newDir === "UP" && direction !== "DOWN") ||
        (newDir === "DOWN" && direction !== "UP")
    ) {
        nextDirection = newDir;
    }
});

function update() {
    direction = nextDirection;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const head = { ...snake[0] };

    if (direction === "LEFT") head.x -= box;
    if (direction === "RIGHT") head.x += box;
    if (direction === "UP") head.y -= box;
    if (direction === "DOWN") head.y += box;

    const walls = document.getElementById("walls").checked;

    if (walls) {
        if (
            head.x < 0 ||
            head.y < 0 ||
            head.x >= cols * box ||
            head.y >= rows * box
        ) {
            return endGame();
        }
    } else {
        if (head.x < 0) head.x = (cols - 1) * box;
        if (head.x >= cols * box) head.x = 0;
        if (head.y < 0) head.y = (rows - 1) * box;
        if (head.y >= rows * box) head.y = 0;
    }

    if (snake.some(s => samePos(s, head))) {
        return endGame();
    }

    snake.unshift(head);

    let ate = false;

    foods = foods.filter(f => {
        if (Date.now() - f.born > f.life) return false;

        if (samePos(head, f)) {
            score += f.score;

            if (f.grow > 0) {
                for (let i = 0; i < f.grow; i++) {
                    snake.push({ ...snake[snake.length - 1] });
                }
            } else if (f.grow < 0) {
                for (let i = 0; i < Math.abs(f.grow); i++) {
                    if (snake.length > 1) snake.pop();
                }
            }

            ate = true;
            return false;
        }
        return true;
    });

    if (!ate) snake.pop();

    if (!foods.some(f => f.life === Infinity)) {
        spawnFood("normal");
    }

    if (Math.random() < 0.005) spawnFood("gold");
    if (Math.random() < 0.007) spawnFood("poison");
    if (Math.random() < 0.003) spawnFood("bonus");

    drawSnake();
    drawFoods();

    document.getElementById("score").textContent = "Score: " + score;
}

function drawSnake() {
    const bodyColor = document.getElementById("snakeColor").value;
    const outlineColor = "#000";

    snake.forEach((s, i) => {
        ctx.fillStyle = outlineColor;
        ctx.fillRect(s.x - 1, s.y - 1, box + 2, box + 2);

        ctx.fillStyle = bodyColor;
        ctx.fillRect(s.x, s.y, box, box);

        if (i === 0) {
            ctx.fillStyle = "white";

            let e1 = { x: s.x + 5, y: s.y + 5 };
            let e2 = { x: s.x + 12, y: s.y + 5 };

            if (direction === "UP") { e1.y = e2.y = s.y + 4; }
            if (direction === "DOWN") { e1.y = e2.y = s.y + 12; }
            if (direction === "LEFT") {
                e1.x = e2.x = s.x + 4;
                e2.y += 7;
            }
            if (direction === "RIGHT") {
                e1.x = e2.x = s.x + 12;
                e2.y += 7;
            }

            ctx.fillRect(e1.x, e1.y, 5, 5);
            ctx.fillRect(e2.x, e2.y, 5, 5);

            ctx.fillStyle = "black";
            ctx.fillRect(e1.x + 1, e1.y + 1, 2, 2);
            ctx.fillRect(e2.x + 1, e2.y + 1, 2, 2);
        }
    });
}

function drawFoods() {
    foods.forEach(f => {
        ctx.fillStyle = f.color;
        ctx.fillRect(f.x, f.y, box, box);
    });
}

function endGame() {
    clearInterval(gameLoop);
    gameRunning = false;
    alert("Game Over! Score: " + score);
    document.getElementById("menu").style.display = "block";
    document.getElementById("score").style.display = "none";
}
