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
      :model-value="exams"
      @update:model-value="updateExams($event)"
      :elements-name="$t('exam')"
      :are-exams="true"
      base-url="exam"
      />

    <template v-slot:append>
      <v-list-item
        prepend-avatar="/images/pippo.webp"
        lines="two"
        :title="state.getUserSettings().username"
        subtitle="Local account"
        class="mb-5"
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
      :model-value="chapters"
      @update:model-value="updateChapters($event)"
      :elements-name="$t('chapter')"
      :choose-color="false"
      :choose-icon="false"
      :color="exam?.color ?? 'primary'"
      :base-url="`exam/${exam.name}`"
    />

  </v-navigation-drawer>

  <UserSettings v-model="openUserSettings" />

</template> 

<script setup lang="ts">
import MenuList from '@/components/Menus/MenuList.vue';
import { useRoute } from 'vue-router'
import { ref, computed } from "vue";
import { useStateStore } from "@/stores/state";
import type { Chapter, Exam } from '@/types';
import UserSettings from '@/components/Popup/UserSettings.vue';

const route = useRoute()
const state = useStateStore();
const openUserSettings = ref(false);

const exam = computed(() => route.params.exam ? state.getExam(route.params.exam as string) : undefined);
const exams = computed(() => state.getExams());
const chapters = computed(() => exam.value?.chapters ?? []);
function updateExams(exams: Exam[]) {
  state.updateExams(exams);
}
function updateChapters(chapters: Chapter[]) {
  if (exam.value) state.updateChapters(exam.value, chapters);
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