<template>
  <div class="grid-wrap" ref="gridWrap">
    <span class="game-grid" data-id="1"></span><span class="game-grid" data-id="2"></span
    ><span class="game-grid" data-id="3"></span><span class="game-grid" data-id="4"></span
    ><span class="game-grid" data-id="5"></span><span class="game-grid" data-id="6"></span
    ><span class="game-grid" data-id="7"></span><span class="game-grid" data-id="8"></span
    ><span class="game-grid" data-id="9"></span>
  </div>
  <div v-if="winner">
    <h3>{{ winner }} wins!</h3>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'

const gridSize = 3
const gridWrap = ref(null)
const gridCollection = ref([])
const gridArr = ref([])

const playerTurn = ref(false)
const aiToken = 'X'
const playerToken = 'O'

const scoreMap = { X: 10, O: -10, tie: 0 }

const winner = ref(null)

onMounted(async () => {
  await nextTick(() => {
    gridCollection.value = gridWrap.value.querySelectorAll('.game-grid')
    let arr = []
    gridCollection.value.forEach((c, i) => {
      arr.push(null)
      if (arr.length === 3) {
        gridArr.value.push(arr)
        arr = []
      }
      c.addEventListener('click', (e) => {
        setPlayerToken(c)
      })
    })
    if (!playerTurn.value) {
      cpuMove()
    }
  })
})

function setPlayerToken(c) {
  if (c.innerText || winner.value) return
  c.innerText = playerToken
  const row = Math.ceil(c.dataset.id / 3) - 1
  const column = c.dataset.id % gridSize ? (c.dataset.id % gridSize) - 1 : gridSize - 1
  gridArr.value[row][column] = playerToken
  winner.value = checkWin(gridArr.value)
  playerTurn.value = !playerTurn.value
  cpuMove()
}

function cpuMove() {
  if (winner.value) return
  const board = JSON.parse(JSON.stringify(gridArr.value))
  const { move } = minimax(board, 0, true, -Infinity, Infinity)

  gridArr.value[move.r][move.c] = aiToken
  gridCollection.value[gridSize * move.r + move.c].innerText = aiToken
  winner.value = checkWin(gridArr.value)
  playerTurn.value = !playerTurn.value
}

function checkWin(board) {
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
      winner = tokenStreak === gridSize ? board[0][c] : null
    }
  }

  for (let c = 0; c < board[0].length; c++) {
    if (winner) break
    if (!board?.[c]?.[c] || board?.[c]?.[c] !== board?.[0]?.[0]) {
      tokenStreak = 0
      break
    }
    tokenStreak++
    winner = tokenStreak === gridSize ? board?.[c]?.[c] : null
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
    winner = tokenStreak === gridSize ? board?.[board.length - 1]?.[0] : null
  }

  for (let r = 0; r < board.length; r++) {
    if (winner) break
    if (!board[r].every((c) => !!c)) {
      tokenStreak = 0
      break
    }
    tokenStreak++
    winner = tokenStreak === gridSize ? 'tie' : null
  }
  return winner
}

function minimax(board, depth, isMaximizing, alpha, beta) {
  const result = checkWin(board)
  if (depth > 4) return { score: 0 }
  if (scoreMap[result] != null) {
    if (result === 'tie') return { score: scoreMap[result] }
    const evaluated = result === aiToken ? scoreMap[result] - depth : scoreMap[result] + depth
    return { score: evaluated }
  }
  if (isMaximizing) {
    let bestScore = -Infinity
    let move = {}
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board[r].length; c++) {
        const curBoard = JSON.parse(JSON.stringify(board))
        if (curBoard[r][c] === null) {
          curBoard[r][c] = aiToken
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
          curBoard[r][c] = playerToken
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
.grid-wrap {
  margin: auto;
  display: grid;
  width: 450px;
  height: 450px;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 150px 150px 150px;
  margin-top: 20%;
}
.game-grid {
  border: 1px solid black;
  text-align: center;
  font-size: 5rem;
}
.game-grid:hover {
  cursor: pointer;
}
</style>
