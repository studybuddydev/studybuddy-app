<template>
  <div class="categories">
    <v-chip-group selected-class="text-primary" column v-model="selectedCategory">
      <v-chip v-for="cat in themeStore.categories" :key="cat"> {{ cat }} </v-chip>
    </v-chip-group>
  </div>

  <div class="themes" v-if="selectedCategory !== null">
    <ThemeTile class="theme-tile" v-for="t in themeStore.themesByCategory[themeStore.categories[selectedCategory]]"
      :theme="t" :selected="selectedTheme?.title === t.title" :primaryColor="primaryColorsMapping[t.palette ?? '']"
      @setTheme="setTheme(t)" />
  </div>

  <div class="text-h6">Customize</div>
  <v-col cols="12">
    <v-row>
      <v-col cols="10">
        <v-text-field label="Background"
          v-model="background" :error="!!backgroundUrlError"
          :prepend-icon="iconBackground"
          clearable />
      </v-col>
      <v-col cols="2">
        <div>
          <v-tooltip activator="parent" location="top">Show only music</v-tooltip>
          <v-switch
            color="primary"
            inset hide-details
            true-icon="mdi-music" false-icon="mdi-video"
            v-model="settings.themeSettings.showOnlyMusic"
            :disabled="!settings.themeSettings.backgroundVideo" />
        </div>
      </v-col>
    </v-row>
    <v-row v-if="settings.themeSettings.backgroundVideo">
      <v-col cols="12">
        <VolumeSlider
          v-model:volume="settings.generalSettings.videoVolume"
          v-model:mute="settings.generalSettings.videoMute"
        />
      </v-col>
    </v-row>
    <v-row v-if="settings.themeSettings.backgroundVideo && settings.themeSettings.showOnlyMusic">
      <v-col cols="12">
        <v-text-field
          label="Background image"
          v-model="backgroundImg" :error="!!backgroundUrlImgError"
          clearable />
      </v-col>
    </v-row>
  </v-col>
</template>
<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useThemeStore } from "@/stores/settings/theme";
import { useSettingsStore } from "@/stores/settings";
import { paletteList } from '@/config/themes'
import type { Theme } from '@/types';
import { getYotubeId, isUrl } from '@/utils/common'
import ThemeTile from '@/components/common/ThemeTile.vue';
import VolumeSlider from '@/components/common/VolumeSlider.vue'

const themeStore = useThemeStore();
const settings = useSettingsStore();

const selectedCategory = ref<number>(0);
const volume = ref<number>(0);

const primaryColorsMapping: { [id: string]: string } = {};
paletteList.forEach((t) => { primaryColorsMapping[t.value] = t.color; });

const backgroundUrlError = ref<string | null>(null);
const background = computed({
  get() {
    return settings.themeSettings.backgroundVideo ?? settings.themeSettings.backgroundImg ?? backgroundUrlError.value
  },
  set(newValue) {
    if (!newValue) {
      settings.themeSettings.backgroundImg = '';
      settings.themeSettings.backgroundVideo = '';
      backgroundUrlError.value = null;
      backgroundUrlImgError.value = null;
    } else if (getYotubeId(newValue)) {
      settings.themeSettings.backgroundVideo = newValue;
      backgroundUrlError.value = null;
    } else if (isUrl(newValue)) {
      settings.themeSettings.backgroundImg = newValue;
      settings.themeSettings.backgroundVideo = undefined;
      backgroundUrlError.value = null;
      backgroundUrlImgError.value = null;
    } else {
      backgroundUrlError.value = newValue;
    }
    
  }
})
const backgroundUrlImgError = ref<string | null>(null);
const backgroundImg = computed({
  get() {
    return settings.themeSettings.backgroundImg ?? backgroundUrlImgError.value
  },
  set(newValue) {
    if (!newValue) {
      settings.themeSettings.backgroundImg = '';
      backgroundUrlImgError.value = null;
    } else if (isUrl(newValue)) {
      settings.themeSettings.backgroundImg = newValue;
      backgroundUrlImgError.value = null;
    } else {
      backgroundUrlImgError.value = newValue;
    }
    
  }
})

const iconBackground = computed(() => {
  if (settings.themeSettings.backgroundVideo) {
    return 'mdi-video'
  } else if (settings.themeSettings.backgroundImg) {
    return 'mdi-image'
  } else {
    return 'mdi-video-off'
  }
})

const selectedTheme = ref<Theme | null>(null);
function setTheme(newTheme: Theme) {
  selectedTheme.value = newTheme;
  settings.updatePalette(newTheme.palette!);
  settings.themeSettings.palette = newTheme.palette!;
  settings.themeSettings.backgroundImg = newTheme.backgroundImg;
  settings.themeSettings.backgroundVideo = newTheme.backgroundVideo;
  settings.themeSettings.showOnlyMusic = newTheme.showOnlyMusic;
}

function saveTheme() {
  const newTheme: Theme = {
    // title: newThemeTitle.value,
    palette: settings.themeSettings.palette,
    backgroundImg: settings.themeSettings.backgroundImg,
    backgroundVideo: settings.themeSettings.backgroundVideo,
    showOnlyMusic: settings.themeSettings.showOnlyMusic,
  };

  themeStore.addTheme(newTheme);
  setTheme(newTheme);
}

</script>

<style scoped lang="scss">
.theme-settings {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;

  .header {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
}

.themes {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  width: 80%;
  padding: 0.5rem;
}

.theme-tile {
  flex-basis: 27%;
  flex-shrink: 0;
  height: 100%;
}

.advance-panel-closed {
  border-bottom: 1px solid rgba(var(--v-theme-primary), 0.6);
}
</style>
