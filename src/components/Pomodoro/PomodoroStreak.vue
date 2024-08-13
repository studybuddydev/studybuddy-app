<template>
  <div class="streak">
    <p class="streak-nr font-casio">{{ pomoDB.streak }}</p>
    <v-icon icon="mdi-fire" :color="pomoDB.streak > 0 ? 'accent' : '#AAA'" size="large" />
  </div>
</template>
<script lang="ts" setup>
import { usePomodoroDBStore } from "@/stores/db/pomodoro";
const pomoDB = usePomodoroDBStore();
</script>
<style scoped lang="scss">
.streak {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  font-weight: bold;

  .streak-nr {
    font-size: 0.8em;
    text-shadow: -2px 1px rgb(var(--v-theme-primary));
  }
}
</style>