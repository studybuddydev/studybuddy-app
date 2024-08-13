<template>
  <router-view
    v-if="!isLoading"
  ></router-view>
</template>
<script setup lang="ts">
import { useAuth0 } from "@auth0/auth0-vue";
import { useUsersAPIStore } from "@/stores/api";
import { useRouter } from 'vue-router'
import { watch } from 'vue';

const { isLoading, isAuthenticated } = useAuth0();
const router = useRouter()


async function checkOnboarding() {
  const isOnboarded = await useUsersAPIStore().isOnboarded();
  if (!isOnboarded) {
    router.push('/welcome')
  }
}

watch(isLoading, (newIsLoading) => {
  if (!newIsLoading && isAuthenticated.value) {
    checkOnboarding()
  }
})

</script>