<template>
  <div class="game">
    <div :id="`winner-message${winner ? '-show' : ''}`">
      <h3>{{ winner?.toUpperCase() }} {{ winner !== 'tie' ? 'wins!' : '!' }}</h3>
    </div>
    <div class="grid-wrap" ref="gridWrap" :style="gridStyle" :key="gridSize">
      <span
        v-for="cell in gridSize * gridSize"
        :key="cell"
        :data-id="cell"
        :class="`game-grid game-grid${getScheme() === 'light' ? '-black' : '-white'}`"
      ></span>
    </div>
    <div class="game-controls">
      <button @click="startGame" class="contrast control-button">
        {{ !gameIsRunning ? 'Start' : 'Restart' }}
      </button>
      <div class="grid">
        <div>
          <label for="game-difficulty" class="select-label">Choose grid size:</label>
          <select id="game-difficulty" @change="changeGridSize" :disabled="gameIsRunning">
            <option value="3">3x3</option>
            <option value="5">5x5</option>
            <!--    <option value="10">10x10</option>-->
          </select>
        </div>
        <div>
          <label for="starting-player" class="select-label">Choose starting player:</label>
          <select
            id="starting-player"
            @change="(e) => changeStartingP(e)"
            :disabled="gameIsRunning"
            required
          >
            <option value="human">Human</option>
            <option value="ai">Ai</option>
          </select>
        </div>

        <div>
          <label for="game-difficulty" class="select-label">Choose ai difficulty:</label>
          <select id="game-difficulty" @change="changeDifficulty" :disabled="gameIsRunning">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import useThemeSwitch from '@/composables/useThemeSwitch'

type Move = { r: number; c: number }

const { getScheme } = useThemeSwitch()

type gridBoard = (string | null)[][]

const moveCount = ref<number>(0)

const gridSize = ref<number>(3)
const gridWrap = ref<HTMLDivElement | null>(null)
const gridCollection = ref<NodeListOf<HTMLElement> | []>([])
const gridArr = ref<gridBoard>([])

const winCheckOffset = computed<number>(() => (gridSize.value === 3 ? 5 : 9))

const isAiFirst = ref<boolean>(false)

const gameDepth = ref<number>(1)
const gameDifficulty = ref<string>('easy')

const maximizerToken = 'X'
const minimizerToken = 'O'

const aiToken = computed<string>(() => (isAiFirst.value ? maximizerToken : minimizerToken))
const playerToken = computed<string>(() => (isAiFirst.value ? minimizerToken : maximizerToken))
const gridWrapWidth = computed<number>(() =>
  gridWrap.value ? parseInt(window.getComputedStyle(gridWrap.value)?.width) : 450
)

const gridStyle = computed<{}>(() => ({
  gridTemplateColumns: `repeat(${gridSize.value}, minmax(${
    gridWrapWidth.value / gridSize.value
  }px, 1fr))`,
  fontSize: `${gridWrapWidth.value / gridSize.value / 35}rem`,
  color: `${getScheme() === 'light' ? '#415462' : '#bbc6ce'}`
}))

const gameIsRunning = ref<boolean>(false)
const gamesPlayed = ref<number>(0)
const playerTurn = ref<boolean>(true)

const scoreMap: { [index: string]: any } = { X: 10, O: -10, tie: 0 }

const winner = ref<string>('')

onMounted(async () => await setupGridInteractions())

function changeStartingP(e: Event) {
  isAiFirst.value = (e.target as HTMLInputElement).value === 'ai'
}
function changeDifficulty(e: Event) {
  gameDifficulty.value = (e.target as HTMLInputElement).value
  changeGameDepth()
}

function changeGameDepth() {
  if (gridSize.value === 3 && gameDifficulty.value === 'easy') {
    gameDepth.value = 3
  }
  if (gridSize.value === 5 && gameDifficulty.value === 'easy') {
    gameDepth.value = 1
  }
  if (gridSize.value === 3 && gameDifficulty.value === 'medium') {
    gameDepth.value = 7
  }
  if (gridSize.value === 5 && gameDifficulty.value === 'medium') {
    gameDepth.value = 3
  }
}
function changeGridSize(e: Event) {
  gridSize.value = +(e.target as HTMLInputElement).value
  changeGameDepth()
  setupGridInteractions()
}

async function setupGridInteractions() {
  await nextTick(() => {
    gridCollection.value = gridWrap.value?.querySelectorAll('.game-grid') || []

    let arr: (string | null)[] = []
    gridArr.value = []
    gridCollection.value.forEach((c) => {
      arr.push(null)
      if (arr.length === gridSize.value) {
        gridArr.value?.push(arr)
        arr = []
      }
      c.addEventListener('click', () => {
        playerMove(c)
      })
    })
  })
}

function startGame() {
  playerTurn.value = !isAiFirst.value
  if (gamesPlayed.value)
    if (gamesPlayed.value > 0) {
      winner.value = ''
      gridCollection.value.forEach((c) => (c.innerText = ''))
      for (let r = 0; r < gridArr.value.length; r++) {
        for (let c = 0; c < gridArr.value[r].length; c++) {
          gridArr.value[r][c] = null
        }
      }
      // gridKey.value++
    }

  gameIsRunning.value = true

  gamesPlayed.value++
  if (isAiFirst.value) {
    cpuMove()
  }
}

function playerMove(c: HTMLElement) {
  // console.log(!!c.innerText, 'c.innerText')
  if (!c) return
  if (!playerTurn.value || c.innerText || winner.value || !gameIsRunning.value) return
  c.innerText = playerToken.value
  const cellId = parseInt(c!.dataset!.id || '')
  if (isNaN(cellId)) return
  const row = Math.ceil(cellId / gridSize.value) - 1
  const column = cellId % gridSize.value ? (cellId % gridSize.value) - 1 : gridSize.value - 1

  gridArr.value[row][column] = playerToken.value
  moveCount.value++
  winner.value = checkWin(gridArr.value) || ''
  if (winner.value) {
    gameIsRunning.value = false
    return
  }
  playerTurn.value = false
  cpuMove()
}

