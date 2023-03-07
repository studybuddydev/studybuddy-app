<template>

  <v-container class="link-container">
    <v-card
      class="link-card d-flex justify-start align-center pa-2 ma-2"
      v-for="card, i in props.links"
      :key="card.name"  
      @click="openLink(card.url)"
    >
      <v-img
        :src="`https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&&url=${getDomain(card.url)}&size=128`"
        class="favicon"
        width="32"
        height="32"/>
      <v-card-title class="pa-0 pl-4 text-white" v-text="card.name"></v-card-title>
    </v-card>

    <v-card
      class="link-card link-card-add d-flex justify-start align-center pa-2 ma-2"
      @click="addUrl()"
      color="secondary"
    >
      <v-icon class="favicon" color="white">mdi-plus</v-icon>
      <v-card-title class="pa-0 pl-4 text-white">Aggiungi Link</v-card-title>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import type { Link } from '@/types';

const props = defineProps<{
  links: Link[]
}>();

function openLink(url: string) {
  window.open(url, '_blank')
}

function getDomain(url: string) {
  const domain = (new URL(url));
  return domain.hostname;
}


function addUrl() {
  props.links.push({
    name: 'New',
    url: 'https://google.com/pippo',
  })
}
</script>

<style lang="scss">
.link-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  align-content: center;
  padding: 0;
  margin: 0;

  .link-card {
    width: 20rem;
  }

  .favicon {
    flex-grow: 0;
  }
}
</style>