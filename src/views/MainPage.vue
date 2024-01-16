<template>
  <div class="container">
    <div class="game-select-wrap">
      <RouterLink to="tictactoe" class="game-link"
        ><svg
          xmlns="http://www.w3.org/2000/svg"
          class="icon icon-tabler icon-tabler-tic-tac"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <circle cx="6" cy="6" r="2" />
          <path d="M3 12h18" />
          <path d="M12 3v18" />
          <path d="M4 16l4 4" />
          <path d="M4 20l4 -4" />
          <path d="M16 4l4 4" />
          <path d="M16 8l4 -4" />
          <circle cx="18" cy="18" r="2" /></svg
      ></RouterLink>
      <RouterLink to="wordle" class="game-link" id="wordle">Wordle</RouterLink>
      <RouterLink to="snake" class="game-link">Snake</RouterLink>
    </div>
  </div>
</template>

<script setup>
import TicTacToe from '../components/TicTacToe.vue'
import WordleGame from '../components/WordleGame.vue'
</script>

<style scoped lang="scss">
.game-select-wrap {
  width: 80%;
  margin: auto;
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.game-link {
  width: 100px;
  height: 100px;
  color: currentColor;
  border: 1px solid currentColor;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 20px;
  &:hover {
    animation: shake 1.5s ease infinite;
  }
}
#wordle {
  font-family: Impact;
  font-size: 1.4rem;
  &:hover {
    text-decoration: none;
  }
}
@keyframes shake {
  30% {
    transform: scale(1.2);
  }
  40%,
  60% {
    transform: rotate(-20deg) scale(1.2);
  }
  50% {
    transform: rotate(20deg) scale(1.2);
  }
  70% {
    transform: rotate(0deg) scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
</style>
