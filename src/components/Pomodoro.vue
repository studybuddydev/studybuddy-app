<template>
    <v-container>
        <v-row class="justify-center">
            <v-col cols="12" md="8">
                <v-card :style="{backgroundColor: color}">
                    <v-card-title class="headline">Timer</v-card-title>
                    <v-card-text>
                        <h1>{{ minutes }}:{{ seconds }}</h1>
                        <p>Click start to begin the timer</p>
                        <v-btn @click="startTimer">Start</v-btn>
                        <v-btn @click="stopTimer">Pause</v-btn>
                        <v-btn @click="reset">Reset</v-btn>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>
  

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "PomoTimer",
    data: function () {
        return {
            minutes: 0,
            seconds: 0,
            interval: 0,
            color: "blue",
        };
    },
    methods: {
        startTimer() {
            //start timer
            this.interval = setInterval(() => {
                if (this.seconds === 59) {
                    this.seconds = 0;
                    this.minutes += 1;
                } else {
                    this.seconds += 1;
                }
            }, 1000);
            //change background color
            this.color = "green";
        },
        stopTimer() {
            clearInterval(this.interval);
            this.color = "red";
        },
        reset() {
            this.minutes = 0;
            this.seconds = 0;
        },
    },
});
</script>
