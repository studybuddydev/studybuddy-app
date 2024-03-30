<template>
  <div class="sink-list">
    <div v-for="s in sink.items" :key="s" class="sink-list-item">
      <p>{{ s }}</p>
      <v-icon icon="mdi-delete" @click="sink.remove(s)" class="sink-list-item-icon" />
    </div>
    <div v-if="sink.itemsCount === 0" class="no-items">
      <p class="text-medium-emphasis">Bravo! Hai finito il lavandino</p>
    </div>
  </div>

</template>

<script lang="ts" setup>
import { useSinkStore } from "@/stores/sink";
const sink = useSinkStore();
</script>

<style scoped lang="scss">
.sink-list {
  padding: 1rem;
  
  .sink-list-item {
    gap: 1rem;
    display: flex;
    align-items: center;
    padding: 1rem 0;

    .sink-list-item-icon {
      transition: color 0.2s;
      &:hover {
        color: rgb(var(--v-theme-error));
      }
    }

    p {
      flex-grow: 1;
    }

  }

  .no-items {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>