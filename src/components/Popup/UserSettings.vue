<template>
  <v-dialog v-model="model" width="500">
    <v-card  v-on:keyup.enter="saveSettings()">
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="closeSettings()"> <v-icon>mdi-close</v-icon> </v-btn>
          <v-toolbar-title>{{$t('popup.settings.title')}}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items> <v-btn variant="text" @click="saveSettings()" > {{  $t('save')}} </v-btn> </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field label="Username" v-model="userSettings.username" type="string" required></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-select :label="$t('popup.settings.language')" :items="$i18n.availableLocales" v-model="$i18n.locale" @update:model-value="updateLanguage($event)"></v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <!-- theme selector -->
                <v-select :label="$t('popup.settings.theme')" :items="themeList" item-title="title" item-value="value" v-model="userSettings.theme" @update:model-value="updateTheme($event)" >
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props" >
                      <template v-slot:prepend>
                        <v-icon :color="item.raw.color">mdi-circle</v-icon>
                      </template>
                    </v-list-item>
                  </template>
                  <!-- <template v-slot:prepend>
                    <v-icon :color="userSettings.theme">mdi-circle</v-icon>
                  </template> -->
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
      </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStateStore } from "@/stores/state";
import { useTheme } from 'vuetify'
import { themeList } from '@/assets/themes'
const theme = useTheme()
const state = useStateStore();
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue'])

const userSettings = ref({ ...state.getUserSettings() })

const model = computed({
  get() {
    return props.modelValue
  },

  set(value) {
    return emit('update:modelValue', value)
  }
})

function updateLanguage(newLanguage: string) {
  state.saveLanguage(newLanguage);
}

function closeSettings() {
  model.value = false
  userSettings.value = { ...state.getUserSettings() }
  theme.global.name.value = userSettings.value.theme;
}

function saveSettings() {
  state.setUserSettings(userSettings.value)
  model.value = false
}

function updateTheme(newTheme: string) {
  theme.global.name.value = newTheme;
}

function resetTutorial() {
  state.resetTutorial()
}


</script>