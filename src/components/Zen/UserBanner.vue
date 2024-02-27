<template>
  <div class="user-banner blur" v-if="!isLoading"
    @click="!isAuthenticated ? loginWithRedirect() : emit('openSettingsTab', 'general')">
    <p class="logged-user" v-if="offline">
      <v-icon v-ripple size="x-large" class="icon" icon="mdi-wifi-off" color="warning" />
      <span class="text">Offline</span>
    </p>
    <p v-else-if="isAuthenticated" class="logged-user">
      <span class="text">{{ user?.given_name ?? user?.nickname }}</span>
      <span><v-avatar :image="user?.picture" /></span>
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
  height: 5rem;
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

.user-banner:after {
  content: '';
  top: 0;
  transform: translateX(100%);
  width: 100%;
  height: 5rem;
  position: absolute;
  z-index: 1;
  animation: slide 1.2s;
  /* 
  CSS Gradient - complete browser support from http://www.colorzilla.com/gradient-editor/ 
  */
  background: -moz-linear-gradient(left, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 50%, rgba(128, 186, 232, 0) 99%, rgba(125, 185, 232, 0) 100%);
  /* FF3.6+ */
  background: -webkit-gradient(linear, left top, right top, color-stop(0%, rgba(255, 255, 255, 0)), color-stop(50%, rgba(255, 255, 255, 0.8)), color-stop(99%, rgba(128, 186, 232, 0)), color-stop(100%, rgba(125, 185, 232, 0)));
  /* Chrome,Safari4+ */
  background: -webkit-linear-gradient(left, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 50%, rgba(128, 186, 232, 0) 99%, rgba(125, 185, 232, 0) 100%);
  /* Chrome10+,Safari5.1+ */
  background: -o-linear-gradient(left, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 50%, rgba(128, 186, 232, 0) 99%, rgba(125, 185, 232, 0) 100%);
  /* Opera 11.10+ */
  background: -ms-linear-gradient(left, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 50%, rgba(128, 186, 232, 0) 99%, rgba(125, 185, 232, 0) 100%);
  /* IE10+ */
  background: linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 50%, rgba(128, 186, 232, 0) 99%, rgba(125, 185, 232, 0) 100%);
  /* W3C */
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#00ffffff', endColorstr='#007db9e8', GradientType=1);
  /* IE6-9 */
}

@keyframes slide {
  0% {
    transform: translateX(-100%);
  }

  50% {
    transform: translateX(100%);
  }

  100% {
    transform: translateX(-100%);
  }
}
</style>