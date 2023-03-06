<template>
  <v-container>

    <Postit />

  </v-container>
</template>

<script setup lang="ts">
import Postit from "@/components/Postit.vue";
import { useRoute } from 'vue-router'
import { useStateStore } from "@/stores/state";

const state = useStateStore();
const route = useRoute()

const exam = state.getExam(route.params.exam as string);
</script>