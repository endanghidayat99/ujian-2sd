const URL_KEY = 'ujian_sd_script_url'

export function getScriptUrl() {
  return localStorage.getItem(URL_KEY) || ''
}

export function setScriptUrl(url) {
  if (url.trim()) localStorage.setItem(URL_KEY, url.trim())
  else localStorage.removeItem(URL_KEY)
}

export function hasScriptUrl() {
  return !!getScriptUrl()
}

// GET — fetch all questions from Sheets
export async function fetchAllQuestions() {
  const url = getScriptUrl()
  if (!url) return null
  const res = await fetch(`${url}?action=getAllQuestions`)
  const json = await res.json()
  return json.ok ? json.data : null
}

// POST — push one subject's questions to Sheets
export async function syncQuestionsToSheet(subjectId, questions) {
  const url = getScriptUrl()
  if (!url) throw new Error('URL belum dikonfigurasi')
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ action: 'updateQuestions', subjectId, questions }),
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.error || 'Gagal sync')
  return json.data
}

// POST — save score (fire and forget)
export function saveScoreToSheet(record) {
  const url = getScriptUrl()
  if (!url) return
  fetch(url, {
    method: 'POST',
    body: JSON.stringify({ action: 'saveScore', ...record }),
  }).catch(() => {})
}

// GET — test connection
export async function testConnection() {
  const url = getScriptUrl()
  if (!url) throw new Error('URL kosong')
  const res = await fetch(`${url}?action=ping`)
  const json = await res.json()
  return json.ok
}
