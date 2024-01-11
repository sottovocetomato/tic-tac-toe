<template>
  <RouterLink to="tictactoe">TicTac</RouterLink><RouterLink to="wordle">Wordle</RouterLink>
</template>

<script>
import TicTacToe from '../components/TicTacToe.vue'
import WordleGame from '../components/WordleGame.vue'
export default {
  name: 'MainPage',
  components: { WordleGame, TicTacToe }
}
</script>

<style scoped></style>
