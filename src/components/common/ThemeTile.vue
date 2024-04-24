<template>
  <div :class="`theme-box ${selected ? 'selected' : ''}`"
    @mouseleave="deleteTheme(undefined)" @click="emit('setTheme')" :style="{
    border: `2px solid ${primaryColor}`,
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${previewImage})`
  }">
    <svg class="triangle" height="30" width="30" xmlns="http://www.w3.org/2000/svg">
      <polygon points="0,0 30,0 30,30" :style="{
    fill: primaryColor,
  }" />
    </svg>
    <div class="theme-title">
      {{ theme.backgroundVideo ? (theme.showOnlyMusic ? '♪' : '▶') : '' }}
      {{ theme.title }}
    </div>
    <v-icon size="x-small" icon="mdi-delete" @click.stop="deleteTheme(theme.id)" class="btn-delete"
      :color="deleteingTheme === theme.id ? 'red' : 'white'" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { Theme } from '@/types';
import { useThemeStore } from "@/stores/settings/theme";
import { getYotubeId } from '@/utils/common'
const themeStore = useThemeStore();

const props = defineProps<{
  theme: Theme,
  selected: boolean,
  primaryColor: string
}>();
const emit = defineEmits<{
  (e: 'setTheme'): void
}>()

const previewImage = computed(() => {
  if (props.theme.previewImg) return props.theme.previewImg;
  if (props.theme.backgroundImg) return props.theme.backgroundImg;
  if (props.theme.showOnlyMusic) return undefined;
  if (props.theme.backgroundVideo) {
    const id = getYotubeId(props.theme.backgroundVideo);
    return id ? `https://img.youtube.com/vi/${id}/0.jpg` : undefined;
  }
});

const deleteingTheme = ref<number | null>(null);
function deleteTheme(id: number | undefined) {
  if (id === undefined) {
    deleteingTheme.value = null;
    return;
  }

  if (deleteingTheme.value === id) {
    deleteingTheme.value = null;
    themeStore.deleteTheme(id);
  } else {
    deleteingTheme.value = id;
  }
}
</script>

<style lang="scss" scoped>
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

  .theme-title {
    color: white;
  }
}
</style>