import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getSubjectById } from '../data/index'

const STORAGE_KEY = 'ujian_sd_history'

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

  // Actions
  function startExam(subjectId) {
    const subject = getSubjectById(subjectId)
    if (!subject) return
    currentSubjectId.value = subjectId
    currentQuestions.value = [...subject.questions]
    currentQuestionIndex.value = 0
    answers.value = {}
  }

  function selectAnswer(optionIndex) {
    answers.value = { ...answers.value, [currentQuestionIndex.value]: optionIndex }
  }

  function goToQuestion(index) {
    if (index >= 0 && index < totalQuestions.value) {
      currentQuestionIndex.value = index
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
    selectAnswer,
    goToQuestion,
    prevQuestion,
    nextQuestion,
    submitExam,
    clearHistory,
  }
})
