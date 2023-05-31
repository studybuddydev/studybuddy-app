<template>
  <v-dialog width="500" v-model="model">
    <v-card  v-on:keyup.enter="save()">
      <v-toolbar dark color="primary">
        <v-btn icon dark @click="cancel()"> <v-icon>mdi-close</v-icon> </v-btn>
        <v-toolbar-title>{{ props.title }}</v-toolbar-title>

        <template v-slot:extension v-if="props.extension">
          <slot name="extension" />
        </template>
      </v-toolbar>

      <slot :data="clonedData"></slot>
      <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="cancel()">Cancel</v-btn>
          <v-btn @click="save()" color="primary">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup generic="T extends {}">
import { watch } from 'vue';
import { computed, toRaw } from 'vue';
import { ref } from 'vue';

type Props<G> = {
  modelValue: boolean,
  extension?: boolean,
  title?: string,
  data?: G,
}

const propsND = defineProps<Props<T>>()
const props = ref<Props<T>>({
  title: 'Dialog',
  modelTab: '',
  ...propsND,
});
const emits = defineEmits(['update:modelValue', 'save', 'cancel'])
const model = computed({
  get() { return propsND.modelValue },
  set(value) { return emits('update:modelValue', value) }
})
// const emits = defineEmits<{
//   close: () => void,
//   save: (data?: T) => void,
//   modelValue: (value: boolean) => void,
// }>();
const clonedData = ref<T>({} as T);
watch(() => propsND.modelValue, (value) => {
  if (value) {
    clonedData.value = JSON.parse(JSON.stringify((propsND as any).data));
  }
})

function cancel() {
  emits('cancel');
  emits('update:modelValue', false);
}

function save() {
  emits('save', JSON.parse(JSON.stringify(clonedData.value)));
  emits('update:modelValue', false);
}

</script>