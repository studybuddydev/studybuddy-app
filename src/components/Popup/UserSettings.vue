<template>
  <BaseDialog
    title="User Settings"
    v-model="model"
    :extension="true"
    :data="settingsStore.settingsWithDefaults"
    @save="saveSettings($event)"
    @cancel="cancelSettings()">
    <template #extension>
      <v-tabs v-model="tab">
        <v-tab value="general">General</v-tab>
        <v-tab value="pomodoro">Timer</v-tab>
      </v-tabs>
    </template>
    <template #default="{ data }">
      <v-card-text>
        <v-container>
          <v-window v-model="tab">
            <v-window-item value="general">
              <v-row>
                <v-col cols="12">
                  <v-text-field label="Username" v-model="data!.user!.username" type="string" required />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <v-select :label="$t('popup.settings.language')" v-model="$i18n.locale" :items="$i18n.availableLocales"
                    @update:model-value="($event) => data!.user!.lang = $event" />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <v-select :label="$t('popup.settings.theme')" v-model="data.user!.theme" :items="themeList" item-title="title"
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
                <v-col> <v-btn variant="tonal" @click="exportData()">Export data</v-btn> </v-col>
                <v-col> <v-btn variant="tonal" @click="importData()">Import data</v-btn> </v-col>
                <v-spacer />
              </v-row>

              <v-row>
                <v-spacer />
                <v-col>
                  <v-snackbar :timeout="2000" color="primary" elevation="24">
                    <template #activator="{ props }">
                      <v-btn variant="tonal" @click="resetTutorial()" v-bind="props">Reset Tutorial</v-btn>
                    </template>
                    Tutorial resetted
                  </v-snackbar>
                </v-col>
                <v-spacer />
              </v-row>
              
            </v-window-item>

            <v-window-item value="pomodoro">
              <v-row>
                <v-col cols="12"> <v-text-field v-model="data!.pomodoro!.pomodoroFlexSettings!.totalLength" type="time" label="Session length [hh:mm]" required step="300" min="0" /> </v-col>
                <v-col cols="12"> <v-text-field v-model.number="data!.pomodoro!.pomodoroFlexSettings!.numberOfBreak" type="number" label="Number of breaks" required min="0" /> </v-col>
                <v-col cols="12"> <v-text-field v-model.number="data!.pomodoro!.pomodoroFlexSettings!.breakLength" type="number" label="Break length [minutes]" required min="0" /> </v-col>
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
const tab = ref('general');

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


</script>