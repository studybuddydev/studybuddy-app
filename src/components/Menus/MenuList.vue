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
            <v-list-item @click="editElement(e, i)" :title="$t('edit')" />
            <v-list-item @click="removeElement(i)" :title="$t('delete')" />
          </v-list>
        </v-menu>
      </template>
    </v-list-item>

    <v-list-item
      @click="addElement()"
      :class="`bg-${props.color}`"
      prepend-icon="mdi-plus" :title="$t('add',{ 'element' :props.elementsName })"  />

  </v-list>

  <!-- add exam/chapter dialog-->
  <v-dialog v-model="newElementDialog.open" width="500">
    <v-card>
      <v-toolbar dark :color="props.color">
        <v-btn icon dark @click="newElementDialog.open = false"> <v-icon>mdi-close</v-icon> </v-btn>
        <v-toolbar-title>{{ props.elementsName }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items> <v-btn variant="text" @click="saveElement()" > {{ $t('save') }} </v-btn> </v-toolbar-items>
      </v-toolbar>
      <v-card-text>
        <v-container>
          
          <v-row>
            <!-- Exam name -->
            <v-col cols="12">
              <v-text-field
                v-model="newElementDialog.element.name"
                :label="$t('name',{ 'element': props.elementsName})"
                required
                :error-messages="state.checkValidExamName(newElementDialog.element.name, newElementDialog.index) ? '' : $t('invalidName', {element: props.elementsName})" />
            </v-col>
            <!--Deadline-->
            <v-col cols="12" v-if="props.elementsName === $t('exam')">
              <v-text-field
                v-model="newElementDialog.element.deadline"
                label="Deadline"
                type="date"
              />
            </v-col>
            
            <!--  Icon-->
            <v-col cols="12" v-if="props.chooseIcon">
              <v-select :label="$t('icon')"
                :items="mdiIconsList" item-title="title" item-value="icon"
                v-model="newElementDialog.element.icon"
                :prepend-icon="newElementDialog.element.icon"
              >
                <template v-slot:item="{ props: item }">
                  <v-list-item v-bind="item" :prepend-icon="item.value" :title="item.title" />
                </template>
              </v-select>
            </v-col>
          </v-row>
          <!-- Color -->
          <v-row>
            <v-col cols="12" v-if="props.chooseColor">
              <v-select :label="$t('color')"
                :items="colorList" item-title="title" item-value="color"
                v-model="newElementDialog.element.color" >
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
import { useStateStore } from "@/stores/state";
const state = useStateStore();

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

const mdiIconsList = ref([
  { icon: "mdi-account-school", title: 'School' },
  { icon: "mdi-flask-outline", title: 'Flask' },
  { icon: "mdi-function-variant", title: 'Function' },
  { icon: "mdi-atom-variant", title: 'Atom' },
  { icon: "mdi-book-open-page-variant", title: 'Book' },
  { icon: "mdi-account-cowboy-hat", title: 'Cowboy' },
  { icon: "mdi-brain", title: 'Brain' },
  { icon: "mdi-globe-model", title: 'Globe' },
  { icon: "mdi-music-note", title: 'Music' },
  { icon: "mdi-palette-outline", title: 'Palette' },
  { icon: "mdi-basketball-hoop-outline", title: 'Basketball' },
  { icon: "mdi-format-list-bulleted", title: 'Format' },
  { icon: "mdi-weather-sunny", title: 'Weather' },
  { icon: "mdi-account-tie", title: 'Account' },
  { icon: "mdi-desktop-tower-monitor", title: 'Desktop' },
  { icon: "mdi-puzzle-outline", title: 'Puzzle' },
  { icon: "mdi-animation-outline", title: 'Animation' },
  { icon: "mdi-microscope-variant", title: 'Microscope' },
  { icon: "mdi-camera-outline", title: 'Camera' },
  { icon: "mdi-wallet-outline", title: 'Wallet' },
  { icon: "mdi-account-supervisor-outline", title: 'Account' },
]);

const colorList = [
  { color: 'purple', title: 'Purple' },
  { color: 'pink', title: 'Pink' },
  { color: 'indigo', title: 'Indigo' },
  { color: 'blue', title: 'Blue' },
  { color: 'teal', title: 'Teal' },
  { color: 'green', title: 'Green' },
  { color: 'orange', title: 'Orange' },
  { color: 'deep-orange', title: 'Deep' },
  { color: 'brown', title: 'Brown' },
  { color: 'grey', title: 'Grey' },
  { color: 'blue-grey', title: 'Blue' },
  { color: 'black', title: 'Black' },
  { color: 'white', title: 'White' },
];

const defaultElement: MenuElement = { name: '', icon: 'mdi-account-school', to: '' };
const newElementDialog = ref({
  open: false,
  index: -1,
  element: { ...defaultElement },
});

function addElement() {
  newElementDialog.value.element =  { ...defaultElement };
  newElementDialog.value.index = -1;
  newElementDialog.value.open = true;
  newElementDialog.value.element.color = colorList[Math.floor(Math.random() * colorList.length)].color;
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
  if (state.checkValidExamName(newElementDialog.value.element.name, newElementDialog.value.index)) {
    if (newElementDialog.value.index === -1) {
      emit('add', newElementDialog.value.element)
    } else {
      emit('edit', newElementDialog.value.element, newElementDialog.value.index)
    }
    newElementDialog.value.open = false;
  }
}

function rail() {
  emit('rail')
}


</script>