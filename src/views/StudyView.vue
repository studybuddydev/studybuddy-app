<template>
  <v-container>
    <!-- MENU  -->
    <v-navigation-drawer permanent>

      <!--column header  -->
      <template v-slot:prepend>
        <v-list-item>
          <h1 class="title text-h4 text-primary">StudyBuddy</h1>
        </v-list-item>
      </template>

      <v-divider></v-divider>

      <Menu 
        elements-name="Chapters"
        :menu-elements="menuElements ?? []"
        @add="addChapter"
        @edit="editChapter"
        @remove="removeChapter"
      />

    </v-navigation-drawer>

    <!-- MAIN CONTENT  -->

    <h1>{{ exam?.name }}</h1>


    <Postit />


  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from 'vue-router'
import Postit from "@/components/Postit.vue";
import { useStateStore } from "@/stores/state";
import type { MenuElement } from '@/types';
import Menu from '@/components/Menu.vue';

const route = useRoute()
const state = useStateStore();

const exam = computed(() => state.getExam(route.params.exam as string));

const menuElements = computed(() => exam.value?.chapters.map((c) => ({
  name: c.name,
  to: `/exam/${c.name}/${c.name}`,
})));

function addChapter(el: MenuElement) {
  if (exam.value)
    state.addChapter(exam.value, { name: el.name })
}

function editChapter(el: MenuElement, i: number) {
  if (exam.value)
    state.editChapter(exam.value, i, { name: el.name })
}

function removeChapter(i: number) {
  if (exam.value)
    state.removeChapter(exam.value, i)
}


</script>