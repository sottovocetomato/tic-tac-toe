<template>
  <div class="game">
    <div
      class="grid-wrap"
      ref="gridWrap"
      :style="gridStyle"
      v-for="row in 5"
      :key="row"
      data-row="row"
    >
      <span
        v-for="cell in 5"
        :key="cell"
        :data-cell="cell"
        :class="`game-grid game-grid${getScheme() === 'light' ? '-black' : '-white'}`"
      ></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import useThemeSwitch from '../composables/useThemeSwitch.js'
import { computed, nextTick, onMounted, ref } from 'vue'
import { WORDS } from '../collections/wordleWords'

const { getScheme } = useThemeSwitch()
const gridStyle = computed<{}>(() => ({
  // gridTemplateColumns: `repeat(${gridSize.value}, minmax(${450 / gridSize.value}px, 1fr))`,
  // fontSize: `${14 / gridSize.value}rem`,
  color: `${getScheme() === 'light' ? '#415462' : '#bbc6ce'}`
}))

const wordInd = Math.floor(Math.random() * WORDS.length)
const word = WORDS[wordInd].toUpperCase()
const currRow = ref<NodeList | []>([])
const currRowNum = ref<number>(0)
const currCellsInd = ref<number>(0)
const cells = ref<NodeList | []>([])
const rows = ref<NodeList | []>([])

const input = ref<string>('')
onMounted(async () => {
  await nextTick(() => {
    rows.value = document.querySelectorAll('.grid-wrap')
    currRow.value = rows.value[currRowNum.value]
    cells.value = currRow.value?.querySelectorAll('.game-grid')
    window.addEventListener('keypress', (e) => onKeyPressFn(e))
  })
})
function onKeyPressFn(e) {
  if (currRowNum.value > 4) return
  if (e.keyCode > 122 || e.keyCode < 65) return
  input.value += e.key.toUpperCase()
  cells.value[currCellsInd.value].innerText = e.key.toUpperCase()
  console.log(currCellsInd.value)
  currCellsInd.value++
  getNextRow(e)
}
function getNextRow(e) {
  if (currCellsInd.value > 4) {
    checkWork(e)
    currCellsInd.value = 0
    currRowNum.value++
    console.log(currRowNum.value, 'currRowNum.value')
    currRow.value = rows.value[currRowNum.value]
    cells.value = currRow.value?.querySelectorAll('.game-grid')
    input.value = ''
  }
}
function checkWork(e) {
  if (!WORDS.includes(input.value.toLowerCase())) {
    console.error('Word is not a valid word')
    return
  }
  if (!input.value === word) {
    console.info('WINNER')
    return
  }
  cells.value.forEach((c: HTMLElement, i) => {
    if (!word.includes(c.innerText)) {
      c.classList.add('no-such-letter')
    }
    if (word.includes(c.innerText) && word.indexOf(c.innerText) !== i) {
      c.classList.add('has-letter-wrong-place')
    }
    if (word.includes(c.innerText) && word.indexOf(c.innerText) === i) {
      c.classList.add('has-letter')
    }
  })
}
console.log(word)
</script>

<style scoped>
.grid-wrap {
  width: 500px;
  height: 100px;
  /*height: 600px;*/
  grid-template-columns: repeat(5, minmax(100px, 1fr));
  grid-gap: 5px;
  margin-bottom: 5px;
  font-size: 2.5rem;
}
/*.game-grid {*/
/*  width: 100px;*/
/*  height: 100px;*/
/*}*/
</style>
