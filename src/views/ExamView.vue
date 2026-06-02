<template>
  <div class="exam-bg">
    <v-container class="py-4" max-width="840">

      <!-- Header Bar -->
      <v-card class="mb-4" rounded="xl" elevation="3">
        <v-card-text class="pa-4">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center" style="gap: 12px;">
              <span style="font-size: 2rem;">{{ store.currentSubject?.icon }}</span>
              <div>
                <div class="font-fredoka header-subject-name">
                  {{ store.currentSubject?.name }}
                </div>
                <div class="header-soal-info">
                  Soal {{ store.currentQuestionIndex + 1 }} dari {{ store.totalQuestions }}
                </div>
              </div>
            </div>
            <div class="text-center">
              <v-progress-circular
                :model-value="store.progressPercent"
                :size="58"
                :width="6"
                color="primary"
              >
                <div>
                  <div class="progress-number">{{ store.answeredCount }}</div>
                  <div class="progress-label">dijawab</div>
                </div>
              </v-progress-circular>
            </div>
          </div>
          <v-progress-linear
            :model-value="store.progressPercent"
            color="primary"
            rounded
            height="7"
            class="mt-3"
          />
        </v-card-text>
      </v-card>

      <!-- Question Card -->
      <transition name="slide-q" mode="out-in">
        <v-card :key="store.currentQuestionIndex" class="mb-4 question-card" rounded="xl" elevation="5">
          <v-card-text class="pa-6">
            <!-- Question text -->
            <div class="question-text mb-6">
              <span class="question-number">{{ store.currentQuestionIndex + 1 }}.</span>
              {{ store.currentQuestion?.q }}
            </div>

            <!-- Options -->
            <div
              v-for="(option, idx) in store.currentQuestion?.options"
              :key="idx"
              class="option-row mb-3"
              :class="{
                'option-selected': store.answers[store.currentQuestionIndex] === idx,
              }"
              @click="store.selectAnswer(idx)"
            >
              <div class="option-label-badge" :class="{ 'badge-selected': store.answers[store.currentQuestionIndex] === idx }">
                {{ ['A', 'B', 'C', 'D'][idx] }}
              </div>
              <div class="option-text">{{ option }}</div>
              <v-icon
                v-if="store.answers[store.currentQuestionIndex] === idx"
                color="white"
                size="20"
                class="ml-2 flex-shrink-0"
              >
                mdi-check-circle
              </v-icon>
            </div>
          </v-card-text>
        </v-card>
      </transition>

      <!-- Navigation Panel -->
      <v-card rounded="xl" elevation="3">
        <v-card-text class="pa-4">
          <!-- Prev / Next Arrows -->
          <div class="d-flex align-center justify-space-between mb-4">
            <v-btn
              :disabled="store.isFirstQuestion"
              variant="tonal"
              color="primary"
              size="default"
              rounded="xl"
              @click="store.prevQuestion()"
            >
              <v-icon start>mdi-chevron-left</v-icon>
              Sebelumnya
            </v-btn>

            <span class="nav-counter">
              {{ store.currentQuestionIndex + 1 }} / {{ store.totalQuestions }}
            </span>

            <v-btn
              :disabled="store.isLastQuestion"
              variant="tonal"
              color="primary"
              size="default"
              rounded="xl"
              @click="store.nextQuestion()"
            >
              Selanjutnya
              <v-icon end>mdi-chevron-right</v-icon>
            </v-btn>
          </div>

          <!-- Question Number Grid -->
          <QuestionNavigator
            :total-questions="store.totalQuestions"
            :current-index="store.currentQuestionIndex"
            :answers="store.answers"
            @go-to="store.goToQuestion($event)"
          />

          <!-- Bottom Actions -->
          <div class="d-flex align-center mt-4 gap-2">
            <v-btn
              variant="outlined"
              color="grey-darken-1"
              rounded="xl"
              size="small"
              @click="goHome"
            >
              <v-icon start size="18">mdi-home</v-icon>
              Beranda
            </v-btn>
            <v-spacer />
            <div v-if="store.unansweredCount > 0" class="unanswered-badge">
              ⚠️ {{ store.unansweredCount }} belum dijawab
            </div>
            <v-btn
              color="primary"
              variant="flat"
              rounded="xl"
              @click="showConfirm = true"
            >
              <v-icon start>mdi-send</v-icon>
              Submit Ujian
            </v-btn>
          </div>
        </v-card-text>
      </v-card>

    </v-container>

    <!-- Submit Confirm Dialog -->
    <v-dialog v-model="showConfirm" max-width="420">
      <v-card rounded="xl" elevation="8">
        <v-card-text class="pa-6 text-center">
          <div style="font-size: 3rem;" class="mb-3">📝</div>
          <h3 class="font-fredoka mb-3" style="font-size: 1.4rem; color: #6C63FF;">
            Yakin ingin Submit?
          </h3>
          <div
            v-if="store.unansweredCount > 0"
            class="warning-box mb-3"
          >
            <v-icon color="orange" class="mr-1">mdi-alert-circle</v-icon>
            Masih ada <strong>{{ store.unansweredCount }} soal</strong> yang belum dijawab.
            Soal kosong dianggap salah.
          </div>
          <div v-else class="success-box mb-3">
            <v-icon color="green" class="mr-1">mdi-check-circle</v-icon>
            Semua <strong>{{ store.totalQuestions }} soal</strong> sudah dijawab! 🎉
          </div>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0 justify-center" style="gap: 12px;">
          <v-btn variant="outlined" rounded="xl" size="large" @click="showConfirm = false">
            Kembali
          </v-btn>
          <v-btn color="primary" variant="flat" rounded="xl" size="large" @click="doSubmit">
            <v-icon start>mdi-send</v-icon>
            Ya, Submit!
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useExamStore } from '../stores/exam'
import QuestionNavigator from '../components/QuestionNavigator.vue'

