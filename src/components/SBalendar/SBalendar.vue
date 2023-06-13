<template>

  <Calendar view="weekly" is-dark :first-day-of-week="2" @update:pages="($event: any) => changePage($event)">
    <template v-slot:day-content="{ day, attributes}">
      <DayViewWeekly :date="(day.date as Date)" :day="day" />
    </template>
  </Calendar>
</template>

<script setup lang="ts">
import 'v-calendar/style.css';
import { Calendar } from 'v-calendar';
import { onMounted } from 'vue';
import DayViewWeekly from './DayViewWeekly.vue';

function scrollToTime() {
  document.querySelector(".vc-week")?.scrollTo({top:  8*60 });
}
onMounted(() => scrollToTime());
function changePage(e: any) {
  setTimeout(() => scrollToTime(), 220);
}

</script>