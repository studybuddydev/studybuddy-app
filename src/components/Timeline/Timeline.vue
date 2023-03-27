<template>
  <div>
    <h2>Le tue prossime deadline</h2>
    <v-timeline align="start" side="end" class="h-auto">
      <v-timeline-item
        v-for="(event, i) in events" :key="i"
        :dot-color="event.color"
        size="small"
        >
        <template v-slot:opposite>
          <div :class="`pt-1 headline font-weight-bold text-${event.color}`" v-text="toDateSting(event.date)"></div>
        </template>
        <div>
          <h2 :class="`mt-n1 headline font-weight-light mb-4 text-${event.color}`">Lorem ipsum</h2>
          <div>{{ event.text }}</div>
        </div>
      </v-timeline-item>
    </v-timeline>
  </div>
</template>

<script setup lang="ts">
const events = [
  {
    color: 'cyan',
    date: new Date(),
    text: 'Lorem ipsum dolor sit amet, no nam oblique veritus. Commune scaevola imperdiet nec ut, sed euismod convenire principes at. Est et nobis iisque percipit, an vim zril disputando voluptatibus, vix an salutandi sententiae.',
  },
  {
    color: 'green',
    date: new Date(),
    text: 'Lorem ipsum dolor sit amet, no nam oblique veritus. Commune scaevola imperdiet nec ut, sed euismod convenire principes at. Est et nobis iisque percipit, an vim zril disputando voluptatibus, vix an salutandi sententiae.',
  },
  {
    color: 'pink',
    date: new Date(),
    text: 'Lorem ipsum dolor sit amet, no nam oblique veritus. Commune scaevola imperdiet nec ut, sed euismod convenire principes at. Est et nobis iisque percipit, an vim zril disputando voluptatibus, vix an salutandi sententiae.',
  },
  {
    color: 'amber',
    date: new Date(),
    text: 'Lorem ipsum dolor sit amet, no nam oblique veritus. Commune scaevola imperdiet nec ut, sed euismod convenire principes at. Est et nobis iisque percipit, an vim zril disputando voluptatibus, vix an salutandi sententiae.',
  },
  {
    color: 'orange',
    date: new Date(),
    text: 'Lorem ipsum dolor sit amet, no nam oblique veritus. Commune scaevola imperdiet nec ut, sed euismod convenire principes at. Est et nobis iisque percipit, an vim zril disputando voluptatibus, vix an salutandi sententiae.',
  },
]

function toDateSting(date: Date): string {
  return date.toLocaleDateString('it-IT', { month: 'short', day: 'numeric' })
}
</script>