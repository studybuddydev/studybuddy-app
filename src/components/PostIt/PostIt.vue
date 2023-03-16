
<template>
  <div class="postits">
    <v-card class="postit" v-for="postit, index in postIts">
      <div :class="`postit-header ${ focus == index || selectingColor ? 'focus' : '' }`" :style="{ backgroundColor: postit.color }">
        <div v-if="focus == index || selectingColor">
        <div class="bar" v-if="!selectingColor">
          <v-spacer />
          <v-icon color="white" size="2rem" @click="selectingColor = true">mdi-palette</v-icon>
          <v-icon color="white" size="2rem" @click="deletePostIt(index)" >mdi-close</v-icon>
        </div>
        <div class="color-list" v-else>
          <div
          v-for="color in colors" :key="color"
          :style="{ backgroundColor: color }"
          @click="selectColor(postit, color, index)" >
          <v-icon v-if="postit.color === color" color="white">mdi-check</v-icon>
        </div>
      </div>
      </div>
    </div>
    <QuillEditor
      theme="snow" :toolbar="`#my-toolbar-${index}`"
      v-model:content="postit.content"
      contentType="html"
      @focus="focus = index"
      @blur="(function() { if (focus == index) focus = -1; })"
      @textChange="save()"
      
      />
      <div :id="`my-toolbar-${index}`" v-show="focus || selectingColor">
        <button class="ql-bold"></button>
        <button class="ql-italic"></button>
        <button class="ql-underline"></button>
        <button class="ql-strike"></button>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import '@vueup/vue-quill/dist/vue-quill.bubble.css';
import { computed, ref } from 'vue';
import type { PostIt, WithPostIt } from '@/types';
import { useStateStore } from "@/stores/state";
const state = useStateStore();

defineExpose({
  addPostIt
})

const props = defineProps<{
  element: WithPostIt,
}>();

const postIts = computed(() => props.element.postIts ?? []);

const focus = ref(-1);
const selectingColor = ref(false);

const colors = [
  '#e6b905',
  '#6ed261',
  '#ea86c2',
  '#c78eff',
  '#5ac0e7',
  '#858585',
  '#454545',
]

function selectColor(postit: PostIt, color: string, index: number) {
  postit.color = color;
  selectingColor.value = false;
  focus.value = index;
  save()
}

function addPostIt() {
  if (!props.element.postIts)
    props.element.postIts = [];
  const postIt: PostIt = { color: '#e6b905', content: '' }
  props.element.postIts.push(postIt)
  save()
}


function deletePostIt(index: number) {
  if (!props.element.postIts) return;
  props.element.postIts.splice(index, 1);
  save()
}

function save() {
  state.save()
}

</script>

<style scoped lang="scss">
.postits {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}
.postit {
  width: 300px;
  margin: 10px;

  .postit-header {
    height: 0.5em;
    background-color: #e6b905;
    &.focus {
      height: 2.2em;
    }

    .bar {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      height: 2.2em;
      padding: 0 0.2em;
    }

    .color-list {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      height: 2.2em;
      width: 100%;
      cursor: pointer;

      div {
        flex-grow: 1;
        height: 2.2em;

        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
}



</style>
