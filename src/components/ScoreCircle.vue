<template>
  <div class="score-wrap">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" style="transform: rotate(-90deg); display: block;">
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        stroke="#e8e8ef"
        :stroke-width="strokeWidth"
      />
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        :stroke="color"
        :stroke-width="strokeWidth"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        stroke-linecap="round"
        class="score-circle"
      />
    </svg>
    <div class="score-inner">
      <div class="score-value font-fredoka">{{ score }}</div>
      <div class="score-label">dari 100</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  score: { type: Number, required: true },
  size: { type: Number, default: 160 },
  strokeWidth: { type: Number, default: 14 },
})

const radius = computed(() => props.size / 2 - props.strokeWidth)
const circumference = computed(() => 2 * Math.PI * radius.value)
const dashOffset = computed(() => circumference.value * (1 - props.score / 100))

const color = computed(() => {
  if (props.score >= 80) return '#2ecc71'
  if (props.score >= 60) return '#f39c12'
  return '#e74c3c'
})
</script>

<style scoped>
.score-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.score-circle {
  transition: stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.score-inner {
  position: absolute;
  text-align: center;
}
.score-value {
  font-size: 2.4rem;
  color: #6C63FF;
  line-height: 1;
}
.score-label {
  font-size: 0.8rem;
  color: #999;
  font-family: 'Nunito', sans-serif;
}
</style>
