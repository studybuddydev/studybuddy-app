<template>
    <v-app>
        <v-app-bar app>
            <v-app-bar-nav-icon></v-app-bar-nav-icon>
            <v-toolbar-title>StudyBuddy</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn text to="/">Home</v-btn>
            <v-btn text>Learn</v-btn>
            <v-btn text href="https://studybuddy.it/" target="_blank"
                >Info</v-btn
            >
        </v-app-bar>

        <!-- Navigation drawer  where i can add new item, each item is an exam, the click routes to /exam -->
        <v-navigation-drawer v-model="drawer" v-if="$route.name != 'exam'" app>
            <v-list dense>
                <v-list-item
                    v-for="exam in exams"
                    :key="exam.text"
                    link
                    :to="`/exam?name=${exam.text}`"
                    >{{ exam.text }}</v-list-item
                >
            </v-list>

            <!-- add button to the bottom with width 100% to add new item -->
            <v-dialog v-model="dialog" width="auto">
                <v-sheet width="300" class="mx-auto">
                    <v-form @submit.prevent>
                        <v-text-field
                            v-model="examName"
                            :rules="rules"
                            label="Exam name"
                        ></v-text-field>
                        <v-btn type="submit" @click="addExam" block class="mt-2">Confirm</v-btn>
                    </v-form>
                </v-sheet>
            </v-dialog>
            <v-btn color="primary" width="100%" @click="dialog = true"
                >Add new exam</v-btn
            >
        </v-navigation-drawer>

        <!-- Sizes your content based upon application components -->
        <v-main>
            <!-- Provides the application the proper gutter -->
            <v-container fluid>
                <!-- If using vue-router -->
                <router-view></router-view>
            </v-container>
        </v-main>

        <v-footer app>
            <!-- -->
        </v-footer>
    </v-app>
</template>


<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "App",
    data: function () {
        return {
            exams: [
                { text: "Generale" },
                { text: "Test" },
                { text: "Diritto Internazionale" },
            ],
            drawer: true,
            dialog: false,
            examName: "",
            rules: [(v: string) => !!v || "Exam name is required"],
        };
    },
    methods: {

        addExam() {
            this.exams.push({ text: this.examName });
            this.examName = "";
            this.dialog = false;
        },
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