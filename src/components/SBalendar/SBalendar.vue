<template>

  <Calendar
    :view="monthly ? 'monthly' : 'weekly'"
    :class="monthly ? 'monthly-calendar' : 'weekly-calendar'"
    is-dark
    :first-day-of-week="2"
    @update:pages="($event: any) => changePage($event)"
  >
    <template v-slot:day-content="{ day, attributes}">
      <DayViewMonthly
        v-if="monthly"
        v-model="open"
        :date="(day.date as Date)"
        :dayId="day.id"
        :events="events[day.id]"
        :deadlines="deadlines[day.id]"
      />
      <DayViewWeekly
        v-else
        v-model="open"
        :date="(day.date as Date)"
        :dayId="day.id"
        :events="events[day.id]"
        :deadlines="deadlines[day.id]"
      />
    </template>
  </Calendar>
  <v-switch v-model="monthly" :label="monthly ? 'Monthly' : 'Weekly'"></v-switch>
</template>

<script setup lang="ts">
import 'v-calendar/style.css';
import { Calendar } from 'v-calendar';
import { onMounted, ref } from 'vue';
import DayViewWeekly from './DayViewWeekly.vue';
import DayViewMonthly from './DayViewMonthly.vue';
import type { Event, Deadline } from '@/types';
import { useStateStore } from "@/stores/state";
const state = useStateStore();

const open = ref('')
const events = ref<{ [key: string]: Event[] }>({});
const deadlines = ref<{ [key: string]: Deadline[] }>({});

const monthly = ref(true);

function scrollToTime() {
  document.querySelector(".vc-week")?.scrollTo({top:  8*60 });
}
onMounted(() => scrollToTime());
function changePage(e: any) {
  const days: string[] = e[0].viewDays.map((d: any) => d.id);
  events.value = state.getEvents(days);
  deadlines.value = state.getDeadlines(days);

  setTimeout(() => scrollToTime(), 220);
}

</script>