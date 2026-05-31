import { defineStore } from 'pinia'
import { ref } from 'vue'
import { subjects } from '../data/index'
import { fetchAllQuestions, syncQuestionsToSheet } from '../services/api'

const CACHE_KEY = 'ujian_sd_questions_cache'

function loadCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') }
  catch { return {} }
}

export const useQuestionsStore = defineStore('questions', () => {
  // In-memory questions — diisi dari Sheets (atau cache jika offline)
  const questions = ref(loadCache())
  const loading = ref(false)
  const error = ref('')
  const lastSyncAt = ref(localStorage.getItem('ujian_sd_last_sync') || '')
  const syncing = ref(false)

  function saveCache() {
    localStorage.setItem(CACHE_KEY, JSON.stringify(questions.value))
  }

  // Ambil soal untuk satu subject: Sheets data → cache → default
  function getQuestions(subjectId) {
    if (questions.value[subjectId]) return questions.value[subjectId]
    const subject = subjects.find(s => s.id === subjectId)
    return subject ? [...subject.questions] : []
  }

  function hasCustom(subjectId) {
    return !!questions.value[subjectId]
  }

  function setQuestions(subjectId, qs) {
    questions.value = { ...questions.value, [subjectId]: qs }
    saveCache()
  }

  function resetToDefault(subjectId) {
    const updated = { ...questions.value }
    delete updated[subjectId]
    questions.value = updated
    saveCache()
  }

  function addQuestion(subjectId, q) {
    setQuestions(subjectId, [...getQuestions(subjectId), q])
  }

  function updateQuestion(subjectId, index, q) {
    const arr = [...getQuestions(subjectId)]
    arr[index] = q
    setQuestions(subjectId, arr)
  }

  function deleteQuestion(subjectId, index) {
    setQuestions(subjectId, getQuestions(subjectId).filter((_, i) => i !== index))
  }

  // Fetch semua soal dari Google Sheets — dipanggil tiap buka AdminView
  async function fetchFromSheets() {
    loading.value = true
    error.value = ''
    try {
      const data = await fetchAllQuestions()
      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        questions.value = data
        saveCache()
        const ts = new Date().toLocaleString('id-ID')
        lastSyncAt.value = ts
        localStorage.setItem('ujian_sd_last_sync', ts)
        return { count: Object.keys(data).length }
      }
      // Sheets kosong atau belum ada data — tetap pakai cache/default
      return null
    } catch (e) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  // Push soal satu subject ke Google Sheets
  async function pushToSheets(subjectId) {
    syncing.value = true
    try {
      return await syncQuestionsToSheet(subjectId, getQuestions(subjectId))
    } finally {
      syncing.value = false
    }
  }

  return {
    questions, loading, error, lastSyncAt, syncing,
    getQuestions, hasCustom, setQuestions, resetToDefault,
    addQuestion, updateQuestion, deleteQuestion,
    fetchFromSheets, pushToSheets,
  }
})
