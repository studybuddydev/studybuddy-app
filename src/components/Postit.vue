
<template>
    <v-card class="post-it" :color="color">
      <v-card-title v-if="editingTitle">
        <v-text-field v-model="title" label="Title" @keyup.enter="finishEditingTitle" />
      </v-card-title>
      <v-card-title v-else class="post-it-title" @dblclick="startEditingTitle">{{ title }}</v-card-title>
      <v-card-text v-if="editingText">
        <v-textarea v-model="text" label="Text" @keyup.enter="finishEditingText" />
      </v-card-text>
      <v-card-text v-else class="post-it-text" @dblclick="startEditingText">{{ text }}</v-card-text>
    </v-card>
</template>
  

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "PomoTimer",
    data: function () {
        return {
            editingTitle: false,
            editingText: false,
            editedTitle: "titolo ",
            editedText: "il testo dei testi ",
            text : 'se clicchi due volte sia il testo che il titolo li puoi modificare, invio per confermare',
            title : 'POSTIT',
            color : 'yellow'

        };
    },
    methods: {
        startEditingTitle() {
            this.editingTitle = true;
            this.editedTitle = this.title;
        },
        finishEditingTitle() {
         this.editingTitle = false;
         // this.title = this.editedTitle;
        },
        startEditingText() {
         this.editingText = true;
         this.editedText = this.text;
        },
        finishEditingText() {
         this.editingText = false;
         //this.text = this.editedText;
        },
        
    },
});
</script>

<style>
.post-it {
  width: 250px;
  height: 250px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 3px 3px 10px #00000080;
  border-radius: 8px;
  font-size: 16px;
  color: #7d8100;
}
</style>
