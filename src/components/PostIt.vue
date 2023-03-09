
<template>
  <v-card class="postit">
    <div :class="`postit-header ${ focus || selectingColor ? 'focus' : '' }`" :style="{ backgroundColor: postit.color }">
      <div v-if="focus || selectingColor">
        <div class="bar" v-if="!selectingColor">
          <v-icon color="white" size="2rem" @click="addPostIt()">mdi-plus</v-icon>
          <v-divider />
          <v-icon color="white" size="2rem" @click="selectingColor = true">mdi-palette</v-icon>
          <v-icon color="white" size="2rem" @click="deletePostIt()" >mdi-close</v-icon>
        </div>
        <div class="color-list" v-else>
          <div
            v-for="color in colors" :key="color"
            :style="{ backgroundColor: color }"
            @click="selectColor(color)" >
              <v-icon v-if="postit.color === color" color="white">mdi-check</v-icon>
            </div>
        </div>
      </div>
    </div>
    <QuillEditor
      theme="snow" :toolbar="`#my-toolbar-${index}`"
      v-model:content="postit.content"
      contentType="html"
      @focus="focus = true"
      @blur="focus = false"
      @textChange="save()"

      />
      <div :id="`my-toolbar-${index}`" v-show="focus || selectingColor">
        <button class="ql-bold"></button>
        <button class="ql-italic"></button>
        <button class="ql-underline"></button>
        <button class="ql-strike"></button>
      </div>
  </v-card>
</template>
  

<script setup lang="ts">
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import '@vueup/vue-quill/dist/vue-quill.bubble.css';
import { ref } from 'vue';
import type { PostIt } from '@/types';

const emits = defineEmits(['add', 'delete', 'save'])

const props = defineProps<{
  postit: PostIt,
  index: number
}>();

const focus = ref(false);
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

function selectColor(color: string) {
  props.postit.color = color;
  selectingColor.value = false;
  focus.value = true;
  save();
}

function deletePostIt() {
  emits('delete', props.index)
}

function save() {
  emits('save', props.postit)
}

function addPostIt() {
  emits('add')
}
</script>

<style scoped lang="scss">
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
