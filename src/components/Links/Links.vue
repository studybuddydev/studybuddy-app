<template>
  <div>

    <!-- list od links-->
    <v-container class="link-container">
      <v-card
        class="link-card pa-2 ma-2"
        v-for="card, i in links"
        :key="card.name"
        :href="`//${card.url}`"
        target="_blank"
      >
        <div class="link-card-content">
          <v-img
          :src="`https://www.google.com/s2/favicons?sz=64&domain_url=${getDomain(card.url)}`"
          class="favicon"
          width="32"
          height="32"/>
          <v-card-title class="pa-0 px-4 title" v-text="card.name" />
          <v-btn variant="outlined" icon color="secondary" @click.prevent.stop.="deleteLink(i)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </div>
      </v-card>
    </v-container>

    <!-- add link dialog-->
    <v-dialog v-model="newLinkOpen" width="500">
      <v-card v-on:keyup.enter="addLink()">
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="closeNewLink()"> <v-icon>mdi-close</v-icon> </v-btn>
          <v-toolbar-title>{{$t('link.title')}}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items> <v-btn variant="text" @click="addLink()" > {{$t('save')}} </v-btn> </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field autofocus label="Url" v-model="newLink.url" type="string" required></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field label="Name" v-model="newLink.name" type="string" required></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>

  </div>
</template>

<script setup lang="ts">
import type { Link, WithLink } from '@/types';
import { ref, computed } from 'vue';
import { useStateStore } from "@/stores/state";
import { watch } from 'vue';
const state = useStateStore();

defineExpose({
  openNewLink
})

const props = defineProps<{
  element: WithLink,
}>();
const links = computed(() => props.element.links ?? []);


const newLink = ref<Link>({
  name: '',
  url: ''
})
const newLinkOpen = ref(false)
watch(newLinkOpen, (open) => {
  if (open) {
    newLink.value.url = '';
    newLink.value.name = '';
  }
});

let idleTimer = 0;
watch(() => newLink.value.url, (url) => {
  if (!url) {
    newLink.value.name = '';
    return;
  }
  
  clearTimeout(idleTimer);
  idleTimer = setTimeout(async () => {
    newLink.value.name = await getUrlTitle(url);
  }, 300);
})

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
  link.name = link.name || getDomain(link.url);
  props.element.links.push(link)

  newLinkOpen.value = false;
  newLink.value = { name: '', url: '' };

  save()
}

function deleteLink(index: number) {
  if (!props.element.links) return;
  props.element.links.splice(index, 1);
  save()
}

function save() {
  state.save()
}

async function getUrlTitle(url: string) {
  try {
    const response = await axios.get(`//${url}`);
    return response.data.match(/<title[^>]*>([^<]+)<\/title>/)[1];
  } catch (error) {
    return url;
  }
}

</script>

<style lang="scss">
.link-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  align-content: center;
  padding: 0;
  margin: 0;

  .link-card-content {
    width: 20rem;
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    justify-content: center;

    .title {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .favicon {
    flex-grow: 0;
  }
}
</style>