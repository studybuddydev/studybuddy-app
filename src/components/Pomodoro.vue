<template>
    <v-container>
        <v-row class="justify-center">
            <v-col cols="12" md="8">
                <v-card>
                    <v-card-title class="headline">Pomodoro Timer</v-card-title>
                    <v-card-text>
                        <v-time-picker v-model="time" :readonly="true">{{time/1000/60}}</v-time-picker>
                        <v-btn @click="startTimer">Start</v-btn>
                        <v-btn @click="stopTimer">Stop</v-btn>
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
            time: 25 * 60 * 1000,
            
        };
    },
    methods: {
        startTimer() {
            this.intervalId = setInterval(() => {
                this.time -= 1000;
                if (this.time <= 0) {
                    this.stopTimer();
                }
            }, 1000);
        },
        stopTimer() {},
    },
});
</script>
