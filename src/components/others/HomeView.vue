<template>
  <div>
    <h1 class="ma-4">{{ $t("welcome", { 'name': settings.settingsWithDefaults.user?.username } ) }}</h1>
    <Timeline class="ma-10" />
  </div>
</template>

<script setup lang="ts">
import Timeline from "@/components/Timeline/Timeline.vue";
import { useSettingsStore } from "@/stores/settings";
const settings = useSettingsStore();

</script>