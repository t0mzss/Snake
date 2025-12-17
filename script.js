// Get canvas and context
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Game settings
const gridSize = 20;
const tileCount = canvas.width / gridSize;

// Game state
let snake = [{ x: 10, y: 10 }];
let velocity = { x: 1, y: 0 };
let food = randomFood();
let score = 0;
let gameInterval = null;

// Main game loop
function gameLoop() {
  update();
  draw();
}

// Update game state
function update() {
  const head = {
    x: snake[0].x + velocity.x,
    y: snake[0].y + velocity.y
  };

  // Wall collision
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    return gameOver();
  }

  // Self collision
  for (let segment of snake) {
    if (segment.x === head.x && segment.y === head.y) {
      return gameOver();
    }
  }

  snake.unshift(head);

  // Food collision
  if (head.x === food.x && head.y === food.y) {
    score++;
    food = randomFood();
  } else {
    snake.pop();
  }
}

// Draw everything
function draw() {
  // Clear screen
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw snake
  ctx.fillStyle = "yellow";
  for (let segment of snake) {
    ctx.fillRect(
      segment.x * gridSize,
      segment.y * gridSize,
      gridSize,
      gridSize
    );
  }

  // Draw food
  ctx.fillStyle = "pink";
  ctx.fillRect(
    food.x * gridSize,
    food.y * gridSize,
    gridSize,
    gridSize
  );

  // Draw score
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText(`Score: ${score}`, 10, 20);
}

// Generate random food position
function randomFood() {
  return {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
  };
}

// End the game
function gameOver() {
  clearInterval(gameInterval);
  alert(`Game Over! Score: ${score}`);
  document.location.reload();
}

// Handle keyboard input
document.addEventListener("keydown", event => {
  switch (event.key) {
    case "ArrowUp":
      if (velocity.y === 0) velocity = { x: 0, y: -1 };
      break;
    case "ArrowDown":
      if (velocity.y === 0) velocity = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
      if (velocity.x === 0) velocity = { x: -1, y: 0 };
      break;
    case "ArrowRight":
      if (velocity.x === 0) velocity = { x: 1, y: 0 };
      break;
  }
});

// Start the game
gameInterval = setInterval(gameLoop, 120);
