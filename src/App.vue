<template>
  <v-app id="inspire">

    <v-footer app class="bg-black">
      <Player />
    </v-footer>

    <v-navigation-drawer absolute :rail="rail">
      <template v-slot:prepend>
        <v-list-item
          prepend-avatar="/images/logo.png"
          title="StudyBuddy"
          @click="rail = false"
          to="/"
          nav />
      </template>

      <v-divider></v-divider>

      <v-list nav density="compact">
        <v-list-item
          v-for="exam in state.getExams()" :key="exam.name"
          link :to="`/exam/${exam.name}`"
          @click="rail = true"
          :prepend-icon="exam.icon" :title="exam.name" :value="exam.name"
          active-color="primary"
          />

        <v-list-item
          @click="newExamDialog.open = true"
          color="primary"
          class="bg-primary"
          prepend-icon="mdi-plus" title="Add exam" />

      </v-list>

      <template v-slot:append>
        <v-list-item
          prepend-avatar="/images/pippo.webp"
          lines="two"
          :title="state.getUsername()"
          subtitle="Logged in"
          nav />
      </template>
    </v-navigation-drawer>

    <v-main>
      <router-view></router-view>
    </v-main>

    <v-dialog v-model="newExamDialog.open" width="auto">
      <v-sheet width="300" class="mx-auto">
        <v-form @submit.prevent>
          <v-text-field v-model="newExamDialog.name" :rules="new" label="Exam name"></v-text-field>
          <v-btn type="submit" @click="addExam" block class="mt-2">Confirm</v-btn>
        </v-form>
      </v-sheet>
    </v-dialog>
  </v-app>
</template>


<script setup lang="ts">
import { ref } from "vue";
import Player from "@/components/Player.vue";
import { useStateStore } from "@/stores/state";
const state = useStateStore();


const rail = ref(false);

const newExamDialog = ref({
  open: false,
  name: "",
});

function addExam() {
  state.addExam({
    name: newExamDialog.value.name,
    icon: "mdi-math-integral",
    chapters: []
  })
  newExamDialog.value.name = "";
  newExamDialog.value.open = false;
};

</script>
