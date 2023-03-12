<template>

  <v-container class="link-container">
    <v-card
      class="link-card d-flex justify-start align-center pa-2 ma-2"
      v-for="card, i in links"
      :key="card.name"
      :href="`//${card.url}`"
      target="_blank"
    >
      <v-img
        :src="`https://www.google.com/s2/favicons?sz=64&domain_url=${getDomain(card.url)}`"
        class="favicon"
        width="32"
        height="32"/>
      <v-card-title class="pa-0 pl-4 text-white" v-text="card.name"></v-card-title>
    </v-card>

    <v-card
      class="link-card link-card-add d-flex justify-start align-center pa-2 ma-2"
      @click="openNewLink()"
      color="secondary"
    >
      <v-icon class="favicon" color="white">mdi-plus</v-icon>
      <v-card-title class="pa-0 pl-4 text-white">Aggiungi Link</v-card-title>
    </v-card>
  </v-container>

  <v-dialog v-model="newLinkOpen" width="500">
    <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="closeNewLink()"> <v-icon>mdi-close</v-icon> </v-btn>
          <v-toolbar-title>Settings</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items> <v-btn variant="text" @click="addLink()" > Save </v-btn> </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field label="Name" v-model="newLink.name" type="string" required></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field label="Url" v-model="newLink.url" type="string" required></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { Link, WithLink } from '@/types';
import { ref, computed } from 'vue';
import { useStateStore } from "@/stores/state";
const state = useStateStore();

const props = defineProps<{
  element: WithLink,
}>();
const links = computed(() => props.element.links ?? []);


const newLink = ref<Link>({
  name: '',
  url: ''
})
const newLinkOpen = ref(false)

function closeNewLink() {
  newLinkOpen.value = false;
  newLink.value = { name: '', url: '' };
}

function openNewLink() {
  newLinkOpen.value = true;
}

function getDomain(url: string) {
  try {
    const domain = (new URL(url));
    return domain.hostname;
  } catch (error) {
    return url;
  }
}

function addLink() {
  if (!props.element.links)
    props.element.links = [];
  const link: Link = { ...newLink.value }
  props.element.links.push(link)

  newLinkOpen.value = false;
  newLink.value = { name: '', url: '' };

  save()
}

function save() {
  state.save()
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