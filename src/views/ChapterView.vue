<template>
  <v-container v-if="exam && chapter">
    <h1>{{ chapter.name }}</h1>
  </v-container>
  
  <div class="link">
    <h2>Link utili </h2>
    <v-btn v-for="(button, index) in buttons" :key="index" :class="button.class"  :href="button.href" variant="outlined" >
      {{ button.label }}
    </v-btn>
    <v-btn color="primary" @click="addButton">Add Button</v-btn>
  </div>

</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useStateStore } from "@/stores/state";
import {ref, nextTick} from 'vue'

const state = useStateStore();
const route = useRoute()

const exam = state.getExam(route.params.exam as string);
const chapter = exam?.chapters.find(c => c.name === route.params.chapter) ?? undefined;

const buttons = [
  {
    label: 'Moodle',
    href: 'https://google.com',
    class: 'mr-3'
  },
  {
    label: 'Paper',
    href: 'https://google.com/pippo',
    class: 'mr-3'
  }
]



const  addButton = () => {
  console.log('add button')
  buttons.push({
    label: 'New',
    href: 'https://google.com/pippo',
    class: 'mr-3'
  })

}


</script>

<style lang="scss">
h1{
  text-align: center;
  
}
h2{
  text-align: center;
}

.link{
  
  text-align: center;


}



</style>