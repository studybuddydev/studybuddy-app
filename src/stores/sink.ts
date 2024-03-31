import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

export const useSinkStore = defineStore('sink', () => {

  const showSink = ref(false);
  const items = ref<string[]>(JSON.parse(localStorage.getItem('sink') || '[]'));

  function add(newItem: string) {
    items.value.push(newItem);
    localStorage.setItem('sink', JSON.stringify(items.value));
  }

  const itemsCount = computed(() => items.value.length);

  function toggleSink() {
    showSink.value = !showSink.value;
  }

  function remove(s: string) {
    const index = items.value.indexOf(s);
    if (index !== -1) {
      items.value.splice(index, 1);
      localStorage.setItem('sink', JSON.stringify(items.value));
    }
    if (items.value.length === 0) showSink.value = false;
  }

  return {
    items, itemsCount, showSink,
    add, toggleSink, remove
  };
});
