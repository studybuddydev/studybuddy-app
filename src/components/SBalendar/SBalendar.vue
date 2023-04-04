<template>
  <Calendar view="weekly" is-dark="system" :first-day-of-week="2">
    <template v-slot:day-content="{ day, attributes}">
      <div class="day-slot">
        
        <div class="grid-structure times" v-if="(day.date as Date).getDay() === 1">
          <p class="text-center title" style="color: transparent">Time</p>
          <div class="grid">
            <div v-for="t in timeSlots" class="time"><p>{{ t }}</p></div>
          </div>
        </div>
        
        <div class="grid-structure timeslots">
          <p class="text-center title day-number">{{ (day.date as Date).getDate() }}</p>
          <div class="grid borders">
            <div v-for="t in timeSlots" class="timeslot borders">
              <div></div>
              <div></div>
            </div>
          </div>
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
import { onMounted } from 'vue';

onMounted(() => {
  const calendar = document.querySelector(".vc-week");
  if (calendar) calendar.scrollTop += 8*60;
});


const timeSlots: string[] = []
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 60) {
    timeSlots.push(`${h}:${m < 10 ? '0' : ''}${m}`);
  }
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
