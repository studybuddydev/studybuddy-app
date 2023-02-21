<template>
    <v-container>
        <!-- MENU  -->
        <v-navigation-drawer permanent  >

            <!--column header  -->
            <template v-slot:prepend>
                <v-list-item>
                    <v-list-item-content>
                        <h1 class="title text-h4 text-primary">StudyBuddy</h1>
                    </v-list-item-content>
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


       <!-- <Pomodoro /> -->
    </v-container>
</template>
  
<script lang="ts">
import { defineComponent } from "vue";
import Pomodoro from "@/components/Timer.vue";
import Postit from "@/components/Postit.vue";

type Task = {
        text: string;
        weight: number;
    };

export default defineComponent({
    name: "StudyView",
    components: {Pomodoro, Postit},
    data: function () {
        return {
            topics: [
                { text: "Topic 1" },
                { text: "Topic 2" },
                // ...
            ],
            selectedTopic: '',
            time: 25 * 60 * 1000,
            intervalId: 0,

            tasks: [
                { text: "Chapter 1", weight: 1 },
                { text: "Chapter 2", weight: 2 },
                // ...
            ] as Task[],
            dialog: false,
            newTask: "",
            rules: [(v: string) => !!v || "Chapter name is required"],

        };
    },

    created: async function () {},
    methods: {
        loadVotes: async function () {},
        selectTopic: function (topic: any) {
            this.selectedTopic = topic;
        },
        startTimer() {
            this.intervalId = setInterval(() => {
                this.time -= 1000;
                if (this.time <= 0) {
                    this.stopTimer();
                }
            }, 1000);
        },
        stopTimer() {
            clearInterval(this.intervalId);
            this.intervalId = 0;
        },
        addTask() {
            this.tasks.push({ text: this.newTask, weight: 1 });
            this.newTask = "";
            this.dialog = false;
        },
    },
    onMounted: async function () {},
});
</script>
  
<style lang="scss">
</style>