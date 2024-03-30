<template>
  <div>
    <v-tabs v-model="tab" align-tabs="center">
      <v-tab :value="1" v-if="pomo.report" >Report</v-tab>
      <v-tab :value="2">Details</v-tab>
      <v-tab :value="3" v-if="showSink">Sink
        <v-badge v-if="sink.itemsCount > 0" :content="sink.itemsCount" inline color="error"/>
      </v-tab>
    </v-tabs>
    <v-window class="pomo-details" v-model="tab">
      <v-window-item :value="1" v-if="pomo.report" class="page-content report">
        <PomodoroReport :report="pomo.report" />
      </v-window-item>
      <v-window-item :value="2">
        <PomodoroDetails class="page-content details" :pomo="pomo" />
      </v-window-item>
      <v-window-item :value="3" v-if="showSink">
        <SinkList class="page-content sink-list" />
      </v-window-item>
    </v-window>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import PomodoroReport from '@/components/Pomodoro/PomodoroDone/PomodoroReport.vue';
import PomodoroDetails from '@/components/Pomodoro/PomodoroDone/PomodoroDetails.vue';
import SinkList from '@/components/Sink/SinkList.vue';
import type { PomodoroBase } from '@/types';
import { useSinkStore } from "@/stores/sink";
const sink = useSinkStore();
const tab = ref(1);
const props = defineProps<{
  pomo: PomodoroBase,
  hideSink?: boolean
 }>();

const showSink = computed(() => !props.hideSink && (sink.itemsCount > 0 || tab.value === 3));
</script>

<style scoped lang="scss">
.page-content {
  margin: auto;
  height: 14rem;
  display: grid;
  align-content: center;
}
.report {
  max-width: 35rem;
}
.details {
  max-width: 50rem;
}
.sink-list {
  max-width: 40rem;
  display: block;
  align-content: unset;
  overflow-y: auto
}
</style>