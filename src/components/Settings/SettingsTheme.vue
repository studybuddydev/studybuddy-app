<template>
  <div>

    <div class="themes">
      <div v-for="t in themeStore.themes" :class="`theme-box ${selectedTheme?.title === t.title ? 'selected' : ''}`" :style="{
        border: `2px solid ${primaryColorsMapping[t.palette ?? '']}`,
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${t.backgroundImg})`
      }" @click="setTheme(t)">
        <svg class="triangle" height="30" width="30" xmlns="http://www.w3.org/2000/svg">
          <polygon points="0,0 30,0 30,30" :style="{
            fill: primaryColorsMapping[t.palette ?? ''],
          }" />
        </svg>
        <div class="theme-title">{{ t.title }}</div>
      </div>
    </div>

    <v-expansion-panels>
      <v-expansion-panel title="Custom theme">
        <v-expansion-panel-text>

          <div class="text-h6">{{ $t('pause.theme.colors') }}</div>
            <div class="themes">
              <div v-for="t in paletteList" class="theme-box" :style="{ backgroundColor: t.background }" @click="settingsStore.updatePalette(t.value)">
                <svg class="triangle" height="30" width="30" xmlns="http://www.w3.org/2000/svg">
                  <polygon points="0,0 30,0 30,30" :style="{
                    fill: t.color,
                  }" />
                </svg>
                <div class="theme-title"><p :style="{color: t.color}">{{ t.title }}</p></div>
              </div>
            </div>

          <v-row>
            <v-col cols="12">
              <v-text-field :label="$t('pause.theme.bgColor')" v-model="settingsStore.settings!.theme!.backgroundColor"
                type="color" clearable />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-text-field :label="$t('pause.theme.url')" v-model="settingsStore.settings!.theme!.backgroundImg"
                type="string" clearable />
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>


  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { useThemeStore } from "@/stores/settings/theme";
import { useSettingsStore } from "@/stores/settings";
import { paletteList } from '@/assets/themes'
import type { Theme } from '@/types';

const themeStore = useThemeStore();
const settingsStore = useSettingsStore();

const primaryColorsMapping: { [id: string]: string } = {};
paletteList.forEach((t) => { primaryColorsMapping[t.value] = t.color; });

const selectedTheme = ref<Theme | null>(null);
function setTheme(newTheme: Theme) {
  selectedTheme.value = newTheme;
  settingsStore.updatePalette(newTheme.palette!);
  settingsStore.settings!.theme!.palette = newTheme.palette!;
  settingsStore.settings!.theme!.backgroundImg = newTheme.backgroundImg;
}
</script>

<style scoped lang="scss">
.themes {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  place-items: center;
  margin: 1.5rem 0;
  cursor: pointer;

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

    .theme-title {
      color: white;
    }
  }
}
</style>
