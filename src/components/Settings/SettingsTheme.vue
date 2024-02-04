<template>
  <div>

    <div class="themes">
      <div v-for="t in themes" :class="`theme-box ${selectedTheme?.title === t.title ? 'selected' : ''}`" :style="{
        border: `2px solid ${t.primaryColor}`,
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${t.img})`
      }" @click="setTheme(t)">
        <svg class="triangle" height="30" width="30" xmlns="http://www.w3.org/2000/svg">
          <polygon points="0,0 30,0 30,30" :style="{
            fill: t.primaryColor,
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
              <div v-for="t in paletteList" class="theme-box" :style="{ backgroundColor: t.background }" @click="settingsStore.updateTheme(t.value)">
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
import { useSettingsStore } from "@/stores/settings";
import { paletteList } from '@/assets/themes'

const settingsStore = useSettingsStore();

function getPaletteColor(theme: string) {
  return paletteList.find((t) => t.value === theme)?.color;
}

// ----- THEME
type Theme = { title: string, theme: string, img: string, primaryColor?: string }
const themes: Theme[] = [
  { title: 'Forest', theme: 'bio', img: 'https://images.pexels.com/photos/1423600/pexels-photo-1423600.jpeg' },
  { title: 'Clouds', theme: 'nord', img: 'https://images.alphacoders.com/133/1332707.png' },
  { title: 'Aurora', theme: 'blallo', img: 'https://images.pexels.com/photos/3573603/pexels-photo-3573603.jpeg' },
  { title: 'Space', theme: 'gptnight', img: 'https://live.staticflickr.com/65535/52259221868_b757d6cdea_k_d.jpg' },
  { title: 'Mountain', theme: 'nord', img: 'https://images.pexels.com/photos/1772973/pexels-photo-1772973.png' },
  { title: 'Beach', theme: 'pastel', img: 'https://images.pexels.com/photos/65322/pexels-photo-65322.jpeg' },
  { title: 'Vaporwave', theme: 'vaporwave', img: 'https://images.alphacoders.com/124/1249674.jpg' },
  { title: 'LOFI', theme: 'gptnight', img: 'https://i.redd.it/injl33v9myl51.jpg' },
  { title: 'Barbie', theme: 'pastel', img: 'https://wallpapercg.com/download/margot-robbie-4096x2304-16479.jpeg' },
  { title: 'Oppenheimer', theme: 'gptnight', img: 'https://venezianews.b-cdn.net/wp-content/uploads/elementor/thumbs/Oppenheimer-qcqe56sjf98g5iharhgvboxysohac64vt3kbim5lio.jpg' },
  { title: 'OG', theme: 'verdone', img: 'https://images.pexels.com/photos/66997/pexels-photo-66997.jpeg' },
  { title: 'Gandalf', theme: 'blallo', img: 'https://media4.giphy.com/media/TcdpZwYDPlWXC/giphy.gif' }
].map(x => ({ ...x, primaryColor: getPaletteColor(x.theme) }))

const selectedTheme = ref<Theme | null>(null);
function setTheme(newTheme: Theme) {
  selectedTheme.value = newTheme;
  settingsStore.updateTheme(newTheme.theme);
  settingsStore.settings!.theme!.theme = newTheme.theme;
  settingsStore.settings!.theme!.backgroundImg = newTheme.img;
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
