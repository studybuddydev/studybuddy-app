<template>
  <v-container v-if="exam">
    <h1>{{ exam.name }}</h1>

    <Links :element="exam" />
    <PostIt :element="exam" />
    <ToDo :element="exam" />

  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router'
import { useStateStore } from "@/stores/state";
import type { Link, PostIt as PostItType } from '@/types';
import Links from '@/components/Links/Links.vue'
import PostIt from '@/components/PostIt/PostIt.vue'
import ToDo from '@/components/ToDo/ToDo.vue'

const state = useStateStore();
const route = useRoute()

const exam = ref(state.getExam(route.params.exam as string));

function addLink(link: Link) {
  if (exam.value) state.addLink(exam.value, link);
}
</script>