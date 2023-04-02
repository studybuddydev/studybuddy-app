<template>
  <Calendar view="weekly" is-dark="system" :first-day-of-week="2">
    <template v-slot:day-content="{ day, attributes}">
      {{ (day.date as Date).getDay() }}
    </template>
  </Calendar>
</template>

<script setup lang="ts">
import 'v-calendar/style.css';
import { Calendar } from 'v-calendar';

</script>
