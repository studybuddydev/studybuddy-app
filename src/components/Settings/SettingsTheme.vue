<template>
  <v-window v-model="step">
    <v-window-item :value="1" class="theme-settings">
      <div class="header">
        <div class="text-h6">{{ $t('pause.theme.chooseTheme') }}</div>
        <v-btn @click="setUpNewTheme()" color="primary" variant="text" prepend-icon="mdi-plus">{{
    $t('pause.timer.createNew') }}</v-btn>
      </div>
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
            <v-text-field label="Background" v-model="settingsStore.settings!.theme!.backgroundVideo" clearable />
          </v-col>
          <v-col cols="2">
            <div>
              <v-tooltip activator="parent" location="top">Show only music</v-tooltip>
              <v-switch color="primary" inset hide-details true-icon="mdi-music" false-icon="mdi-video"
                v-model="settingsStore.settings!.theme!.showOnlyMusic"
                :disabled="!settingsStore.settings!.theme!.backgroundVideo" />
            </div>
          </v-col>
        </v-row>
        <v-row v-if="settingsStore.settings!.theme!.showOnlyMusic">
          <v-col cols="12">
            <v-text-field label="Background image" v-model="settingsStore.settings!.theme!.backgroundImg" clearable />
          </v-col>
        </v-row>
      </v-col>

    </v-window-item>
    <v-window-item :value="2" class="theme-settings">
      <div class="header">
        <v-btn @click="back()" color="primary" variant="text" prepend-icon="mdi-arrow-left">{{ $t('back') }}</v-btn>
        <v-btn @click="saveTheme()" color="primary">{{ $t('save') }}</v-btn>
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
        <v-row>
          <v-col cols="9">
            <v-text-field :label="$t('Youtube')" v-model="settingsStore.settings!.theme!.backgroundVideo" type="string"
              clearable />
          </v-col>
          <v-col cols="3">
            <div>
              <v-tooltip activator="parent" location="top">Show only music</v-tooltip>
              <v-switch color="primary" inset hide-details true-icon="mdi-music" false-icon="mdi-video"
                v-model="settingsStore.settings!.theme!.showOnlyMusic">
              </v-switch>
            </div>
          </v-col>
        </v-row>

      </div>
    </v-window-item>
  </v-window>
</template>
<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useThemeStore } from "@/stores/settings/theme";
import { useSettingsStore } from "@/stores/settings";
import { paletteList } from '@/config/themes'
import type { Theme } from '@/types';
import { useI18n } from 'vue-i18n';
import ThemeTile from '@/components/common/ThemeTile.vue';

const { t } = useI18n();
const themeStore = useThemeStore();
const settingsStore = useSettingsStore();

const selectedCategory = ref<number>(0);
const step = ref(1);
const emit = defineEmits<{
  (e: 'hideDone', hide: boolean): void
}>()
watch(step, (val) => {
  emit('hideDone', val === 2);
});

const primaryColorsMapping: { [id: string]: string } = {};
paletteList.forEach((t) => { primaryColorsMapping[t.value] = t.color; });

const selectedTheme = ref<Theme | null>(null);
function setTheme(newTheme: Theme) {
  selectedTheme.value = newTheme;
  settingsStore.updatePalette(newTheme.palette!);
  settingsStore.settings!.theme!.palette = newTheme.palette!;
  settingsStore.settings!.theme!.backgroundImg = newTheme.backgroundImg;
  settingsStore.settings!.theme!.backgroundVideo = newTheme.backgroundVideo;
  settingsStore.settings!.theme!.showOnlyMusic = newTheme.showOnlyMusic;
}

function setPalette(palette: string) {
  settingsStore.settings!.theme!.palette = palette;
  settingsStore.updatePalette(palette);
}

const newThemeTitle = ref<string | undefined>(undefined);
let ogTheme: Theme | null = null;
function setUpNewTheme() {
  step.value = 2;
  newThemeTitle.value = t('pause.theme.newTheme');
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
    backgroundVideo: settingsStore.settings!.theme!.backgroundVideo,
    showOnlyMusic: settingsStore.settings!.theme!.showOnlyMusic,
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