const router = useRouter()
const route = useRoute()
const store = useExamStore()
const showConfirm = ref(false)

onMounted(() => {
  if (!store.currentSubjectId) {
    // Refresh terdeteksi — coba restore jawaban yang sudah diisi
    const restored = store.restoreSession(route.params.subjectId)
    if (!restored) {
      // Tidak ada sesi tersimpan, mulai ujian baru
      store.startExam(route.params.subjectId)
    }
  }
})

function goHome() {
  router.push({ name: 'home' })
}

function doSubmit() {
  showConfirm.value = false
  const result = store.submitExam()
  router.push({ name: 'result' })
}
</script>

<style scoped>
.exam-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.header-subject-name {
  font-size: 1.15rem;
  color: #6C63FF;
}
.header-soal-info {
  font-size: 0.8rem;
  color: #888;
  font-family: 'Nunito', sans-serif;
}
.progress-number {
  font-size: 0.82rem;
  font-weight: 800;
  color: #6C63FF;
  font-family: 'Nunito', sans-serif;
  line-height: 1;
}
.progress-label {
  font-size: 0.6rem;
  color: #aaa;
  font-family: 'Nunito', sans-serif;
  line-height: 1;
}

/* Question card animation */
.slide-q-enter-active { transition: all 0.22s ease-out; }
.slide-q-leave-active { transition: all 0.15s ease-in; }
.slide-q-enter-from { opacity: 0; transform: translateX(20px); }
.slide-q-leave-to { opacity: 0; transform: translateX(-20px); }

.question-text {
  font-size: 1.08rem;
  line-height: 1.65;
  font-weight: 700;
  color: #2d3748;
  font-family: 'Nunito', sans-serif;
}
.question-number {
  color: #6C63FF;
  font-size: 1.15rem;
  margin-right: 4px;
}

/* Option rows */
.option-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  border: 2px solid #e8e8ef;
  cursor: pointer;
  transition: all 0.15s ease;
  background: #fff;
  font-family: 'Nunito', sans-serif;
}
.option-row:hover {
  border-color: #6C63FF;
  background: #f5f4ff;
}
.option-selected {
  background: #6C63FF !important;
  border-color: #6C63FF !important;
  transform: scale(1.01);
}
.option-selected .option-text {
  color: white !important;
  font-weight: 700;
}

.option-label-badge {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #eeeeff;
  color: #6C63FF;
  font-weight: 800;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-family: 'Nunito', sans-serif;
  transition: all 0.15s;
}
.badge-selected {
  background: rgba(255,255,255,0.25) !important;
  color: white !important;
}
.option-text {
  font-size: 0.95rem;
  color: #333;
  line-height: 1.45;
  flex: 1;
  font-family: 'Nunito', sans-serif;
}

.nav-counter {
  font-size: 0.9rem;
  font-weight: 700;
  color: #6C63FF;
  font-family: 'Nunito', sans-serif;
}

.unanswered-badge {
  font-size: 0.8rem;
  color: #f39c12;
  font-weight: 700;
  font-family: 'Nunito', sans-serif;
}

.warning-box {
  background: #fff3e0;
  border: 1px solid #ffcc80;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 0.9rem;
  font-family: 'Nunito', sans-serif;
  color: #e65100;
}
.success-box {
  background: #e8f5e9;
  border: 1px solid #a5d6a7;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 0.9rem;
  font-family: 'Nunito', sans-serif;
  color: #2e7d32;
}
</style>
