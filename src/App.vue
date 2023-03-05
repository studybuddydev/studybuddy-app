<template>
  <v-app id="inspire">

    <v-navigation-drawer absolute :rail="rail">
      <template v-slot:prepend>
        <v-list-item
          prepend-avatar="/images/logo.png"
          title="StudyBuddy"
          @click="rail = false"
          to="/" nav />
      </template>

      <v-divider></v-divider>
      
      <Menu
        elements-name="Exam"
        :menu-elements="menuElements"
        @add="addExam"
        @edit="editExam"
        @remove="removeExam"
        />

      <template v-slot:append>
        <v-list-item
          prepend-avatar="/images/pippo.webp"
          lines="two"
          :title="state.getUsername()"
          subtitle="Logged in"
          nav />
      </template>
    </v-navigation-drawer>


    <v-footer app class="bg-black pa-0">
      <TomatoFooterVue />
    </v-footer>

    <v-main>
      <router-view></router-view>
    </v-main>

  </v-app>
</template>


<script setup lang="ts">
import { ref, computed } from "vue";
import TomatoFooterVue from './components/TomatoFooter.vue';
import Menu from './components/Menu.vue';
import { useStateStore } from "@/stores/state";
import type { MenuElement } from './types';
const state = useStateStore();
const rail = ref(false);

const menuElements = computed(() => state.getExams().map((e) => ({
  name: e.name,
  icon: e.icon,
  color: e.color,
  to: `/exam/${e.name}`,
})));


function addExam(el: MenuElement) {
  state.addExam({
    name: el.name,
    icon: el.icon  ?? 'mdi-book',
    color: el.color,
    chapters: []
  });
}

function editExam(el: MenuElement, index: number) {
  state.editExam(index, {
    name: el.name,
    icon: el.icon ?? 'mdi-book',
    color: el.color,
    chapters: []
  });
}

function removeExam(i: number) {
  state.removeExam(i);
}

</script>

<style>
html {
  overflow: hidden !important;
}
</style>
