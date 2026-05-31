import { defineStore } from 'pinia'
import { ref } from 'vue'
import { subjects } from '../data/index'
import { fetchAllQuestions, syncQuestionsToSheet } from '../services/api'

const STORAGE_KEY = 'ujian_sd_custom_questions'

function loadFromStorage() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
  catch { return {} }
}

export const useQuestionsStore = defineStore('questions', () => {
  const customQuestions = ref(loadFromStorage())
  const syncing = ref(false)
  const lastSyncAt = ref(localStorage.getItem('ujian_sd_last_sync') || '')

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customQuestions.value))
  }

  function getQuestions(subjectId) {
    if (customQuestions.value[subjectId]) return customQuestions.value[subjectId]
    const subject = subjects.find(s => s.id === subjectId)
    return subject ? [...subject.questions] : []
  }

  function hasCustom(subjectId) {
    return !!customQuestions.value[subjectId]
  }

  function setQuestions(subjectId, questions) {
    customQuestions.value = { ...customQuestions.value, [subjectId]: questions }
    persist()
  }

  function resetToDefault(subjectId) {
    const updated = { ...customQuestions.value }
    delete updated[subjectId]
    customQuestions.value = updated
    persist()
  }

  function addQuestion(subjectId, question) {
    setQuestions(subjectId, [...getQuestions(subjectId), question])
  }

  function updateQuestion(subjectId, index, question) {
    const updated = [...getQuestions(subjectId)]
    updated[index] = question
    setQuestions(subjectId, updated)
  }

  function deleteQuestion(subjectId, index) {
    setQuestions(subjectId, getQuestions(subjectId).filter((_, i) => i !== index))
  }

  // Fetch all questions from Google Sheets and update local cache
  async function fetchFromSheets() {
    syncing.value = true
    try {
      const data = await fetchAllQuestions()
      if (data && typeof data === 'object') {
        customQuestions.value = { ...customQuestions.value, ...data }
        persist()
        const ts = new Date().toLocaleString('id-ID')
        lastSyncAt.value = ts
        localStorage.setItem('ujian_sd_last_sync', ts)
        return { count: Object.keys(data).length }
      }
      return null
    } finally {
      syncing.value = false
    }
  }

  // Push one subject's questions to Google Sheets
  async function pushToSheets(subjectId) {
    syncing.value = true
    try {
      const questions = getQuestions(subjectId)
      return await syncQuestionsToSheet(subjectId, questions)
    } finally {
      syncing.value = false
    }
  }

  return {
    customQuestions, syncing, lastSyncAt,
    getQuestions, hasCustom, setQuestions, resetToDefault,
    addQuestion, updateQuestion, deleteQuestion,
    fetchFromSheets, pushToSheets,
  }
})
