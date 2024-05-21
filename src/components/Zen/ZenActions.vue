<template>
  <div class="pomopause">

    <v-btn class='btn bg-primary pomo-btn pomo-box font-press btn-main-start' v-if="pomodoro.finishedPomoRecord?.pomo"
      @click="share()">
      <v-icon class="icon" icon="mdi-share-variant" />
    </v-btn>

    <v-btn class='btn bg-primary pomo-btn pomo-box font-press btn-main-start'
      v-if="!pomodoro.going && !pomodoro.settingUp" @click="emit('show-history')">
      <v-icon class="icon" icon="mdi-folder-clock-outline" />
    </v-btn>

    <v-btn class='btn bg-accent pomo-btn pomo-box font-press btn-main-start'
      v-if="!pomodoro.going && !pomodoro.finishedPomoRecord?.shortPomo && !pomodoro.settingUp" @click="
        pomodoro.createPomodoro(); settingsStore.generalSettings.hideSetup ? pomodoro.startPomodoro() : pomodoro.setup()
        ">
      <span>{{ $t("pause.study") }}</span>
      <v-icon class="icon" icon="mdi-play" />
    </v-btn>

    <v-btn class='btn bg-accent pomo-btn pomo-box font-press btn-main-start' v-if="pomodoro.settingUp"
      @click="pomodoro.startPomodoro()">
      <span>{{ $t("pause.study") }}</span>
      <v-icon class="icon" icon="mdi-play" />
    </v-btn>

    <v-btn class='btn bg-accent pomo-btn pomo-box font-press btn-main-start'
      v-if="!pomodoro.going && pomodoro.finishedPomoRecord?.shortPomo" @click="pomodoro.createPomodoro()">
      <span>{{ $t("backHome") }}</span>
      <v-icon class="icon" icon="mdi-home" />
    </v-btn>

  </div>
</template>
<script lang="ts" setup>
import { usePomodoroStore } from "@/stores/pomodoro";
import { useSettingsStore } from "@/stores/settings";
const pomodoro = usePomodoroStore();
const settingsStore = useSettingsStore();
const emit = defineEmits<{
  (e: 'show-history'): void
}>();

async function share() {
  // share image with pomodoro results
  const blob = await fetch('https://cdn.glitch.com/f96f78ec-d35d-447b-acf4-86f2b3658491%2Fchuck.png?v=1618311092497').then(r => r.blob())
  await navigator.share({
    files: [
      new File([blob], 'file.png', {
        type: blob.type,
      }),
    ],
    title: 'Guarda che bel Pomo',
    text: 'Ecco il mio pomo',
  });
}

</script>
<style scoped lang="scss">
.pomopause {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
}

.btn {
  font-size: 0.8rem;
  font-weight: bold;
}

.btn-main-start {
  width: auto;
  margin-left: 1em;
}
</style>