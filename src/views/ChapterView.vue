<template>
  <v-container v-if="exam && chapter">
    <h1>{{ chapter.name }}</h1>
  </v-container>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useStateStore } from "@/stores/state";

const state = useStateStore();
const route = useRoute()

const exam = state.getExam(route.params.exam as string);
const chapter = exam?.chapters.find(c => c.name === route.params.chapter) ?? undefined;


</script>