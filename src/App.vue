<template>
  <v-app id="inspire">
    <Menu v-if="windowWidth > 600"></Menu>
    <v-main class="main">
      <div class="main-wrapper">
        <router-view :key="$route.fullPath"></router-view>
      </div>
    </v-main>
    <ZenScreen />

    <v-dialog width="500" v-model="popupFirstLogin" v-if="false && windowWidth > 600 && !isLoading && !isAuthenticated">
      <v-card>
        <v-toolbar dark color="primary">
          <v-toolbar-title>{{ $t("welcomeToSB") }}</v-toolbar-title>
          <v-btn icon dark @click="popupFirstLogin = false"> <v-icon>mdi-close</v-icon> </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <p>{{ $t("loginMsg") }}</p><br />
                <p>{{ $t("doLogin") }}</p>
              </v-col>
            </v-row>
            </v-container>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="flat" color="primary" @click="loginWithRedirect()">Login</v-btn>
          </v-card-actions>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-app>
</template>


<script setup lang="ts">
import Menu from '@/components/Menus/Menu.vue';
import ZenScreen from '@/components/Zen/ZenScreen.vue';
import { ref, onMounted, onUnmounted, watch,computed } from 'vue';
import { useAuth0 } from "@auth0/auth0-vue";
import { usePomodoroStore } from "@/stores/pomodoro";

const pomodoro = usePomodoroStore();
const { loginWithRedirect, isLoading, isAuthenticated } = useAuth0();
const popupFirstLogin = ref(true);

const windowWidth = ref(window.innerWidth);
const updateWidth = () => { windowWidth.value = window.innerWidth; };

onMounted(() => {
  window.addEventListener('resize', updateWidth);
});
onUnmounted(() => {
  window.removeEventListener('resize', updateWidth);
});

watch(computed(() => pomodoro.timeInTitle), (val) => { document.title = val });

</script>

<style lang="scss">
.v-tooltip > .v-overlay__content {
  background-color: rgba(var(--v-theme-primary), 0.7) !important;
  color: rgb(var(--v-theme-on-primary)) !important;
  border-radius: 1rem !important;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}
.small {
  font-size: 0.5em;
}

.primary-thumb .v-slider-thumb__label {
  background-color: rgb(var(--v-theme-primary));
  &::after {
    background-color: rgb(var(--v-theme-primary));
  }
}

.hide {
  display: none !important;
}
::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: var(--lightestgrey); 
  }
  
  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: #888; 
    border-radius: 5px;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: #555; 
  }

html {
  overflow: hidden !important;
}

.btn {
  border-radius: 1rem !important;
}

.font-press {
  font-family: 'Press Start 2P', Arial, Helvetica, sans-serif !important;
}

.font-casio {
  font-family: 'casio', Arial, Helvetica, sans-serif !important;
}

.main {
  height: 100vh;
  overflow: auto;

  .main-wrapper {
    height: 100%;
    position: relative;

    .pomodoro {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
    }

    .pomodoro.mobile {
      height: 3rem;
      bottom: 4rem;
    }

    .pomodoro-controls {
      position: absolute;
      bottom: 10rem;
      // centered
      display: flex;
      justify-content: center;
      align-content: center;
      width: 100%;
      z-index: 1499;

    }

  }
}</style>
