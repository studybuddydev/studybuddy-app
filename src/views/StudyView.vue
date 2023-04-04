<template>

  <!--<SBalendar /> -->

  <v-container>
    <h1>{{ element.name }}</h1>
  
    <div class="content">
      <ToDo   class="todo" :element="element" ref="todoRef" />
      <PostIt class="note" :element="element" ref="postitRef" />
      <Links  class="link" :element="element" ref="linkRef" />
    </div>

  </v-container>

  <Add
    @addLink="linkRef?.openNewLink()"
    @addPostIt="postitRef?.addPostIt()"
    @addTodo="todoRef?.showHideTodo($event)"
    :showTodo="!!element?.showTasks"
  />
</template>



<script setup lang="ts">
import { ref, type Ref } from 'vue';
import SBalendar from '@/components/SBalendar/SBalendar.vue'
import Links from '@/components/Links/Links.vue'
import PostIt from '@/components/PostIt/PostIt.vue'
import ToDo from '@/components/ToDo/ToDo.vue'
import Add from '@/components/Add/Add.vue'
import type { StudyElement } from '@/types';

import { useRoute } from 'vue-router'
import { useStateStore } from "@/stores/state";
const state = useStateStore();
const route = useRoute()


function getElement(): StudyElement {
  if (route.params.exam) {
    const exam = state.getExam(route.params.exam as string);
    if (route.params.chapter) {
      const chapter = exam?.chapters.find(c => c.name === route.params.chapter);
      if (chapter) return chapter;
    }
    if (exam) return exam;
  }

  return {
    name: '',
    links: [],
    postIts: [],
    showTasks: false,
    tasks: [],
  };
}

const element = ref(getElement());

const linkRef = ref<InstanceType<typeof Links> | null>(null);
const postitRef = ref<InstanceType<typeof PostIt> | null>(null);
const todoRef = ref<InstanceType<typeof ToDo> | null>(null);

</script>

<style scoped lang="scss">
.content {
  display: grid;
  grid-template-columns: 3fr 1fr;
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
