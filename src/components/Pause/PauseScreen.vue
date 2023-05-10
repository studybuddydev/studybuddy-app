<template>
  <v-scroll-x-transition>
    <div class="pause-screen" v-if="props.modelValue">
      <p class="text-primary" >You are taking a</p>
      <h2 class="text-primary" >BREAK</h2>

      <ul>
        <li @click="emit('update:modelValue', false)">Resume</li>
        <li>Settings</li>
      </ul>
    </div>
  </v-scroll-x-transition>
</template>

<script lang="ts" setup>
const props = withDefaults(defineProps<{
  modelValue: boolean,
}>(), {})
const emit = defineEmits(['update:modelValue'])

</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.pause-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10000;

  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(30px);

  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-family: 'Press Start 2P', cursive;
  
  h2 {
    font-size: 7rem;
  }
  
  p {
    font-size: 1rem;
  }

  ul {
    list-style: none;
    margin-top: 2rem;
    font-size: 1.5rem;

    li {
      margin: 0.5rem 0;
      text-align: center;
      cursor: pointer;
      padding: 0.5rem;


      &:hover {
        color: rgb(var(--v-theme-primary));
        text-decoration: underline;
      }
    }
  }
}

</style>