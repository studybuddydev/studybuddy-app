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

  <Links
    :links="chapter?.links ?? []"
    @add-link="addLink($event)"
    />

  <PostIt
    v-for="postit, i in chapter?.postIts ?? []" :key="i"
    :postit="postit" :index="i"
    @save="state.save()"
    @add="addPostIt()"
    @delete="deletePostIt($event)"/>

</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router'
import { useStateStore } from "@/stores/state";
import type { Link, PostIt as PostItType } from '@/types';
import Links from '@/components/Links/Links.vue'
import PostIt from '@/components/PostIt.vue'

const state = useStateStore();
const route = useRoute()

const exam = state.getExam(route.params.exam as string);
const chapter = ref(exam?.chapters.find(c => c.name === route.params.chapter) ?? undefined);
if (chapter.value) {
  if (!chapter.value.postIts || chapter.value.postIts.length === 0)
    chapter.value.postIts = [{ color: '#e6b905', content: '' }];
}

function addLink(link: Link) {
  if (chapter.value) state.addLink(chapter.value, link);
}

function addPostIt() {
  if (chapter.value) {
    const postIt: PostItType = { color: '#e6b905', content: '' }
    if (chapter.value?.postIts) {
      chapter.value?.postIts.push(postIt)
    } else {
      chapter.value.postIts = [postIt]
    }
  }
}

function deletePostIt(index: number) {
  if (chapter.value) {
    chapter.value.postIts?.splice(index, 1);
    state.save();
  }
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