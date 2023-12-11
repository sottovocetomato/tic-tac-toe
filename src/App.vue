<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header></header>
  <main>
    <RouterView />
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 15vh;
}
</style>
