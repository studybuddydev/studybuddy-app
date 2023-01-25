<template>

  <v-app id="inspire">
    <!-- <v-navigation-drawer
      model-value
      class="pt-4"
      color="grey-lighten-3"
      rail
    >
      <v-avatar
        v-for="n in 6"
        :key="n"
        :color="`grey-${n === 1 ? 'darken' : 'lighten'}-1`"
        :size="n === 1 ? 36 : 20"
        class="d-block text-center mx-auto mb-9"
      ></v-avatar>
    </v-navigation-drawer> -->

    <v-main class="main">
      <div class="wrapper">
        <h2>Welcome to</h2>
        <h1> StudyBuddy! </h1>
        <p> Soon a place to study </p>
      </div>
    </v-main>
  </v-app>

</template>


<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App'
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
  background-image: url("/background.jpg");
}
.wrapper {
  background-color: #222222C0;
  backdrop-filter: blur(5px);
  padding: 1.5em 4em;
  border-radius: 1em;
  border: 3px solid white;
}
h2, h1, p {
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