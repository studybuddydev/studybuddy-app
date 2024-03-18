<template>
  <div class="created-box">
    <div class="blur pa-7 created-box-wrapper">
      <Info :text="$t('info.welcome')" class="info-welcome" />
      <p class="text-primary font-press">{{ $t("pause.welcome") }}</p>
      <div class="title">
        <img src="/images/logo.png" alt="logo" class='logo' />
        <h1 class="text-primary">StudyBuddy</h1>
      </div>
      <h6 class="text-version">v{{ appVersion }}</h6>
      <h3 class="minecraft-sentence font-press">{{ minecraftSentence }}</h3>
    </div>
  </div>
</template>
<script lang="ts" setup>
import Info from '@/components/common/Info.vue';
import minecraftSentences from '@/assets/minecraft.json';

const appVersion = APP_VERSION;
const minecraftSentence = minecraftSentences.sentences[Math.floor(Math.random() * minecraftSentences.sentences.length)];
</script>
<style scoped lang="scss">
p {
  max-width: 700px;
  text-align: center;
  font-size: 1rem;
}

h1 {
  font-size: 5rem;
  max-width: 700px;

  @media (max-width: 600px) {
    font-size: 3rem;
  }
}

h3 {
  font-size: 1.5rem;
  max-width: 700px;

  @media (max-width: 600px) {
    font-size: 0.8rem;
  }
}

.created-box {
  .created-box-wrapper {
    position: relative;
    border-radius: 1rem;
  }

  @media (max-width: 600px) {
    .title {
      display: flex;
      flex-direction: column;
    }
  }

  .minecraft-sentence {
    position: absolute;
    top: 0;
    left: 0;
    font-size: 1rem;
    color: rgba(var(--v-theme-primary));
    transform: translate(-10%, -0em) rotate(-24deg);
    animation: breath 0.5s linear infinite alternate;
    text-shadow: -2px 2px black;
  }

  @keyframes breath {
    0% {
      scale: 0.9;
    }

    100% {
      scale: 1;
    }
  }

  .text-version {
    text-align: right;
    margin-right: 3em;
    margin-top: -1.8em;
    font-size: 0.9rem;

    @media (max-width: 600px) {
      margin-top: -1.2em;
      margin-right: 2em;
    }
  }

  .info-welcome {
    margin: 1rem;
    top: 0;
    right: 0;
  }
}

.title {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;

  img {
    height: 7rem;
    margin-right: 0.5em;

    @media (max-width: 600px) {
      display: none;
    }
  }
}
</style>