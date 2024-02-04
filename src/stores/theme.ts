import { defineStore } from 'pinia'
import Dexie, { type Table } from 'dexie';
import type { Theme } from '@/types';
import { ref } from 'vue';

class ThemeDatabase extends Dexie {
  public themes!: Table<Theme, number>; // id is number in this case

  public constructor() {
    super("ThemeDatabase");
    this.version(1).stores({
      themes: "++id,title,palette,backgroundColor, backgroundImg"
    });
    this.on("populate", () => {
      this.themes.bulkAdd([
        { title: 'Forest', palette: 'bio', backgroundImg: 'https://images.pexels.com/photos/1423600/pexels-photo-1423600.jpeg' },
        { title: 'Clouds', palette: 'nord', backgroundImg: 'https://images.alphacoders.com/133/1332707.png' },
        { title: 'Aurora', palette: 'blallo', backgroundImg: 'https://images.pexels.com/photos/3573603/pexels-photo-3573603.jpeg' },
        { title: 'Space', palette: 'gptnight', backgroundImg: 'https://live.staticflickr.com/65535/52259221868_b757d6cdea_k_d.jpg' },
        { title: 'Mountain', palette: 'nord', backgroundImg: 'https://images.pexels.com/photos/1772973/pexels-photo-1772973.png' },
        { title: 'Beach', palette: 'pastel', backgroundImg: 'https://images.pexels.com/photos/65322/pexels-photo-65322.jpeg' },
        { title: 'Vaporwave', palette: 'vaporwave', backgroundImg: 'https://images.alphacoders.com/124/1249674.jpg' },
        { title: 'LOFI', palette: 'gptnight', backgroundImg: 'https://i.redd.it/injl33v9myl51.jpg' },
        { title: 'Barbie', palette: 'pastel', backgroundImg: 'https://wallpapercg.com/download/margot-robbie-4096x2304-16479.jpeg' },
        { title: 'Oppenheimer', palette: 'gptnight', backgroundImg: 'https://venezianews.b-cdn.net/wp-content/uploads/elementor/thumbs/Oppenheimer-qcqe56sjf98g5iharhgvboxysohac64vt3kbim5lio.jpg' },
        { title: 'OG', palette: 'verdone', backgroundImg: 'https://images.pexels.com/photos/66997/pexels-photo-66997.jpeg' },
        { title: 'Gandalf', palette: 'blallo', backgroundImg: 'https://media4.giphy.com/media/TcdpZwYDPlWXC/giphy.gif' }
      ]);
    })
  }
}


export const useThemeStore = defineStore('themeStore', () => {

  const themeDatabase = new ThemeDatabase();
  const themes = ref<Theme[] >([]);

  async function getAllThemes() {
    return await themeDatabase.themes.toArray();
  }

  async function addTheme(theme: Theme) {
    return await themeDatabase.themes.add(theme);
  }

  async function load() {
    themes.value = await getAllThemes();
  }
  load();

  return {
    getAllThemes, addTheme, themes
  };
});
