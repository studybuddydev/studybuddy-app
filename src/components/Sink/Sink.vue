<template>
  <div class="sink blur">
    <v-text-field v-on:keyup.enter="addItem()" prepend-inner-icon="mdi-faucet" density="compact" label="Remind me"
          class="input-add-sink" variant="plain" hide-details single-line v-model="currentItem" />
    <v-snackbar v-model="snackbar" :timeout="2000" location="top" rounded="pill" color="primary" variant="tonal">Saved for later</v-snackbar>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useSinkStore } from "@/stores/sink";
const sink = useSinkStore();

const currentItem = ref('');
const snackbar = ref(false);

function addItem() {
  sink.add(currentItem.value);
  snackbar.value = true;
  currentItem.value = '';
}
</script>

<style scoped lang="scss">
.sink {
  border-radius: 1rem 0 0 1rem;
  opacity: 0.4;
  transition: opacity 0.3s, width 0.3s, background-color 0.3s;
  display: flex;
  width: 15rem;
  width: 1rem;
  position: relative;
  background-color: rgba(var(--v-theme-accent), 0.9) !important;
  
  &:hover {
    background-color: rgba(var(--v-theme-surface), 0.9) !important;
    opacity: 1;
    width: 15rem;
  }
  .input-add-sink {
    margin-left: 1rem;
    padding-bottom: 8px;
  }
  .saved-popup {
    position: absolute;
    top: -1rem;
    right: 0;
    height: 1rem;
    color: white;
    padding: 0.5rem;
    border-radius: 0 0 0 1rem;
    // display: none;
  }

}

</style>