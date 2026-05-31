import matematika from './matematika'
import bahasaIndonesia from './bahasaIndonesia'
import bahasaSunda from './bahasaSunda'
import pkn from './pkn'
import penjaskes from './penjaskes'
import agama from './agama'

export const subjects = [
  matematika,
  bahasaIndonesia,
  bahasaSunda,
  pkn,
  penjaskes,
  agama,
]

export { matematika, bahasaIndonesia, bahasaSunda, pkn, penjaskes, agama }

export function getSubjectById(id) {
  return subjects.find(s => s.id === id)
}
