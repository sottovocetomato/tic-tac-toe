<template>
  <div class="grid-wrap" ref="gridWrap" :style="gridStyle" :key="gridSize">
    <span v-for="cell in gridSize * gridSize" :key="cell" :data-id="cell" class="game-grid"></span>
  </div>
  <div class="game-controls">
    <button @click="startGame">{{ !gameIsRunning ? 'Start' : 'Restart' }}</button>
    <div>
      <label for="game-difficulty" class="select-label">Choose gridSize:</label>
      <select id="game-difficulty" @change="changeGridSize" :disabled="gameIsRunning">
        <option value="3">3x3</option>
        <option value="5">5x5</option>
        <!--    <option value="10">10x10</option>-->
      </select>
    </div>
    <div>
      <label for="starting-player" class="select-label">Choose starting player:</label>
      <select id="starting-player" @change="(e) => changeStartingP(e)" :disabled="gameIsRunning">
        <option value="human">Human</option>
        <option value="ai">Ai</option>
      </select>
    </div>

    <div>
      <label for="game-difficulty" class="select-label">Choose ai difficulty:</label>
      <select id="game-difficulty" @change="changeDifficulty" :disabled="gameIsRunning">
        <option value="2">Medium</option>
        <option value="4">Hard</option>
      </select>
    </div>

    <div v-if="winner">
      <h3>{{ winner }} wins!</h3>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'

type gridBoard = (string | null)[][]

const gridSize = ref<number>(3)
const gridWrap = ref<HTMLDivElement | null>(null)
const gridCollection = ref<NodeList | []>([])
const gridArr = ref<gridBoard>([])

const isAiFirst = ref<boolean>(false)

const gameDepth = ref<number>(1)

const maximizerToken = 'X'
const minimizerToken = 'O'

const aiToken = computed<string>(() => (isAiFirst.value ? maximizerToken : minimizerToken))
const playerToken = computed<string>(() => (isAiFirst.value ? minimizerToken : maximizerToken))

const gridStyle = computed<{}>(() => ({
  gridTemplateColumns: `repeat(${gridSize.value}, minmax(${450 / gridSize.value}px, 1fr))`,
  fontSize: `${15 / gridSize.value}rem`
}))

const gameIsRunning = ref<boolean>(false)
const gamesPlayed = ref<number>(0)
const playerTurn = ref<boolean>(true)

const scoreMap = { X: 10, O: -10, tie: 0 }

const winner = ref<string>('')

onMounted(async () => await setupGridInteractions())

function changeStartingP(e: Event) {
  isAiFirst.value = (e.target as HTMLInputElement).value === 'ai'
}
function changeDifficulty(e: Event) {
  gameDepth.value = +(e.target as HTMLInputElement).value
}
function changeGridSize(e: Event) {
  gridSize.value = +(e.target as HTMLInputElement).value
  setupGridInteractions()
}

async function setupGridInteractions() {
  await nextTick(() => {
    gridCollection.value = gridWrap.value?.querySelectorAll('.game-grid')
    let arr: (string | null)[] = []
    gridArr.value = []
    gridCollection.value.forEach((c: HTMLElement) => {
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
      gridCollection.value.forEach((c: HTMLElement) => (c.innerText = ''))
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
  if (!playerTurn.value || c.innerText || winner.value || !gameIsRunning.value) return
  c.innerText = playerToken.value
  const row = Math.ceil(c.dataset.id / gridSize.value) - 1
  const column =
    c.dataset.id % gridSize.value ? (c.dataset.id % gridSize.value) - 1 : gridSize.value - 1
  gridArr.value[row][column] = playerToken.value
  winner.value = checkWin(gridArr.value)
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

  gridArr.value[move.r][move.c] = aiToken.value
  gridCollection.value[gridSize.value * move.r + move.c].innerText = aiToken.value
  winner.value = checkWin(gridArr.value)
  if (winner.value) {
    gameIsRunning.value = false
    return
  }
  playerTurn.value = true
}

function checkWin(board: gridBoard) {
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
  if (scoreMap[result] != null) {
    if (result === 'tie') return { score: scoreMap[result] }
    const evaluated = result === aiToken.value ? scoreMap[result] - depth : scoreMap[result] + depth
    return { score: evaluated }
  }
  if (isMaximizing) {
    let bestScore = -Infinity
    let move = {}
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
    let move = {}
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

<style scoped>
.game-controls {
  margin: 15px auto;
  display: flex;
  width: 450px;
  height: 150px;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}
.grid-wrap {
  margin: auto;
  display: grid;
  width: 450px;
  height: 450px;
  /*grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));*/
  grid-auto-rows: 1fr;
  margin-top: 20%;
}
.game-grid {
  border: 1px solid black;
  text-align: center;
  /*font-size: 5rem;*/
  /*font-size: 1rem;*/
}
.game-grid:hover {
  cursor: pointer;
}
.select-label {
  margin-right: 10px;
}
</style>
