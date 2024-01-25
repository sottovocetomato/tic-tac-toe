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
      <h3 v-show="gameOver">Your best score: {{ bestScore }}</h3>
    </div>
    <button v-if="!gameIsRunning" class="contrast control-button" @click="startGame">Start</button>
    <button v-else class="contrast control-button" @click="restartGame">Restart</button>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import useThemeSwitch from '@/composables/useThemeSwitch'
import { getItem, setItem } from '@/utills/localStorage/storageHelper'
import IconBase from '@/components/icons/IconBase.vue'
import IconBack from '@/components/icons/IconBack.vue'

type SnakeCell = { x: number; y: number }

const { getScheme } = useThemeSwitch()
const gameField = ref<HTMLCanvasElement | null>(null)
const gameInterval = ref<number | null>(null)
const gameIsRunning = ref<boolean>(false)
const gameOver = ref<boolean>(false)
const isPaused = ref<boolean>(false)
const score = ref<number>(0)
const attempts = ref<number>(0)
const hasMoved = ref<boolean>(false)
const bestScore = ref<number | undefined>(getItem('snakeBestScore'))

const cellFillColor = computed(() => (getScheme() === 'light' ? '#efefef' : '#234977'))
const cellStrokeColor = computed(() => (getScheme() === 'light' ? '#202f3b' : '#eaeaea'))
const unitSize = 25

let ctx: CanvasRenderingContext2D

let xVelocity: number,
  yVelocity: number,
  gameFieldWidth: number,
  gameFieldHeight: number,
  foodX: number,
  foodY: number

const gameTick = 100

const snakeModel: SnakeCell[] = [
  { x: unitSize * 3, y: 0 },
  { x: unitSize * 2, y: 0 },
  { x: unitSize, y: 0 },
  { x: 0, y: 0 }
]

let snake: SnakeCell[]
onMounted(async () => {
  await nextTick(() => {
    ctx = gameField.value?.getContext('2d')
    if (!ctx) throw new Error("Can't get context!")
    gameFieldWidth = gameField.value?.width || 500
    gameFieldHeight = gameField.value?.height || 500
    window.addEventListener('keydown', (e) => handleKeys(e))
    // drawSnake()
  })
})

function RandCoordinate(min: number, max: number) {
  return Math.round((Math.random() * (max - min) + min) / unitSize) * unitSize
}
function startGame() {
  gameOver.value = false
  score.value = 0
  gameIsRunning.value = true
  attempts.value++
  xVelocity = unitSize
  yVelocity = 0
  clearCanvas()
  createFood()
  snake = [...snakeModel]
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
  snake = [...snakeModel]
  isPaused.value = false
  startGame()
}
function handleKeys(e: KeyboardEvent) {
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
function setGameOver() {
  gameIsRunning.value = false
  gameOver.value = true
  if (!bestScore.value || bestScore.value < score.value) {
    bestScore.value = score.value
    setItem('snakeBestScore', bestScore.value as number)
    return
  }
}
function checkGameOver(head: SnakeCell) {
  if (head.x >= gameFieldWidth || head.x < 0 || head.y >= gameFieldHeight || head.y < 0) {
    setGameOver()
  }

  for (let i = 0; i < snake.length; i++) {
    if (snake[i].x === head.x && snake[i].y === head.y) {
      setGameOver()
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
