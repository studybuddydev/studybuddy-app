<template>
  <div class="about-wrapper">
    <v-dialog width="450" v-model="aboutOpen">
      <template v-slot:activator="{ props: activatorProps }">

        <div class="sb-title blur" v-bind="activatorProps">
          <img src="/images/logo.png" alt="logo" class="logo" />
          <h3 class="text-primary" v-if="showTitle">StudyBuddy
            <span class="bg-primary beta">BETA</span>
          </h3>
        </div>

      </template>
      <v-card class="about">
        <v-card-title>
          <div class="title">
            <img src="/images/logo.png" alt="logo" class="logo-about" />
            <h1>StudyBuddy<span class="bg-primary beta">BETA</span></h1>
          </div>
        </v-card-title>
        <v-card-text>
          <div class="card-body">
            <h3>About</h3>
            <p>Version: {{ appVersion }} ({{ env }})</p>
            <p>Release date: {{ releaseDate }}</p>
            <div class="btn-wrapper">
              <v-btn href="https://forms.gle/CtL93R1QLZswFWGK9" target="_blank" color="primary" class="btn">Send
                feedback
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
          <v-btn @click="aboutOpen = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <div class="btn-install blur" v-ripple @click="installApp()" v-if="!runningAsPWA">
      <v-icon icon="mdi-cloud-arrow-down-outline" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import axios from 'axios'
import { ref } from 'vue';

const aboutOpen = ref(false);
const appVersion = APP_VERSION;
const env = import.meta.env.VITE_ENV
const releaseDate = ref('');

defineProps<{
  showTitle: boolean;
}>();

const runningAsPWA = window.matchMedia('(display-mode: standalone)').matches;

let deferredPrompt: Event | null = null;
window.addEventListener('beforeinstallprompt', (e) => { deferredPrompt = e; });
async function installApp() {
  if (deferredPrompt !== null) {
    // @ts-ignore
    deferredPrompt.prompt();
    // @ts-ignore
    const { outcome } = await deferredPrompt.userChoice;
    console.log(outcome)
    if (outcome === 'accepted') {
      deferredPrompt = null;
    }
  }
}


if (env !== 'local') {
  (async () => {
    try {
      const res = await axios.get(`https://api.github.com/repos/studybuddydev/studybuddy-app/branches/${env}`);
      const date = res.data?.commit?.commit?.committer?.date as string;
      if (date) {
        releaseDate.value = new Date(date).toLocaleDateString();
        return;
      }
    } catch (error) {
    }
    releaseDate.value = 'NA';
  })();
}

</script>
<style scoped lang="scss">
.about-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  .btn-install {
    height: 3rem;
    width: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 1rem;
    background-color: rgba(var(--v-theme-background), 0.7);
    cursor: pointer;

    &:hover {
      background-color: rgba(var(--v-theme-background), 0.4);
    }
  }
}

.sb-title {
  display: flex;
  align-items: center;
  border-radius: 1rem;
  padding: 0.5rem;
  height: 3rem;
  text-decoration: none;
  cursor: pointer;

  @media (max-width: 450px) {
    h3 {
      display: none;
    }
  }

  h3 {
    margin: 0 0.2em;
  }

  .logo {
    height: 2.5rem;
  }

  .beta {
    border-radius: 0.5rem;
    padding: 0.2em;
  }

  &:hover {
    background-color: rgba(var(--v-theme-background), 0.4);
  }
}

.about {
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

    .logo-about {
      width: 3em;
      height: 3em;
    }

    @media screen and (max-width: 450px) {
      h1 {
        margin-left: 0.2em;
        font-size: 1.5rem;
      }

      .logo-about {
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
}
</style>
