<template>
  <div class="game">
    <canvas
      ref="gameField"
      id="game-field"
      width="500"
      height="500"
      style="border: 1px solid white"
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'

const gameField = ref<HTMLCanvasElement | null>(null)
const gameInterval = ref<number | null>(null)
let ctx: CanvasRenderingContext2D = null
const unitSize = 25
let xVelocity = unitSize
let yVelocity = 0

const gameTick = 500
const gameFieldWidth = 500
const gameFieldHeight = 500

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
    window.addEventListener('keydown', (e) => handleKeys(e))
    clearCanvas()
    createFood()
    gameInterval.value = setInterval(() => {
      clearCanvas()
      drawFood()
      moveSnake()
      drawSnake()
    }, gameTick)
  })
})

function RandCoordinate(min, max) {
  return Math.round((Math.random() * (max - min) + min) / unitSize) * unitSize
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
  snake.unshift(head)
  snake.pop()
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
  console.log(goingUp)
  switch (true) {
    case e.key === 'ArrowUp' && !goingDown:
      xVelocity = 0
      yVelocity = -unitSize
      break
    case e.key === 'ArrowDown' && !goingUp:
      xVelocity = 0
      yVelocity = unitSize
      console.log('hello')
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
  console.log(yVelocity, xVelocity)
}
</script>

<style scoped></style>
