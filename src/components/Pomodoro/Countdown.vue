<template>
  <div class="countdown-content font-casio text-primary"></div>
</template>

<script setup lang="ts">
</script>

<style lang="scss" scoped>
.countdown-content {
  display: flex;
  align-items: center;
  justify-content: center;
  counter-reset: my-count 4;
  animation: countdown 5s linear infinite;

  &::after {
    content: counter(my-count);
    font-size: 6em;
  }
}

@keyframes countdown {
  // 3 ---
  0% {
    // 0%
    font-size: 2em;
    opacity: 0;
    counter-increment: my-count -1;
  }

  1% {
    // 5%
    font-size: 2em;
    opacity: 0;
    counter-increment: my-count -1;
  }

  10% {
    // 50%
    opacity: 1;
    counter-increment: my-count -1;
  }

  15% {
    // 75%
    opacity: 1;
    counter-increment: my-count -1;
  }

  18% {
    // 95%
    font-size: 1em;
    opacity: 0;
    counter-increment: my-count -1;
  }

  19% {
    // 100%
    font-size: 2em;
    opacity: 0;
    counter-increment: my-count -1;
  }

  // 2 ---
  20% {
    // 0%
    font-size: 2em;
    opacity: 0;
    counter-increment: my-count -2;
  }

  21% {
    // 5%
    font-size: 2em;
    opacity: 0;
    counter-increment: my-count -2;
  }

  30% {
    // 50%
    opacity: 1;
    counter-increment: my-count -2;
  }

  35% {
    // 75%
    opacity: 1;
    counter-increment: my-count -2;
  }

  38% {
    // 95%
    font-size: 1em;
    opacity: 0;
    counter-increment: my-count -2;
  }

  39% {
    // 100%
    font-size: 2em;
    opacity: 0;
    counter-increment: my-count -2;
  }

  // 1 ---
  40% {
    // 0%
    font-size: 2em;
    opacity: 0;
    counter-increment: my-count -3;
  }

  41% {
    // 5%
    font-size: 2em;
    opacity: 0;
    counter-increment: my-count -3;
  }

  50% {
    // 50%
    opacity: 1;
    counter-increment: my-count -3;
  }

  55% {
    // 75%
    opacity: 1;
    counter-increment: my-count -3;
  }

  58% {
    // 95%
    font-size: 1em;
    opacity: 0;
    counter-increment: my-count -3;
  }

  59% {
    // 100%
    font-size: 2em;
    opacity: 0;
    counter-increment: my-count -3;
  }

  100% {
    font-size: 2em;
    opacity: 0;
    counter-increment: my-count -2;
  }
}
</style>