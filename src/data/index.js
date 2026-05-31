import matematika from './matematika'
import bahasaIndonesia from './bahasaIndonesia'
import bahasaSunda from './bahasaSunda'
import pkn from './pkn'
import penjaskes from './penjaskes'
import agama from './agama'
import seniBudaya from "./seniBudaya.js";

export const subjects = [
  matematika,
  bahasaIndonesia,
  bahasaSunda,
  pkn,
  penjaskes,
  agama,
    seniBudaya,
]

export { matematika, bahasaIndonesia, bahasaSunda, pkn, penjaskes, agama, seniBudaya }

export function getSubjectById(id) {
  return subjects.find(s => s.id === id)
}
