<template>
  <!-- MAIN MENU -->
  <v-navigation-drawer permanent :rail="!!exam">
    <template v-slot:prepend>
      <v-list-item
        prepend-avatar="/images/logo.png"
        to="/" nav >
        <template v-slot>
          <v-list-item class="pa-0">
            <h1 class="title font-weight-bold text-primary">StudyBuddy
              <span class="bg-primary pa-1">BETA</span>
            </h1>
          </v-list-item>
        </template>
      </v-list-item>
    </template>

    <v-divider></v-divider>
    
    <MenuList
      :elements-name="$t('exam')"
      :menu-elements="menuElements"
      @add="addExam"
      @edit="editExam"
      @remove="removeExam"
      />

    <template v-slot:append>
      <v-list-item
        prepend-avatar="/images/pippo.webp"
        lines="two"
        :title="state.getUserSettings().username"
        subtitle="Logged in"
        nav >
          <template v-slot:append v-if="!exam">

            <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn color="grey-lighten-1" icon="mdi-cog" variant="text" v-bind="props" />
            </template>

            <v-list>
              <v-list-item title="Export data" @click="exportData()"/>
              <v-list-item title="Import data" @click="importData()"/>
              <v-list-item title="User Settings" @click="openUserSettings = true"/>
            </v-list>
          </v-menu>



          </template>
      </v-list-item>
    </template>
  </v-navigation-drawer>

  <!-- EXAM MENU -->
  <v-navigation-drawer permanent v-if="exam">

    <template v-slot:prepend>
      <v-list-item :to="`/exam/${exam.name}`" nav >
        <h1 >{{exam?.name}}</h1>
      </v-list-item>
    </template>

    <v-divider></v-divider>

    <MenuList
      :elements-name="$t('chapter')"
      :choose-color="false"
      :choose-icon="false"
      :color="exam?.color ?? 'primary'"
      :menu-elements="menuElementsChapters ?? []"
      @add="addChapter"
      @edit="editChapter"
      @remove="removeChapter"
    />

  </v-navigation-drawer>

  <UserSettings v-model="openUserSettings" />

</template> 

<script setup lang="ts">
import MenuList from '@/components/Menus/MenuList.vue';
import { useRoute } from 'vue-router'
import { ref, computed } from "vue";
import { useStateStore } from "@/stores/state";
import type { MenuElement } from '@/types';
import UserSettings from '@/components/Popup/UserSettings.vue';

const route = useRoute()
const state = useStateStore();
const openUserSettings = ref(false);

const exam = computed(() => route.params.exam ? state.getExam(route.params.exam as string) : undefined);

// ----- EXAM
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
  state.editExam(index, el.name, el.icon ?? 'mdi-book', el.color);
}

function removeExam(i: number) {
  state.removeExam(i);
}

// ----- CHAPTER
const menuElementsChapters = computed(() => exam.value?.chapters.map((c) => ({
  name: c.name,
  to: `/exam/${exam.value?.name}/${c.name}`,
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

function exportData() {
  state.downloadData();
}

function importData() {
  state.uploadData();
}

</script>

<style scoped lang="scss">
.title {
  font-size: 1.2rem !important;
  span {
    border-radius: 0.5rem;
  }
}
</style>