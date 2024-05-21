<template>
  <v-window v-model="step">
    <v-window-item :value="1" class="settings-theme">

      <div class="header px-6 pb-6">
        <div class="header-title">
          <p class="text-h6">Choose a theme</p>
          <Info :text="$t('info.timer')" class="info-settings" />
        </div>
        <v-btn @click="step = 2" color="primary" variant="text" prepend-icon="mdi-plus">Save as new</v-btn>
      </div>

      <div class="categories pb-6">
        <v-chip v-for="(cat, i) in themeStore.categories" :key="cat" @click="setCategory(i)"
          :color="selectedCategory === i ? 'primary' : ''" :variant="selectedCategory === i ? 'flat' : 'tonal'">{{ cat
          }}</v-chip>
      </div>
      <div class="themes" v-if="selectedCategory !== null">
        <div class="arrow" v-ripple @click="decreasePage()"><v-icon :disabled="themesPage === 0"
            icon="mdi-chevron-left" /></div>
        <ThemeTile class="theme-tile" v-for="t in showingThemes" :theme="t" :selected="selectedTheme?.title === t.title"
          :primaryColor="primaryColorsMapping[t.palette ?? '']" @setTheme="setTheme(t)" />
        <div class="arrow" v-ripple @click="increasePage()"><v-icon
            :disabled="themeStore.themesByCategory?.[selectedCategory]?.length! <= (themesPage + 1) * 3"
            icon="mdi-chevron-right" /></div>
      </div>

      <div class="customize">

        <div class="text-h6">Customize</div>
        <v-col cols="12">
          <v-row>
            <v-col cols="12">
              <v-text-field label="Youtube background" v-model="background" :error="!!backgroundUrlError"
                :prepend-icon="iconBackground" clearable hide-details />
            </v-col>
          </v-row>
          <v-row v-if="settings.themeSettings.backgroundVideo">
            <v-col cols="10" class="volume-slider">
              <VolumeSlider v-model:volume="settings.generalSettings.videoVolume" hide-details
                v-model:mute="settings.generalSettings.videoMute" />
            </v-col>
            <v-col cols="2">
              <div>
                <v-tooltip activator="parent" location="top">Show only music</v-tooltip>
                <v-switch color="primary" inset hide-details true-icon="mdi-music" false-icon="mdi-video"
                  v-model="settings.themeSettings.showOnlyMusic" :disabled="!settings.themeSettings.backgroundVideo" />
              </div>
            </v-col>
          </v-row>
          <v-row v-if="settings.themeSettings.backgroundVideo && settings.themeSettings.showOnlyMusic">
            <v-col cols="12">
              <v-text-field label="Background image" v-model="backgroundImg" :error="!!backgroundUrlImgError" hide-details
                clearable />
            </v-col>
          </v-row>
        </v-col>
      </div>
    </v-window-item>
    <v-window-item :value="2" class="settings-theme pa-6">
      <div class="header pb-6">
        <v-btn @click="step = 1" color="primary" variant="text" prepend-icon="mdi-arrow-left">{{ $t('back') }}</v-btn>
        <v-btn @click="saveTheme(); step = 1" color="primary">{{ $t('pause.timer.saveTimer') }}</v-btn>
      </div>

      <v-col cols="12">
        <v-row>
          <v-col cols="12">
            <v-text-field label="Title" v-model="newThemeTitle" />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="10">
            <v-text-field label="Background Video" v-model="settings.themeSettings.backgroundVideo"
              prepend-icon="mdi-video" clearable hide-details
              :error="!!settings.themeSettings.backgroundVideo && !getYotubeId(settings.themeSettings.backgroundVideo ?? '')" />
          </v-col>
          <v-col cols="2">
            <div>
              <v-tooltip activator="parent" location="top">Show only music</v-tooltip>
              <v-switch color="primary" inset hide-details true-icon="mdi-music" false-icon="mdi-video"
                v-model="settings.themeSettings.showOnlyMusic" :disabled="!settings.themeSettings.backgroundVideo" />
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-text-field label="Background image" v-model="settings.themeSettings.backgroundImg"
              prepend-icon="mdi-image" clearable hide-details
              :error="!!settings.themeSettings.backgroundImg && !isUrl(settings.themeSettings.backgroundImg ?? '')" />
          </v-col>
        </v-row>
      </v-col>

      <div class="palette px-6">
        <div v-for="t in paletteList" class="palette-box" :style="{ backgroundColor: t.background }" @click="setPalette(t.value)">
          <svg class="triangle" height="30" width="30" xmlns="http://www.w3.org/2000/svg">
            <polygon points="0,0 30,0 30,30" :style="{ fill: t.color }" />
          </svg>
          <div class="palette-title">
            <p :style="{ color: t.color }">{{ t.title }}</p>
          </div>
        </div>
      </div>
    </v-window-item>
  </v-window>
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
import Info from '@/components/common/Info.vue'

