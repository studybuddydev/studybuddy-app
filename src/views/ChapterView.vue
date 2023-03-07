<template>
  <v-container v-if="exam && chapter">
    <h1>{{ chapter.name }}</h1>
  </v-container>
  
  <!-- <div class="link">
    <h2>Link utili </h2>
    <v-btn v-for="(button, index) in buttons" :key="index" :class="button.class"  :href="button.href" variant="outlined" >
      {{ button.label }}
    </v-btn>
    <v-btn color="primary" @click="addButton">Add Button</v-btn>
  </div> -->

  <Links class="ma-4" :links="links" />

</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useStateStore } from "@/stores/state";
import type { Link } from '@/types';
import Links from '@/components/Links/Links.vue'

const state = useStateStore();
const route = useRoute()

const exam = state.getExam(route.params.exam as string);
const chapter = exam?.chapters.find(c => c.name === route.params.chapter) ?? undefined;

const links: Link[] = [{
  name: 'ISIS',
  url: 'https://isis.tu-berlin.de/login/index.php'
}, {
  name: 'MOSES',
  url: 'https://moseskonto.tu-berlin.de/moses/index.html'
}, {
  name: 'Email',
  url: 'https://mail.tu-berlin.de/'
}]

const  addButton = () => {
  links.push({
    name: 'New',
    url: 'https://google.com/pippo',
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