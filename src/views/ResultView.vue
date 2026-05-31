<template>
  <div class="result-bg">
    <v-container class="py-8" max-width="760">
      <v-card class="result-card" rounded="xl" elevation="6">
        <v-card-text class="pa-6 text-center">

          <!-- Emoji & Title -->
          <div style="font-size: 4rem;" class="mb-2">{{ resultEmoji }}</div>
          <h2 class="font-fredoka result-title">{{ resultMessage }}</h2>
          <p class="result-subject">
            {{ store.currentSubject?.icon }} {{ store.currentSubject?.name }}
          </p>

          <!-- Score Circle -->
          <div class="d-flex justify-center my-6">
            <ScoreCircle :score="lastResult?.score ?? 0" :size="160" />
          </div>

          <!-- Stats Row -->
          <v-row class="mb-6" justify="center">
            <v-col cols="4">
              <div class="stat-box stat-correct">
                <div class="stat-number">{{ lastResult?.correct }}</div>
                <div class="stat-label">✅ Benar</div>
              </div>
            </v-col>
            <v-col cols="4">
              <div class="stat-box stat-wrong">
                <div class="stat-number">{{ lastResult?.wrong }}</div>
                <div class="stat-label">❌ Salah</div>
              </div>
            </v-col>
            <v-col cols="4">
              <div class="stat-box stat-skip">
                <div class="stat-number">{{ lastResult?.skipped }}</div>
                <div class="stat-label">⬜ Kosong</div>
              </div>
            </v-col>
          </v-row>

          <!-- Answer Review Accordion -->
          <v-expansion-panels class="mb-6 text-left" rounded="xl">
            <v-expansion-panel rounded="xl" elevation="0" style="border: 1px solid #e0e0e0;">
              <v-expansion-panel-title>
                <v-icon start color="primary">mdi-clipboard-list-outline</v-icon>
                <strong style="font-family: Nunito, sans-serif;">Lihat Review Jawaban</strong>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div
                  v-for="(q, i) in store.currentQuestions"
                  :key="i"
                  class="review-item rounded-xl mb-3 pa-3"
                  :class="reviewItemClass(i)"
                >
                  <div class="review-q">{{ i + 1 }}. {{ q.q }}</div>
                  <div class="review-ans">
                    <template v-if="store.answers[i] !== undefined">
                      Jawabanmu:
                      <strong :class="store.answers[i] === q.answer ? 'text-success' : 'text-error'">
                        {{ ['A','B','C','D'][store.answers[i]] }}. {{ q.options[store.answers[i]] }}
                      </strong>
                      <span v-if="store.answers[i] === q.answer"> ✅</span>
                      <span v-else> ❌</span>
                    </template>
                    <span v-else class="text-warning font-weight-bold">⬜ Tidak dijawab</span>

                    <div
                      v-if="store.answers[i] !== q.answer"
                      class="correct-ans mt-1"
                    >
                      Jawaban benar: {{ ['A','B','C','D'][q.answer] }}. {{ q.options[q.answer] }}
                    </div>
                  </div>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <!-- Actions -->
          <div class="d-flex gap-3 justify-center flex-wrap">
            <v-btn
              color="primary"
              variant="outlined"
              rounded="xl"
              size="large"
              @click="retryExam"
            >
              <v-icon start>mdi-refresh</v-icon>Coba Lagi
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              rounded="xl"
              size="large"
              @click="goHome"
            >
              <v-icon start>mdi-home</v-icon>Pilih Mapel Lain
            </v-btn>
          </div>

        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useExamStore } from '../stores/exam'
import ScoreCircle from '../components/ScoreCircle.vue'

const router = useRouter()
const store = useExamStore()

const lastResult = computed(() => {
  const h = store.history
  return h.length ? h[h.length - 1] : null
})

const score = computed(() => lastResult.value?.score ?? 0)

const resultEmoji = computed(() => {
  if (score.value >= 90) return '🏆'
  if (score.value >= 80) return '⭐'
  if (score.value >= 70) return '😊'
  if (score.value >= 60) return '🙂'
  return '😅'
})

const resultMessage = computed(() => {
  if (score.value >= 90) return 'Luar Biasa! Sempurna!'
  if (score.value >= 80) return 'Bagus Sekali!'
  if (score.value >= 70) return 'Cukup Baik!'
  if (score.value >= 60) return 'Lumayan, Tingkatkan!'
  return 'Ayo Belajar Lagi!'
})

function reviewItemClass(i) {
  const ans = store.answers[i]
  const correct = store.currentQuestions[i]?.answer
  if (ans === undefined) return 'review-skip'
  if (ans === correct) return 'review-correct'
  return 'review-wrong'
}

function retryExam() {
  const subjectId = store.currentSubjectId
  store.startExam(subjectId)
  router.push({ name: 'exam', params: { subjectId } })
}

function goHome() {
  router.push({ name: 'home' })
}

onMounted(() => {
  if (!lastResult.value) {
    router.replace({ name: 'home' })
  }
})
</script>

<style scoped>
.result-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.result-card {
  animation: slideUp 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes slideUp {
  from { transform: translateY(40px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.result-title {
  font-size: 2rem;
  color: #6C63FF;
  margin-bottom: 4px;
}
.result-subject {
  color: #888;
  font-size: 0.95rem;
  font-family: 'Nunito', sans-serif;
}

.stat-box {
  border-radius: 14px;
  padding: 14px 8px;
  text-align: center;
}
.stat-number {
  font-size: 1.9rem;
  font-weight: 800;
  font-family: 'Nunito', sans-serif;
  line-height: 1;
}
.stat-label {
  font-size: 0.82rem;
  font-family: 'Nunito', sans-serif;
  font-weight: 600;
  margin-top: 4px;
}
.stat-correct { background: #e8f5e9; }
.stat-correct .stat-number { color: #2e7d32; }
.stat-correct .stat-label { color: #4caf50; }

.stat-wrong { background: #ffebee; }
.stat-wrong .stat-number { color: #c62828; }
.stat-wrong .stat-label { color: #ef5350; }

.stat-skip { background: #fff3e0; }
.stat-skip .stat-number { color: #e65100; }
.stat-skip .stat-label { color: #fb8c00; }

/* Review items */
.review-item {
  font-family: 'Nunito', sans-serif;
  border: 1.5px solid transparent;
}
.review-correct {
  background: #e8f5e9;
  border-color: #a5d6a7;
}
.review-wrong {
  background: #ffebee;
  border-color: #ef9a9a;
}
.review-skip {
  background: #fff8e1;
  border-color: #ffe082;
}

.review-q {
  font-size: 0.85rem;
  font-weight: 700;
  color: #444;
  margin-bottom: 5px;
}
.review-ans {
  font-size: 0.82rem;
  color: #555;
}
.correct-ans {
  color: #2e7d32;
  font-weight: 600;
}
</style>
