<template>
    <v-container>
        <v-row class="justify-center">
            <v-col cols="12" md="8">
                <v-card :style="{backgroundColor: color}">
                    <v-card-title class="headline">Timer</v-card-title>
                    <v-card-text>
                        <h1>studio : {{ minutes }}:{{ seconds }}</h1>
                        <p></p>
                        <h1>pausa : {{ pminutes }}:{{ pseconds }}</h1>
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

            pinterval: 0,
            pminutes: 0,
            pseconds: 0,
        };
    },
    methods: {
        startTimer() {
            clearInterval(this.pinterval);
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

            this.pinterval = setInterval(() => {
                if (this.pseconds === 59) {
                    this.pseconds = 0;
                    this.pminutes += 1;
                } else {
                    this.pseconds += 1;
                }
            }, 1000);
        },
        reset() {
            this.minutes = 0;
            this.seconds = 0;
            this.color = "blue";
            clearInterval(this.interval);

            this.pminutes = 0;
            this.pseconds = 0;
            clearInterval(this.pinterval);
        },
    },
});
</script>
