<template>
  <BaseDialog
    :title="$t('pause.pomoSettings')"
    v-model="model"
    :extension="true"
    :data="settingsStore.settingsWithDefaults"
    @save="saveSettings($event)"
    @cancel="cancelSettings()">
    <template #extension>
      <v-tabs v-model="tab">

        <v-tab value="pomodoro">{{$t("pause.timer.timer")}}</v-tab>
        <v-tab value="general">{{$t("pause.general.general")}}</v-tab>
      </v-tabs>
    </template>
    <template #default="{ data }">
      <v-card-text>
        <v-container>
          <v-window v-model="tab">

            <v-window-item value="pomodoro">

              <div class="text-h6"> {{$t("pause.timer.sessionOf")}} {{ Math.floor(data!.pomodoro!.pomodoroFlexSettings!.totalLength / 60) }} {{$t("pause.timer.hours")}} {{ data!.pomodoro!.pomodoroFlexSettings!.totalLength % 60 }} {{$t("pause.timer.minutes")}}</div>
              <v-slider
                v-model="data!.pomodoro!.pomodoroFlexSettings!.totalLength"
                :min="5" :max="240" :step="5" thumb-label class="pr-4"
                prepend-icon="mdi-timer"
              >
                <template v-slot:thumb-label>
                  {{ Math.floor(data!.pomodoro!.pomodoroFlexSettings!.totalLength / 60) }}h{{ data!.pomodoro!.pomodoroFlexSettings!.totalLength % 60 }}m
                </template>
              </v-slider>

              <div class="text-h6">{{ data!.pomodoro!.pomodoroFlexSettings!.numberOfBreak }} {{$t("pause.timer.breaksNumber")}}</div>
              <v-slider
                v-model="data!.pomodoro!.pomodoroFlexSettings!.numberOfBreak"
                :min="0" :max="10" :step="1" thumb-label show-ticks="always" class="pr-4"
                prepend-icon="mdi-tally-mark-5"
              />

              <div class="text-h6">{{ data!.pomodoro!.pomodoroFlexSettings!.breakLength }} {{$t("pause.timer.breakLength")}}</div>
              <v-slider
                v-model="data!.pomodoro!.pomodoroFlexSettings!.breakLength"
                :min="1" :max="20" :step="1" thumb-label class="pr-4"
                prepend-icon="mdi-coffee"
              />

              <div class="text-h6">{{$t("pause.timer.volume")}}</div>
              <v-slider
                v-model="data!.pomodoro!.pomodoroFlexSettings!.soundVolume"
                :min="0" :max="100" :step="1" thumb-label class="pr-4"
                :prepend-icon="volumeIcon(data!.pomodoro!.pomodoroFlexSettings!.soundVolume)"
              />

              <v-row>
                <v-spacer />
                <v-col> <v-btn variant="tonal" @click="() => {
                  data!.pomodoro!.pomodoroFlexSettings!.totalLength = settingsStore.defaultSettings.pomodoro!.pomodoroFlexSettings!.totalLength;
                  data!.pomodoro!.pomodoroFlexSettings!.numberOfBreak = settingsStore.defaultSettings.pomodoro!.pomodoroFlexSettings!.numberOfBreak;
                  data!.pomodoro!.pomodoroFlexSettings!.breakLength = settingsStore.defaultSettings.pomodoro!.pomodoroFlexSettings!.breakLength;
                }">{{$t("pause.timer.default")}}</v-btn> </v-col>
                <v-spacer />
              </v-row>

            </v-window-item>

            <v-window-item value="general">
              <v-row>
                <v-col cols="12">
                  <v-text-field :label="$t('pause.general.username')" v-model="data!.user!.username" type="string" required />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <v-select :label="$t('pause.general.language')" v-model="$i18n.locale" :items="$i18n.availableLocales"
                    @update:model-value="($event) => data!.user!.lang = $event" />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <v-select :label="$t('pause.general.theme')" v-model="data.user!.theme" :items="themeList" item-title="title"
                    item-value="value" @update:model-value="setTheme($event)">
                    <template #item="{ props, item }">
                      <v-list-item v-bind="props">
                        <template #prepend>
                          <v-icon :color="item.raw.color">mdi-circle</v-icon>
                        </template>
                      </v-list-item>
                    </template>
                    <!-- <template v-slot:prepend><v-icon :color="data.theme">mdi-circle</v-icon></template> -->
                  </v-select>
                </v-col>
              </v-row>

              <v-row>
                <v-spacer />
                <v-col> <v-btn variant="tonal" @click="exportData()">{{$t("pause.general.exportData")}}</v-btn> </v-col>
                <v-col> <v-btn variant="tonal" @click="importData()">{{$t("pause.general.importData")}}</v-btn> </v-col>
                <v-spacer />
              </v-row>

              <v-row>
                <v-spacer />
                <v-col>
                  <v-snackbar :timeout="2000" color="primary" elevation="24">
                    <template #activator="{ props }">
                      <v-btn variant="tonal" @click="resetTutorial()" v-bind="props">{{$t("pause.general.resetTutorial")}}</v-btn>
                    </template>
                    {{$t("pause.general.resetted")}}
                  </v-snackbar>
                </v-col>
                <v-spacer />
              </v-row>
              
            </v-window-item>

          </v-window>
        </v-container>
      </v-card-text>

    </template>
  </BaseDialog>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStateStore } from "@/stores/state";
import { useSettingsStore } from "@/stores/settings";
import { useTheme } from 'vuetify'
import { themeList } from '@/assets/themes'
import BaseDialog from '@/components/common/BaseDialog.vue'
import type { Settings } from '@/types';

const theme = useTheme();
const state = useStateStore();
const settingsStore = useSettingsStore();

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue'])
const model = computed({
  get() { return props.modelValue },
  set(value) { return emit('update:modelValue', value) }
})
const tab = ref('pomodoro');

const tt = ref(20);

function cancelSettings() {
  settingsStore.updateLanguage();
  settingsStore.updateTheme();
}
function saveSettings(s: Settings) {
  settingsStore.updateSettings(s);
}
function setTheme(newTheme: string) {
  theme.global.name.value = newTheme;
}
function resetTutorial() {
  state.resetTutorial()
}

function exportData() {
  state.downloadData();
}

function importData() {
  state.uploadData();
}

//// ---- ////
const volumeIcon = computed(() => ((volume: number) => {
  if (!volume) return 'mdi-volume-off';
  if (volume < 33) return 'mdi-volume-low';
  if (volume < 66) return 'mdi-volume-medium';
  return 'mdi-volume-high';
}))

let _sessionLenght = 20;
const sessionLenght = computed({
  get() { return props.modelValue },
  set(value) { return emit('update:modelValue', value) }
})

</script>