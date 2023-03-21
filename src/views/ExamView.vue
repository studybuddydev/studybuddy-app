<template>
  <v-container v-if="exam">
    
    <div class="content">
      <ToDo   class="todo" :element="exam" ref="todoRef" />
      <PostIt class="note" :element="exam" ref="postitRef" />
      <Links  class="link" :element="exam" ref="linkRef" />
    </div>

  </v-container>

  <Add
    @addLink="linkRef?.openNewLink()"
    @addPostIt="postitRef?.addPostIt()"
    @addTodo="todoRef?.showHideTodo($event)"
    :showTodo="!!exam?.showTasks"
  />


</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router'
import { useStateStore } from "@/stores/state";
import Links from '@/components/Links/Links.vue'
import PostIt from '@/components/PostIt/PostIt.vue'
import ToDo from '@/components/ToDo/ToDo.vue'
import Add from '@/components/Add/Add.vue'

const state = useStateStore();
const route = useRoute()

const exam = ref(state.getExam(route.params.exam as string));


const linkRef = ref<InstanceType<typeof Links> | null>(null);
const postitRef = ref<InstanceType<typeof PostIt> | null>(null);
const todoRef = ref<InstanceType<typeof ToDo> | null>(null);
</script>

<style scoped lang="scss">
.content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;

}
.todo {
}

.link {
  grid-column: 1 / 3;
}

.note {
}
</style>
