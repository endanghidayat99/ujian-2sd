<template>
  <div>
    <div
      v-for="(item, i) in items"
      :key="i"
      class="history-row rounded-lg mb-2 pa-3"
      :style="{ borderLeftColor: item.color }"
    >
      <div class="d-flex align-center justify-space-between flex-wrap gap-2">
        <div class="d-flex align-center gap-2">
          <span class="history-icon">{{ item.icon }}</span>
          <div>
            <div class="history-subject">{{ item.name }}</div>
            <div class="history-date">{{ formatDate(item.date) }}</div>
          </div>
        </div>
        <div class="d-flex align-center gap-3">
          <div class="history-stats">
            <span class="stat-correct">✅ {{ item.correct }}</span>
            <span class="stat-wrong">❌ {{ item.wrong }}</span>
            <span class="stat-skip">⬜ {{ item.skipped }}</span>
          </div>
          <v-chip
            :color="scoreColor(item.score)"
            size="small"
            class="font-fredoka font-weight-bold"
          >
            {{ item.score }}/100
          </v-chip>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getSubjectById } from '../data/index'

const props = defineProps({
  items: { type: Array, required: true },
})

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function scoreColor(score) {
  if (score >= 80) return 'green'
  if (score >= 60) return 'orange'
  return 'red'
}
</script>

<style scoped>
.history-row {
  background: #fafafa;
  border-left: 4px solid #ccc;
}
.history-icon { font-size: 1.4rem; }
.history-subject {
  font-weight: 700;
  font-size: 0.9rem;
  font-family: 'Nunito', sans-serif;
}
.history-date {
  font-size: 0.75rem;
  color: #999;
  font-family: 'Nunito', sans-serif;
}
.history-stats {
  display: flex;
  gap: 6px;
  font-size: 0.78rem;
  font-family: 'Nunito', sans-serif;
}
.stat-correct { color: #2ecc71; font-weight: 700; }
.stat-wrong { color: #e74c3c; font-weight: 700; }
.stat-skip { color: #f39c12; font-weight: 700; }
</style>
