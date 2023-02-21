<template>
    <div class="bottom-bar">
        <div class="now-playing">
            
            <div class="song-info">
                <span class="song-name">{{ currentTrack.name }}</span>
                <span class="artist-name">{{ currentTrack.artist }}</span>
            </div>
        </div>

        <div class="playback-controls">
     

            <button class="play-pause" @click="isPlaying = !isPlaying">
                <i v-if="isPlaying" class="mdi mdi-pause"></i>
                <i v-else class="mdi mdi-play"></i>
            </button>
            <button class="next">
                <i class="mdi mdi-stop"></i>
            </button>

        </div>
        <div class="progress-bar-container">
            <div class="progress-bar" :style="{ width: progressPercentage }"></div>
        </div>
        <h3 > 04:20/25:00</h3>
    </div>
</template>
  
  <script lang="ts">
export default {
    name: "BottomBar",

    data: () => ({
        currentTrack: {
            name: "Esercizi ",
            artist: "Fisica",
            image: "https://i.scdn.co/image/ab67616d0000b273f2b5f9b2b0f9b2b0f2b0f2b0",
        },
        isPlaying: true,
        progressPercentage: "10%",
    }),
};
</script>
  
<style scoped>
.bottom-bar {
    position: fixed;
    bottom: 0;
    left: 250px;
    right: 0;
    height: 80px;
    background-color: #1e1e1e;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
}

.now-playing {
    display: flex;
    align-items: center;
    right: 0;
}

.album-art {
    width: 50px;
    height: 50px;
    border-radius: 5px;
}

.song-info {
    margin-left: 10px;
}

.song-name {
    font-size: 40px;
    color: #fff;

}

.artist-name {
    font-size: 30px;
    color: #b3b3b3;
}

.playback-controls {
    display: flex;
    align-items: center;
    font-size: 50px;
}

.playback-controls button {
    background-color: transparent;
    border: none;
    color: #fff;
    margin: 0 10px;
    cursor: pointer;
}

.progress-bar-container {
    width: 50%;
    height: 5px;
    background-color: #b3b3b3;
    border-radius: 5px;
}

.progress-bar {
    height: 100%;
    background-color: #1db954;
    border-radius: 5px;
}

.progress-bar-container:hover .progress-bar {
    width: 50%;
}




</style>
  