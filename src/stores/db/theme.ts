import { defineStore } from 'pinia'
import type { Theme } from '@/types';
import { ref } from 'vue';
import { useDBStore } from "./db";

export const useThemeStore = defineStore('themeStore', () => {
  const db = useDBStore()
  const themes = ref<Theme[] >([]);
  const themesByCategory = ref<Theme[][]>([]);
  const categories = ref<string[] >([]);

  async function getAllThemes() {
    return await db.themes.toArray();
  }

  async function addTheme(theme: Theme) {
    const toAddTheme: Theme = {
      title: theme.title,
      palette: theme.palette,
      backgroundColor: theme.backgroundColor,
      backgroundImg: theme.backgroundImg,
      backgroundVideo: theme.backgroundVideo,
      showOnlyMusic: theme.showOnlyMusic,
    }
    const res = await db.themes.add(toAddTheme);
    update();
    return res;
  }

  async function update() {
    themes.value = await getAllThemes();
    categories.value = [ ...new Set(themes.value.map(t => t.category as string).filter(x => x)) ];
    themesByCategory.value = [ ...categories.value.map(_ => []), [] ];
    themes.value.forEach(t => {
      if (t.category) {
        themesByCategory.value[categories.value.indexOf(t.category)].push(t);
      } else {
        themesByCategory.value?.at(-1)?.push(t);
      }
    });
    if ((themesByCategory.value.at(-1)?.length ?? 0) > 0) categories.value.push('No Category');




  }
  update();

  async function deleteTheme(id?: number) {
    if (id !== undefined) {
      await db.themes.delete(id);
      update();
    }
  }

  return {
    getAllThemes, addTheme, deleteTheme, themes, categories, themesByCategory
  };
});
