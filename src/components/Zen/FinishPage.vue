<template>
  <div class="blur finish-box">
    <div v-if="shortPomo">
      <p class="pause font-press text-center">{{ $t("pause.pomoDoneShort") }}</p>
      <h3 class="text-primary font-press text-center">{{ $t("pause.goodjobShort") }}</h3>
    </div>
    <div v-else-if="points < 0.5">
      <p class="pause font-press text-center">{{ $t("pause.pomoDoneBad") }}</p>
      <h2 class="text-primary font-press text-center">{{ $t("pause.goodjobBad") }}</h2>
    </div>
    <div v-else>
      <p class="pause font-press text-center">{{ $t("pause.pomoDone") }}</p>
      <h2 class="text-primary font-press text-center">{{ $t("pause.goodjob") }}</h2>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  shortPomo: boolean;
  points: number;
}>();
</script>

<style scoped lang="scss">
.finish-box {
  padding: 1.5rem;
  position: relative;
  border-radius: 1rem;
  max-width: 900px;

  h2 {
    font-size: 3rem;
  }

  @media (max-width: 600px) {
    padding: 1rem;

    p {
      font-size: 0.7rem;
    }

    h2 {
      font-size: 1rem;
    }
  }
}
</style>