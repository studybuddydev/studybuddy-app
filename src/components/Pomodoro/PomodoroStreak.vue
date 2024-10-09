<template>
  <div class="streak">
    <p class="streak-nr font-casio">{{ streak }}</p>
    <v-icon icon="mdi-fire" color="accent" size="large" />
  </div>
</template>
<script lang="ts" setup>
const props = defineProps<{
  streak: number
}>();
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