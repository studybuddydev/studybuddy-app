<template>
  <div>
    <h1 class="ma-4">{{ $t("welcome", { 'name': state.getUsername() } ) }}</h1>
    <h2 class="ma-4">{{ $t("random.intro") }}</h2>
    <Timeline class="ma-10" />
  </div>
</template>

<script setup lang="ts">
import Timeline from "@/components/Timeline/Timeline.vue";
import { useStateStore } from "@/stores/state";
const state = useStateStore();

</script>