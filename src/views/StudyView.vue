<template>
    <v-container>
        <v-navigation-drawer permanent >
            <template v-slot:prepend>
                <!--add logo img -->
                <v-list-item>
                    <v-list-item-content>
                        <v-list-item-title class="title">
                            <a href="/">
                                <img
                                    src="/images/logotxt.png"
                                    alt="Studubuddy logo"
                                    height="50"
                                />
                            </a>
                            
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </template>

            <v-divider></v-divider>

            <v-list nav density="compact">
                <v-list-item
                    v-for="task in tasks"
                    link
                    :key="task.text"
                    :title="task.text"
                    :value="task.text"
                />


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

            <template v-slot:append>
                <v-list-item
                    lines="two"
                    prepend-avatar="/images/pippo.webp"
                    title="Pippo"
                    subtitle="Logged in"
                ></v-list-item>
            </template>
        </v-navigation-drawer>

            
        <h1>{{ $route.query["name"] }}</h1>

        <h2 v-if="selectedTopic">
            {{ selectedTopic }}
        </h2>

        <Pomodoro />
    

    </v-container>
</template>
  
<script lang="ts">
import { defineComponent } from "vue";
import Pomodoro from "@/components/Pomodoro.vue";

type Task = {
        text: string;
        weight: number;
    };

export default defineComponent({
    name: "StudyView",
    components: {Pomodoro},
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
            rules: [(v: string) => !!v || "Task name is required"],

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