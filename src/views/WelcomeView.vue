<template>
  <div class="onboarding-background" :style=" { backgroundImage: `url(${settings.themeSettings?.backgroundImg})` }"></div>
  <div class="onboarding">
    <v-card class="mx-auto onboarding-card" max-width="500" height="400">
      <v-card-title class="text-h6 font-weight-regular justify-space-between">
        <span>Ciaone</span>
      </v-card-title>

      <v-window v-model="step">
        <v-window-item :value="1">
          <v-card-text>
            <v-text-field label="Email" placeholder="john@google.com"></v-text-field>
            <span class="text-caption text-grey-darken-1">
              This is the email you will use to login to your Vuetify account
            </span>
          </v-card-text>
        </v-window-item>

        <v-window-item :value="2">
          <v-card-text>
            <v-text-field label="Password" type="password"></v-text-field>
            <v-text-field label="Confirm Password" type="password"></v-text-field>
            <span class="text-caption text-grey-darken-1">
              Please enter a password for your account
            </span>
          </v-card-text>
        </v-window-item>

        <v-window-item :value="3">
          <div class="pa-4 text-center">
            <v-img class="mb-4" height="128" src="https://cdn.vuetifyjs.com/images/logos/v.svg" contain></v-img>
            <h3 class="text-h6 font-weight-light mb-2">
              Welcome to Vuetify
            </h3>
            <span class="text-caption text-grey">Thanks for signing up!</span>
          </div>
        </v-window-item>
      </v-window>

      <v-divider />

      <v-card-actions>
        <v-btn v-if="step > 1" variant="text" @click="step--">
          Back
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn v-if="step < 3" color="primary" variant="flat" @click="step++">
          Next
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useSettingsStore } from "@/stores/settings";

const settings = useSettingsStore();
const step = ref(0);
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
