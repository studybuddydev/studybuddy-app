<template>
  <div :class="isThereAVideo ? '' : 'no-video'" id="video-container">
    <div id="video-player"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import YouTubePlayer from 'youtube-player'
import { useSettingsStore } from "@/stores/settings";
import type { YouTubePlayer as YouTubePlayerType } from 'youtube-player/dist/types'
import { getYotubeId } from '@/utils/common'

const settings = useSettingsStore();
const isThereAVideo = ref(false);
let player: YouTubePlayerType | null = null;

let currentVideo: string | null = null;

const props = defineProps<{
  shouldUnmute: boolean
}>();


onMounted(() => {
  if (settings.settings.theme?.backgroundVideo) {
    currentVideo = getYotubeId(settings.settings.theme?.backgroundVideo)
    if (currentVideo)
      playVideo(currentVideo);
  }
  if (!settings.generalSettings.videoMute) {
    if (props.shouldUnmute) {
      if (navigator.userActivation.isActive) {
        player?.unMute()
      } else {
        settings.generalSettings.videoMute = true;
      }
    }
  }
})


// Methods
function playVideo(id: string) {
  if (player) {
    removePlayer()
  }
  player = YouTubePlayer('video-player', {
    videoId: id,
    host: 'https://www.youtube-nocookie.com',
    playerVars: {
      autoplay: 1,
      playsinline: 1,
      loop: 1,
      controls: 0,
      playlist: id,
    }
  });

  player.on('ready', async () => {
    if (settings.generalSettings.videoMute) await player?.mute()
    else await player?.unMute()
    await player?.playVideo()
  });

  isThereAVideo.value = true;
}
function removePlayer() {
  player?.stopVideo()
  player?.destroy()

  player = null;
  isThereAVideo.value = true;
  currentVideo = null;
}

// Watch
// watch(() => props.hidden, (hidden) => {
//   if (hidden) {
//     removePlayer()
//   } else if (currentVideo) {
//     playVideo(currentVideo)
//   }
// })
watch(() => settings.settings.theme?.backgroundVideo, (bgVideo) => {
  console.log(bgVideo)
  if (bgVideo) {
    const id = getYotubeId(bgVideo)
    if (currentVideo !== id) {
      currentVideo = id;
      if (id) {
        playVideo(id)
      } else {
        removePlayer()
      }
    }
  } else {
    removePlayer()
  }
})
watch(() => settings.generalSettings.videoVolume, (volume) => {
  player?.setVolume(volume) 
})
watch(() => settings.generalSettings.videoMute, (muted) => {
  if (muted) {
    player?.mute()
  } else {
    player?.unMute()
  }
})
watch(() => props.shouldUnmute, (unMute) => {
  if (
    unMute &&
    navigator.userActivation.isActive &&
    !settings.generalSettings.videoMute
  ) {
    
    player?.unMute()
  }
});

</script>
<style lang="scss" scoped>
.no-video {
  display: none;
}

#video-container {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;

  ::v-deep(iframe) {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100vw;
    height: 100vh;
    transform: translate(-50%, -50%);
  }
}

@media (min-aspect-ratio: 16/9) {
  #video-container ::v-deep(iframe) {
    /* height = 100 * (9 / 16) = 56.25 */
    height: 56.25vw;
  }
}

@media (max-aspect-ratio: 16/9) {
  #video-container ::v-deep(iframe) {
    /* width = 100 / (9 / 16) = 177.777777 */
    width: 177.78vh;
  }
}
</style>