<template>
  <div>
    <div class="hide" id="pomocirclepipparent">
      <div id="pomocirclepip"
        :class="zenStyle.backgroundImage ? 'pomodoro-circle-component-on-pip-wrapper-wrapper img-background' : 'pomodoro-circle-component-on-pip-wrapper-wrapper'"
        :style="zenStyle">
        <div class="pomodoro-circle-component-on-pip-wrapper">
          <div class="pomodoro-circle-component pomodoro-circle-component-on-pip">
            <MiniTimer />
          </div>
        </div>
      </div>
    </div>
    
    <div class="pomodoro-circle-component-on-zen-wrapper"
      v-if="!isPipped && (pomodoro.countdownRunning || (pomodoro.going && (!props.hideTime || pomodoro.pauseing)))">
      <PomodoroCircle class="pomodoro-circle-component pomodoro-circle-component-on-zen" :in-pip="false" />
      <v-btn v-if="pipSupported" density="comfortable" size="small" class="btn-pip bg-surface" icon="mdi-flip-to-front"
        @click="pipIt()" />
      <Info v-if="pomodoro.pauseing" :text="$t('info.pause')" class="info-pause" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import PomodoroCircle from '@/components/Pomodoro/PomodoroCircle.vue';
import MiniTimer from '@/components/Pomodoro/MiniTimer.vue';
import Info from '@/components/common/Info.vue';
import { ref } from 'vue';
import { usePomodoroStore } from "@/stores/pomodoro";

const pomodoro = usePomodoroStore();
const pipSupported = !!(window as any).documentPictureInPicture;
const isPipped = ref(false);

const props = defineProps<{
  zenStyle: { backgroundImage?: string, backgroundColor?: string },
  hideTime: boolean,
}>();

async function pipIt() {
  const player = document.querySelector("#pomocirclepip");
  if (!(window as any).documentPictureInPicture) return;

  if ((window as any).documentPictureInPicture.window) {
    (window as any).documentPictureInPicture.window.close();
    isPipped.value = false;
    return;
  }

  const pipWindow = await (window as any).documentPictureInPicture.requestWindow({ width: 800, height: 360 });

  [...(document.styleSheets as any)].forEach((styleSheet) => {
    try {
      const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
      const style = document.createElement('style');

      style.textContent = cssRules;
      pipWindow.document.head.appendChild(style);
    } catch (e) {
      const link = document.createElement('link');

      link.rel = 'stylesheet';
      link.type = styleSheet.type;
      link.media = styleSheet.media;
      link.href = styleSheet.href;
      pipWindow.document.head.appendChild(link);
    }
  });

  pipWindow.document.body.append(player);

  pipWindow.addEventListener("pagehide", (event: any) => {
    const playerContainer = document.querySelector("#pomocirclepipparent");
    const pipPlayer = event.target.querySelector("#pomocirclepip");
    playerContainer?.append(pipPlayer);
    isPipped.value = false;
  });
  isPipped.value = true;
}
</script>

<style scoped lang="scss">
.pomodoro-circle-component-on-zen-wrapper {
  position: relative;

  .btn-pip {
    position: absolute;
    display: none;
    top: 0;
    left: 0;
  }

  .info-pause {
    top: 0;
    right: 0;
  }


  &:hover .btn-pip {
    display: block;
  }

  .pomodoro-circle-component-on-zen {
    height: min(50vh, 80vw);
    width: min(50vh, 80vw);
  }
}

.pomodoro-circle-component-on-pip-wrapper-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: rgb(var(--v-theme-surface));
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;

  .pomodoro-circle-component-on-pip-wrapper {
    width: 100vw;
    height: 100vh;

    .pomodoro-circle-component-on-pip {
      height: 100%;
    }
  }
}
</style>