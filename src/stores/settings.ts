import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { PomodoroFlexSettings, Settings } from '@/types'
import { useI18n } from 'vue-i18n';
import { useTheme } from 'vuetify'

const LOCAL_STORAGE_KEY = 'settings';

const defaultSettings: Settings = {
  user: {
    theme: 'blallo',
    username: 'Pippo',
    icon: 'mdi-icon',
    lang: 'it',
  },

  pomodoro: {
    totalLength: 120,
    numberOfBreak: 3,
    breaksLength: 15,
    soundVolume: 50,
  },

  zenMode: {
    backgroundColor: undefined,
    backgroundImg: undefined,
  }
};

export const useSettingsStore = defineStore('settings', () => {

  const theme = useTheme();
  const i18n = useI18n();

  const settings = ref<Settings>(JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) ?? '{}'));

  const userSettings = computed(() => settings.value.user ?? defaultSettings.user!);
  const pomodoroFlexSettings = computed(() => settings.value.pomodoro ?? defaultSettings!.pomodoro!);
  const zenModeSettings = computed(() => settings.value.zenMode ?? defaultSettings.zenMode);


  const settingsWithDefaults = computed<Settings>(() => {
    return {
      user: userSettings.value,
      pomodoro: pomodoroFlexSettings.value,
      zenMode: zenModeSettings.value,
    }
  });

  function updateSettings(newSettings: Settings) {
    settings.value = newSettings;
    save();
  }

  function updatePomodoroSettings(newSettings: PomodoroFlexSettings) {
    if (settings.value.pomodoro)
      settings.value.pomodoro = newSettings;
    save();
  }

  function save() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings.value));
  }

  function updateTheme() {
    theme.global.name.value = userSettings.value.theme;
  }
  function updateLanguage() {
    i18n.locale.value = userSettings.value.lang
  }

  updateTheme();
  updateLanguage();
  
  return {
    settings, settingsWithDefaults,
    userSettings, pomodoroFlexSettings,
    defaultSettings,
    updateSettings, updatePomodoroSettings,
    updateTheme, updateLanguage
  };
});
