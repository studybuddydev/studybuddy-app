<template>
  <div class="day-wrapper" @click="addEvent()">
    <div class="day-box">
      <p :class="todayId === dayId ? 'today day' : 'day'">{{ date.getDate() }}</p>
      <v-card
        @click.stop="() => {}"
        v-for="d in deadlines"
        v-bind=" { ...props }"
        class="calendar-element deadline"
        color="primary"
      ><p>{{ d.name.toUpperCase() }}</p>
      </v-card>
      <v-menu
        :close-on-content-click="false"
        location="end" v-for="e, i in events"
        :model-value="modelValue === `${dayId}-${i}`"
        @update:model-value="updateModelValue($event ? `${dayId}-${i}` : '')">
        <template v-slot:activator="{ props }">
          <v-card
            v-bind=" { ...props }"
            class="calendar-element event"
            :color="e.color ?? 'surface'"
          >
            <p>{{ e.title }}</p>
          </v-card>
        </template>
        <EventForm :event="e" @delete="deleteEvent(e)" />
      </v-menu>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Deadline, Event } from '@/types'
import { computed, onMounted, onUnmounted, watch } from 'vue';
import EventForm from './EventForm.vue';
import { useStateStore } from "@/stores/state";
const state = useStateStore();

const todayId = new Date().toISOString().slice(0, 10);

const props = defineProps<{
  modelValue: string,
  dayId: string,
  date: Date,
  events: Event[]
  deadlines: Deadline[]
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'addEvent', value: { h: number, m: number }): void
  (e: 'deleteEvent', value: Event): void
}>();

function updateModelValue(value: string) {
  emit('update:modelValue', value)
}

function addEvent() {
  emit('addEvent', { h: 8, m: 0 });
}
function deleteEvent(e: Event) {
  emit('deleteEvent', e);
}

</script>
<style lang="scss" scoped>

.day-wrapper {
  width: 8em;
  height: 6em;
  overflow: auto;
  border: 1px solid rgba($color: #FFFFFF, $alpha: 0.5);

  // nice scrollbars
  &::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }
}
.day-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  padding: 5px;
  overflow-y: auto;

  .day {
    background-color: rgba($color: var(--v-theme-surface), $alpha: 0.5);
    border-radius: 50%;
    width: 1.5em;
    height: 1.5em;
    text-align: center;
    line-height: 1.5em;
    &.today {
      background-color: rgba($color: var(--v-theme-primary), $alpha: 0.5);
    }
  }
  .calendar-element {
    width: 100%;
    text-align: center;
    font-size: 0.8em;
    margin: 2px 0;

    &.deadline {
      border: 2px solid white;
      font-weight: bold;
    }
  }
}
</style>
<style lang="scss">
.vc-monthly .is-not-in-month * {
  opacity: 0.5 !important;
}
</style>
