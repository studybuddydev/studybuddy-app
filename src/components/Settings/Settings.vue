<template>
  <v-dialog width="500" v-model="modelDialog">
    <v-card>
      <v-toolbar dark color="primary">
        <v-btn icon dark @click="modelDialog = false"> <v-icon>mdi-close</v-icon> </v-btn>
        <!-- <v-toolbar-title>Settings</v-toolbar-title> -->
        <v-tabs v-model="modelTab">
          <v-tab value="general">{{ $t("pause.general.general") }}</v-tab>
          <v-tab value="pomodoro">{{ $t("pause.timer.timer") }}</v-tab>
          <v-tab value="theme">{{ $t("pause.theme.theme") }}</v-tab>
        </v-tabs>
      </v-toolbar>

      <v-card-text>
        
        <v-container>
          <v-window v-model="modelTab" :touch="false">
            
            <!-- PROFILE -->
            <v-window-item value="general">
              <SettingsGeneral />
            </v-window-item>

            <!-- POMODORO -->
            <v-window-item value="pomodoro">
              <SettingsPomodoro @hide-done="e => hideDone = e" />
            </v-window-item>

            <!-- THEME -->
            <v-window-item value="theme">
              <SettingsTheme @hide-done="e => hideDone = e" />
            </v-window-item>

          </v-window>
        </v-container>
        <v-card-actions v-if="!hideDone">
          <v-spacer />
          <v-btn variant="outlined" color="primary" @click="modelDialog = false">{{ $t('done') }}</v-btn>
        </v-card-actions>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import SettingsPomodoro from './SettingsPomodoro.vue';
import SettingsGeneral from './SettingsGeneral.vue';
import SettingsTheme from './SettingsTheme.vue';

const hideDone = ref(false);

const props = defineProps<{ modelValue: string | boolean }>()
const emit = defineEmits(['update:modelValue', 'update:tab'])
const modelDialog = computed({
  get() { return !!props.modelValue },
  set(value) { return emit('update:modelValue', value) }
})
const modelTab = computed({
  get() { return props.modelValue ?? 'general' },
  set(value) { return emit('update:modelValue', value) }
})
</script>
