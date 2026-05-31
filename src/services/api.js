import { SCRIPT_URL } from '../config'

export function hasScriptUrl() {
  return !!SCRIPT_URL
}

// GET — ambil semua soal dari Sheets
export async function fetchAllQuestions() {
  if (!SCRIPT_URL) return null
  const res = await fetch(`${SCRIPT_URL}?action=getAllQuestions`)
  const json = await res.json()
  return json.ok ? json.data : null
}

// POST — push soal satu subject ke Sheets
export async function syncQuestionsToSheet(subjectId, questions) {
  if (!SCRIPT_URL) throw new Error('SCRIPT_URL belum diisi di src/config.js')
  const res = await fetch(SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'updateQuestions', subjectId, questions }),
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.error || 'Gagal sync')
  return json.data
}

// POST — simpan nilai (fire and forget)
export function saveScoreToSheet(record) {
  if (!SCRIPT_URL) return
  fetch(SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'saveScore', ...record }),
  }).catch(() => {})
}

// GET — test koneksi
export async function testConnection() {
  if (!SCRIPT_URL) throw new Error('SCRIPT_URL belum diisi di src/config.js')
  const res = await fetch(`${SCRIPT_URL}?action=ping`)
  const json = await res.json()
  if (!json.ok) throw new Error('Respons tidak valid')
  return true
}
