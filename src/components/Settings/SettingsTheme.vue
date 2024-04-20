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
            v-model="settingsStore.themeSettings.showOnlyMusic"
            :disabled="!settingsStore.themeSettings.backgroundVideo" />
        </div>
      </v-col>
    </v-row>
    <v-row v-if="settingsStore.themeSettings.backgroundVideo && settingsStore.themeSettings.showOnlyMusic">
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
import ThemeTile from '@/components/common/ThemeTile.vue';
import { getYotubeId, isUrl } from '@/utils/common'

const themeStore = useThemeStore();
const settingsStore = useSettingsStore();

const selectedCategory = ref<number>(0);

const primaryColorsMapping: { [id: string]: string } = {};
paletteList.forEach((t) => { primaryColorsMapping[t.value] = t.color; });

const backgroundUrlError = ref<string | null>(null);
const background = computed({
  get() {
    return settingsStore.themeSettings.backgroundVideo ?? settingsStore.themeSettings.backgroundImg ?? backgroundUrlError.value
  },
  set(newValue) {
    if (!newValue) {
      settingsStore.themeSettings.backgroundImg = '';
      settingsStore.themeSettings.backgroundVideo = '';
      backgroundUrlError.value = null;
      backgroundUrlImgError.value = null;
    } else if (getYotubeId(newValue)) {
      settingsStore.themeSettings.backgroundVideo = newValue;
      backgroundUrlError.value = null;
    } else if (isUrl(newValue)) {
      settingsStore.themeSettings.backgroundImg = newValue;
      settingsStore.themeSettings.backgroundVideo = undefined;
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
    return settingsStore.themeSettings.backgroundImg ?? backgroundUrlImgError.value
  },
  set(newValue) {
    if (!newValue) {
      settingsStore.themeSettings.backgroundImg = '';
      backgroundUrlImgError.value = null;
    } else if (isUrl(newValue)) {
      settingsStore.themeSettings.backgroundImg = newValue;
      backgroundUrlImgError.value = null;
    } else {
      backgroundUrlImgError.value = newValue;
    }
    
  }
})

const iconBackground = computed(() => {
  if (settingsStore.themeSettings.backgroundVideo) {
    return 'mdi-video'
  } else if (settingsStore.themeSettings.backgroundImg) {
    return 'mdi-image'
  } else {
    return 'mdi-video-off'
  }
})

const selectedTheme = ref<Theme | null>(null);
function setTheme(newTheme: Theme) {
  selectedTheme.value = newTheme;
  settingsStore.updatePalette(newTheme.palette!);
  settingsStore.themeSettings.palette = newTheme.palette!;
  settingsStore.themeSettings.backgroundImg = newTheme.backgroundImg;
  settingsStore.themeSettings.backgroundVideo = newTheme.backgroundVideo;
  settingsStore.themeSettings.showOnlyMusic = newTheme.showOnlyMusic;
}

function saveTheme() {
  const newTheme: Theme = {
    // title: newThemeTitle.value,
    palette: settingsStore.themeSettings.palette,
    backgroundImg: settingsStore.themeSettings.backgroundImg,
    backgroundVideo: settingsStore.themeSettings.backgroundVideo,
    showOnlyMusic: settingsStore.themeSettings.showOnlyMusic,
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
