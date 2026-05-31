<template>
  <div class="home-bg">
    <v-container class="py-10" max-width="1000">

      <!-- Header -->
      <div class="text-center mb-10">
        <div class="hero-icon">🎒</div>
        <h1 class="font-fredoka hero-title text-white">Ujian SD Kelas 2</h1>
        <p class="hero-subtitle text-white">Semester 2 — Pilih Mata Pelajaran</p>
      </div>

      <!-- Subject Grid -->
      <v-row>
        <v-col v-for="subject in subjects" :key="subject.id" cols="6" sm="4" md="4">
          <SubjectCard
            :subject="subject"
            :best-score="store.getBestScore(subject.id)"
            :session-count="store.getSubjectHistory(subject.id).length"
            @click="startExam(subject.id)"
          />
        </v-col>
      </v-row>

      <!-- History Section -->
      <v-card v-if="enrichedHistory.length" class="mt-8" rounded="xl" elevation="4">
        <v-card-title class="pa-5 pb-2 d-flex align-center justify-space-between">
          <span class="font-fredoka" style="font-size: 1.3rem; color: #6C63FF;">
            📊 Rekap & Riwayat Nilai
          </span>
          <v-btn
            variant="text"
            color="error"
            size="small"
            @click="showClearDialog = true"
          >
            <v-icon start size="16">mdi-trash-can-outline</v-icon>
            Hapus Riwayat
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-5 pt-0">
          <!-- Best Score per Subject -->
          <div class="best-scores-grid mb-5">
            <div
              v-for="subject in subjects"
              :key="subject.id"
              class="best-score-card"
              :style="{ background: subject.colorLight, borderColor: subject.color + '44' }"
            >
              <div class="best-score-icon">{{ subject.icon }}</div>
              <div class="best-score-name">{{ subject.name }}</div>
              <div v-if="store.getBestScore(subject.id) !== null">
                <div class="best-score-value font-fredoka" :style="{ color: subject.color }">
                  {{ store.getBestScore(subject.id) }}
                </div>
                <div class="best-score-label">nilai terbaik</div>
              </div>
              <div v-else class="best-score-empty">—</div>
            </div>
          </div>

          <!-- Recent History -->
          <div class="section-label mb-3">🕐 Riwayat Terbaru</div>
          <HistoryList :items="enrichedHistory.slice().reverse().slice(0, 10)" />
        </v-card-text>
      </v-card>

      <!-- Empty state -->
      <div v-else class="text-center mt-10">
        <div style="font-size: 2rem;">👆</div>
        <p class="text-white mt-2" style="opacity: 0.8; font-size: 0.95rem;">
          Pilih mata pelajaran untuk mulai ujian!
        </p>
      </div>

    </v-container>

    <!-- Clear Dialog -->
    <v-dialog v-model="showClearDialog" max-width="360">
      <v-card rounded="xl">
        <v-card-text class="pa-6 text-center">
          <div style="font-size: 2.5rem;" class="mb-2">🗑️</div>
          <h3 class="font-fredoka mb-2" style="font-size: 1.2rem; color: #e74c3c;">
            Hapus Semua Riwayat?
          </h3>
          <p style="font-size: 0.9rem; color: #666;">
            Semua data nilai dan sesi akan dihapus permanen.
          </p>
        </v-card-text>
        <v-card-actions class="justify-center pa-4 pt-0" style="gap: 10px;">
          <v-btn variant="outlined" rounded="xl" @click="showClearDialog = false">Batal</v-btn>
          <v-btn color="error" variant="flat" rounded="xl" @click="clearHistory">Hapus</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useExamStore } from '../stores/exam'
import { subjects, getSubjectById } from '../data/index'
import SubjectCard from '../components/SubjectCard.vue'
import HistoryList from '../components/HistoryList.vue'

const router = useRouter()
const store = useExamStore()
const showClearDialog = ref(false)

const enrichedHistory = computed(() =>
  store.history.map(h => {
    const subject = getSubjectById(h.subjectId)
    return { ...h, ...subject }
  })
)

function startExam(subjectId) {
  store.startExam(subjectId)
  router.push({ name: 'exam', params: { subjectId } })
}

function clearHistory() {
  store.clearHistory()
  showClearDialog.value = false
}
</script>

<style scoped>
.home-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.hero-icon { font-size: 3.5rem; margin-bottom: 8px; }
.hero-title {
  font-size: 2.4rem;
  text-shadow: 0 2px 12px rgba(0,0,0,0.2);
  margin-bottom: 4px;
}
.hero-subtitle {
  font-size: 1.05rem;
  opacity: 0.85;
  font-family: 'Nunito', sans-serif;
}

.best-scores-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
@media (max-width: 480px) {
  .best-scores-grid { grid-template-columns: repeat(2, 1fr); }
}

.best-score-card {
  border-radius: 14px;
  border: 2px solid;
  padding: 12px 8px;
  text-align: center;
}
.best-score-icon { font-size: 1.5rem; }
.best-score-name {
  font-size: 0.78rem;
  color: #555;
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  margin: 2px 0 4px;
}
.best-score-value { font-size: 1.6rem; line-height: 1; }
.best-score-label {
  font-size: 0.7rem;
  color: #888;
  font-family: 'Nunito', sans-serif;
}
.best-score-empty {
  font-size: 1rem;
  color: #bbb;
  font-family: 'Nunito', sans-serif;
}

.section-label {
  font-size: 0.88rem;
  font-weight: 700;
  color: #555;
  font-family: 'Nunito', sans-serif;
}
</style>
