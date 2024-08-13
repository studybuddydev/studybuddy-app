import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { PomodoroSettings, Settings, ThemeSettings, GeneralSettings } from '@/types'
import { useTheme } from 'vuetify'
import * as common from '@/utils/common';
import { useSettingsAPIStore } from './api';

const LOCAL_STORAGE_KEY = 'settings';
const DEFAULT_LANG = 'it';
const DEFAULT_PALETTE = 'gptnight';
const DEFAULT_ICONS = 'mdi-icon';
const DEFAULT_IMG = 'https://api.studybuddy.it/images/LOFI';
const DEFAULT_VIDEO = 'https://www.youtube.com/watch?v=jfKfPfyJRdk';


const defaultSettings: Settings = {
  general: {
    lang: DEFAULT_LANG,
    hideTime: false,
    soundVolume: 50,
    soundMute: false,
    videoVolume: 50,
    videoMute: false,
    pulsingPause: true,
    showSeconds: false,
    disableCountdown: false,
    hideSetup: false,
    startPipped: true,
    dayStartEndHours: [8, 18],
  },

  pomodoro: {
    freeMode: false,
    totalLength: 115,
    numberOfBreak: 3,
    breaksLength: 15,
  },

  theme: {
    icon: DEFAULT_ICONS,
    palette: DEFAULT_PALETTE,
    backgroundColor: undefined,
    backgroundImg: DEFAULT_IMG,
    backgroundVideo: DEFAULT_VIDEO,
    showOnlyMusic: false,
  }
};

export const useSettingsStore = defineStore('settings', () => {

  const theme = useTheme();
  const settingsAPI = useSettingsAPIStore();

  const settings = ref<Settings>(JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) ?? '{}'));

  function updateSettingsValue(newSettings: Settings) {
    settings.value.general = { ...defaultSettings.general, ...newSettings.general } as GeneralSettings;
    settings.value.theme = { ...defaultSettings.theme, ...newSettings.theme } as ThemeSettings;
    settings.value.pomodoro = { ...defaultSettings.pomodoro, ...newSettings.pomodoro } as PomodoroSettings;
  }
  updateSettingsValue(settings.value);


  if (settings.value.theme.backgroundImg === 'https://images.alphacoders.com/133/1332707.png') {
    settings.value.theme.backgroundImg = DEFAULT_IMG;
  }

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

  function save(skipRemote: boolean = false) {
    const s = { ...settings.value, lastUpdate: new Date().getTime() }
    common.debounce('settings-save', () => {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(s));
    }, 500);

    if (!skipRemote) settingsAPI.upsertSettings(s);
  }

  function updatePalette(newPalette?: string) {
    theme.global.name.value = newPalette ?? themeSettings.value.palette ?? DEFAULT_PALETTE;
  }
  updatePalette();

  async function getSettingsAPI() {
    const lastUpdate = settings.value.lastUpdate ?? 0;
    const newSettings = await settingsAPI.getSettingsIfNew(lastUpdate);
    if (newSettings) {
      updateSettingsValue(newSettings);
      save(true);
    }
  }
  getSettingsAPI();



  return {
    settings,
    generalSettings, pomoSettings, themeSettings,
    defaultSettings,
    updateSettings, updatePomodoroSettings,
    updatePalette,
    save
  };
});
