<template>
  <div class="onboarding-background" :style=" { backgroundImage: `url(${settings.themeSettings?.backgroundImg})` }"></div>
  <div class="onboarding">
    <v-card class="onboarding-card d-flex flex-column" max-width="1200" height="400">
      <v-spacer />

      <v-window v-model="step">

        <v-window-item :value="1">
          <div class="pa-4 text-center">
            <v-img class="mb-4" height="128" src="/images/logo.png" contain></v-img>
            <h3 class="text-h6 font-weight-light mb-2">
              Welcome to StudyBuddy!
            </h3>
            <span class="text-caption text-grey">Thanks for signing up!</span>
          </div>
        </v-window-item>


        <v-window-item :value="2">
          <v-card-title class="text-h6 font-weight-regular justify-space-between">
            <span>What are you</span>
          </v-card-title>
          <v-card-text>
            <v-radio-group>
              <v-radio label="Studente" value="one"></v-radio>
              <v-radio label="Non studente" value="two"></v-radio>
              <v-radio label="Lavoratore" value="three"></v-radio>
            </v-radio-group>
          </v-card-text>
        </v-window-item>

        <v-window-item :value="3">
          <v-card-text>
            <v-text-field label="Password" type="password"></v-text-field>
            <v-text-field label="Confirm Password" type="password"></v-text-field>
            <span class="text-caption text-grey-darken-1">
              Please enter a password for your account
            </span>
          </v-card-text>
        </v-window-item>

      </v-window>

      <v-spacer />

      <v-card-actions class="pa-4">
        <v-btn v-if="step == 1" variant="plain" @click="step--">Skip</v-btn>
        <v-btn v-if="step > 1" variant="text" @click="step--">Back</v-btn>
        <v-spacer></v-spacer>
        <v-btn v-if="step == 1" color="primary" variant="flat" @click="step++">Start</v-btn>
        <v-btn v-if="step == 2" color="primary" variant="flat" @click="step++">Next</v-btn>
        <v-btn v-if="step == 3" color="secondary" variant="flat" @click="step++">Start now!</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useSettingsStore } from "@/stores/settings";
import { useAuth0 } from "@auth0/auth0-vue";

const settings = useSettingsStore();
const { user } = useAuth0();
const step = ref(1);
</script>

<style scoped lang="scss">
.onboarding-background {
  position: fixed;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  z-index: -1;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  filter: blur(20px);
  -webkit-filter: blur(20px);
  opacity: 0.7;
}
.onboarding {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  .onboarding-card {
    width: 500px;
  }
}
</style>
