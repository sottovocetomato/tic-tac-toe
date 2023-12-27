<template>
  <div class="game">
    <h3 :id="`game-message${message ? '-show' : ''}`">{{ message }}</h3>
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
const message = ref<string>('')

const input = ref<string>('')
onMounted(async () => {
  await nextTick(() => {
    rows.value = document.querySelectorAll('.grid-wrap')
    currRow.value = rows.value[currRowNum.value]
    cells.value = currRow.value?.querySelectorAll('.game-grid')
    window.addEventListener('keydown', (e) => onKeyPressFn(e))
  })
})
function onKeyPressFn(e) {
  // console.log(e, 'e')
  if (e.keyCode === 13) {
    console.log('enter is pressed')
    checkWork()
    return
  }
  if (e.keyCode === 8) {
    if (!input.value) return
    input.value = input.value.slice(0, input.value.length - 1)
    cells.value[input.value.length].innerText = ''
    currCellsInd.value--
  }
  if (currRowNum.value > 4 || currCellsInd.value > 4) return
  if (!e.key.match(/^[a-z]$/gi)) return

  input.value += e.key.toUpperCase()
  cells.value[currCellsInd.value].innerText = e.key.toUpperCase()
  currCellsInd.value++
}
function getNextRow() {
  if (currCellsInd.value > 4) {
    currCellsInd.value = 0
    currRowNum.value++

    currRow.value = rows.value[currRowNum.value]
    cells.value = currRow.value?.querySelectorAll('.game-grid')
    input.value = ''
  }
}
function checkWork() {
  console.log(input.value.length)
  if (input.value.length < 4) {
    return
  }
  if (!WORDS.includes(input.value.toLowerCase())) {
    message.value = 'Please enter a valid word'
    return
  }
  if (!input.value === word) {
    message.value = 'YEEEEEEAH!'
    return
  }
  cells.value.forEach((c: HTMLElement, i) => {
    if (!word.includes(c.innerText)) {
      c.classList.add('wrong-letter')
    }
    if (word.includes(c.innerText) && word.indexOf(c.innerText) !== i) {
      c.classList.add('wrong-place')
    }
    if (word.includes(c.innerText) && word.indexOf(c.innerText) === i) {
      c.classList.add('right-letter')
    }
  })
  getNextRow()
}
console.log(word)
</script>

<style scoped lang="scss">
.grid-wrap {
  width: 500px;
  height: 100px;
  /*height: 600px;*/
  grid-template-columns: repeat(5, minmax(100px, 1fr));
  grid-gap: 5px;
  margin-bottom: 5px;
  font-size: 2.5rem;
}
.wrong-letter {
  background: grey;
}
.wrong-place {
  background: yellow;
}
.right-letter {
  background: green;
}
#game-message {
  display: block;
  height: 60px;
  opacity: 0;
  &-show {
    opacity: 1;
  }
}
/*.game-grid {*/
/*  width: 100px;*/
/*  height: 100px;*/
/*}*/
</style>
