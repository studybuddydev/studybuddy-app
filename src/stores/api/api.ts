import { defineStore } from 'pinia'
import { useAuth0 } from "@auth0/auth0-vue";
import config from '@/config/config';

export const useAPIStore = defineStore('api', () => {

  const endpoint = config.api.endpoint;
  
  const { getAccessTokenSilently } = useAuth0();
  async function getOptions() {
    return {
      headers: { Authorization: `Bearer ${await getAccessTokenSilently()}` }
    }
  }

  return { getOptions, endpoint }
})