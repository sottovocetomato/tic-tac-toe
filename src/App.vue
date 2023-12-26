<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import useThemeSwitch from '@/composables/useThemeSwitch'
import { nextTick, onMounted } from 'vue'

const { init, getScheme } = useThemeSwitch()

onMounted(() =>
  nextTick(() => {
    init()
  })
)
</script>

<template>
  <header></header>
  <main class="container">
    <button class="contrast switcher theme-switcher" data-theme-switcher>
      <i>Turn {{ getScheme() === 'light' ? 'on' : 'off' }} dark mode</i>
    </button>
    <RouterView />
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 15vh;
}
</style>
