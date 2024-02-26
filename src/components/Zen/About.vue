<template>
  <v-card>
    <v-card-title>
      <div class="title">
        <img src="/images/logo.png" alt="logo" class="logo" />
        <h1>StudyBuddy<span class="bg-primary beta">BETA</span></h1>
      </div>
    </v-card-title>
    <v-card-text>
      <div class="card-body">
        <h3>About</h3>
        <p>Version: {{ appVersion }}</p>
        <div class="btn-wrapper">
          <v-btn href="https://forms.gle/CtL93R1QLZswFWGK9" target="_blank" color="primary" class="btn">Send feedback
            <v-icon class="btn-icon" icon="mdi-arrow-top-right" /></v-btn>
        </div>
        <div class="btn-wrapper">
          <v-btn href="https://arc.net/e/1B44629B-4AA6-467A-8AC1-CAC7FCC871EA" target="_blank" color="primary"
            variant="outlined" class="btn">What's New <v-icon class="btn-icon" icon="mdi-arrow-top-right" /></v-btn>
        </div>
        <div class="btn-wrapper">
          <v-btn href="https://studybuddy.it/" target="_blank" color="primary" class="btn" variant="outlined">About
            StudyBuddy <v-icon class="btn-icon" icon="mdi-arrow-top-right" /></v-btn>
        </div>
        <h3>Follow us</h3>
        <div class="social">
          <v-btn href="https://www.instagram.com/studybuddy.ita/" target="_blank" variant="tonal" color="primary"
            icon="fa:fa-instagram" />
          <v-btn href="https://t.me/stubud" target="_blank" variant="tonal" color="primary" icon="fa:fa-telegram" />
          <v-btn href="https://www.linkedin.com/company/studybuddio/about/" target="_blank" variant="tonal"
            color="primary" icon="fa:fa-linkedin" />
          <v-btn href="https://github.com/studybuddydev" target="_blank" variant="tonal" color="primary"
            icon="fa:fa-github" />
        </div>
        <p class="text-medium-emphasis text-foot">Developed with ❤️ by the StudyBuddy Team</p>

      </div>

    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn @click="emits('close')">Close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
const appVersion = APP_VERSION;

const emits = defineEmits<{
  (e: 'close'): void
}>()
console.log(import.meta.env.VITE_ENV)
</script>
<style scoped lang="scss">
.title {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1em;

  .beta {
    border-radius: 0.5rem;
    padding: 0.5rem;
    margin-left: 0.5rem;
    font-size: 2rem;
  }

  h1 {
    margin-left: 0.2em;
    font-size: 2rem;
  }

  img {
    width: 3em;
    height: 3em;
  }

  @media screen and (max-width: 450px) {
    h1 {
      margin-left: 0.2em;
      font-size: 1.5rem;
    }
    img {
      width: 2em;
      height: 2em;
    }
    .beta {
      border-radius: 0.5rem;
      padding: 0.5rem;
      margin-left: 0.5rem;
      font-size: 1.5rem;
    }
  }
}

h3 {
  text-align: center;
  margin-top: 1.2em;
  margin-bottom: 0.3em;
  font-size: 1.4em;
}

p {
  padding: 0.2em 0.4em;
  text-align: center;
}

.social {
  display: flex;
  justify-content: center;

  >* {
    margin: 0.4em;
  }
}

.card-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;

  .btn-wrapper {
    width: 100%;
    padding: 0 4em;

    @media screen and (max-width: 450px) {
      padding: 0;
    }

    .btn {
      margin: 0.4em;
      position: relative;
      width: 100%;

      .btn-icon {
        position: absolute;
        right: 1em;
      }
    }
  }
}

.text-foot {
  font-size: 0.8em;
  margin-top: 2.3em;
  text-align: center;
}
</style>
