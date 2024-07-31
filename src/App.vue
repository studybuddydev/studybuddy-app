<template>
  <router-view
    v-if="isAuthenticated"
  ></router-view>
</template>
<script setup lang="ts">
import { useAuth0 } from "@auth0/auth0-vue";
import { useUsersAPIStore } from "@/stores/api/users";
import { useRouter } from 'vue-router'

const { isAuthenticated } = useAuth0();
const router = useRouter()


async function checkOnboarding() {
  const isOnboarded = await useUsersAPIStore().isOnboarded();
  if (!isOnboarded) {
    router.push('/welcome')
  }
}
checkOnboarding();

</script>