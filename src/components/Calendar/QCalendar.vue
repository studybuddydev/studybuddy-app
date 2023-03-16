<template>
  <Qalendar
    class="calendar bg-surface"
    :config="config"
    :events="events"
    :key="componentKey"
    @day-was-clicked="dayClick($event)"
    @interval-was-clicked="intervalClick($event)"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Qalendar } from "qalendar";
import type { eventInterface as Event } from "qalendar/dist/src/typings/interfaces/event.interface";
import type { configInterface as Config } from "qalendar/dist/src/typings/config.interface";
import type { interval as Interval } from "qalendar/dist/src/helpers/DayIntervals";
import { v4 as uuid } from 'uuid';

const componentKey = ref(0);

function forceRerender(){
  componentKey.value += 1;
}

const config: Config = {
  dayIntervals: {
    length: 30,
    height: 50,
    displayClickableInterval: true
  }
}

const events = ref<Event[]>([{
  title: "Advanced algebra",
  with: "Chandler Bing",
  time: { start: "2023-03-13 12:05", end: "2023-03-13 13:35" },
  color: "yellow",
  isEditable: true,
  id: "753944708f0f",
  description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores assumenda corporis doloremque et expedita molestias necessitatibus quam quas temporibus veritatis. Deserunt excepturi illum nobis perferendis praesentium repudiandae saepe sapiente voluptatem!"
}, {
  title: "Ralph on holiday",
  with: "Rachel Greene",
  time: { start: "2023-03-14", end: "2023-03-16" },
  color: "green",
  isEditable: true,
  id: "5602b6f589fc"
}])

function dayClick(day: string) {
  console.log("Day", day);
}

function intervalClick(interval: Interval) {
  console.log("Interval", interval);

  const start = interval.intervalStart
  const end = interval.intervalEnd
  const id = uuid();

  events.value.push({
    title: "New event",
    with: "Chandler Bing",
    time: { start: start, end: end },
    color: "yellow",
    isEditable: true,
    id: id,
    description: "nuovo ventooo!"
  })

  forceRerender()
}

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