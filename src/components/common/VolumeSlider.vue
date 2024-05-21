<template>
  <v-slider
    v-model="volume"
    @update:model-value="updateVolume($event)"
    :prepend-icon="volumeIcon(volume)"
    :min="0" :max="100" :step="1"
    @click:prepend="toggleMute()"
    thumb-label hide-details class="pr-4 primary-thumb"
    color="primary"
  />
</template>
<script lang="ts" setup>
import { computed } from 'vue'

const emit = defineEmits<{
  (e: 'testSound', volume: number): void,
}>()

const volume = defineModel<number>('volume')
const mute = defineModel<boolean>('mute')

function updateVolume(vol: number) {
  if (vol > 0) mute.value = false
  testSound(vol, false)
}

function testSound(vol: number, mute: boolean) {
  if (vol && vol > 0 && !mute)
    emit('testSound', vol)
}

function toggleMute() {
  testSound(volume.value ?? 0, !mute.value)
  mute.value = !mute.value
}

const volumeIcon = computed(() => ((vol?: number) => {
  if (mute.value || !vol) return 'mdi-volume-off';
  if (vol < 33) return 'mdi-volume-low';
  if (vol < 66) return 'mdi-volume-medium';
  return 'mdi-volume-high';
}))
</script>
