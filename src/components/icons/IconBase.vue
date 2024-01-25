<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="width || 64"
    :height="height || 64"
    :viewBox="viewBox || '0 0 24 24'"
    :aria-labelledby="iconName"
    :fill="iconColor || 'currentColor'"
    role="presentation"
  >
    <title :id="iconName" lang="en">{{ iconName }} icon</title>
    <g :fill="iconColor || 'currentColor'">
      <slot />
    </g>
  </svg>
</template>

<script setup lang="ts">
const props = defineProps<{
  width?: number | string
  height?: number | string
  viewBox?: string
  iconName?: string
  iconColor?: string
}>()
</script>

<style scoped></style>
