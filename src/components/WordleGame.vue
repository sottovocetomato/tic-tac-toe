<template>
  <div class="game">
    <h3 :class="`game-message game-message${message ? '-show' : ''}`">{{ message }}</h3>
    <h4 :class="`word-message word-message${showWord ? '-show' : ''}`">{{ word }}</h4>
    <div
      ref="gridWrap"
      :style="gridStyle"
      v-for="row in 5"
      :key="row"
      data-row="row"
      :class="`grid-wrap grid-wrap${getScheme() === 'light' ? '-black' : '-white'}`"
    >
      <span v-for="cell in 5" :key="cell" :data-cell="cell" class="game-grid"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import useThemeSwitch from '../composables/useThemeSwitch.js'
import { computed, nextTick, onMounted, onUpdated, ref } from 'vue'
import { WORDS } from '../collections/wordleWords'
import { setItem, getItem } from '../utills/localStorage/storageHelper'

const { getScheme } = useThemeSwitch()
const gridStyle = computed<{}>(() => ({
  // gridTemplateColumns: `repeat(${gridSize.value}, minmax(${450 / gridSize.value}px, 1fr))`,
  // fontSize: `${14 / gridSize.value}rem`,
  color: `${getScheme() === 'light' ? '#415462' : '#bbc6ce'}`
}))

const word = ref<string>('')
const wordInd = ref<number>(0)
const currRow = ref<HTMLElement | null>(null)
const currRowNum = ref<number>(0)
const currCellsInd = ref<number>(0)
const cells = ref<NodeListOf<HTMLElement> | []>([])
const rows = ref<NodeListOf<HTMLElement> | []>([])
const message = ref<string>('')

const input = ref<string>('')
const showWord = ref<boolean>(false)
const solved = ref<string>('false')

// const timestamp = new Date().getTime()

onMounted(async () => {
  await nextTick(() => {
    rows.value = document.querySelectorAll('.grid-wrap')
    currRow.value = rows.value[currRowNum.value]
    cells.value = currRow.value?.querySelectorAll('.game-grid')
    window.addEventListener('keydown', (e) => onKeyPressFn(e))
    initGame()
  })
})

// onUpdated(async () => {
//   initGame()
// })
function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function onKeyPressFn(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === 'NumpadEnter') {
    await checkWord()
    return
  }
  if (e.key === 'Backspace') {
    if (!input.value) return
    if (message.value) message.value = ''
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
    const board = getItem('board')
    if (!board.includes(input.value)) {
      board.push(input.value)
      setItem('board', board)
    }
    input.value = ''
  }
}
async function checkWord(init: boolean = false) {
  if (input.value.length < 4) {
    return
  }
  if (!WORDS.includes(input.value.toLowerCase())) {
    message.value = 'Please enter a valid word'
    return
  }

  for (const [i, c] of cells.value.entries()) {
    const time = init ? 0 : 400
    await timeout(time)
    addClass(init, c as HTMLElement, i)

    if (i === 4) {
      if (input.value === word.value && solved.value !== 'true') {
        await timeout(400)
        message.value = "That's right, you won!"
        setItem('solved', true)
      }
      if (currRowNum.value >= 4 && solved.value !== 'true') {
        await timeout(400)
        message.value = 'See you tomorrow!'
        showWord.value = true
        setItem('solved', 'true')
      }
      getNextRow()
    }
  }
}

async function initGame() {
  let timestamp = getItem('timestamp')
  let board = getItem('board')
  solved.value = getItem('solved')
  const currTimestamp = new Date().getTime()
  wordInd.value = getItem('id') || Math.floor(Math.random() * WORDS.length)
  word.value = WORDS[wordInd.value].toUpperCase()

  if (timestamp && currTimestamp < timestamp && board.length) {
    for (const w of board) {
      input.value = w
      for (let i = 0; i < w.length; i++) {
        cells.value[i].innerText = w[i]
        currCellsInd.value++
      }
      await checkWord(true)
    }
    if (solved.value !== 'false') {
      message.value = 'Come back tomorrow for a new challenge!'
    }
    return
  }

  const time = new Date()
  time.setDate(new Date().getDate() + 1)
  timestamp = time.getTime()
  setItem('timestamp', timestamp)
  setItem('id', wordInd.value)
  setItem('solved', 'false')
  setItem('board', [])
}

function addClass(init: boolean = false, c: HTMLElement, i: number) {
  if (!init) {
    c.classList.add('flip')
  }
  if (!word.value.includes(c.innerText)) {
    c.classList.add('checked', 'wrong-letter')
  }
  if (word.value.includes(c.innerText) && word.value[i] !== c.innerText) {
    c.classList.add('checked', 'wrong-place')
  }
  if (word.value.includes(c.innerText) && word.value[i] === c.innerText) {
    c.classList.add('checked', 'right-letter')
  }
}
</script>

<style scoped lang="scss">
.game {
  padding: 20px 0;
}
.grid-wrap {
  width: 550px;
  height: 100px;
  grid-template-columns: repeat(5, minmax(100px, 1fr));
  grid-gap: 5px;
  margin-bottom: 5px;
  font-size: 3rem;
  font-weight: bold;
}
.game-grid {
  text-align: center;
  height: 100px;
  line-height: 90px;
  border-radius: 5px;
}
.grid-wrap {
  &-white {
    .game-grid {
      border: 1px solid white;
    }
  }
  &-black {
    .game-grid {
      border: 1px solid black;
    }
  }
}
.flip {
  animation: flip 400ms ease-in-out forwards;
}
.checked {
  color: white;
}

@keyframes flip {
  0% {
    transform: rotateX(0deg);
    background: var(--background-color);
  }
  45% {
    transform: rotateX(90deg);
    background: var(--background-color);
  }
  55% {
    transform: rotateX(90deg);
    background: var(--background-color);
  }

  100% {
    transform: rotateX(0deg);
  }
}
.wrong-letter {
  background: #787c7e;
}
.wrong-place {
  background: #c9b458;
}
.right-letter {
  background: #6aaa64;
}
.game-message {
  display: block;
  height: 60px;
  opacity: 0;
  text-align: center;
  margin-bottom: 20px;
  &-show {
    opacity: 1;
  }
}
.word-message {
  display: block;
  height: 40px;
  opacity: 0;
  text-align: center;
  &-show {
    opacity: 1;
  }
}
@media (max-width: 768px) {
  .grid-wrap {
    width: 95%;
    height: 70px;
    grid-template-columns: repeat(5, minmax(50px, 1fr));
    grid-gap: 5px;
    margin-bottom: 5px;
    font-size: 2.5rem;
    font-weight: bold;
  }
  .game-grid {
    height: 70px;
    line-height: 70px;
  }
  .word-message {
    margin-bottom: 10px;
  }
} ;
</style>
