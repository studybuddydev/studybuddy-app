<template>
    <div>
        <h2>User Profile</h2>
        <button v-if="!isAuthenticated" @click="login">Log in</button>
        <pre v-if="isAuthenticated">
        <code>{{ user }}</code>
    </pre>
        <h1>{{ user }}</h1>
    </div>
</template>
<script>
import { useAuth0 } from "@auth0/auth0-vue";

export default {
    setup() {
        const { loginWithRedirect, user, isAuthenticated } = useAuth0();

        return {
            login: () => {
                loginWithRedirect();
            },
            user,
            isAuthenticated,
        };
    },
};
</script>