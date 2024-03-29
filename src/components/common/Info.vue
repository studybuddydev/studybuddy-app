
<script lang="ts" setup generic="T extends {}">
import { ref } from 'vue';
import { useDisplay } from 'vuetify'
const { xs } = useDisplay()


const props = defineProps<{
  text: string,
}>()
const open = ref(false);
function openClick() {
  console.log('ciao')
  open.value = true;
  setTimeout(() => open.value = false, 15000);
}
</script>

<template>
  <div class="info-tip">
    <v-tooltip location="top center" origin="auto" no-click-animation v-model="open" >
      <template v-slot:activator="{ props }">
        <v-icon v-bind="props" icon="mdi-information-outline" @click="openClick()"  />
      </template>
      
      <div class="info-box">
        <p>{{ text }}</p>
      </div>
    </v-tooltip>
  </div>
</template>


<style lang="scss" scoped>
.info-box {
  max-width: 300px;
  padding: 0.3rem;
}
</style>
