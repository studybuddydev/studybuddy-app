<template><!--   MENU-->

  <h1>Pianifica il tuo studio beta</h1>
  <!-- <v-date-picker class="custom-calendar" disable-page-swipe is-expanded is-dark v-model="date" /> -->
  <div style="height: 400px;" class="ma-6">
    <Qalendar class="calendar bg-surface" :events="events" />
  </div>



</template>

<script setup lang="ts">
import { ref } from "vue";
import { Qalendar } from "qalendar";

const events = ref([
  {
    title: "Advanced algebra",
    with: "Chandler Bing",
    time: { start: "2023-03-13 12:05", end: "2023-03-13 13:35" },
    color: "yellow",
    isEditable: true,
    id: "753944708f0f",
    description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores assumenda corporis doloremque et expedita molestias necessitatibus quam quas temporibus veritatis. Deserunt excepturi illum nobis perferendis praesentium repudiandae saepe sapiente voluptatem!"
  },
  {
    title: "Ralph on holiday",
    with: "Rachel Greene",
    time: { start: "2023-03-14", end: "2023-03-16" },
    color: "green",
    isEditable: true,
    id: "5602b6f589fc"
  }
])
// const newExamDialogNameRules = [(v: string) => !!v || "Exam name is required"]
// const attributes = ref([ { key: "fisica", highlight: true, dates: [new Date(2023,1,20)], popover: {} } ] as any[]);



</script>

<style lang="scss">
@import "qalendar/dist/style.css";
.calendar {
  .calendar-header__mode-option {
    color: black;
  }
  .event-flyout__row {
    color: black;
  }
}
</style>