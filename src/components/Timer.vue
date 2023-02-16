
<template>
    <v-container>


    </v-container>

    <div class="bottom-bar">
        <div class="bottom-bar-buttons">
            <v-btn @click="startTimer">{{ minutes }}:{{ seconds }} Studio</v-btn>
            <v-btn @click="stopTimer">{{ pminutes }}:{{pseconds}} Pausa</v-btn>
            <v-btn @click="reset">Reset</v-btn>
        </div>
    </div>
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
            color: "#CC5C29",

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

<style>
.bottom-bar {
    position: fixed;
    bottom: 0;
    
    padding: 12px;
    display: flex;
    justify-content: space-between;
}

.bottom-bar-text {
    font-size: 18px;
}

.bottom-bar-buttons button {
    margin-left: 8px;
    font-size: 16px;
    padding: 50px 130px;
    
    border-radius: 4px;
    background-color: #12454a;
    color: white;
    cursor: pointer;
    
}

.bottom-bar-buttons button:hover {
    background-color: #3e8e41;

}
</style>
