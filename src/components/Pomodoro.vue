<template>
    <v-container>
        <v-row class="justify-center">
            <v-col cols="10" md="4">
                <v-card :style="{backgroundColor: color}" >
                    <v-card-title class="headline">Timer</v-card-title>
                    <v-card-text>
                        <h2>studio : {{ minutes }}:{{ seconds }}</h2>
                    <br>
                        <h2>pausa : {{ pminutes }}:{{ pseconds }}</h2>
                        <br>
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
            color:'#CC5C29',

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
            this.color = "#207178";
        },
        stopTimer() {
            clearInterval(this.interval);
            this.color = "#CC5C29";

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
            this.color = "#8BC4D9";
            clearInterval(this.interval);

            this.pminutes = 0;
            this.pseconds = 0;
            clearInterval(this.pinterval);
        },
    },
});
</script>