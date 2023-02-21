<template><!--   MENU-->

  <h1>Pianifica il tuo studio</h1>
  <v-date-picker class="custom-calendar" disable-page-swipe is-expanded is-dark v-model="date" />

  <iframe style="border-radius:12px"
    src="https://open.spotify.com/embed/playlist/37i9dQZF1DX3ChuoDUa3J5?utm_source=generator&theme=0" width="35%"
    height="80" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
    loading="lazy">
  </iframe>

  

</template>

<script setup lang="ts">
import { ref } from "vue";

const date = ref(new Date());

// const newExamDialogNameRules = [(v: string) => !!v || "Exam name is required"]
// const attributes = ref([ { key: "fisica", highlight: true, dates: [new Date(2023,1,20)], popover: {} } ] as any[]);



</script>