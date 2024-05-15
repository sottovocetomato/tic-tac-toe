<template>
  <div class="game">
    <!--    <div :id="`winner-message${winner ? '-show' : ''}`">-->
    <!--      <h3>{{ winner?.toUpperCase() }} {{ winner !== 'tie' ? 'wins!' : '!' }}</h3>-->
    <!--    </div>-->
    <div class="grid-wrap" ref="gridWrap" :key="gridSize">
      <input
        v-for="(cell, ind) in gridSize * gridSize"
        :key="cell"
        :data-id="cell"
        :class="`game-grid game-grid${getScheme() === 'light' ? '-black' : '-white'} ${
          (ind + 1) % 3 === 0 && (ind + 1) % 9 !== 0 ? 'vertical-margin' : ''
        } ${(ind > 17 && ind < 27) || (ind > 44 && ind < 54) ? 'horizontal-margin' : ''}`"
      />
    </div>
    <div class="game-controls">
      <!--      <button @click="startGame" class="contrast control-button">-->
      <!--        {{ !gameIsRunning ? 'Start' : 'Restart' }}-->
      <!--      </button>-->
      <div class="grid">
        <!--        <div>-->
        <!--          <label for="game-difficulty" class="select-label">Choose grid size:</label>-->
        <!--          <select id="game-difficulty" @change="changeGridSize" :disabled="gameIsRunning">-->
        <!--            <option value="3">3x3</option>-->
        <!--            <option value="5">5x5</option>-->
        <!--            &lt;!&ndash;    <option value="10">10x10</option>&ndash;&gt;-->
        <!--          </select>-->
        <!--        </div>-->
        <!--        <div>-->
        <!--          <label for="starting-player" class="select-label">Choose starting player:</label>-->
        <!--          <select-->
        <!--            id="starting-player"-->
        <!--            @change="(e) => changeStartingP(e)"-->
        <!--            :disabled="gameIsRunning"-->
        <!--            required-->
        <!--          >-->
        <!--            <option value="human">Human</option>-->
        <!--            <option value="ai">Ai</option>-->
        <!--          </select>-->
        <!--        </div>-->

        <!--        <div>-->
        <!--          <label for="game-difficulty" class="select-label">Choose ai difficulty:</label>-->
        <!--          <select id="game-difficulty" @change="changeDifficulty" :disabled="gameIsRunning">-->
        <!--            <option value="1">Medium</option>-->
        <!--            <option value="4">Hard</option>-->
        <!--          </select>-->
        <!--        </div>-->
      </div>
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
const gridWrapWidth = 450

onMounted(async () => await setupGridInteractions())
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
      // c.addEventListener('click', () => {
      //   playerMove(c)
      // })
    })
  })
}
//Проверка грида по вертикали
//Проверка грида по горизонтали
//Проверка бокса грида
//Заполнение грида
function fillCells(board) {
  const emptyCell = findEmpty(board)
  if (!emptyCell) {
    return
  }
  const filledBoard = fillEmptyCell(emptyCell, board)
  if (!filledBoard) {
    return
  }
  fillCells(filledBoard)
}

function findEmpty(board) {
  let empty = null
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (empty) return
      if (!board[r][c]?.value) {
        empty = [r, c]
      }
    }
  }
  return empty
}
function fillEmptyCell(cell, board) {
  const [y, x] = cell
  const currBoard = JSON.parse(JSON.stringify(board))
  for (let n = 0; n < 9; n++) {
    currBoard[y][x].value = n
    const horizontalCheck = checkHorizontal(currBoard, y, n)
    const verticalCheck = checkVertical(currBoard, x, n)
    const boxCheck = checkBox(currBoard, x, y, n)
    if (horizontalCheck && verticalCheck && boxCheck) return currBoard
  }
  return false
}

function checkHorizontal(board, y, n) {
  for (let c = 0; c < board[y].length; c++) {
    if (board[y][c].value === n) return false
  }
  return true
}
function checkVertical(board, x, n) {
  for (let r = 0; r < board[x].length; r++) {
    if (board[r][x].value === n) return false
  }
  return true
}
function checkBox(board, x, y, n) {
  for (let r = 0; r < board[x].length; r++) {
    if (board[r][x].value === n) return false
  }
  return true
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
  .grid {
    width: 100%;
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
</style>
