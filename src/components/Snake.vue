<template>
  <div class="game">
    <div class="score">
      <h4>Score: {{ score }}</h4>
      <h4>Attempts: {{ attempts }}</h4>
    </div>
    <canvas
      ref="gameField"
      id="game-field"
      width="500"
      height="500"
      :class="`${gameOver ? 'blur' : ''}`"
      :style="`border: 4px solid ${getScheme() === 'light' ? '#11191f' : '#efefef'}`"
    >
    </canvas>
    <div class="overlay" v-show="gameOver"></div>
    <div id="gameOverText">
      <h2 v-show="gameOver">Game Over!</h2>
    </div>
    <button class="contrast control-button" @click="restartGame">Restart</button>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import useThemeSwitch from '@/composables/useThemeSwitch'
const { getScheme } = useThemeSwitch()
const gameField = ref<HTMLCanvasElement | null>(null)
const gameInterval = ref<number | null>(null)
const gameIsRunning = ref<boolean>(false)
const gameOver = ref<boolean>(false)
const isPaused = ref<boolean>(false)
const score = ref<number>(0)
const attempts = ref<number>(0)
const hasMoved = ref<boolean>(false)

const cellFillColor = computed(() => (getScheme() === 'light' ? '#efefef' : '#234977'))
const cellStrokeColor = computed(() => (getScheme() === 'light' ? '#202f3b' : '#eaeaea'))

let ctx: CanvasRenderingContext2D
const unitSize = 25
let xVelocity = unitSize
let yVelocity = 0

const gameTick = 100
let gameFieldWidth
let gameFieldHeight

let foodX
let foodY

let snake = [
  { x: unitSize * 3, y: 0 },
  { x: unitSize * 2, y: 0 },
  { x: unitSize, y: 0 },
  { x: 0, y: 0 }
]

onMounted(async () => {
  await nextTick(() => {
    ctx = gameField.value?.getContext('2d')
    gameFieldWidth = gameField.value?.width
    gameFieldHeight = gameField.value?.height
    window.addEventListener('keydown', (e) => handleKeys(e))
    clearCanvas()
    createFood()
    gameIsRunning.value = true
    startGame()
    // drawSnake()
  })
})

function RandCoordinate(min, max) {
  return Math.round((Math.random() * (max - min) + min) / unitSize) * unitSize
}
function startGame() {
  gameInterval.value = setInterval(() => {
    if (gameIsRunning.value && !isPaused.value) {
      clearCanvas()
      drawFood()
      moveSnake()
      drawSnake()
    } else if (!gameIsRunning.value) {
      clearInterval(gameInterval.value as number)
    }
  }, gameTick)
}
function drawSnake() {
  // console.log(snake)
  ctx.fillStyle = cellFillColor.value
  ctx.strokeStyle = cellStrokeColor.value
  snake.forEach((r) => {
    ctx.fillRect(r.x, r.y, unitSize, unitSize)
    ctx.strokeRect(r.x, r.y, unitSize, unitSize)
  })
}
function moveSnake() {
  hasMoved.value = false
  const head = { x: snake[0].x + xVelocity, y: snake[0].y + yVelocity }
  checkGameOver(head)
  if (gameIsRunning.value) {
    snake.unshift(head)
    if (head.x === foodX && head.y === foodY) {
      score.value++
      createFood()
      return
    }
    snake.pop()
  }
}
function createFood() {
  foodX = RandCoordinate(0, gameFieldWidth - unitSize)
  foodY = RandCoordinate(0, gameFieldWidth - unitSize)
}
function drawFood() {
  ctx.fillStyle = cellFillColor.value
  ctx.strokeStyle = cellStrokeColor.value
  ctx.fillRect(foodX, foodY, unitSize, unitSize)
  ctx.strokeRect(foodX, foodY, unitSize, unitSize)
}
function clearCanvas() {
  ctx.clearRect(0, 0, gameFieldWidth, gameFieldHeight)
}
function restartGame() {
  clearInterval(gameInterval.value as number)
  snake = [
    { x: unitSize * 3, y: 0 },
    { x: unitSize * 2, y: 0 },
    { x: unitSize, y: 0 },
    { x: 0, y: 0 }
  ]
  score.value = 0
  attempts.value++
  clearCanvas()
  createFood()
  gameIsRunning.value = true
  gameOver.value = false
  isPaused.value = false
  startGame()
}
function handleKeys(e: KeyboardEvent) {
  console.log(e)
  if (e.code === 'Space') {
    isPaused.value = !isPaused.value
  }
  if (hasMoved.value) return
  const goingUp = yVelocity == -unitSize
  const goingDown = yVelocity == unitSize
  const goingRight = xVelocity == unitSize
  const goingLeft = xVelocity == -unitSize

  switch (true) {
    case e.key === 'ArrowUp' && !goingDown:
      xVelocity = 0
      yVelocity = -unitSize
      hasMoved.value = true
      break
    case e.key === 'ArrowDown' && !goingUp:
      xVelocity = 0
      yVelocity = unitSize
      hasMoved.value = true
      break
    case e.key === 'ArrowLeft' && !goingRight:
      xVelocity = -unitSize
      yVelocity = 0
      hasMoved.value = true
      break
    case e.key === 'ArrowRight' && !goingLeft:
      xVelocity = unitSize
      yVelocity = 0
      hasMoved.value = true
      break
  }
}
function checkGameOver(head) {
  if (head.x >= gameFieldWidth || head.x < 0 || head.y >= gameFieldHeight || head.y < 0) {
    console.log(snake[0].x)
    gameIsRunning.value = false
    gameOver.value = true
  }

  for (let i = 0; i < snake.length; i++) {
    if (snake[i].x === head.x && snake[i].y === head.y) {
      gameIsRunning.value = false
      gameOver.value = true
    }
  }
}
</script>

<style scoped lang="scss">
.game {
  display: flex;

  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 90vh;
  padding: 20px 0;
  position: relative;
  h3,
  h4,
  h2,
  h5,
  button {
    font-family: 'Silkscreen', sans-serif !important;
  }
}

.score {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 508px;
  h4 {
    margin-bottom: 10px;
  }
}

#gameOverText {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  text-align: center;
  h2 {
    font-size: 2.5rem;
    text-shadow: 3px 2px black;
  }
}
.blur {
  filter: blur(5px);
}
.control-button {
  margin: 25px 0;
  min-width: 150px;
  width: 25%;
}
</style>
