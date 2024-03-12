
import Dexie, { type Table } from 'dexie';
import type { Timer, Theme, PomodoroDBO } from '@/types';
import { defineStore } from 'pinia'

export class StudyBuddyDB extends Dexie {
  public timer!: Table<Timer, number>;
  public themes!: Table<Theme, number>;
  public pomodori!: Table<PomodoroDBO, number>;

  public constructor() {
    super("StudyBuddyDB");
    this.version(3).stores({
      timer: "++id,title,studyLength,breakLength,repetitions,freeMode",
      themes: "++id,title,palette,backgroundColor,backgroundImg",
      pomodori: "++id,endedAt,end,freeMode,datetime"
    });

    this.on("populate", () => {
      // Timers
      this.timer.bulkAdd([
        { title: 'Free', studyLength: 0, breakLength: 0, repetitions: 1, freeMode: true },
        { title: '25/5', studyLength: 25, breakLength: 5, repetitions: 4, freeMode: false },
        { title: '50/10', studyLength: 50, breakLength: 10, repetitions: 3, freeMode: false },
      ]);
      //Themes
      this.themes.bulkAdd([
        { title: 'Forest',      palette: 'bio',       previewImg: '/images/themes/Forest.webp',      backgroundImg: 'https://images.pexels.com/photos/1423600/pexels-photo-1423600.jpeg' },
        { title: 'Clouds',      palette: 'nord',      previewImg: '/images/themes/Clouds.webp',      backgroundImg: 'https://images.pexels.com/photos/3996362/pexels-photo-3996362.jpeg' },
        { title: 'Aurora',      palette: 'blallo',    previewImg: '/images/themes/Aurora.webp',      backgroundImg: 'https://images.pexels.com/photos/3573603/pexels-photo-3573603.jpeg' },
        { title: 'Space',       palette: 'gptnight',  previewImg: '/images/themes/Space.webp',       backgroundImg: 'https://live.staticflickr.com/65535/52259221868_b757d6cdea_k_d.jpg' },
        { title: 'Mountain',    palette: 'nord',      previewImg: '/images/themes/Mountain.webp',    backgroundImg: 'https://images.pexels.com/photos/1772973/pexels-photo-1772973.png' },
        { title: 'Beach',       palette: 'pastel',    previewImg: '/images/themes/Beach.webp',       backgroundImg: 'https://images.pexels.com/photos/65322/pexels-photo-65322.jpeg' },
        { title: 'Vaporwave',   palette: 'vaporwave', previewImg: '/images/themes/Vaporwave.webp',   backgroundImg: 'https://images.alphacoders.com/124/1249674.jpg' },
        { title: 'LOFI',        palette: 'gptnight',  previewImg: '/images/themes/LOFI.webp',        backgroundImg: 'https://i.redd.it/injl33v9myl51.jpg' },
        { title: 'Barbie',      palette: 'pastel',    previewImg: '/images/themes/Barbie.webp',      backgroundImg: 'https://wallpapercg.com/download/margot-robbie-4096x2304-16479.jpeg' },
        { title: 'Oppenheimer', palette: 'gptnight',  previewImg: '/images/themes/Oppenheimer.webp', backgroundImg: 'https://venezianews.b-cdn.net/wp-content/uploads/elementor/thumbs/Oppenheimer-qcqe56sjf98g5iharhgvboxysohac64vt3kbim5lio.jpg' },
        { title: 'Wave',        palette: 'nord',      previewImg: '/images/themes/Wave.webp',        backgroundImg: 'https://r4.wallpaperflare.com/wallpaper/283/881/127/the-great-wave-off-kanagawa-painting-japanese-waves-wallpaper-0e19ea97218f10d82b15fbcaa3f2b7ee.jpg' },
        { title: 'Gandalf',     palette: 'blallo',    previewImg: '/images/themes/Gandalf.webp',     backgroundImg: 'https://media4.giphy.com/media/TcdpZwYDPlWXC/giphy.gif' }
      ]);
    })
  }
}

export const useDBStore = defineStore('dbStore', () => {
  const studyBuddyDB = new StudyBuddyDB();

  const themes = studyBuddyDB.themes;
  const timers = studyBuddyDB.timer;
  const pomodori = studyBuddyDB.pomodori;

  return { themes, timers, pomodori };
});
