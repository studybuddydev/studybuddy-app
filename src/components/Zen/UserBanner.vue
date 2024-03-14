<template>
  <div class="user-banner blur" v-if="!isLoading"
    @click="!isAuthenticated ? loginWithRedirect() : emit('openSettingsTab', 'general')">
    <p class="logged-user" v-if="offline">
      <v-icon v-ripple size="x-large" class="icon" icon="mdi-wifi-off" color="warning" />
      <span class="text">Offline</span>
    </p>
    <p v-else-if="isAuthenticated" class="logged-user">
      <span class="text">{{ user?.given_name ?? user?.nickname }}</span>
      <span><v-avatar size="2rem" :image="user?.picture" /></span>
    </p>
    <p class="login-button" v-else>
      <v-icon v-ripple size="x-large" class="icon" icon="mdi-account" />
      <span class="text">Login</span>
    </p>
  </div>
</template>

<script lang="ts" setup>
import { useAuth0 } from "@auth0/auth0-vue";
import { onMounted, onUnmounted, ref } from 'vue';

const emit = defineEmits<{
  (e: 'openSettingsTab', value: string): void
}>();

const { loginWithRedirect, user, isAuthenticated, isLoading } = useAuth0();
const offline = ref(!navigator.onLine);
const setOffline = () => offline.value = !navigator.onLine;

onMounted(() => {
  window.addEventListener('online', () => setOffline);
  window.addEventListener('offline', () => setOffline);

});
onUnmounted(() => {
  window.removeEventListener('online', () => setOffline);
  window.removeEventListener('offline', () => setOffline);
});
</script>

<style scoped lang="scss">
.user-banner {
  display: flex;
  align-items: center;
  justify-items: center;
  padding: 0.5em;
  border-radius: 1em;
  transition: background-color 0.1s ease-in-out;
  height: 3rem;
  overflow: hidden;
  font-family: 'Press Start 2P', Arial, Helvetica, sans-serif;

  .icon {
    display: none;
  }

  @media (max-width: 600px) {
    .text {
      display: none;
    }

    .icon {
      display: block;
    }
  }

  &:hover {
    background-color: #FFF4;
    cursor: pointer;
  }

  .login-button {
    padding: 0 1rem;
  }

  .logged-user {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;

    span {
      padding: 0 0.5rem;
    }
  }
}

</style>