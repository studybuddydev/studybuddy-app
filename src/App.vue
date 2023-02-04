<template>
    <v-app>
        <v-app-bar app>
            <v-app-bar-nav-icon></v-app-bar-nav-icon>
            <v-toolbar-title>StudyBuddy</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn text>Home</v-btn>
            <v-btn text>About</v-btn>
            <v-btn text>Contact</v-btn>
        </v-app-bar>

        <!-- Navigation drawer  where i can add new item, each item is an exam, the click routes to /exam -->
        <v-navigation-drawer v-model="drawer" app>
            <v-list dense>
                <v-list-item v-for="exam in exams" :key="exam.text" link :to="`/exam`">{{ exam.text }}</v-list-item>
            </v-list>
            
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
            exams: [{ text: "Analisi" }, { text: "Geometria" }, { text: "Diritto Internazionale" }],
            drawer: true,
        };
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