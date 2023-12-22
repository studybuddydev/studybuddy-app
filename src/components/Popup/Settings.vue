<template>
  <v-dialog width="500" v-model="modelDialog">
    <v-card>
      <v-toolbar dark color="primary">
        <v-btn icon dark @click="modelDialog = false"> <v-icon>mdi-close</v-icon> </v-btn>
        <v-toolbar-title>Settings</v-toolbar-title>
        <v-tabs v-model="modelTab">
          <v-tab value="general">{{ $t("pause.general.general") }}</v-tab>
          <v-tab value="pomodoro" :disabled="pomodoro.going">{{ $t("pause.timer.timer") }}</v-tab>
          <v-tab value="theme">Theme</v-tab>
        </v-tabs>
      </v-toolbar>

      <v-card-text>
        <v-container>
          <v-window v-model="modelTab">

            <!-- PROFILE -->
            <v-window-item value="general">
              <v-row>
                <v-col cols="12">
                  <!-- <v-text-field :label="$t('pause.general.username')" v-model="data!.user!.username" type="string" required /> -->
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <v-select :label="$t('pause.general.language')" v-model="$i18n.locale" :items="$i18n.availableLocales"
                    @update:model-value="($event) => settingsStore.settings!.user!.lang = $event" />
                </v-col>
              </v-row>

              <v-row>
                <v-spacer />
                <v-col> <v-btn class="bg-background" @click="exportData()" icon="mdi-tray-arrow-down" title="Export Data"
                    color="background" /> </v-col>
                <v-col> <v-btn class="bg-background" @click="importData()" icon="mdi-tray-arrow-up" title="Import Data"
                    color="background" /> </v-col>
                <!-- <v-col>
                  <v-snackbar :timeout="2000" color="primary" elevation="24">
                    <template #activator="{ props }">
                      <v-btn class="bg-background" @click="resetTutorial()" icon="mdi-tray-arrow-up" />
                    </template>
                    {{$t("pause.general.resetted")}}
                  </v-snackbar>
                </v-col> -->
                <v-col> <v-btn @click="loggaout()" icon="mdi-logout-variant" color="error" title="Logout"></v-btn>
                </v-col>
                <v-spacer />
              </v-row>

            </v-window-item>

            <!-- POMODORO -->
            <v-window-item value="pomodoro">

              <div class="text-h6"> {{ $t("pause.timer.sessionOf") }} {{
                Math.floor(settingsStore.settings!.pomodoro!.totalLength / 60) }} {{ $t("pause.timer.hours") }} {{ settingsStore.settings!.pomodoro!.totalLength % 60 }} {{ $t("pause.timer.minutes") }}</div>
              <v-slider v-model="settingsStore.settings!.pomodoro!.totalLength" :min="5" :max="240" :step="5" thumb-label
                class="pr-4" prepend-icon="mdi-timer">
                <template v-slot:thumb-label>
                  {{ Math.floor(settingsStore.settings!.pomodoro!.totalLength / 60) }}h{{
                    settingsStore.settings!.pomodoro!.totalLength % 60 }}m
                </template>
              </v-slider>

              <div class="text-h6">{{ settingsStore.settings!.pomodoro!.breaksLength }} {{ $t("pause.timer.breaksLength") }}
              </div>
              <v-slider v-model="settingsStore.settings!.pomodoro!.breaksLength" :min="1" :max="60" :step="1" thumb-label
                class="pr-4" prepend-icon="mdi-coffee" />

              <div class="text-h6">{{ settingsStore.settings!.pomodoro!.numberOfBreak }}
                {{ $t("pause.timer.breaksNumber") }}</div>
              <v-slider v-model="settingsStore.settings!.pomodoro!.numberOfBreak" :min="0" :max="10" :step="1" thumb-label
                show-ticks="always" class="pr-4" prepend-icon="mdi-tally-mark-5" />

              <div class="text-h6">{{ $t("pause.timer.volume") }}</div>
              <v-slider v-model="settingsStore.settings!.pomodoro!.soundVolume" :min="0" :max="100" :step="1" thumb-label
                class="pr-4" :prepend-icon="volumeIcon(settingsStore.settings!.pomodoro!.soundVolume)" />

              <v-row>
                <v-spacer />
                <v-col> <v-btn variant="tonal" @click="() => {
                  settingsStore.settings!.pomodoro!.totalLength = settingsStore.defaultSettings.pomodoro!.totalLength;
                  settingsStore.settings!.pomodoro!.numberOfBreak = settingsStore.defaultSettings.pomodoro!.numberOfBreak;
                  settingsStore.settings!.pomodoro!.breaksLength = settingsStore.defaultSettings.pomodoro!.breaksLength;
                }">{{ $t("pause.timer.default") }}</v-btn> </v-col>
                <v-spacer />
              </v-row>

            </v-window-item>

            <!-- THEME -->
            <v-window-item value="theme">
              <v-row>
                <v-col cols="12">
                  <v-select :label="$t('pause.general.theme')" v-model="settingsStore.settings.theme!.theme"
                    :items="themeList" item-title="title" item-value="value" @update:model-value="settingsStore.updateTheme($event)">
                    <template #item="{ props, item }">
                      <v-list-item v-bind="props">
                        <template #prepend>
                          <v-icon :color="item.raw.color">mdi-circle</v-icon>
                        </template>
                      </v-list-item>
                    </template>
                    <!-- <template v-slot:prepend><v-icon :color="data.theme">mdi-circle</v-icon></template> -->
                  </v-select>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <v-text-field label="Colore Sfondo" v-model="settingsStore.settings!.theme!.backgroundColor"
                    type="color" clearable />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <v-select label="Seleziona immagine di sfondo" v-model="settingsStore.settings!.theme!.backgroundImg"
                    :items="backgroundImages" clearable />
                </v-col>
                <v-col cols="12">
                  <v-text-field label="Url immagine custom" v-model="settingsStore.settings!.theme!.backgroundImg"
                    type="string" clearable />
                </v-col>
              </v-row>
            </v-window-item>

          </v-window>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStateStore } from "@/stores/state";
