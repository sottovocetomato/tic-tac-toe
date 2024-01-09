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
const solved = ref<boolean>(false)

// const timestamp = new Date().getTime()

onMounted(async () => {
  await nextTick(() => {
    rows.value = document.querySelectorAll('.grid-wrap')
    currRow.value = rows.value[currRowNum.value]
    cells.value = currRow.value?.querySelectorAll('.game-grid')
    window.addEventListener('keydown', (e) => onKeyPressFn(e))

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
        checkWord()
      })
      if (board.length === 5) {
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
  })
})
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
function checkWord() {
  console.log(input.value.length)
  if (input.value.length < 4) {
    return
  }
  if (!WORDS.includes(input.value.toLowerCase())) {
    message.value = 'Please enter a valid word'
    return
  }
  if (input.value === word.value) {
    message.value = "That's right, you won!"
  }

  cells.value.forEach((c: HTMLElement, i) => {
    setTimeout(() => {
      if (!word.value.includes(c.innerText)) {
        c.classList.add('checked', 'wrong-letter')
      }
      if (word.value.includes(c.innerText) && word.value[i] !== c.innerText) {
        c.classList.add('checked', 'wrong-place')
      }
      if (word.value.includes(c.innerText) && word.value[i] === c.innerText) {
        c.classList.add('checked', 'right-letter')
      }
    }, 500 * (i + 1))
  })

  getNextRow()
}
</script>

<style scoped lang="scss">
.grid-wrap {
  width: 500px;
  height: 100px;
  /*height: 600px;*/
  grid-template-columns: repeat(5, minmax(100px, 1fr));
  grid-gap: 5px;
  margin-bottom: 5px;
  font-size: 3rem;
  font-weight: bold;
}
.checked {
  animation: flip 500ms ease-in-out forwards;
  color: white;
}

@keyframes flip {
  0% {
    transform: rotateX(0deg);
  }
  45% {
    transform: rotateX(90deg);
  }
  55% {
    transform: rotateX(90deg);
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
#game-message {
  display: block;
  height: 60px;
  opacity: 0;
  &-show {
    opacity: 1;
  }
}
.game-grid {
  border-radius: 5px;
}
</style>
