<template>
  <div class="admin-bg">
    <v-container class="py-6" max-width="960">

      <!-- Header -->
      <div class="d-flex align-center mb-5" style="gap: 12px;">
        <v-btn icon variant="text" color="white" @click="router.push({ name: 'home' })">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <div style="flex: 1;">
          <h1 class="font-fredoka text-white" style="font-size: 1.8rem; line-height: 1.1;">
            Pemeliharaan Soal
          </h1>
          <p class="text-white" style="font-size: 0.85rem; opacity: 0.8; margin: 0; font-family: 'Nunito', sans-serif;">
            Kelola soal ujian per mata pelajaran
          </p>
        </div>
        <!-- Sheets status badge -->
        <div v-if="hasScriptUrl()" class="d-flex align-center" style="gap: 8px;">
          <v-chip
            :color="qStore.error ? 'error' : 'success'"
            variant="flat"
            size="small"
            :prepend-icon="qStore.error ? 'mdi-cloud-off-outline' : 'mdi-google-spreadsheet'"
          >
            {{ qStore.error ? 'Offline' : 'Google Sheets' }}
          </v-chip>
          <v-btn
            icon
            variant="text"
            color="white"
            size="small"
            :loading="qStore.loading"
            title="Refresh dari Sheets"
            @click="reload"
          >
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
        </div>
      </div>

      <!-- Loading overlay -->
      <v-card v-if="qStore.loading" rounded="xl" class="mb-4 pa-6 text-center" elevation="3">
        <v-progress-circular indeterminate color="primary" size="40" class="mb-3" />
        <p style="font-family: 'Nunito', sans-serif; color: #666; margin: 0;">
          Memuat soal dari Google Sheets...
        </p>
      </v-card>

      <!-- Error banner -->
      <v-alert
        v-if="qStore.error && !qStore.loading"
        type="warning"
        rounded="xl"
        density="compact"
        class="mb-4"
        closable
      >
        Gagal memuat dari Google Sheets: {{ qStore.error }}. Menampilkan data cache/default.
      </v-alert>

      <!-- No URL configured notice -->
      <v-alert
        v-if="!hasScriptUrl()"
        type="info"
        rounded="xl"
        density="compact"
        class="mb-4"
        icon="mdi-information-outline"
      >
        Google Sheets belum dikonfigurasi. Isi <code>SCRIPT_URL</code> di <strong>src/config.js</strong> lalu build ulang.
        Soal saat ini tersimpan secara lokal.
      </v-alert>

      <!-- Last sync info -->
      <div v-if="qStore.lastSyncAt && !qStore.loading" class="mb-3" style="font-size: 0.8rem; color: rgba(255,255,255,0.7); font-family: 'Nunito', sans-serif; text-align: right;">
        Terakhir sync dari Sheets: {{ qStore.lastSyncAt }}
      </div>

      <!-- Subject Tabs -->
      <v-card rounded="xl" elevation="4" class="mb-4">
        <v-tabs v-model="activeTab" color="primary" show-arrows>
          <v-tab
            v-for="subject in subjects"
            :key="subject.id"
            :value="subject.id"
            style="font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 0.85rem;"
          >
            <span class="mr-1">{{ subject.icon }}</span>
            {{ subject.name }}
          </v-tab>
        </v-tabs>
      </v-card>

      <!-- Subject Panels -->
      <v-window v-model="activeTab">
        <v-window-item v-for="subject in subjects" :key="subject.id" :value="subject.id">
          <div v-if="activeTab === subject.id">

            <!-- Toolbar -->
            <v-card rounded="xl" elevation="3" class="mb-4">
              <v-card-text class="pa-4">
                <div class="d-flex flex-wrap align-center" style="gap: 10px;">
                  <v-chip :color="subject.color" variant="flat" size="small" style="color: white;">
                    {{ activeQuestions.length }} soal
                  </v-chip>
                  <div class="d-flex flex-wrap" style="gap: 8px; margin-left: auto;">
                    <v-btn size="small" color="success" variant="flat" rounded="xl" prepend-icon="mdi-plus" @click="openAddDialog">
                      Tambah Soal
                    </v-btn>
                    <v-btn size="small" color="primary" variant="flat" rounded="xl" prepend-icon="mdi-file-excel" @click="triggerImport">
                      Import Excel
                    </v-btn>
                    <v-btn size="small" color="teal" variant="flat" rounded="xl" prepend-icon="mdi-download" @click="exportExcel(subject)">
                      Export Excel
                    </v-btn>
                    <v-btn
                      v-if="hasScriptUrl()"
                      size="small"
                      color="green-darken-2"
                      variant="outlined"
                      rounded="xl"
                      prepend-icon="mdi-cloud-upload"
                      :loading="qStore.syncing"
                      @click="pushToSheets(subject.id)"
                    >
                      Push ke Sheets
                    </v-btn>
                    <v-btn
                      v-if="qStore.hasCustom(subject.id)"
                      size="small"
                      color="error"
                      variant="outlined"
                      rounded="xl"
                      prepend-icon="mdi-restore"
                      @click="confirmReset(subject.id)"
                    >
                      Reset Default
                    </v-btn>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <!-- Question List -->
            <v-card rounded="xl" elevation="3">
              <v-card-text class="pa-0">
                <div v-if="activeQuestions.length === 0" class="text-center pa-10">
                  <div style="font-size: 2rem;">📝</div>
                  <p style="color: #999; font-family: 'Nunito', sans-serif; margin-top: 8px;">
                    Belum ada soal. Tambah soal atau import Excel.
                  </p>
                </div>
                <v-list v-else lines="two">
                  <template v-for="(q, idx) in activeQuestions" :key="idx">
                    <v-list-item class="py-3 px-5">
                      <template #prepend>
                        <div
                          class="question-num font-fredoka"
                          :style="{ background: subject.colorLight, color: subject.color }"
                        >
                          {{ idx + 1 }}
                        </div>
                      </template>
                      <v-list-item-title class="question-q mb-1">{{ q.q }}</v-list-item-title>
                      <v-list-item-subtitle>
                        <div class="options-preview">
                          <span
                            v-for="(opt, oi) in q.options"
                            :key="oi"
                            :class="{ 'opt-correct': oi === q.answer }"
                          >
                            {{ ['A','B','C','D'][oi] }}. {{ opt }}
                          </span>
                        </div>
                      </v-list-item-subtitle>
                      <template #append>
                        <div class="d-flex" style="gap: 4px;">
                          <v-btn icon size="small" variant="text" color="primary" @click="openEditDialog(idx, q)">
                            <v-icon size="18">mdi-pencil</v-icon>
                          </v-btn>
                          <v-btn icon size="small" variant="text" color="error" @click="confirmDelete(idx)">
                            <v-icon size="18">mdi-delete</v-icon>
                          </v-btn>
                        </div>
                      </template>
                    </v-list-item>
                    <v-divider v-if="idx < activeQuestions.length - 1" />
                  </template>
                </v-list>
              </v-card-text>
            </v-card>

          </div>
        </v-window-item>
      </v-window>

    </v-container>

    <!-- Hidden file input -->
    <input ref="fileInput" type="file" accept=".xlsx,.xls" style="display: none;" @change="handleImport" />

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="showFormDialog" max-width="580" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-5 pb-2 font-fredoka" style="font-size: 1.2rem; color: #6C63FF;">
          {{ editIndex === null ? '➕ Tambah Soal Baru' : '✏️ Edit Soal' }}
        </v-card-title>
        <v-card-text class="pa-5 pt-2">
          <v-textarea
            v-model="form.q"
            label="Pertanyaan"
            rows="3"
            variant="outlined"
            density="compact"
            rounded="lg"
            class="mb-3"
          />
          <div v-for="(_, oi) in form.options" :key="oi" class="d-flex align-center mb-2" style="gap: 8px;">
            <v-chip
              :color="form.answer === oi ? 'success' : 'default'"
              size="small"
              style="min-width: 32px; cursor: pointer; font-weight: 700;"
              @click="form.answer = oi"
            >
              {{ ['A','B','C','D'][oi] }}
            </v-chip>
            <v-text-field
              v-model="form.options[oi]"
              :label="`Pilihan ${['A','B','C','D'][oi]}`"
              variant="outlined"
              density="compact"
              rounded="lg"
              hide-details
              style="flex: 1;"
            />
            <v-icon v-if="form.answer === oi" color="success" size="18">mdi-check-circle</v-icon>
          </div>
          <p class="mt-2" style="font-size: 0.8rem; color: #888; font-family: 'Nunito', sans-serif;">
            Klik huruf A/B/C/D untuk menandai jawaban benar.
          </p>
          <v-alert v-if="formError" type="error" density="compact" class="mt-2" rounded="lg">{{ formError }}</v-alert>
        </v-card-text>
        <v-card-actions class="pa-5 pt-0 justify-end" style="gap: 8px;">
          <v-btn variant="outlined" rounded="xl" @click="showFormDialog = false">Batal</v-btn>
          <v-btn color="primary" variant="flat" rounded="xl" @click="saveQuestion">
            {{ editIndex === null ? 'Tambah' : 'Simpan' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirm -->
    <v-dialog v-model="showDeleteDialog" max-width="360">
      <v-card rounded="xl">
        <v-card-text class="pa-6 text-center">
          <div style="font-size: 2.5rem;" class="mb-2">🗑️</div>
          <h3 class="font-fredoka mb-2" style="font-size: 1.1rem; color: #e74c3c;">Hapus soal ini?</h3>
          <p style="font-size: 0.88rem; color: #666;">Soal akan dihapus dari daftar mata pelajaran ini.</p>
        </v-card-text>
        <v-card-actions class="justify-center pa-4 pt-0" style="gap: 10px;">
          <v-btn variant="outlined" rounded="xl" @click="showDeleteDialog = false">Batal</v-btn>
          <v-btn color="error" variant="flat" rounded="xl" @click="doDelete">Hapus</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Reset Confirm -->
    <v-dialog v-model="showResetDialog" max-width="380">
      <v-card rounded="xl">
        <v-card-text class="pa-6 text-center">
          <div style="font-size: 2.5rem;" class="mb-2">🔄</div>
          <h3 class="font-fredoka mb-2" style="font-size: 1.1rem; color: #e67e22;">Reset ke soal default?</h3>
          <p style="font-size: 0.88rem; color: #666;">Semua perubahan akan dikembalikan ke data awal.</p>
        </v-card-text>
        <v-card-actions class="justify-center pa-4 pt-0" style="gap: 10px;">
          <v-btn variant="outlined" rounded="xl" @click="showResetDialog = false">Batal</v-btn>
          <v-btn color="warning" variant="flat" rounded="xl" @click="doReset">Reset</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Import Preview Dialog -->
    <v-dialog v-model="showImportDialog" max-width="720" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-5 pb-2 font-fredoka" style="font-size: 1.2rem; color: #6C63FF;">
          📂 Preview Import Excel
        </v-card-title>
        <v-card-text class="pa-5 pt-2">
          <v-alert v-if="importError" type="error" density="compact" class="mb-3" rounded="lg">{{ importError }}</v-alert>
          <div v-if="importPreview.length" class="mb-3">
            <p style="font-size: 0.88rem; font-family: 'Nunito', sans-serif; color: #555;" class="mb-2">
              Ditemukan <strong>{{ importPreview.length }}</strong> soal. Mode:
            </p>
            <v-radio-group v-model="importMode" inline hide-details density="compact">
              <v-radio label="Ganti semua soal" value="replace" />
              <v-radio label="Tambahkan ke soal yang ada" value="append" />
            </v-radio-group>
          </div>
          <v-list v-if="importPreview.length" lines="two" style="max-height: 340px; overflow-y: auto;">
            <template v-for="(q, idx) in importPreview" :key="idx">
              <v-list-item class="py-2 px-3">
                <template #prepend>
                  <div class="question-num font-fredoka" style="background: #e8f5e9; color: #388e3c;">{{ idx + 1 }}</div>
                </template>
                <v-list-item-title style="font-size: 0.88rem; white-space: normal;">{{ q.q }}</v-list-item-title>
                <v-list-item-subtitle>
                  <div class="options-preview">
                    <span v-for="(opt, oi) in q.options" :key="oi" :class="{ 'opt-correct': oi === q.answer }">
                      {{ ['A','B','C','D'][oi] }}. {{ opt }}
                    </span>
                  </div>
                </v-list-item-subtitle>
              </v-list-item>
              <v-divider v-if="idx < importPreview.length - 1" />
            </template>
          </v-list>

          <v-expansion-panels v-if="!importPreview.length && !importError" class="mt-2">
            <v-expansion-panel rounded="lg">
              <v-expansion-panel-title style="font-size: 0.85rem; font-family: 'Nunito', sans-serif;">
                📋 Format kolom Excel yang diperlukan
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div style="font-size: 0.82rem; font-family: 'Nunito', sans-serif; color: #555;">
                  <v-table density="compact">
                    <thead><tr><th>Kolom</th><th>Keterangan</th></tr></thead>
                    <tbody>
                      <tr><td><strong>Pertanyaan</strong></td><td>Teks soal</td></tr>
                      <tr><td><strong>Pilihan A</strong></td><td>Opsi A</td></tr>
                      <tr><td><strong>Pilihan B</strong></td><td>Opsi B</td></tr>
                      <tr><td><strong>Pilihan C</strong></td><td>Opsi C</td></tr>
                      <tr><td><strong>Pilihan D</strong></td><td>Opsi D</td></tr>
                      <tr><td><strong>Jawaban</strong></td><td>A, B, C, atau D</td></tr>
                    </tbody>
                  </v-table>
                  <p class="mt-2">Gunakan <strong>Export Excel</strong> untuk mendapatkan template.</p>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
        <v-card-actions class="pa-5 pt-0 justify-end" style="gap: 8px;">
          <v-btn variant="outlined" rounded="xl" @click="showImportDialog = false">Batal</v-btn>
          <v-btn v-if="importPreview.length" color="primary" variant="flat" rounded="xl" @click="applyImport">
            Simpan {{ importPreview.length }} Soal
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" rounded="xl" location="bottom" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { subjects } from '../data/index'
import { useQuestionsStore } from '../stores/questions'
import { hasScriptUrl } from '../services/api'
import * as XLSX from 'xlsx'

const router = useRouter()
const qStore = useQuestionsStore()

const activeTab = ref(subjects[0]?.id)
const fileInput = ref(null)

// Auto-fetch dari Sheets setiap kali halaman dibuka
onMounted(async () => {
  if (hasScriptUrl()) {
    const result = await qStore.fetchFromSheets()
    if (result) showSnack(`Soal dimuat dari Google Sheets (${result.count} mata pelajaran)`, 'success')
    else if (qStore.error) showSnack('Gagal memuat dari Sheets, menampilkan data cache.', 'warning')
  }
})

async function reload() {
  const result = await qStore.fetchFromSheets()
  if (result) showSnack('Soal berhasil diperbarui dari Google Sheets', 'success')
  else if (qStore.error) showSnack(`Gagal: ${qStore.error}`, 'error')
  else showSnack('Sheets kosong, menampilkan data default', 'info')
}

async function pushToSheets(subjectId) {
  try {
    await qStore.pushToSheets(subjectId)
    showSnack('Soal berhasil dikirim ke Google Sheets!', 'success')
  } catch (e) {
    showSnack(`Gagal push: ${e.message}`, 'error')
  }
}

// ─── Question list ─────────────────────────────────────────────────────────
const activeQuestions = computed(() => qStore.getQuestions(activeTab.value))

// ─── Add / Edit dialog ─────────────────────────────────────────────────────
const showFormDialog = ref(false)
const editIndex = ref(null)
const formError = ref('')
const form = ref({ q: '', options: ['', '', '', ''], answer: 0 })

function openAddDialog() {
  editIndex.value = null
  form.value = { q: '', options: ['', '', '', ''], answer: 0 }
  formError.value = ''
  showFormDialog.value = true
}

function openEditDialog(idx, q) {
  editIndex.value = idx
  form.value = { q: q.q, options: [...q.options], answer: q.answer }
  formError.value = ''
  showFormDialog.value = true
}

function saveQuestion() {
  formError.value = ''
  if (!form.value.q.trim()) { formError.value = 'Pertanyaan tidak boleh kosong.'; return }
  const empty = form.value.options.findIndex(o => !o.trim())
  if (empty !== -1) { formError.value = `Pilihan ${['A','B','C','D'][empty]} tidak boleh kosong.`; return }

  const q = { q: form.value.q.trim(), options: form.value.options.map(o => o.trim()), answer: form.value.answer }
  if (editIndex.value === null) {
    qStore.addQuestion(activeTab.value, q)
    showSnack('Soal berhasil ditambahkan!', 'success')
  } else {
    qStore.updateQuestion(activeTab.value, editIndex.value, q)
    showSnack('Soal berhasil diperbarui!', 'success')
  }
  showFormDialog.value = false
}

// ─── Delete ────────────────────────────────────────────────────────────────
const showDeleteDialog = ref(false)
const deleteIndex = ref(null)
function confirmDelete(idx) { deleteIndex.value = idx; showDeleteDialog.value = true }
function doDelete() {
  qStore.deleteQuestion(activeTab.value, deleteIndex.value)
  showDeleteDialog.value = false
  showSnack('Soal dihapus.', 'info')
}

// ─── Reset ─────────────────────────────────────────────────────────────────
const showResetDialog = ref(false)
const resetSubjectId = ref(null)
function confirmReset(id) { resetSubjectId.value = id; showResetDialog.value = true }
function doReset() {
  qStore.resetToDefault(resetSubjectId.value)
  showResetDialog.value = false
  showSnack('Soal dikembalikan ke default.', 'warning')
}

// ─── Export Excel ──────────────────────────────────────────────────────────
function exportExcel(subject) {
  const rows = qStore.getQuestions(subject.id).map(q => ({
    Pertanyaan: q.q,
    'Pilihan A': q.options[0],
    'Pilihan B': q.options[1],
    'Pilihan C': q.options[2],
    'Pilihan D': q.options[3],
    Jawaban: ['A','B','C','D'][q.answer],
  }))
  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = [{ wch: 50 },{ wch: 25 },{ wch: 25 },{ wch: 25 },{ wch: 25 },{ wch: 10 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, subject.name)
  XLSX.writeFile(wb, `soal_${subject.id}.xlsx`)
  showSnack('File Excel berhasil didownload!', 'success')
}

// ─── Import Excel ──────────────────────────────────────────────────────────
const showImportDialog = ref(false)
const importPreview = ref([])
const importError = ref('')
const importMode = ref('replace')

function triggerImport() {
  importPreview.value = []
  importError.value = ''
  importMode.value = 'replace'
  fileInput.value.value = ''
  fileInput.value.click()
}

function handleImport(event) {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' })
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
      const parsed = []
      for (const [i, row] of rows.entries()) {
        const q = row['Pertanyaan'] || ''
        const a = row['Pilihan A'] || ''
        const b = row['Pilihan B'] || ''
        const c = row['Pilihan C'] || ''
        const d = row['Pilihan D'] || ''
        const ans = String(row['Jawaban'] || '').toUpperCase().trim()
        if (!q || !a || !b || !c || !d || !ans) {
          importError.value = `Baris ${i + 2}: data tidak lengkap.`
          importPreview.value = []
          showImportDialog.value = true
          return
        }
        const ansMap = { A: 0, B: 1, C: 2, D: 3 }
        if (!(ans in ansMap)) {
          importError.value = `Baris ${i + 2}: Jawaban harus A, B, C, atau D.`
          importPreview.value = []
          showImportDialog.value = true
          return
        }
        parsed.push({ q, options: [String(a), String(b), String(c), String(d)], answer: ansMap[ans] })
      }
      if (!parsed.length) {
        importError.value = 'File tidak memiliki data soal.'
        showImportDialog.value = true
        return
      }
      importPreview.value = parsed
      importError.value = ''
      showImportDialog.value = true
    } catch {
      importError.value = 'Gagal membaca file. Pastikan format Excel (.xlsx/.xls).'
      showImportDialog.value = true
    }
  }
  reader.readAsArrayBuffer(file)
}

function applyImport() {
  const current = importMode.value === 'append' ? qStore.getQuestions(activeTab.value) : []
  qStore.setQuestions(activeTab.value, [...current, ...importPreview.value])
  showImportDialog.value = false
  showSnack(`${importPreview.value.length} soal berhasil diimport!`, 'success')
}

// ─── Snackbar ──────────────────────────────────────────────────────────────
const snackbar = ref({ show: false, message: '', color: 'success' })
function showSnack(message, color = 'success') {
  snackbar.value = { show: true, message, color }
}
</script>

<style scoped>
.admin-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}
.question-num {
  width: 30px; height: 30px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.85rem; font-weight: 700; margin-right: 12px; flex-shrink: 0;
}
.question-q {
  font-family: 'Nunito', sans-serif; font-size: 0.92rem;
  color: #333; white-space: normal; line-height: 1.4;
}
.options-preview { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
.options-preview span {
  font-size: 0.78rem; font-family: 'Nunito', sans-serif;
  color: #666; background: #f5f5f5; border-radius: 6px; padding: 2px 7px;
}
.options-preview span.opt-correct {
  background: #e8f5e9; color: #2e7d32; font-weight: 700;
}
</style>
