<template>
  <v-window v-model="step">
    <v-window-item :value="1" class="theme-settings">
      <div class="header">
        <div class="text-h6">Choose a theme</div>
        <v-btn @click="setUpNewTheme()" color="primary" variant="text" prepend-icon="mdi-plus">Create new</v-btn>
      </div>

      <div class="themes">
        <div v-for="t in themeStore.themes" :class="`theme-box ${selectedTheme?.title === t.title ? 'selected' : ''}`"
          :style="{
            border: `2px solid ${primaryColorsMapping[t.palette ?? '']}`,
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${t.previewImg ?? t.backgroundImg})`
          }" @click="setTheme(t)">
          <svg class="triangle" height="30" width="30" xmlns="http://www.w3.org/2000/svg">
            <polygon points="0,0 30,0 30,30" :style="{
              fill: primaryColorsMapping[t.palette ?? ''],
            }" />
          </svg>
          <div class="theme-title">{{ t.title }}</div>
          <v-icon size="x-small" icon="mdi-delete" @click.stop="themeStore.deleteTheme(t.id)" class="btn-delete" />
        </div>
      </div>

    </v-window-item>
    <v-window-item :value="2" class="theme-settings">
      <div class="header">
        <v-btn @click="back()" color="primary" variant="text" prepend-icon="mdi-arrow-left">Back</v-btn>
        <v-btn @click="saveTheme()" color="primary">Save Theme</v-btn>
      </div>

      <div class="new-theme-settings">

        <v-text-field label="Title" v-model="newThemeTitle" />

        <div class="themes">
          <div v-for="t in paletteList" class="theme-box" :style="{ backgroundColor: t.background }"
            @click="setPalette(t.value)">
            <svg class="triangle" height="30" width="30" xmlns="http://www.w3.org/2000/svg">
              <polygon points="0,0 30,0 30,30" :style="{
                fill: t.color,
              }" />
            </svg>
            <div class="theme-title">
              <p :style="{ color: t.color }">{{ t.title }}</p>
            </div>
          </div>
        </div>

        <v-text-field :label="$t('pause.theme.bgColor')" v-model="settingsStore.settings!.theme!.backgroundColor"
          type="color" clearable />
        <v-text-field :label="$t('pause.theme.url')" v-model="settingsStore.settings!.theme!.backgroundImg"
          type="string" clearable />

      </div>
    </v-window-item>
  </v-window>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useThemeStore } from "@/stores/settings/theme";
import { useSettingsStore } from "@/stores/settings";
import { paletteList } from '@/assets/themes'
import type { Theme } from '@/types';

const themeStore = useThemeStore();
const settingsStore = useSettingsStore();

const step = ref(1);

const primaryColorsMapping: { [id: string]: string } = {};
paletteList.forEach((t) => { primaryColorsMapping[t.value] = t.color; });

const selectedTheme = ref<Theme | null>(null);
function setTheme(newTheme: Theme) {
  selectedTheme.value = newTheme;
  settingsStore.updatePalette(newTheme.palette!);
  settingsStore.settings!.theme!.palette = newTheme.palette!;
  settingsStore.settings!.theme!.backgroundImg = newTheme.backgroundImg;
}

function setPalette(palette: string) {
  settingsStore.settings!.theme!.palette = palette;
  settingsStore.updatePalette(palette);
}

const newThemeTitle = ref<string | undefined>(undefined);
let ogTheme: Theme | null = null;
function setUpNewTheme() {
  step.value = 2;
  newThemeTitle.value = 'New Theme'
  ogTheme = {
    palette: settingsStore.settings!.theme!.palette,
    backgroundImg: settingsStore.settings!.theme!.backgroundImg,
  }
}

function back() {
  step.value = 1;
  newThemeTitle.value = undefined;
  if (ogTheme) {
    settingsStore.settings!.theme!.palette = ogTheme.palette!;
    settingsStore.settings!.theme!.backgroundImg = ogTheme.backgroundImg;
  }
  ogTheme = null;
  settingsStore.updatePalette(settingsStore.settings!.theme!.palette);
}

function saveTheme() {
  const newTheme: Theme = {
    title: newThemeTitle.value,
    palette: settingsStore.settings!.theme!.palette,
    backgroundImg: settingsStore.settings!.theme!.backgroundImg,
  };
  themeStore.addTheme(newTheme);
  setTheme(newTheme);
  newThemeTitle.value = undefined;
  step.value = 1;
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
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  place-items: center;
  margin: 1.5rem 0;
  cursor: pointer;
}

.theme-box {
  display: grid;
  place-items: center;
  padding: 1rem;
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
</style>
