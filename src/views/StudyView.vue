<template>
    <v-container>
        <v-row>
            <v-col cols="3">
                <!-- Your small left column content goes here -->
                <v-list dense>
                    <v-list-item
                        v-for="topic in topics"
                        :key="topic.text"
                        @click="selectTopic(topic)"
                        >{{ topic.text }}</v-list-item
                    >
                </v-list>
            </v-col>
            <v-col cols="9">
                <h1>{{ $route.query["name"] }}</h1>

                <h2 v-if="selectedTopic">
                    {{ selectedTopic }}
                </h2>

                <Pomodoro />
            </v-col>
        </v-row>
    </v-container>
</template>
  
<script lang="ts">
import { defineComponent } from "vue";
import Pomodoro from "@/components/Pomodoro.vue";

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
    },
    onMounted: async function () {},
});
</script>
  
<style lang="scss">
</style>