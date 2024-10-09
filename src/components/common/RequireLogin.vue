<template>
  <div v-if="!isAuthenticated" class="wrapper">
    <div class="blur-overlay">
      <slot></slot>
    </div>
    <div class="require-login">
      <div class="require-login-box">

        <p class="text-center"> {{ $t('history.loginMsg') }}</p>
        <v-btn class='btn bg-secondary pomo-btn pomo-box font-press btn-main-start' @click="loginWithRedirect()">
          Login
        </v-btn>
      </div>
    </div>
  </div>
  <div v-else>
    <slot></slot>
  </div>
</template>
<script lang="ts" setup>
import { useAuth0 } from "@auth0/auth0-vue";
const { loginWithRedirect, isAuthenticated } = useAuth0();
</script>

<style scoped lang="scss">
.wrapper {
  position: relative;
}
.require-login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;

  .require-login-box {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background-color: rgba(var(--v-theme-background), 1);
    border-radius: 2rem;
    border: 3px solid rgba(var(--v-theme-primary), 0.6);
    box-shadow: 0 0 10px 0 rgba(var(--v-theme-primary), 0.6);

    .btn {
      width: 10rem;
    }
  }

}

.blur-overlay {
  filter: blur(2px);
  pointer-events: none;
}
</style>
