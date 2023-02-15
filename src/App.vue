<template>
  <v-app id="inspire">
    <v-navigation-drawer permanent>

      <template v-slot:prepend>
        <v-list-item
          class="pa-5"
          prepend-avatar="/images/logo.jpg"
          title="StudyBuddy"
        ></v-list-item>
      </template>


      <v-divider></v-divider>

      <v-list nav density="compact">
        <v-list-item
          v-for="exam in exams" link :key="exam.text"
          :to="`/exam/${exam.text}`"
          :prepend-icon="exam.icon"
          :title="exam.text"
          :value="exam.text"
        />
        <v-list-item ref="input" :contenteditable="true" title="CIAO" @keydown.enter="saveNewExam()"></v-list-item>
        <v-list-item><v-btn color="primary" width="100%" prepend-icon="mdi-plus" >Esame</v-btn></v-list-item>
      </v-list>


      <template v-slot:append>
        <v-list-item
          lines="two"
          prepend-avatar="https://randomuser.me/api/portraits/women/81.jpg"
          title="Jane Smith"
          subtitle="Logged in"
        ></v-list-item>
      </template>
    </v-navigation-drawer>

    <v-main>

    </v-main>
  </v-app>
</template>


<script lang="ts">
import { defineComponent, ref, watch, onMounted } from "vue";

type Exam = {
  text: string;
  icon: string;
}

const newExamListElement = ref(null)
console.log(newExamListElement)

export default defineComponent({
  name: "App",
  data: () => ({
    drawer: false,
    diocane: 'ciao',
    exams: [
      { text: "Matematica", icon: "mdi-math-integral" },
      { text: "Fisica", icon: "mdi-cube" },
      { text: "Informatica", icon: "mdi-laptop" },
    ] as Exam[],
    editingExam: null as Exam | null,
  }),
  mounted() {
    (this.$refs.input as any).focus()

  },
  methods: {
    saveNewExam() {
      const x = (this.$refs.input as any).outerHTML
      console.log(x)
    }
  },
});
</script>

<style lang="scss">
.main {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  //background-image: url("/background.jpg");
}
.wrapper {
  background-color: #222222c0;
  backdrop-filter: blur(5px);
  padding: 1.5em 4em;
  border-radius: 1em;
  border: 3px solid white;
}
h2,
h1,
h3,
p {
  text-align: center;
}
h1 {
  font-size: 4em;
}
h2 {
  font-size: 2em;
}
p {
  border-top: 1px solid white;
  margin-top: 2em;
  padding: 2em;
  font-size: 1.5em;
}
</style>