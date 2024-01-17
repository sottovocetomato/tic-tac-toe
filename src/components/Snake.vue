<template>
  <div class="game">
    <canvas
      ref="gameField"
      id="game-field"
      width="500"
      height="500"
      style="border: 1px solid white"
    ></canvas>
    <h3 v-show="gameOver">You lost</h3>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'

const gameField = ref<HTMLCanvasElement | null>(null)
const gameInterval = ref<number | null>(null)
const gameIsRunning = ref<boolean>(false)
const gameOver = ref<boolean>(false)
const score = ref<number>(0)
let ctx: CanvasRenderingContext2D
const unitSize = 25
let xVelocity = unitSize
let yVelocity = 0

const gameTick = 250
let gameFieldWidth
let gameFieldHeight

let foodX
let foodY

const snake = [
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
    window.addEventListener('keydown', (e) => debounce(handleKeys)(e))
    clearCanvas()
    createFood()
    gameIsRunning.value = true
    startGame()
    // drawSnake()
  })
})

function debounce(fn) {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), gameTick / 3)
  }
}

function RandCoordinate(min, max) {
  return Math.round((Math.random() * (max - min) + min) / unitSize) * unitSize
}
function startGame() {
  gameInterval.value = setInterval(() => {
    if (gameIsRunning.value) {
      clearCanvas()
      drawFood()
      moveSnake()
      drawSnake()
    } else {
      clearInterval(gameInterval.value as number)
    }
  }, gameTick)
}
function drawSnake() {
  // console.log(snake)
  ctx.fillStyle = '#1db953'
  ctx.strokeStyle = '#eaeaea'
  snake.forEach((r) => {
    ctx.fillRect(r.x, r.y, unitSize, unitSize)
    ctx.strokeRect(r.x, r.y, unitSize, unitSize)
  })
}
function moveSnake() {
  ctx.fillStyle = '#1db953'
  ctx.strokeStyle = '#eaeaea'
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
  ctx.fillStyle = '#b91d1d'
  ctx.fillRect(foodX, foodY, unitSize, unitSize)
}
function clearCanvas() {
  ctx.clearRect(0, 0, gameFieldWidth, gameFieldHeight)
}

function handleKeys(e: KeyboardEvent) {
  const goingUp = yVelocity == -unitSize
  const goingDown = yVelocity == unitSize
  const goingRight = xVelocity == unitSize
  const goingLeft = xVelocity == -unitSize

  switch (true) {
    case e.key === 'ArrowUp' && !goingDown:
      xVelocity = 0
      yVelocity = -unitSize
      break
    case e.key === 'ArrowDown' && !goingUp:
      xVelocity = 0
      yVelocity = unitSize
      break
    case e.key === 'ArrowLeft' && !goingRight:
      xVelocity = -unitSize
      yVelocity = 0
      break
    case e.key === 'ArrowRight' && !goingLeft:
      xVelocity = unitSize
      yVelocity = 0
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

<style scoped></style>
