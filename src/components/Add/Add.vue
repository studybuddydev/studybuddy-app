<template>

  <v-menu location="end" transition="scale-transition">
    <template v-slot:activator="{ props }">
      <v-btn class="add-button" icon="mdi-plus" color="primary" :elevation="12" size="x-large" v-bind="props" />
    </template>

    <v-list class="mx-1">
      <v-list-item
        prepend-icon="mdi-format-list-checks"
        :title="showTodo ? $t('item.hidetodo')  : $t('item.showtodo')"
        @click="emits('addTodo', !showTodo)"
      />
      <v-list-item
        prepend-icon="mdi-link"
        :title="$t('item.link')"
        @click="emits('addLink')"
      />
      <v-list-item
        prepend-icon="mdi-note"
        :title="$t('item.postit')"
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
  bottom: 40px;
  right: 20px;
  z-index: 500;
}
</style>
