<template>
  <v-app id="inspire">

    <v-footer app class="bg-black pa-0">
      <TomatoFooterVue />
    </v-footer>

    <v-navigation-drawer absolute :rail="rail">
      <template v-slot:prepend>
        <v-list-item
          prepend-avatar="/images/logo.png"
          title="StudyBuddy"
          @click="rail = false"
          to="/" nav />
      </template>

      <v-divider></v-divider>

      <v-list nav density="compact">
        <v-list-item
          v-for="exam, i in state.getExams()" :key="exam.name"
          link :to="`/exam/${exam.name}`"
          @click="rail = true"
          :prepend-icon="exam.icon" :title="exam.name" :value="exam.name"
          :active-color="exam.color ?? 'primary'">
          <template v-slot:append>
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn
                  color="grey-lighten-1"
                  icon="mdi-dots-vertical"
                  variant="text"
                  v-bind="props"
                  @click.prevent.stop="$event.preventDefault()"
                ></v-btn>
              </template>
              <v-list>
                <v-list-item @click="editExam(exam, i)" title="Edit" />
                <v-list-item @click="removeExam(exam)" title="Delete" />
              </v-list>
            </v-menu>
          </template>
        </v-list-item>

        <v-list-item
          @click="addExam()"
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

    <v-dialog v-model="newExamDialog.open" width="500">
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="newExamDialog.open = false"> <v-icon>mdi-close</v-icon> </v-btn>
          <v-toolbar-title>Exam</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items> <v-btn variant="text" @click="saveExam()" > Save </v-btn> </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12"> <v-text-field v-model="newExamDialog.exam.name" label="Exam name" required></v-text-field> </v-col>
              <v-col cols="12">
                <v-select label="Icon" :items="mdiIconsList" v-model="newExamDialog.exam.icon" :prepend-icon="newExamDialog.exam.icon">
                  <template v-slot:item="{ props: item }">
                    <v-list-item v-bind="item" :prepend-icon="item.value" />
                  </template>
                </v-select>
              </v-col>
            </v-row>
            <v-row>
            <v-col cols="12">
              <v-select label="Icon" :items="colorList" v-model="newExamDialog.exam.color" >
                <template v-slot:item="{ props: item }">
                  <v-list-item v-bind="item" >
                    <template v-slot:prepend>
                      <v-icon :color="item.value">mdi-circle</v-icon>
                    </template>
                  </v-list-item>
                </template>
                <template v-slot:prepend>
                  <v-icon :color="newExamDialog.exam.color">mdi-circle</v-icon>
                </template>
              </v-select>
            </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
  </v-dialog>
  </v-app>
</template>


<script setup lang="ts">
import { ref } from "vue";
import TomatoFooterVue from './components/TomatoFooter.vue';
import { useStateStore } from "@/stores/state";
import type { Exam } from './types';
const state = useStateStore();

const rail = ref(false);

const defultExam = { chapters: [], icon: 'mdi-math-integral', name: '' } as Exam;

const mdiIconsList = [
  'mdi-math-integral',
  'mdi-math-compass',
  'mdi-math-cos',
  'mdi-math-sin',
  'mdi-math-tan',
  'mdi-math-norm',
  'mdi-math-norm-box',
  'mdi-math-log',
  'mdi-math-exp',
  'mdi-math-factorial',
  'mdi-math-derive',
  'mdi-math-integral-box',
]  

const colorList = [
  'purple',
  'pink',
  'indigo',
  'blue',
  'teal',
  'green',
  'orange',
  'deep-orange',
  'brown',
  'grey',
  'blue-grey',
  'black',
  'white',
];

const newExamDialog = ref({
  open: false,
  examIndex: -1,
  exam: { ...defultExam },
});

function addExam() {
  newExamDialog.value.exam =  { ...defultExam };
  newExamDialog.value.examIndex = -1;
  newExamDialog.value.open = true;
}

function saveExam() {
  if (newExamDialog.value.examIndex === -1) {
    state.addExam(newExamDialog.value.exam);
  } else {
    state.editExam(newExamDialog.value.exam, newExamDialog.value.examIndex);
  }
  newExamDialog.value.open = false;
}

function editExam(exam: Exam, i: number) {
  newExamDialog.value.exam = { ...exam };
  newExamDialog.value.examIndex = i;
  newExamDialog.value.open = true;
}


function removeExam(exam: Exam) {
  state.removeExam(exam);
}



</script>