const themeStore = useThemeStore();
const settings = useSettingsStore();
const step = ref(1);
const newThemeTitle = ref('');

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

const selectedCategory = ref<number>(0);
function setCategory(catI: number) {
  selectedCategory.value = catI;
  themesPage.value = 0;
}
const themesPage = ref(0);
const showingThemes = computed(() =>
  themeStore.themesByCategory?.[
    selectedCategory.value
  ]?.slice(themesPage.value * 3, (themesPage.value + 1) * 3)
);

function increasePage() {
  if (themeStore.themesByCategory?.[selectedCategory.value]?.length! > (themesPage.value + 1) * 3) {
    themesPage.value++;
  }
}
function decreasePage() {
  if (themesPage.value > 0) {
    themesPage.value--;
  }
}

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
    title: newThemeTitle.value,
    palette: settings.themeSettings.palette,
    backgroundImg: settings.themeSettings.backgroundImg,
    backgroundVideo: settings.themeSettings.backgroundVideo,
    showOnlyMusic: settings.themeSettings.showOnlyMusic,
  };

  themeStore.addTheme(newTheme);
  setTheme(newTheme);
}
function setPalette(palette: string) {
  settings.updatePalette(palette);
  settings.themeSettings.palette = palette;
}

</script>

<style scoped lang="scss">
.settings-theme {
  display: flex;
  flex-direction: column;
  justify-content: center;

  .customize {
    padding: 3rem 3rem 2rem;
    .volume-slider {
      display: flex;
      align-items: center;
    }
  }

  .header {
    display: flex;
    justify-content: space-between;
    width: 100%;

    .header-title {
      display: flex;
      align-items: center;
      gap: 0.4em
    }
  }

  .themes {
    display: grid;
    grid-template-columns: 4rem 1fr 1fr 1fr 4rem;
    gap: 1rem;
    overflow-x: auto;

    .arrow {
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;

      &:first-child {
        border-radius: 0 0.5rem 0.5rem 0;
      }

      &:last-child {
        border-radius: 0.5rem 0 0 0.5rem;
        grid-column-start: 5;
      }
    }

    .theme-tile {
      flex-basis: 27%;
      flex-shrink: 0;
      height: 100%;
    }
  }

  .categories {
    display: flex;
    gap: 0.8rem;
    padding: 0.5rem;
    justify-content: center;
  }

  .palette {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    place-items: center;
    margin: 1.5rem 0;
    cursor: pointer;

    .palette-box {
      display: grid;
      place-items: center;
      padding: 1rem 0;
      width: 100%;
      height: 4rem;
      border-radius: 1rem;
      background-size: cover;
      background-position: center;
      position: relative;
      overflow: hidden;

      .triangle {
        position: absolute;
        top: 0;
        right: 0;
      }

      .btn-delete {
        display: none;
        position: absolute;
        bottom: 5px;
        right: 5px;
        opacity: 0.7;
      }

      &:hover {
        .btn-delete {
          display: block;

          &:hover {
            opacity: 1;
          }
        }
      }
    }

    .palette-title {
      color: white;
    }
  }
}
</style>
