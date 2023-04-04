<template>
  <Calendar view="weekly" is-dark="system" :first-day-of-week="2">
    <template v-slot:day-content="{ day, attributes}">
      <div :class="(day.date as Date).getDay() === 1 ? 'day-slot first-day' : 'day-slot'">
        
        <div class="grid-structure times" v-if="(day.date as Date).getDay() === 1">
          <p class="text-center title" style="color: transparent">Time</p>
          <div class="grid">
            <div v-for="h in hours" class="time"><p>{{ h }}:00</p></div>
          </div>
        </div>
        
        <div class="grid-structure timeslots">
          <p class="text-center title day-number">{{ (day.date as Date).getDate() }}</p>
          <div class="grid borders">
            <div v-for="h in hours" class="timeslot borders">
              <div v-for="m in minutes" @click="clickOnTimeSlot((day.date as Date).getDay(), h,m)"></div>
            </div>
          </div>
        </div>

        <div class="events">
          <v-menu :close-on-content-click="false" location="end" v-for="e in events[(day.date as Date).getDay()]">
            <template v-slot:activator="{ props }">
              <v-card
                v-bind="props" class="pa-2 event"
                :style="{ height: (cellHeight / 60) * e.length + 'px', top: e.start.hour*cellHeight + ((cellHeight / 60) * e.start.minute) + 'px' }"
              >
                <p>{{ e.title }}</p>
              </v-card>
            </template>

            <v-card class="pa-2" min-width="300">
              <v-text-field v-model="e.title" label="Nome" />
              <v-text-field v-model="e.start.hour" label="Ore" type="number" />
              <v-text-field v-model="e.start.minute" label="Minuti" type="number" />
              <v-text-field v-model="e.length" label="Durata [m]" type="number" />
            </v-card>

          </v-menu>


        </div>
      </div>
      <!-- <v-card
        v-for="t in timeSlots"
        width="200" class="mx-2 my-1"
        :title="t"
        subtitle="No events" /> -->
    </template>
  </Calendar>
</template>

<script setup lang="ts">
import 'v-calendar/style.css';
import { Calendar } from 'v-calendar';
import { onMounted, ref } from 'vue';

const cellHeight = 60;
const fav = true;
const menu = false;
const message = false;
const hints = true;


type Event = {
  title: string;
  start: {
    hour: number;
    minute: number;
  },
  length: number;
}

onMounted(() => {
  const calendar = document.querySelector(".vc-week");
  if (calendar) calendar.scrollTop += 8*60;
});


// array of numbers from 0 to 24
const hours: number[] = Array.from({ length: 24 }, (_, i) => i);
const minutes: number[] = [ 0, 30 ];

const events = ref<Event[][]>([
  [], [], [], [], [], [], []
]);

function clickOnTimeSlot(day: number, h: number, m: number) {
  events.value[day].push({
    title: "New event",
    start: {
      hour: h,
      minute: m
    },
    length: 60
  })
}

</script>
<style lang="scss" scoped>
$cell-width: 10vw;
$cell-height: 60px;
$time-width: 35px;
.day {
  margin-left: 30px;
}
.day-slot {
  display: flex;
  flex-direction: row;

  .grid-structure {
    display: flex;
    flex-direction: column;
    .grid {
      &.borders {
        border-left: 1px solid #FFFFFFAA;
        border-right: 1px solid #FFFFFFAA;
      }
      > div {
        height: $cell-height;
        &.borders {
          border-bottom: 1px solid #FFFFFF80;
          > div:first-child {
            border-bottom: 1px solid #FFFFFF30;
          }
        }
      }
    }
  }
  .times {
    width: $time-width;
    .time {
      p {
        transform: translateY(-50%);
        text-align: right;
        padding-right: 0.4em;
        color: #FFFFFFAA;
        font-size: 0.8em;
      }
    }
  }
  .timeslots {
    width: $cell-width;
    .timeslot {
      display: flex;
      flex-direction: column;
      > div {
        width: $cell-width;
        height: calc($cell-height / 2);
      }
    }

    .day-number {
      position: fixed;
      width: $cell-width;
    }
  }
}
.event {
  position: absolute;
  height: $cell-height;
  width: calc($cell-width - 0.5em);
  padding: 0;
  margin: 0;
  top: 0;
  left: 0;
}
.first-day .event {
  left: $time-width;
}
</style>
<style lang="scss">
$cell-width: 10vw;
$time-width: 35px;
.vc-week, .vc-weekdays {
  grid-template-columns: calc($cell-width + $time-width)  repeat(6, $cell-width);
  .vc-weekday-2 {
    margin-left: $time-width;
  }
}

.vc-week {
  height: 600px;
  overflow-x: hidden;
}
</style>
