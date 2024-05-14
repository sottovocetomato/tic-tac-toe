<template>
  <div class="game">
    <!--    <div :id="`winner-message${winner ? '-show' : ''}`">-->
    <!--      <h3>{{ winner?.toUpperCase() }} {{ winner !== 'tie' ? 'wins!' : '!' }}</h3>-->
    <!--    </div>-->
    <div class="grid-wrap" ref="gridWrap" :key="gridSize">
      <div v-for="cellWrap in gridSize" :key="cellWrap" class="grid-cells-wrap">
        <input
          v-for="cell in gridSize"
          :key="cell"
          :data-id="cell"
          :class="`game-grid game-grid${getScheme() === 'light' ? '-black' : '-white'}`"
        />
      </div>
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

const gridStyle = computed<{}>(() => ({
  gridTemplateColumns: `repeat(${gridSize.value}, 160px))`,
  gridTemplateRows: `repeat(3, 160px))`,
  fontSize: `${gridWrapWidth / gridSize.value / 35}rem`,
  color: `${getScheme() === 'light' ? '#415462' : '#bbc6ce'}`
}))

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
  width: 480px;
  height: 480px;
  grid-template-columns: repeat(3, 160px);
  grid-template-rows: repeat(3, 160px);
}
.game-grid:hover {
  cursor: pointer;
}
</style>
