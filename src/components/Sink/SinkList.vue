<template>
  <div>
    <p v-for="s in sink.items" :key="s">
      <v-icon icon="mdi-delete" @click="sink.remove(s)" />
      {{ s }}
    </p>
  </div>

</template>

<script lang="ts" setup>
import { useSinkStore } from "@/stores/sink";
const sink = useSinkStore();
</script>

<style scoped lang="scss">
.sink-list {
  padding: 1rem;
  border-radius: 1rem;
}
</style>