import { useSettingsStore } from "@/stores/settings";
import { usePomodoroStore } from "@/stores/pomodoro";
import { useTheme } from 'vuetify'
import { themeList } from '@/assets/themes'
import { useAuth0 } from "@auth0/auth0-vue";

const theme = useTheme();
const state = useStateStore();
const settingsStore = useSettingsStore();
const pomodoro = usePomodoroStore();
const { logout } = useAuth0();

const backgroundImages = [
  { title: 'Default', value: 'https://shorturl.at/dfjG9' },
  { title: 'Forest', value: 'https://images.pexels.com/photos/1423600/pexels-photo-1423600.jpeg?cs=srgb&dl=pexels-johannes-plenio-1423600.jpg&fm=jpg&w=6000&h=4000' },
  { title: 'Beach', value: 'https://images.pexels.com/photos/221471/pexels-photo-221471.jpeg?cs=srgb&dl=pexels-pixabay-221471.jpg&fm=jpg&w=2500&h=1400' },
  { title: 'Mountain', value: 'https://images.pexels.com/photos/1772973/pexels-photo-1772973.png?cs=srgb&dl=pexels-stephan-seeber-1772973.jpg&fm=jpg&w=6016&h=4016' },
  { title: 'Dog', value: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?cs=srgb&dl=pexels-chevanon-photography-1108099.jpg&fm=jpg&w=5184&h=3888' },
  { title: 'Barbie', value: 'https://wallpapercg.com/download/margot-robbie-4096x2304-16479.jpeg' },
  { title: 'Oppenheimer', value: 'https://images5.alphacoders.com/125/1257951.jpeg' },
  { title: 'Gandalf', value: 'https://media4.giphy.com/media/TcdpZwYDPlWXC/giphy.gif' },
]

function loggaout() {
  logout({ logoutParams: { returnTo: window.location.origin } });
}


const props = defineProps<{ modelValue: string | boolean }>()
const emit = defineEmits(['update:modelValue', 'update:tab'])
const modelDialog = computed({
  get() { return !!props.modelValue },
  set(value) { return emit('update:modelValue', value) }
})
const modelTab = computed({
  get() { return props.modelValue ?? 'general' },
  set(value) { return emit('update:modelValue', value) }
})

function setTheme(newTheme: string) {
  theme.global.name.value = newTheme;
}

function exportData() {
  state.downloadData();
}

function importData() {
  state.uploadData();
}

//// ---- ////
const volumeIcon = computed(() => ((volume: number) => {
  if (!volume) return 'mdi-volume-off';
  if (volume < 33) return 'mdi-volume-low';
  if (volume < 66) return 'mdi-volume-medium';
  return 'mdi-volume-high';
}))

let _sessionLenght = 20;
const sessionLenght = computed({
  get() { return props.modelValue },
  set(value) { return emit('update:modelValue', value) }
})

</script>