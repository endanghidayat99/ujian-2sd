<template>
  <div class="question-navigator">
    <!-- Legend -->
    <div class="legend">
      <span class="legend-item">
        <span class="legend-dot dot-current" />
        Soal aktif
      </span>
      <span class="legend-item">
        <span class="legend-dot dot-answered" />
        Sudah dijawab
      </span>
      <span class="legend-item">
        <span class="legend-dot dot-empty" />
        Belum dijawab
      </span>
    </div>

    <!-- Number Grid -->
    <div class="number-grid">
      <button
        v-for="n in totalQuestions"
        :key="n"
        class="q-num-btn"
        :class="{
          'q-current': currentIndex === n - 1,
          'q-answered': currentIndex !== n - 1 && answers[n - 1] !== undefined,
          'q-empty': currentIndex !== n - 1 && answers[n - 1] === undefined,
        }"
        @click="$emit('go-to', n - 1)"
        :aria-label="`Soal ${n}`"
      >
        {{ n }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  totalQuestions: { type: Number, required: true },
  currentIndex: { type: Number, required: true },
  answers: { type: Object, required: true },
})
defineEmits(['go-to'])
</script>

<style scoped>
.question-navigator {
  width: 100%;
}

.legend {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.78rem;
  color: #666;
  font-family: 'Nunito', sans-serif;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.dot-current { background: #6C63FF; }
.dot-answered { background: #2ecc71; }
.dot-empty { background: #dde1e7; border: 1px solid #bbb; }

/* Grid layout */
.number-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 6px;
  width: 100%;
}

@media (max-width: 600px) {
  .number-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

/* Button base */
.q-num-btn {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  border: none;
  font-size: 0.8rem;
  font-weight: 700;
  font-family: 'Nunito', sans-serif;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.q-num-btn:hover {
  transform: scale(1.1);
}

.q-current {
  background: #6C63FF;
  color: white;
  box-shadow: 0 3px 10px rgba(108, 99, 255, 0.45);
  transform: scale(1.08);
}

.q-answered {
  background: #2ecc71;
  color: white;
}

.q-empty {
  background: #f0f0f5;
  color: #888;
  border: 1.5px solid #dde1e7;
}
</style>
