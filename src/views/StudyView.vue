<template>
  <v-container class= "" v-if="isPro">
    <h1>{{ element.name }}</h1>
    <!-- <SBalendar v-if="pageType === EStudyView.Dashboard" /> -->

    <div class="content"  >
      <ToDo class="todo" :element="element" ref="todoRef" />
      <PostIt class="note" :element="element" ref="postitRef" />
      <Links class="link" :element="element" ref="linkRef" />

      <div class="content_card" v-if="pageType === EStudyView.Dashboard">
      <v-card class="custom-card" max-width="400">
        <v-card-text>
          Buono studio! qui sotto è appena partito il timer, rappresentato da un serpente verde, quando ti fermi premi il tasto pausa
        </v-card-text>
      </v-card>
    </div>
  

    </div>


  </v-container>




  <!-- this is if we wantt the not pro version
    <v-container fill-height v-else class="custom-container">
    <div class="header">
      <h1>{{ element.name }}</h1>
    </div>
    <div class="content">
      <v-card class="custom-card" max-width="400">
        <v-card-text>
          Buono studio! qui sotto è appena partito il timer, rappresentato da un serpente verde, quando ti fermi premi il tasto pausa
        </v-card-text>
      </v-card>
    </div>
    <div class="footer" location="end">
   
     <v-btn class="add-button" icon="mdi-eye" color="primary" :elevation="12" size="x-large" @click="isPro = true" /> 

    </div>
  </v-container>
  -->


  <Add v-if="pageType != EStudyView.Dashboard" @addLink="linkRef?.openNewLink()" @addPostIt="postitRef?.addPostIt()" @addTodo="todoRef?.showHideTodo($event)"
    :showTodo="!!element?.showTasks" /> 


</template>



<script setup lang="ts">
import { ref, type Ref } from 'vue';
import SBalendar from '@/components/SBalendar/SBalendar.vue'
import Links from '@/components/Links/Links.vue'
import PostIt from '@/components/PostIt/PostIt.vue'
import ToDo from '@/components/ToDo/ToDo.vue'
import Add from '@/components/Add/Add.vue'
import { EStudyView } from '@/types';
import BaseDialog from '@/components/common/BaseDialog.vue'
const baseDialog = ref(true);


import { useRoute } from 'vue-router'
import { useStateStore } from "@/stores/state";
const state = useStateStore();
const route = useRoute()

const pageType = route.meta.type as EStudyView;
const element = ref(state.getStudyElement(route.params.exam as string, route.params.chapter as string));

const linkRef = ref<InstanceType<typeof Links> | null>(null);
const postitRef = ref<InstanceType<typeof PostIt> | null>(null);
const todoRef = ref<InstanceType<typeof ToDo> | null>(null);
const isBlurred = ref(true);
const isPro = ref(true);



</script>

<style scoped lang="scss">
.content {
  display: grid;
  grid-template-columns: 3fr 1fr;
  grid-template-rows: auto auto;

}
.blur-effect {
  filter: blur(90px);
}

.link {
  grid-column: 1 / 3;
}

/* Custom container style */
.custom-container {
  display: flex;
  flex-direction: column;
 
  justify-content: space-between;
  height: 97vh; /* Occupy 100% of viewport height */
  width: 100vw; /* Occupy 100% of viewport width */

}

/* Header style */
.header {
  margin-top: 20px;
  
}

/* Content (Card) style */
.content_card {
  flex-grow: 1;
  /* center */
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 200px;
  text-align: center;

}
.content {
  display: grid;
  grid-template-columns: 3fr 1fr;
  grid-template-rows: auto auto;

}


/* Footer (Button) style */
.footer {
  display: flex;
  justify-content: flex-end; /* Move the footer to the right */
  /* Vertically center the content */
  margin-top: 20px;
}

/* Style for the button */
.custom-button {
  background-color: #007bff;
  color: #fff;
  padding: 10px 20px;
  border: none;
  cursor: pointer;

}

/* Style for the card */
.custom-card {

  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 20px;
  /* a square in the middle*/
  display: flex;
  align-items: center;
  width: 100vw;


}



</style>
