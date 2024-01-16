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

const gameTick = 5000
const gameFieldWidth = 500
const gameFieldHeight = 500

const snake = [
  { x: unitSize * 3, y: 0 },
  { x: unitSize * 2, y: 0 },
  { x: unitSize, y: 0 },
  { x: 0, y: 0 }
]

onMounted(async () => {
  await nextTick(() => {
    ctx = gameField.value?.getContext('2d')

    // gameInterval.value = setInterval(() => {}, gameTick)
  })
})

function RandCoordinate(min, max) {
  return Math.round((Math.random() * (max - min) + min) / unitSize) * unitSize
}
function drawSnake() {
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
}
function drawFood() {
  const randX = RandCoordinate(0, gameFieldWidth - unitSize)
  const randY = RandCoordinate(0, gameFieldWidth - unitSize)
  console.log(randX)
  ctx.fillStyle = '#b91d1d'
  ctx.fillRect(randX, randY, unitSize, unitSize)
}
function clearCanvas() {
  ctx.clearRect(0, 0, gameFieldWidth, gameFieldHeight)
}
</script>

<style scoped></style>
