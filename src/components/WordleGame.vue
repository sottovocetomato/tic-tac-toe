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
const currRow = ref<NodeList | []>([])
const currRowNum = ref<number>(0)
const currCellsInd = ref<number>(0)
const cells = ref<NodeList | []>([])
const rows = ref<NodeList | []>([])
const message = ref<string>('')

const input = ref<string>('')
const showWord = ref<boolean>(false)

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
function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function onKeyPressFn(e) {
  // console.log(e, 'e')
  if (e.keyCode === 13) {
    checkWord()
    return
  }
  if (e.keyCode === 8) {
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
function checkWord(init = false) {
  console.log(input.value.length)
  if (input.value.length < 4) {
    return
  }
  if (!WORDS.includes(input.value.toLowerCase())) {
    message.value = 'Please enter a valid word'
    return
  }

  cells.value.forEach(async (c: HTMLElement, i) => {
    await timeout((init ? 0 : 400) * (i + 1))
    addClass(init, c, i)
    if (i === 4) {
      await timeout(400)
      if (input.value === word.value) {
        message.value = "That's right, you won!"
      }
      if (currRowNum.value === 4 && !message.value) {
        message.value = 'See you tomorrow!'
        showWord.value = true
      }
      getNextRow()
    }
  })
}

function initGame() {
  let timestamp = getItem('timestamp')
  let board = getItem('board')

  const currTimestamp = new Date().getTime()
  wordInd.value = getItem('id') || Math.floor(Math.random() * WORDS.length)
  word.value = WORDS[wordInd.value].toUpperCase()

  console.log(word.value, 'word')

  if (timestamp && currTimestamp < timestamp && board.length) {
    board.forEach((w) => {
      input.value = w
      for (let i = 0; i < w.length; i++) {
        cells.value[i].innerText = w[i]
        currCellsInd.value++
      }
      checkWord(true)
    })
    if (board.length >= 5) {
      message.value = 'Come back tomorrow for a new word!'
    }
    return
  }

  const time = new Date()
  time.setDate(new Date().getDate() + 1)
  timestamp = time.getTime()
  setItem('timestamp', timestamp)
  setItem('id', wordInd.value)
  setItem('board', [])
}

function addClass(init = false, c, i) {
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
