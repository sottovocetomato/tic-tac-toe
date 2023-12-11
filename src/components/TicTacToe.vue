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
const cpuTurn = computed(() => !playerTurn.value)
const aiToken = 'X'
const playerToken = 'O'

const scoreMap = { X: 10, O: -10, tie: 0 }

const token = computed(() => (playerTurn.value ? playerToken : aiToken))
const winner = ref(null)

onMounted(async () => {
  await nextTick(() => {
    console.log(gridWrap.value, 'gridWrap.value')
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
    startGame()
  })
})

function setPlayerToken(c) {
  if (c.innerText) return
  c.innerText = token.value
  const row = Math.ceil(c.dataset.id / 3) - 1
  const column = c.dataset.id % gridSize ? (c.dataset.id % gridSize) - 1 : gridSize - 1
  gridArr.value[row][column] = token.value
  playerTurn.value = !playerTurn.value
  cpuMove()
}

function startGame() {
  if (!playerTurn.value) cpuMove()
}

function cpuMove() {
  let bestScore = -Infinity
  let move = { r: -1, c: -1 }

  for (let r = 0; r < gridArr.value.length; r++) {
    for (let c = 0; c < gridArr.value[r].length; c++) {
      const curBoard = JSON.parse(JSON.stringify(gridArr.value))
      if (curBoard[r][c] === null) {
        curBoard[r][c] = aiToken
        const score = minimax(curBoard, 0, false)

        if (score > bestScore) {
          bestScore = score
          move = { r, c }
        }
      }
    }
  }
  gridArr.value[move.r][move.c] = token.value
  gridCollection.value[gridSize * move.r + move.c].innerText = token.value
  playerTurn.value = !playerTurn.value
}

function checkWin(board) {
  let winner = null
  // console.log(board, 'board')
  for (let r = 0; r < board.length; r++) {
    if (board[r].every((c) => !!c && c === board[r][0])) {
      winner = board[r][0]
      return winner
    }
  }

  for (let c = 0; c < board.length; c++) {
    for (let r = 0; r < board.length; r++) {
      if (!board?.[r]?.[c]) break

      if (board?.[r]?.[c] !== board?.[0]?.[c]) break
      if (r === board.length - 1) {
        winner = board[0][c]
        return winner
      }
    }
  }

  for (let c = 0; c < board[0].length; c++) {
    if (!board?.[c]?.[c]) break
    if (board?.[c]?.[c] !== board?.[0]?.[0]) {
      break
    }
    if (c === board[0].length - 1) {
      winner = board?.[c]?.[c]
      return winner
    }
  }
  for (let c = 0; c < board[0].length; c++) {
    if (!board?.[board.length - (c + 1)]?.[c]) break
    if (board?.[board.length - (c + 1)]?.[c] !== board?.[board.length - 1]?.[0]) {
      break
    }
    if (c === board[0].length - 1) {
      winner = board?.[board.length - 1]?.[0]
      return winner
    }
  }

  for (let r = 0; r < board.length; r++) {
    if (!board[r].every((c) => !!c)) break
    if (r === board.length - 1 && winner == null) {
      winner = 'tie'
      return winner
    }
  }
}

function minimax(board, depth, isMaximizing) {
  const result = checkWin(board)
  if (scoreMap[result] != null) {
    // console.log(result, scoreMap[result], depth)
    if (result === 'tie') return scoreMap[result]
    const evaluated = result === aiToken ? scoreMap[result] - depth : scoreMap[result] + depth
    return evaluated
    // return scoreMap[result]
  }
  // const curBoard = JSON.parse(JSON.stringify(board))
  if (isMaximizing) {
    let bestScore = -Infinity
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board[r].length; c++) {
        const curBoard = JSON.parse(JSON.stringify(board))
        if (curBoard[r][c] === null) {
          curBoard[r][c] = aiToken
          const score = minimax(curBoard, depth + 1, false)
          bestScore = Math.max(score, bestScore)
        }
      }
    }
    // console.log(bestScore, depth, isMaximizing)
    return bestScore
  } else {
    let bestScore = Infinity
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board[r].length; c++) {
        const curBoard = JSON.parse(JSON.stringify(board))
        if (curBoard[r][c] === null) {
          curBoard[r][c] = playerToken
          const score = minimax(curBoard, depth + 1, true)
          bestScore = Math.min(score, bestScore)
        }
      }
    }
    // console.log(bestScore, depth, isMaximizing)
    return bestScore
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
