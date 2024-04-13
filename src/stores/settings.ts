import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { PomodoroSettings, Settings, ThemeSettings, GeneralSettings } from '@/types'
import { useTheme } from 'vuetify'

const LOCAL_STORAGE_KEY = 'settings';
const DEFAULT_LANG = 'it';
const DEFAULT_PALETTE = 'gptday';
const DEFAULT_ICONS = 'mdi-icon';
const DEFAULT_IMG = 'https://api.studybuddy.it/images/Rocks';


const defaultSettings: Settings = {
  general: {
    lang: DEFAULT_LANG,
    hideTime: false,
    soundVolume: 50,
    videoVolume: 50,
    pulsingPause: true,
    showSeconds: false,
    disableCountdown: false,
    hideSetup: false,
    dayStartEndHours: [8, 18],
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
    backgroundImg: DEFAULT_IMG,
  }
};

export const useSettingsStore = defineStore('settings', () => {

  const theme = useTheme();

  const settings = ref<Settings>(JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) ?? '{}'));
  settings.value.general = { ...defaultSettings.general, ...settings.value.general } as GeneralSettings;
  settings.value.theme = { ...defaultSettings.theme, ...settings.value.theme } as ThemeSettings;
  settings.value.pomodoro = { ...defaultSettings.pomodoro, ...settings.value.pomodoro } as PomodoroSettings;

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

  let debounceTimeout: number | undefined = undefined;
  function save() {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(async () => {
      console.log('Saving settings')
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings.value));
    }, 500)
  }

  function updatePalette(newPalette?: string) {
    theme.global.name.value = newPalette ?? themeSettings.value.palette ?? DEFAULT_PALETTE;
  }

  updatePalette();


  // volume
  const videoMuted = ref(true);
  const videoVolume = computed(() => settings.value.general.videoVolume);
  function setVideoVolume(volume: number) {
    settings.value.general.videoVolume = volume;
    if (volume > 0 && videoMuted.value) 
      videoMuted.value = false;
    save();
  }
  function toggleVideoMute() {
    videoMuted.value = !videoMuted.value;
  }

  return {
    settings,
    generalSettings, pomoSettings, themeSettings,
    defaultSettings,
    updateSettings, updatePomodoroSettings,
    updatePalette,
    videoMuted, videoVolume, setVideoVolume, toggleVideoMute,
    save
  };
});
