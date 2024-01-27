
<script lang="ts" setup generic="T extends {}">
const props = defineProps<{
  text: string,
}>()
</script>

<template>
  <div class="info-tip">
    <v-icon icon="mdi-information-outline" />
    <div class="info-box">
      <p>{{ text }}</p>
    </div>
  </div>
</template>


<style lang="scss" scoped>
.info-tip {
  position: fixed;

  .info-box {
    position: absolute;
    bottom: 2.5em;
    left: 0.5em;
    transform: translateX(-50%);
    z-index: 1;
    width: 300px;
    padding: 1em;
    background-color: rgb(var(--v-theme-surface));
    border-radius: 1em;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s ease-in-out;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
    font-size: 0.8em;

  }

  .info-box::after {
    z-index: -99;
    content: "";
    position: absolute;
    width: 0;
    height: 0;
    margin-left: 0;
    bottom: -12px;
    left: calc(50% - 6px);
    box-sizing: border-box;
    border: 6px solid #fff;
    border-color: transparent transparent rgb(var(--v-theme-surface)) rgb(var(--v-theme-surface));
    transform-origin: 0 0;
    transform: rotate(315deg);

    /* removed box-shadow rule */
  }

  &:hover {
    .info-box {
      opacity: 1;
      visibility: visible;
    }
  }
}
</style>
