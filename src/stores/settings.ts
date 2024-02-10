import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { PomodoroSettings, Settings, ThemeSettings, GeneralSettings } from '@/types'
import { useTheme } from 'vuetify'

const LOCAL_STORAGE_KEY = 'settings';
const DEFAULT_LANG = 'it';
const DEFAULT_PALETTE = 'bio';
const DEFAULT_ICONS = 'mdi-icon';

const defaultSettings: Settings = {
  general: {
    lang: DEFAULT_LANG,
    hideTime: false,
    soundVolume: 50,
    pulsingPause: true,
  },

  pomodoro: {
    freeMode: false,
    totalLength: 120,
    numberOfBreak: 3,
    breaksLength: 15,
  },

  theme: {
    icon: DEFAULT_ICONS,
    palette: DEFAULT_PALETTE,
    backgroundColor: undefined,
    backgroundImg: 'https://images.pexels.com/photos/1423600/pexels-photo-1423600.jpeg',
  }
};

export const useSettingsStore = defineStore('settings', () => {

  const theme = useTheme();

  const settings = ref<Settings>(JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) ?? '{}'));
  settings.value.general = { ...defaultSettings.general, ...settings.value.general } as GeneralSettings;
  settings.value.theme = { ...defaultSettings.theme, ...settings.value.theme } as ThemeSettings;
  settings.value.pomodoro = { ...defaultSettings.pomodoro, ...settings.value.pomodoro } as PomodoroSettings;

  const generalSettings = computed(() => settings.value.general);
  const pomoSettings = computed(() => settings.value.pomodoro);
  const themeSettings = computed(() => settings.value.theme);

  function updateSettings(newSettings: Settings) {
    settings.value = newSettings;
    save();
  }

  function updatePomodoroSettings(newSettings: PomodoroSettings) {
    if (settings.value.pomodoro)
      settings.value.pomodoro = newSettings;
    save();
  }

  watch(settings.value, () => {
    save();
  });

  function save() {
    console.log('Saving settings')
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings.value));
  }

  function updatePalette(newPalette?: string) {
    theme.global.name.value = newPalette ?? themeSettings.value.palette ?? DEFAULT_PALETTE;
  }

  updatePalette();
  
  return {
    settings,
    generalSettings, pomoSettings, themeSettings,
    defaultSettings,
    updateSettings, updatePomodoroSettings,
    updatePalette,
    save
  };
});
