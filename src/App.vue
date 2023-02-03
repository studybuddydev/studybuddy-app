<template>
    <v-app id="inspire">
        <v-app-bar app>
            <v-app-bar-nav-icon></v-app-bar-nav-icon>
            <v-toolbar-title>StudyBuddy</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn text>Home</v-btn>
            <v-btn text>About</v-btn>
            <v-btn text>Contact</v-btn>
        </v-app-bar>

        <div id="app">
           

            <v-navigation-drawer
                color="#09151E"
                permanent
                expand-on-hover
                app>
              <v-divider></v-divider>
              <v-list nav dense>
                  <v-list-item link href="#">
                    <v-list-item-icon> <v-icon color="white" small >mdi-lightbulb</v-icon></v-list-item-icon>
                    <v-list-item-title class="title">Analisi</v-list-item-title>
                  </v-list-item>
              </v-list>
            </v-navigation-drawer>
     
            <v-main class="main">
                <div class="wrapper">
                    <h2>Welcome to</h2>
                    <h1>StudyBuddy!</h1>
                    <h3>!Work in progress!</h3>
                    <p>Soon a place to study</p>
                </div>
            </v-main>
        </div>
    </v-app>
</template>


<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "App",
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