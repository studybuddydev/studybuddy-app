<template>
  <div class="px-6">
    <v-row>
      <v-col cols="12">
        <v-select :label="$t('pause.general.language')" v-model="$i18n.locale" :items="langs"
          @update:model-value="($event: any) => updateLanguage($event)">
          <template #item="{ props, item }">
            <v-list-item v-bind="props">
              <template #prepend>
                <country-flag :country='item.raw.country' size='normal' class="ma-1 rounded-lg" />
              </template>
            </v-list-item>
          </template>
        </v-select>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <div class="text-h6">{{ $t("pause.timer.volume") }}</div>
        <VolumeSlider
          v-model:volume="settings.generalSettings.soundVolume"
          v-model:mute="settings.generalSettings.soundMute"
          @test-sound="(vol) => testSound(vol)"
          />
      </v-col>
      <v-col cols="12">
        <div class="text-h6">{{ $t('pause.general.interface') }}</div>
        <v-switch :label="$t('pause.general.pulsingPause')" color="primary" inset v-model="settings.generalSettings.pulsingPause" hide-details/>
        <v-switch :label="$t('pause.general.showSeconds')" color="primary" inset v-model="settings.generalSettings.showSeconds" hide-details/>
        <v-switch :label="$t('pause.general.hideTime')" color="primary" inset v-model="settings.generalSettings.hideTime" hide-details/>
        <v-switch :label="$t('pause.general.hideCountdown')" color="primary" inset v-model="settings.generalSettings.disableCountdown" hide-details/>
        <v-switch :label="$t('pause.general.hideSetup')" color="primary" inset v-model="settings.generalSettings.hideSetup" hide-details/>
      </v-col>
    </v-row>

    <v-row>
      <v-spacer />
      <v-col> <v-btn class="bg-background ma-2" @click="exportData()" icon="mdi-tray-arrow-down"
          :title="$t('pause.general.exportData')" color="background" /> </v-col>
      <v-col> <v-btn class="bg-background ma-2" @click="importData()" icon="mdi-tray-arrow-up"
          :title="$t('pause.general.importData')" color="background" /> </v-col>
      <v-col> <v-btn @click="logoutProfile()" class="ma-2" icon="mdi-logout-variant" color="error" title="Logout"></v-btn>
      </v-col>
      <v-spacer />
    </v-row>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useStateStore } from "@/stores/state";
import { useAuth0 } from "@auth0/auth0-vue";
import { useSettingsStore } from "@/stores/settings";
import CountryFlag from 'vue-country-flag-next'
import VolumeSlider from '@/components/common/VolumeSlider.vue'

const settings = useSettingsStore();
const state = useStateStore();
const { logout } = useAuth0();

//// ---- Volume
let debounceAudio: number | undefined = undefined;
async function testSound(volume: number) {
  clearTimeout(debounceAudio);
  debounceAudio = setTimeout(async () => {
    const audio = new Audio('/sounds/break.wav');
    if (volume === undefined) volume = 0.5;
    audio.volume = volume / 100;
    audio.play();
  }, 500)
}

// ----- LANG
// $i18n.availableLocales
const langs = [
  { title: 'Italiano', value: 'it', country: 'it' },
  { title: 'English', value: 'en', country: 'gb' },
  { title: 'Español', value: 'es', country: 'es' },
  { title: 'French', value: 'fr', country: 'fr' },
  { title: 'German', value: 'de', country: 'de' }
]
function updateLanguage(lang: string) {
  localStorage.setItem('lang', lang);
}

function logoutProfile() {
  logout({ logoutParams: { returnTo: window.location.origin } });
}

function exportData() {
  state.downloadData();
}

function importData() {
  state.uploadData();
}
</script>