function cpuMove() {
  if (winner.value || !gameIsRunning.value) return
  const board = JSON.parse(JSON.stringify(gridArr.value))
  const { move } = minimax(board, 0, isAiFirst.value, -Infinity, Infinity)
  if (move === null) return
  gridArr.value[move!.r][move!.c] = aiToken.value
  gridCollection.value[gridSize.value * move!.r + move!.c].innerText = aiToken.value
  moveCount.value++
  winner.value = checkWin(gridArr.value) || ''
  if (winner.value) {
    gameIsRunning.value = false
    return
  }
  playerTurn.value = true
}

function checkWin(board: gridBoard) {
  if (moveCount.value < winCheckOffset.value) return
  let winner = null
  let tokenStreak = 0
  for (let r = 0; r < board.length; r++) {
    if (board[r].every((c) => !!c && c === board[r][0])) {
      winner = board[r][0]
      break
    }
  }

  for (let c = 0; c < board.length; c++) {
    if (winner) break
    for (let r = 0; r < board.length; r++) {
      if (!board?.[r]?.[c] || board?.[r]?.[c] !== board?.[0]?.[c]) {
        tokenStreak = 0
        break
      }
      tokenStreak++
      winner = tokenStreak === gridSize.value ? board[0][c] : null
    }
  }

  for (let c = 0; c < board[0].length; c++) {
    if (winner) break
    if (!board?.[c]?.[c] || board?.[c]?.[c] !== board?.[0]?.[0]) {
      tokenStreak = 0
      break
    }
    tokenStreak++
    winner = tokenStreak === gridSize.value ? board?.[c]?.[c] : null
  }

  for (let c = 0; c < board[0].length; c++) {
    if (winner) break
    if (
      !board?.[board.length - (c + 1)]?.[c] ||
      board?.[board.length - (c + 1)]?.[c] !== board?.[board.length - 1]?.[0]
    ) {
      tokenStreak = 0
      break
    }
    tokenStreak++
    winner = tokenStreak === gridSize.value ? board?.[board.length - 1]?.[0] : null
  }

  for (let r = 0; r < board.length; r++) {
    if (winner) break
    if (!board[r].every((c) => !!c)) {
      tokenStreak = 0
      break
    }
    tokenStreak++
    winner = tokenStreak === gridSize.value ? 'tie' : null
  }
  return winner
}

function minimax(
  board: gridBoard,
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number
) {
  const result = checkWin(board)
  if (depth > gameDepth.value) return { score: 0 }
  if (result !== null && scoreMap[result] != null) {
    if (result === 'tie') return { score: scoreMap[result] }
    const evaluated = result === aiToken.value ? scoreMap[result] - depth : scoreMap[result] + depth
    return { score: evaluated }
  }
  console.log(depth, 'minmax works')
  if (isMaximizing) {
    let bestScore = -Infinity
    let move: Move = { r: 0, c: 0 }
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board[r].length; c++) {
        const curBoard = JSON.parse(JSON.stringify(board))
        if (curBoard[r][c] === null) {
          curBoard[r][c] = maximizerToken
          const { score } = minimax(curBoard, depth + 1, false, alpha, beta)
          move = score > bestScore ? { r, c } : move
          bestScore = Math.max(score, bestScore)
          alpha = Math.max(score, alpha)
          if (beta <= alpha) break
        }
      }
    }

    // console.log(bestScore, depth, isMaximizing)
    return { score: bestScore, move }
  } else {
    let bestScore = Infinity
    let move: Move = { r: 0, c: 0 }
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board[r].length; c++) {
        const curBoard = JSON.parse(JSON.stringify(board))
        if (curBoard[r][c] === null) {
          curBoard[r][c] = minimizerToken
          const { score } = minimax(curBoard, depth + 1, true, alpha, beta)
          move = score < bestScore ? { r, c } : move
          bestScore = Math.min(score, bestScore)
          beta = Math.min(score, beta)
          if (beta <= alpha) break
        }
      }
    }
    // console.log(bestScore, depth, isMaximizing)
    return { score: bestScore, move }
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
  height: auto;
  padding: 20px 0;
}
.game-grid {
  text-align: center;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  /*font-size: 5rem;*/
  /*font-size: 1rem;*/
  font-family: sans-serif;
  &-black {
    border: 1px solid #24333e;
  }
  &-white {
    border: 1px solid #bbc6ce;
  }
}
.game-controls {
  margin: 15px 0;
  display: flex;
  width: 850px;
  /*height: 150px;*/
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  button {
    width: 450px;
    margin-bottom: 30px;
  }
  .grid {
    width: 100%;
  }
}
.grid-wrap {
  width: 450px;
  height: 450px;
}
.game-grid:hover {
  cursor: pointer;
}
.select-label {
  margin-right: 10px;
}
#winner-message {
  height: auto;
  opacity: 0;
  &-show {
    opacity: 1;
  }
}
@media (max-width: 995px) {
  .game-controls {
    width: 100%;
  }
}
@media (max-width: 570px) {
  .game-controls {
    button {
      width: 310px;
    }
  }
  .grid-wrap {
    width: 310px;
    height: 310px;
  }
}
@media (max-width: 360px) {
  .game-controls {
    button {
      width: 210px;
    }
  }
  .grid-wrap {
    width: 210px;
    height: 210px;
  }
}
</style>
