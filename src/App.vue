<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import useThemeSwitch from '@/composables/useThemeSwitch'
import { nextTick, onMounted } from 'vue'
import IconBase from '@/components/icons/IconBase.vue'
import IconBack from '@/components/icons/IconBack.vue'
const { init, getScheme } = useThemeSwitch()

const route = useRoute()

onMounted(() =>
  nextTick(() => {
    init()
  })
)
</script>

<template>
  <header>
    <div class="container">
      <RouterLink to="/" v-if="route.path !== '/'">
        <IconBase width="32" height="32" viewBox="0 0 122.88 108.06">
          <IconBack />
        </IconBase>
      </RouterLink>
    </div>
  </header>
  <main class="container">
    <button class="contrast switcher theme-switcher" data-theme-switcher>
      <i>Turn {{ getScheme() === 'light' ? 'on' : 'off' }} dark mode</i>
    </button>
    <RouterView />
  </main>
</template>

<style lang="scss">
header {
  line-height: 1.5;
  max-height: 15vh;
  padding: 10px 0;
}
a {
  color: currentColor;
  text-decoration: none;
  user-select: none;
  &:focus {
    background-color: transparent;
  }
}
</style>
