<template>
  <v-card
    class="subject-card pa-5 text-center"
    rounded="xl"
    elevation="4"
    :style="{ background: subject.color, cursor: 'pointer' }"
    @click="$emit('click')"
  >
    <div class="subject-icon mb-2">{{ subject.icon }}</div>
    <div class="font-fredoka text-white subject-name">{{ subject.name }}</div>
    <div class="text-white subject-desc">30 soal pilihan ganda</div>

    <div class="mt-3">
      <v-chip
        v-if="bestScore !== null"
        color="white"
        size="small"
        class="font-weight-bold"
        style="font-family: Nunito, sans-serif;"
      >
        🏅 Terbaik: {{ bestScore }} &nbsp;|&nbsp; {{ sessionCount }}x sesi
      </v-chip>
      <v-chip
        v-else
        color="white"
        size="small"
        style="opacity: 0.75; font-family: Nunito, sans-serif;"
      >
        Belum pernah dikerjakan
      </v-chip>
    </div>
  </v-card>
</template>

<script setup>
defineProps({
  subject: { type: Object, required: true },
  bestScore: { type: Number, default: null },
  sessionCount: { type: Number, default: 0 },
})
defineEmits(['click'])
</script>

<style scoped>
.subject-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.subject-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2) !important;
}
.subject-icon {
  font-size: 2.8rem;
}
.subject-name {
  font-size: 1.1rem;
  line-height: 1.3;
}
.subject-desc {
  font-size: 0.8rem;
  opacity: 0.85;
  margin-top: 2px;
}
</style>
