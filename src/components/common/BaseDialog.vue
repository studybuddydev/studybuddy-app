<template>
  <v-dialog width="500" v-model="model">
    <v-card  v-on:keyup.enter="save()">
      <v-toolbar dark color="primary">
        <v-btn icon dark @click="cancel()"> <v-icon>mdi-close</v-icon> </v-btn>
        <v-toolbar-title>{{ props.title }}</v-toolbar-title>
      </v-toolbar>
      {{ clonedData }}
      <slot :data="clonedData" />

      <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="cancel()">Cancel</v-btn>
          <v-btn @click="save()" color="primary">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup generic="T extends {}">
import { computed, toRaw } from 'vue';
import { ref } from 'vue';

type Props<G> = {
  modelValue: boolean,
  title: string,
  data: G,
}

const propsND = defineProps<{
  modelValue: boolean,
  title: string,
  data: T,
}>()
const props = ref<Props<T>>({
  title: 'Dialog',
  data: {} as T,
  ...propsND,
});
const model = computed({
  get() { return propsND.modelValue },
  set(value) { return emits('update:modelValue', value) }
})
// const emits = defineEmits<{
//   close: () => void,
//   save: (data?: T) => void,
//   modelValue: (value: boolean) => void,
// }>();
const emits = defineEmits(['update:modelValue', 'save', 'cancel'])
const clonedData = toRaw(props.value.data);

function cancel() {
  emits('cancel');
  emits('update:modelValue', false);
}

function save() {
  emits('save', structuredClone(clonedData));
  emits('update:modelValue', false);
}

</script>