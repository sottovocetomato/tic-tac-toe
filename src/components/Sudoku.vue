<template>
  <div class="game">
    <!--    <div :id="`winner-message${winner ? '-show' : ''}`">-->
    <!--      <h3>{{ winner?.toUpperCase() }} {{ winner !== 'tie' ? 'wins!' : '!' }}</h3>-->
    <!--    </div>-->
    <h3 :id="`winner-message${puzzleSolved ? '-show' : ''}`">Congrats! You solved this puzzle!</h3>
    <div class="grid-wrap" ref="gridWrap" :key="wrapKey">
      <input
        v-for="(cell, ind) in gridSize * gridSize"
        :key="cell"
        :data-id="cell"
        @input="(e) => checkAnswer(e, ind)"
        :value="gridArr[Math.floor(ind / 9)]?.[ind % 9]"
        :class="`game-grid game-grid${getScheme() === 'light' ? '-black' : '-white'} ${
          (ind + 1) % 3 === 0 && (ind + 1) % 9 !== 0 ? 'vertical-margin' : ''
        } ${(ind > 17 && ind < 27) || (ind > 44 && ind < 54) ? 'horizontal-margin' : ''}`"
      />
    </div>
    <div class="game-controls">
      <!--      <button @click="startGame" class="contrast control-button">-->
      <!--        {{ !gameIsRunning ? 'Start' : 'Restart' }}-->
      <!--      </button>-->
      <div class="game-controls-grid">
        <button
          @click="() => setGenerationLimit(30)"
          :class="`contrast control-button ${generationLimit === 30 ? 'active' : ''}`"
        >
          Easy
        </button>
        <button
          @click="() => setGenerationLimit(22)"
          :class="`contrast control-button ${generationLimit === 22 ? 'active' : ''}`"
        >
          Medium
        </button>
        <button
          @click="() => setGenerationLimit(15)"
          :class="`contrast control-button ${generationLimit === 15 ? 'active' : ''}`"
        >
          Hard
        </button>
      </div>
      <button
        @click="onSudokuGenerate"
        :class="`contrast control-button ${generating ? 'disabled' : ''}`"
        :disabled="generating"
      >
        Generate Sudoku
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import useThemeSwitch from '@/composables/useThemeSwitch'

const { getScheme } = useThemeSwitch()
type gridBoard = (string | null)[][]

const gridSize = ref<number>(9)
const gridWrap = ref<HTMLDivElement | null>(null)
const gridCollection = ref<NodeListOf<HTMLElement> | []>([])
const gridArr = ref<gridBoard>([])
const solvedPuzzle = ref<number[]>([])
const generatedPuzzle = ref<number[]>([])
const wrapKey = ref(0)
const generating = ref(false)
const puzzleSolved = ref(false)
const generationLimit = ref(30)

onMounted(async () => await setupSudoku())

function doubleRaf(callback) {
  requestAnimationFrame(() => {
    requestAnimationFrame(callback)
  })
}

function setGenerationLimit(limit) {
  generationLimit.value = limit
}
async function setupSudoku() {
  const savedBoard = JSON.parse(localStorage.getItem('savedBoard') || 'null')
  const puzzleInProgress = JSON.parse(localStorage.getItem('puzzleInProgress') || 'null')
  await nextTick(async () => {
    if (savedBoard) {
      gridArr.value = puzzleInProgress || savedBoard.puzzle
      generatedPuzzle.value = savedBoard.puzzle
      solvedPuzzle.value = savedBoard.solvedPuzzle
    } else {
      onSudokuGenerate()
    }
  })
  await nextTick(() => {
    gridCollection.value = gridWrap.value?.querySelectorAll('.game-grid') || []
    checkLoadedBoard()
  })
}

function checkAnswer(e, ind) {
  if (!e.target.value) {
    if (e.target.classList.contains('wrong-answer') || e.target.classListcontains('right-answer'))
      e.target.classList.remove(
        e.target.classList.contains('wrong-answer') ? 'wrong-answer' : 'right-answer'
      )
    return
  }
  if (isNaN(parseInt(e.target.value)) || parseInt(e.target.value) > 9) {
    e.target.value = ''
    return
  }
  const check = e.target.value == solvedPuzzle.value?.[Math.floor(ind / 9)]?.[ind % 9]
  gridArr.value[Math.floor(ind / 9)][ind % 9] = e.target.value
  localStorage.setItem('puzzleInProgress', JSON.stringify(gridArr.value))

  e.target.classList.add(check ? 'right-answer' : 'wrong-answer')
  e.target.classList.remove(check ? 'wrong-answer' : 'right-answer')
  checkSolved()
}

function onSudokuGenerate() {
  generating.value = true
  doubleRaf(() => {
    sudokuGenerator(generationLimit.value)
    generating.value = false
  })
}

function sudokuGenerator(limit = 30) {
  const sudokuField = Array.from(Array(9), () => new Array(9).fill(null))
  wrapKey.value++
  let numbersDone = 0
  // console.log(generating.value, 'generating.value')
  while (numbersDone < limit) {
    const x = Math.floor(Math.random() * 9)
    const y = Math.floor(Math.random() * 9)
    const number = Math.floor(Math.random() * 9) + 1

    if (!sudokuField[y][x]) {
      const isValid = checkDuplicateNumbers(sudokuField, x, y, number)
      if (isValid) {
        sudokuField[y][x] = number
        numbersDone++
      }
    }
  }

  const canSolve = solveSudoku(sudokuField)
  if (!canSolve) {
    sudokuGenerator(generationLimit.value)
  } else {
    gridArr.value = sudokuField
    generatedPuzzle.value = sudokuField
    const boardToSave = {
      puzzle: sudokuField,
      solvedPuzzle: solvedPuzzle.value
    }
    localStorage.setItem('savedBoard', JSON.stringify(boardToSave))
  }
}

function solveSudoku(board) {
  const filledBoard = fillEmptyCell(board)
  if (!filledBoard) {
    return false
  }
  solvedPuzzle.value = filledBoard
  return true
}

function findEmpty(board) {
  let empty = null
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (empty) break
      if (!board[r][c]) {
        empty = [r, c]
      }
    }
  }
  return empty
}
function fillEmptyCell(board) {
  const emptyCell = findEmpty(board)

  if (!emptyCell) {
    return board
  }
  const [y, x] = emptyCell
  const currBoard = JSON.parse(JSON.stringify(board))

  for (let n = 1; n < 10; n++) {
    const isValid = checkDuplicateNumbers(currBoard, x, y, n)
    if (isValid) {
      currBoard[y][x] = n
      const res = fillEmptyCell(currBoard)
      if (res) return res
    }
  }
  return false
}

function checkDuplicateNumbers(currBoard, x, y, n) {
  const horizontalCheck = checkHorizontal(currBoard, y, n)
  const verticalCheck = checkVertical(currBoard, x, n)
  const boxCheck = checkBox(currBoard, x, y, n)
  return horizontalCheck && verticalCheck && boxCheck
}

function checkHorizontal(board, y, n) {
  for (let c = 0; c < board[y].length; c++) {
    if (board[y][c] === n) return false
  }
  return true
}
function checkVertical(board, x, n) {
  for (let r = 0; r < board[x].length; r++) {
    if (board[r][x] === n) return false
  }
  return true
}
function checkBox(board, x, y, n) {
  const r1 = Math.floor(y / 3) * 3
  const r2 = Math.floor(y / 3) * 3 + 3
  const c1 = Math.floor(x / 3) * 3
  const c2 = Math.floor(x / 3) * 3 + 3
  // console.log(r1, r2, c1, c2)
  for (let r = r1; r < r2; r++) {
    for (let c = c1; c < c2; c++) {
      if (board[r][c] === n) return false
    }
  }
  return true
}

function checkLoadedBoard() {
  gridCollection.value.forEach((el, ind) => {
    const initialVal = el.value == generatedPuzzle.value?.[Math.floor(ind / 9)]?.[ind % 9]
    const check = el.value == solvedPuzzle.value?.[Math.floor(ind / 9)]?.[ind % 9]
    if (!initialVal && el.value) el.classList.add(check ? 'right-answer' : 'wrong-answer')
  })
}

function checkSolved() {
  let win = true
  gridCollection.value.forEach((el, ind) => {
    const check = el.value == solvedPuzzle.value?.[Math.floor(ind / 9)]?.[ind % 9]
    if (!check) win = false
  })
  puzzleSolved.value = !!win
}
</script>

<style scoped lang="scss">
input {
  padding: 0 !important;

  margin-bottom: 0 !important;
}
.game {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: auto;
  padding: 20px 0;
}
.grid-cells-wrap {
  width: 150px;
  height: 150px;
}
.game-grid {
  text-align: center;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  /*font-size: 5rem;*/
  /*font-size: 1rem;*/
  font-family: sans-serif;
  height: 50px;
  width: 50px;
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
  .game-controls-grid {
    display: grid;
    grid-template-columns: repeat(3, 150px);
    grid-column-gap: 20px;
    button {
      width: 150px;
    }
  }
}
.grid-wrap {
  width: 490px;
  height: 490px;
  //grid-template-columns: repeat(9, 50px);
  //grid-template-rows: repeat(9, 50px);
  //grid-row-gap: 5px;
  //grid-column-gap: 5px;
  display: flex !important;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
}
.game-grid {
  margin-right: 2px;
  margin-bottom: 2px;
}
.game-grid:hover {
  cursor: pointer;
}
.vertical-margin {
  margin-right: 10px !important;
}
.horizontal-margin {
  margin-bottom: 10px !important;
}
.wrong-answer {
  background: rgba(255, 0, 0, 0.36);
}
.right-answer {
  background: rgba(64, 255, 0, 0.18);
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}
#winner-message {
  height: auto;
  opacity: 0;
  &-show {
    opacity: 1;
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
.control-button.active {
  filter: opacity(0.6);
}
</style>
