<template>
  <v-list nav density="compact">
    <v-list-item
      v-for="e, i in props.menuElements" :key="e.name"
      link :to="e.to"
      @click="rail()"
      :prepend-icon="e.icon" :title="e.name" :value="e.name"
      :active-color="e.color ?? props.color">
      <template v-slot:append>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              color="grey-lighten-1"
              icon="mdi-dots-vertical"
              variant="text"
              v-bind="props"
              @click.prevent.stop="$event.preventDefault()"
            ></v-btn>
          </template>
          <v-list>
            <v-list-item @click="editElement(e, i)" title="Edit" />
            <v-list-item @click="removeElement(i)" title="Delete" />
          </v-list>
        </v-menu>
      </template>
    </v-list-item>

    <v-list-item
      @click="addElement()"
      :class="`bg-${props.color}`"
      prepend-icon="mdi-plus" :title="`Add ${props.elementsName}`" />

  </v-list>
    
  <v-dialog v-model="newElementDialog.open" width="500">
    <v-card>
      <v-toolbar dark :color="props.color">
        <v-btn icon dark @click="newElementDialog.open = false"> <v-icon>mdi-close</v-icon> </v-btn>
        <v-toolbar-title>{{ props.elementsName }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items> <v-btn variant="text" @click="saveElement()" > Save </v-btn> </v-toolbar-items>
      </v-toolbar>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12"> <v-text-field v-model="newElementDialog.element.name" :label="`${props.elementsName} name`" required></v-text-field> </v-col>
            <v-col cols="12" v-if="props.chooseIcon">
              <v-select label="Icon" :items="mdiIconsList" v-model="newElementDialog.element.icon" :prepend-icon="newElementDialog.element.icon">
                <template v-slot:item="{ props: item }">
                  <v-list-item v-bind="item" :prepend-icon="item.value" />
                </template>
              </v-select>
            </v-col>
          </v-row>
          <v-row>
          <v-col cols="12" v-if="props.chooseColor">
            <v-select label="Icon" :items="colorList" v-model="newElementDialog.element.color" >
              <template v-slot:item="{ props: item }">
                <v-list-item v-bind="item" >
                  <template v-slot:prepend>
                    <v-icon :color="item.value">mdi-circle</v-icon>
                  </template>
                </v-list-item>
              </template>
              <template v-slot:prepend>
                <v-icon :color="newElementDialog.element.color">mdi-circle</v-icon>
              </template>
            </v-select>
          </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { MenuElement } from '@/types';
const props = withDefaults(defineProps<{
  elementsName: string,
  menuElements: MenuElement[],
  chooseIcon?: boolean,
  color?: string
  chooseColor?: boolean,
}>(), {
  chooseIcon: true,
  chooseColor: true,
  color: 'primary',
})
const emit = defineEmits(['add', 'edit', 'remove', 'rail'])

const mdiIconsList = [
  'mdi-math-integral',
  'mdi-math-compass',
  'mdi-math-cos',
  'mdi-math-sin',
  'mdi-math-tan',
  'mdi-math-norm',
  'mdi-math-norm-box',
  'mdi-math-log',
  'mdi-math-exp',
  'mdi-math-factorial',
  'mdi-math-derive',
  'mdi-math-integral-box',
]

const colorList = [
  'purple',
  'pink',
  'indigo',
  'blue',
  'teal',
  'green',
  'orange',
  'deep-orange',
  'brown',
  'grey',
  'blue-grey',
  'black',
  'white',
];

const defaultElement: MenuElement = { name: '', icon: 'mdi-math-integral', to: '' };
const newElementDialog = ref({
  open: false,
  index: -1,
  element: { ...defaultElement },
});

function addElement() {
  newElementDialog.value.element =  { ...defaultElement };
  newElementDialog.value.index = -1;
  newElementDialog.value.open = true;
}

function editElement(el: MenuElement, i: number) {
  newElementDialog.value.element = { ...el };
  newElementDialog.value.index = i;
  newElementDialog.value.open = true;
}

function removeElement(i: number) {
  emit('remove', i)
}

function saveElement() {
  if (newElementDialog.value.index === -1) {
    emit('add', newElementDialog.value.element)
  } else {
    emit('edit', newElementDialog.value.element, newElementDialog.value.index)
  }
  newElementDialog.value.open = false;
}

function rail() {
  emit('rail')
}


</script>