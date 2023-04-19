<template>

  <Calendar view="weekly" is-dark="system" :first-day-of-week="2" @update:pages="($event) => changePage($event)">
    <template v-slot:day-content="{ day, attributes}">
      <div :class="(day.date as Date).getDay() === 1 ? 'day-slot first-day' : 'day-slot'">

        <div  v-if="(day.date as Date).getDate() === new Date().getDate()" >
          <div class="now-ball bg-primary" :style="{ top: `${nowHeight}px` }"  />
          <div class="now-bar bg-primary" :style="{ top: `${nowHeight}px` }" />
        </div>
        
        <div class="grid-structure times" v-if="(day.date as Date).getDay() === 1">
          <p class="text-center title" style="color: transparent">Time</p>
          <div class="grid">
            <div v-for="h in hours" class="time"><p>{{ h }}:00</p></div>
          </div>
        </div>
        
        <div class="grid-structure timeslots">
          <div class="title day-number">
            <p class="text-center">{{ (day.date as Date).getDate() }}</p>
            <v-card class="deadline px-1 ma-1" v-for="d in deadlines[day.id]" color="secondary">
              <p>{{ d.name }}</p>
            </v-card>
          </div>
          <div class="grid borders">
            <div v-for="h in hours" class="timeslot borders">
              <div v-for="m in minutes" @click="clickOnTimeSlot(day.id, h, m)"></div>
            </div>
          </div>
        </div>

        <div class="events">
        
          <v-menu :close-on-content-click="false" location="end" v-for="e, i in events[day.id]" :model-value="open === `${day.id}-${i}`" @update:model-value="$event ? open = `${day.id}-${i}` : open = ''">
            <template v-slot:activator="{ props }">
              <v-card
                v-bind="props" class="pa-2 event" :color="e.color ?? 'surface'"
                :style="{ height: (cellHeight / 60) * e.length + 'px', top: e.start.hour*cellHeight + ((cellHeight / 60) * e.start.minute) + 'px' }"
              >
                <p>{{ e.title }}</p>
                <p class="text-medium-emphasis text-caption">
                  {{ e.start.hour }}:{{ e.start.minute.toString().padStart(2, '0') }} - {{ Math.floor(+e.start.hour + ((+e.start.minute + +e.length) / 60)) }}:{{ ((+e.start.minute + e.length) % 60).toString().padStart(2, '0') }}
                </p>
              </v-card>
            </template>

            <v-card width="450" elevation="10" class="pa-4">
              <form class="pa-4">
                <v-row>
                  <v-col cols="12" class="py-0 px-2"><v-text-field v-model="e.title" label="Nome" /></v-col>
                </v-row>
                <v-row>
                  <v-col cols="3" class="py-0 px-2"><v-text-field v-model="e.start.hour" label="Ore" type="number" min="0" max="23" /></v-col>
                  <v-col cols="3" class="py-0 px-2"><v-text-field v-model="e.start.minute" label="Minuti" type="number" step="15" min="0" max="59" /></v-col>
                  <v-col cols="6" class="py-0 px-2"><v-text-field v-model="e.length" label="Durata [m]" type="number" step="15" min="0" max="1440" /></v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" class="py-0 px-2"><ColorPicker v-model="e.color" /></v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" class="py-0 px-2"><v-textarea  v-model="e.description" label="Note" rows="2" /></v-col>
                </v-row>
              </form>
                
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" variant="flat" @click="deleteEvent(day.id, e)"> <v-icon icon="mdi-delete"/></v-btn>
              </v-card-actions>
            </v-card>

          </v-menu>
        </div>


      </div>
    </template>
  </Calendar>
</template>

<script setup lang="ts">
import 'v-calendar/style.css';
import { Calendar } from 'v-calendar';
import { onMounted, ref, computed } from 'vue';
import { watch } from 'vue';
import ColorPicker from '../Inputs/ColorPicker.vue';
import type { Deadline, Event } from '@/types'
import { useStateStore } from "@/stores/state";
const state = useStateStore();


const nowHeight = computed(() => {
  const now = new Date();
  return now.getHours() * cellHeight + (now.getMinutes() / 60) * cellHeight;
})

const cellHeight = 60;
function scrollToTime() {
  document.querySelector(".vc-week")?.scrollTo({top:  8*60 });
}
onMounted(() => scrollToTime());

// array of numbers from 0 to 24
const hours: number[] = Array.from({ length: 24 }, (_, i) => i);
const minutes: number[] = [ 0, 30 ];

const events = ref<{ [key: string]: Event[] }>({});
const deadlines = ref<{ [key: string]: Deadline[] }>({});
const open = ref('');

function clickOnTimeSlot(dayId: string, h: number, m: number) {
  if (open.value) {
    open.value = '';
    return;
  }
  if (events.value[dayId] === undefined)
    events.value[dayId] = [];
  
  events.value[dayId].push({
    title: "Nuovo event",
    description: "",
    start: {
      hour: h,
      minute: m
    },
    length: 60,
  })

  open.value = `${dayId}-${events.value[dayId].length - 1}`;
}

function deleteEvent(dayId: string, e: Event) {
  events.value[dayId].splice(events.value[dayId].indexOf(e), 1);
  open.value = '';
}

function changePage(e: any) {
  const days: string[] = e[0].viewDays.map((d: any) => d.id);
  events.value = state.getEvents(days);
  deadlines.value = state.getDeadlines(days);

  setTimeout(() => scrollToTime(), 220);
}

watch(events, (e) => {
  state.saveEvents(events.value);
}, { deep: true })

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
      z-index: 100;
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

.now-bar {
  position: absolute;
  width: $cell-width;
  height: 2px;
  z-index: 100;
}

.now-ball {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  z-index: 100;
  transform: translate(-75%, -35%);
}
.first-day {
  .event, .now-bar, .now-ball {
    left: $time-width;
  }
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

.deadline {
  p {
    font-size: 0.8em;
  }
}
</style>
