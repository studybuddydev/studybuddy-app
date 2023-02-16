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
  export default {
    props: {
      title: {
        type: String,
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
      color: {
        type: String,
        default: "yellow",
      },
    },
    data() {
      return {
        editingTitle: false,
        editingText: false,
        editedTitle: "",
        editedText: "",
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
};
</script>

<style scoped>
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
}

.post-it-title {
  font-weight: bold;
  margin-bottom: 16px;
}

.post-it-text {
  text-align: center;
}
</style>

