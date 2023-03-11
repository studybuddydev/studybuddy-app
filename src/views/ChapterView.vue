<template>
  <v-container v-if="exam && chapter">
    <h1>{{ chapter.name }}</h1>

    <Links
      :links="chapter?.links ?? []"
      @add-link="addLink($event)"
      />

      <PostIt :element="chapter" />
      
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router'
import { useStateStore } from "@/stores/state";
import type { Link, PostIt as PostItType } from '@/types';
import Links from '@/components/Links/Links.vue'
import PostIt from '@/components/PostIt/PostIt.vue'

const state = useStateStore();
const route = useRoute()

const exam = state.getExam(route.params.exam as string);
const chapter = ref(exam?.chapters.find(c => c.name === route.params.chapter) ?? undefined);

function addLink(link: Link) {
  if (chapter.value) state.addLink(chapter.value, link);
}


</script>
