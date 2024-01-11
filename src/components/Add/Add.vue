<template>

  <v-menu location="end" transition="scale-transition">
    <template v-slot:activator="{ props }">
      <v-btn class="add-button" icon="mdi-plus" color="primary" :elevation="4" size="x-large" v-bind="props" />
    </template>

    <v-list class="mx-1">
      <v-list-item
        prepend-icon="mdi-format-list-checks"
        :title="showTodo ? $t('study.hideTodo')  : $t('study.showTodo')"
        @click="emits('addTodo', !showTodo)"
      />
      <v-list-item
        prepend-icon="mdi-link"
        :title="$t('study.addLink')"
        @click="emits('addLink')"
      />
      <v-list-item
        prepend-icon="mdi-note"
        :title="$t('study.addNote')"
        @click="emits('addPostIt')"
      />

    </v-list>
  </v-menu>

</template>


<script setup lang="ts">
const emits = defineEmits(['addLink', 'addPostIt', 'addTodo'])

const props = defineProps<{
  showTodo: boolean,
}>();

</script>

<style scoped lang="scss">
.add-button {
  position: fixed;
  bottom: 5.5rem;
  right: 2rem;
  z-index: 500;
}
</style>
