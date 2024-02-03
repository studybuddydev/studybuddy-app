<template>
  <div>
    <v-row>
      <v-col cols="12">
        <v-select :label="$t('pause.theme.theme')" v-model="selectedTheme" :items="themes" clearable
          @update:model-value="setTheme($event)" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-select :label="$t('pause.theme.colors')" v-model="settingsStore.settings.theme!.theme" :items="themeList"
          item-title="title" item-value="value" @update:model-value="settingsStore.updateTheme($event)">
          <template #item="{ props, item }">
            <v-list-item v-bind="props">
              <template #prepend>
                <v-icon :color="item.raw.color">mdi-circle</v-icon>
              </template>
            </v-list-item>
          </template>
          <!-- <template v-slot:prepend><v-icon :color="data.theme">mdi-circle</v-icon></template> -->
        </v-select>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-text-field :label="$t('pause.theme.bgColor')" v-model="settingsStore.settings!.theme!.backgroundColor"
          type="color" clearable />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-text-field :label="$t('pause.theme.url')" v-model="settingsStore.settings!.theme!.backgroundImg" type="string"
          clearable />
      </v-col>
    </v-row>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { useSettingsStore } from "@/stores/settings";
import { themeList } from '@/assets/themes'

const settingsStore = useSettingsStore();

// ----- THEME
type Theme = { theme: string, img: string }
const themes = [
  { title: 'Forest', value: { theme: 'bio', img: 'https://images.pexels.com/photos/1423600/pexels-photo-1423600.jpeg' } },
  { title: 'Clouds', value: { theme: 'nord', img: 'https://images.alphacoders.com/133/1332707.png' } },
  { title: 'Aurora', value: { theme: 'blallo', img: 'https://images.pexels.com/photos/3573603/pexels-photo-3573603.jpeg' } },
  { title: 'Space', value: { theme: 'gptnight', img: 'https://live.staticflickr.com/65535/52259221868_b757d6cdea_k_d.jpg' } },
  { title: 'Mountain', value: { theme: 'nord', img: 'https://images.pexels.com/photos/1772973/pexels-photo-1772973.png' } },
  { title: 'Beach', value: { theme: 'pastel', img: 'https://images.pexels.com/photos/65322/pexels-photo-65322.jpeg' } },
  { title: 'Vaporwave', value: { theme: 'vaporwave', img: 'https://images.alphacoders.com/124/1249674.jpg' } },
  { title: 'LOFI', value: { theme: 'gptnight', img: 'https://i.redd.it/injl33v9myl51.jpg' } },
  { title: 'Barbie', value: { theme: 'pastel', img: 'https://wallpapercg.com/download/margot-robbie-4096x2304-16479.jpeg' } },
  { title: 'Oppenheimer', value: { theme: 'gptnight', img: 'https://venezianews.b-cdn.net/wp-content/uploads/elementor/thumbs/Oppenheimer-qcqe56sjf98g5iharhgvboxysohac64vt3kbim5lio.jpg' } },
  { title: 'OG', value: { theme: 'verdone', img: 'https://images.pexels.com/photos/66997/pexels-photo-66997.jpeg' } },
  { title: 'Gandalf', value: { theme: 'blallo', img: 'https://media4.giphy.com/media/TcdpZwYDPlWXC/giphy.gif' } }

]

const selectedTheme = ref<Theme | null>(null);
function setTheme(newTheme: Theme) {
  settingsStore.updateTheme(newTheme.theme);
  settingsStore.settings!.theme!.theme = newTheme.theme;
  settingsStore.settings!.theme!.backgroundImg = newTheme.img;
}
</script>