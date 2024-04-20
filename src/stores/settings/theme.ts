import { defineStore } from 'pinia'
import type { Theme } from '@/types';
import { ref } from 'vue';
import { useDBStore } from "@/stores/db";

export const useThemeStore = defineStore('themeStore', () => {
  const db = useDBStore()
  const themes = ref<Theme[] >([]);
  const themesByCategory = ref<{ [id: string]: Theme[] } >({});
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
    themesByCategory.value = themes.value.reduce((acc, theme) => {
      if (theme.category) {
        if (!acc[theme.category]) {
          acc[theme.category] = [];
        }
        acc[theme.category].push(theme);
      }
      return acc;
    }, {} as { [id: string]: Theme[] });
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
