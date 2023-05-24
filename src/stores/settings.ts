import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { PomodoroSettings, Settings } from '@/types'
import { useI18n } from 'vue-i18n';
import { useTheme } from 'vuetify'

const LOCAL_STORAGE_KEY = 'settings';

const defaultSettings: Settings = {
  user: {
    theme: 'blallo',
    username: 'Pippo',
    icon: 'mdi-icon',
    lang: 'en',
  },

  pomodoro: {
    pomodoroSettings: {
      longBreakLength: 15,
      shortBreakLength: 5,
      nrStudy: 4,
      studyLength: 25,
    },

    pomodoroFlexSettings: {
      totalLength: "02:00",
      numberOfBreak: 3,
      breakLength: 5,
    },
  }
};

export const useSettingsStore = defineStore('settings', () => {

  const theme = useTheme();
  const i18n = useI18n();

  const settings = ref<Settings>(JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) ?? '{}'));

  const userSettings = computed(() => settings.value.user ?? defaultSettings.user!);
  const pomodoroSettings = computed(() => settings.value.pomodoro?.pomodoroSettings ?? defaultSettings!.pomodoro!.pomodoroSettings!);
  const pomodoroFlexSettings = computed(() => settings.value.pomodoro?.pomodoroFlexSettings ?? defaultSettings!.pomodoro!.pomodoroFlexSettings!);

  const settingsWithDefaults = computed<Settings>(() => {
    return {
      user: userSettings.value,
      pomodoro: {
        pomodoroSettings: pomodoroSettings.value,
        pomodoroFlexSettings: pomodoroFlexSettings.value,
      }
    }
  });

  function updateSettings(newSettings: Settings) {
    settings.value = newSettings;
    save();
  }

  function updatePomodoroSettings(newSettings: PomodoroSettings) {
    if (settings.value.pomodoro)
      settings.value.pomodoro.pomodoroSettings = newSettings;
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
    userSettings, pomodoroSettings, pomodoroFlexSettings,
    updateSettings, updatePomodoroSettings,
    updateTheme, updateLanguage
  };
});
