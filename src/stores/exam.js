import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getSubjectById } from '../data/index'
import { useQuestionsStore } from './questions'
import { saveScoreToSheet } from '../services/api'

const STORAGE_KEY = 'ujian_sd_history'
const SESSION_KEY = 'ujian_sd_exam_session'

export const useExamStore = defineStore('exam', () => {
  // State
  const currentSubjectId = ref(null)
  const currentQuestions = ref([])
  const currentQuestionIndex = ref(0)
  const answers = ref({})
  const history = ref(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'))

  // Getters
  const currentSubject = computed(() => getSubjectById(currentSubjectId.value))
  const totalQuestions = computed(() => currentQuestions.value.length)
  const answeredCount = computed(() => Object.keys(answers.value).length)
  const unansweredCount = computed(() => totalQuestions.value - answeredCount.value)
  const progressPercent = computed(() =>
    totalQuestions.value ? (answeredCount.value / totalQuestions.value) * 100 : 0
  )
  const currentQuestion = computed(() =>
    currentQuestions.value[currentQuestionIndex.value] || null
  )
  const isFirstQuestion = computed(() => currentQuestionIndex.value === 0)
  const isLastQuestion = computed(() => currentQuestionIndex.value === totalQuestions.value - 1)

  function getSubjectHistory(subjectId) {
    return history.value.filter(h => h.subjectId === subjectId)
  }

  function getBestScore(subjectId) {
    const hist = getSubjectHistory(subjectId)
    if (!hist.length) return null
    return Math.max(...hist.map(h => h.score))
  }

  // ─── Session persistence (bertahan saat refresh) ─────────────────────────
  function saveSession() {
    if (!currentSubjectId.value) return
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      subjectId: currentSubjectId.value,
      questionIndex: currentQuestionIndex.value,
      answers: answers.value,
    }))
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY)
  }

  function restoreSession(subjectId) {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY)
      if (!raw) return false
      const data = JSON.parse(raw)
      if (data.subjectId !== subjectId) return false
      const qStore = useQuestionsStore()
      const qs = qStore.getQuestions(subjectId)
      if (!qs.length) return false
      currentSubjectId.value = subjectId
      currentQuestions.value = [...qs]
      currentQuestionIndex.value = data.questionIndex ?? 0
      answers.value = data.answers ?? {}
      return true
    } catch {
      return false
    }
  }

  // Actions
  function startExam(subjectId) {
    const subject = getSubjectById(subjectId)
    if (!subject) return
    clearSession()
    const qStore = useQuestionsStore()
    currentSubjectId.value = subjectId
    currentQuestions.value = [...qStore.getQuestions(subjectId)]
    currentQuestionIndex.value = 0
    answers.value = {}
    saveSession()
  }

  function selectAnswer(optionIndex) {
    answers.value = { ...answers.value, [currentQuestionIndex.value]: optionIndex }
    saveSession()
  }

  function goToQuestion(index) {
    if (index >= 0 && index < totalQuestions.value) {
      currentQuestionIndex.value = index
      saveSession()
    }
  }

  function prevQuestion() { goToQuestion(currentQuestionIndex.value - 1) }
  function nextQuestion() { goToQuestion(currentQuestionIndex.value + 1) }

  function submitExam() {
    let correct = 0, wrong = 0, skipped = 0
    currentQuestions.value.forEach((q, i) => {
      if (answers.value[i] === undefined) skipped++
      else if (answers.value[i] === q.answer) correct++
      else wrong++
    })

    const score = Math.round((correct / totalQuestions.value) * 100)
    const record = {
      subjectId: currentSubjectId.value,
      score,
      correct,
      wrong,
      skipped,
      date: new Date().toISOString(),
      answers: { ...answers.value },
    }
    history.value.push(record)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value))
    saveScoreToSheet(record) // fire-and-forget ke Google Sheets
    clearSession()
    return record
  }

  function clearHistory() {
    history.value = []
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    // state
    currentSubjectId,
    currentQuestions,
    currentQuestionIndex,
    answers,
    history,
    // getters
    currentSubject,
    totalQuestions,
    answeredCount,
    unansweredCount,
    progressPercent,
    currentQuestion,
    isFirstQuestion,
    isLastQuestion,
    // methods
    getSubjectHistory,
    getBestScore,
    startExam,
    restoreSession,
    clearSession,
    selectAnswer,
    goToQuestion,
    prevQuestion,
    nextQuestion,
    submitExam,
    clearHistory,
  }
})
