<template>
    <v-container>
        <!-- MENU  -->
        <v-navigation-drawer permanent  >

            <!--column header  -->
            <template v-slot:prepend>
                <v-list-item>
                    <h1 class="title text-h4 text-primary">StudyBuddy</h1>
                </v-list-item>
            </template>

            <v-divider></v-divider>

            <!--exam  list  -->
            <v-list nav density="compact">
                <v-list-item
                    v-for="task in tasks"
                    link
                    :key="task.text"
                    :title="task.text"
                    :value="task.text"
                />

                <!--popup for adding item   -->
                <v-dialog v-model="dialog" width="auto">
                    <v-sheet width="300" class="mx-auto">
                        <v-form @submit.prevent>
                            <v-text-field
                                v-model="newTask"
                                :rules="rules"
                                label="Exam name"
                            ></v-text-field>
                            <v-btn
                                type="submit"
                                @click="addTask"
                                block
                                class="mt-2"
                                >Confirm</v-btn
                            >
                        </v-form>
                    </v-sheet>
                </v-dialog>
                <v-btn color="primary" width="100%" @click="dialog = true"
                    >Add new Chapter</v-btn
                >
            </v-list>
        </v-navigation-drawer>

        <!-- MAIN CONTENT  -->
            
        <h1>{{ $route.params.exam }}</h1>

        <h2 v-if="selectedTopic">
            {{ selectedTopic }}
        </h2>

        <Postit />


    </v-container>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Postit from "@/components/Postit.vue";
import { useStateStore } from "@/stores/state";

const state = useStateStore();

// get path variable

type Task = {
  text: string;
  weight: number;
};

const topics = [
  { text: "Topic 1" },
  { text: "Topic 2" },
]
const selectedTopic = ref('')
const time = ref(25 * 60 * 1000)
const intervalId = ref(0)

const tasks: Task[] = [
  { text: "Chapter 1", weight: 1 },
  { text: "Chapter 2", weight: 2 },
];
const dialog = ref(false)
const newTask = ref("")
const rules = [(v: string) => !!v || "Chapter name is required"]

async function loadVotes() {}
function selectTopic(topic: any) {
  selectedTopic.value = topic;
}
function startTimer() {
  intervalId.value = setInterval(() => {
  time.value -= 1000;
  if (time.value <= 0) {
    stopTimer();
  }
}, 1000);
}
function stopTimer() {
  clearInterval(intervalId.value);
  intervalId.value = 0;
}
function addTask() {
    tasks.push({ text: newTask.value, weight: 1 });
    newTask.value = "";
    dialog.value = false;
}
</script>
  
<style lang="scss">
</style>