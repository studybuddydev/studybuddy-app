import { defineStore } from 'pinia'
import type { Theme } from '@/types';
import { ref } from 'vue';
import { useDBStore } from "@/stores/db";

export const useThemeStore = defineStore('themeStore', () => {
  const db = useDBStore()
  const themes = ref<Theme[] >([]);

  async function getAllThemes() {
    return await db.themes.toArray();
  }

  async function addTheme(theme: Theme) {
    const toAddTheme: Theme = {
      title: theme.title,
      palette: theme.palette,
      backgroundColor: theme.backgroundColor,
      backgroundImg: theme.backgroundImg,
      backgroundVideo: theme.backgroundVideo
    }
    const res = await db.themes.add(toAddTheme);
    update();
    return res;
  }

  async function update() {
    themes.value = await getAllThemes();
  }
  update();

  async function deleteTheme(id?: number) {
    if (id !== undefined) {
      await db.themes.delete(id);
      update();
    }
  }

  return {
    getAllThemes, addTheme, deleteTheme, themes
  };
});
