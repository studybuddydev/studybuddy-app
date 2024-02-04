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
    const res = await db.themes.add(theme);
    update();
    return res;
  }

  async function update() {
    themes.value = await getAllThemes();
  }
  update();

  return {
    getAllThemes, addTheme, themes
  };
});
