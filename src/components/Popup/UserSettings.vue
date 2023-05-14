<template>
  <BaseDialog
    v-model="model"
    title="User Settings"
    :data="userSettings"
    v-slot="{ data }"
    @save="saveSettings($event)"
    @cancel="closeSettings()"
  >
    {{ $i18n.locale }}
    <v-card-text>
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-text-field label="Username" v-model="data.username" type="string" required />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-select
              :label="$t('popup.settings.language')"
              v-model="$i18n.locale" :items="$i18n.availableLocales"
              @update:model-value="saveLanguage($event)" />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-select
              :label="$t('popup.settings.theme')"
              v-model="data.theme" :items="themeList" item-title="title" item-value="value"
              @update:model-value="setTheme($event)">
              <template v-slot:item="{ props, item }" >
                <v-list-item v-bind="props">
                  <template v-slot:prepend>
                    <v-icon :color="item.raw.color">mdi-circle</v-icon>
                  </template>
                </v-list-item>
              </template>
              <!-- <template v-slot:prepend><v-icon :color="data.theme">mdi-circle</v-icon></template> -->
            </v-select>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-snackbar :timeout="2000" color="primary" elevation="24">
              <template v-slot:activator="{ props }">
                <v-btn variant="tonal" @click="resetTutorial()" v-bind="props">Reset Tutorial</v-btn>
              </template>
              Tutorial resetted
            </v-snackbar>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>

</BaseDialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStateStore } from "@/stores/state";
import { useTheme } from 'vuetify'
import { themeList } from '@/assets/themes'
import type { UserSettings } from '@/types';
import BaseDialog from '@/components/common/BaseDialog.vue'
import { useI18n } from 'vue-i18n';

const theme = useTheme()
const state = useStateStore();
const i18n = useI18n();

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue'])
const model = computed({
  get() { return props.modelValue },
  set(value) { return emit('update:modelValue', value) }
})

const userSettings = ref({ ...state.getUserSettings() })
const originalLanguage = i18n.locale.value;

function closeSettings() {
  userSettings.value = { ...state.getUserSettings() }

  setLanguage(originalLanguage);
  setTheme(userSettings.value.theme);
}

function saveSettings(data: UserSettings) {
  state.setUserSettings(data)
}

function setLanguage(newLanguage: string) {
  i18n.locale.value = newLanguage;
  saveLanguage(newLanguage);
}

function saveLanguage(newLanguage: string) {
  state.saveLanguage(newLanguage);
}
function setTheme(newTheme: string) {
  theme.global.name.value = newTheme;
}
function resetTutorial() {
  state.resetTutorial()
}


</script>