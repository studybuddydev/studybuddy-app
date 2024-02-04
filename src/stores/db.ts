import Dexie, { type Table } from 'dexie';
import type { Timer, Theme } from '@/types';
import { defineStore } from 'pinia'

export class StudyBuddyDB extends Dexie {
  public timer!: Table<Timer, number>;
  public themes!: Table<Theme, number>;

  public constructor() {
    super("StudyBuddyDB");
    this.version(1).stores({
      timer: "++id,title,studyLength,breakLength,repetitions,freeMode",
      themes: "++id,title,palette,backgroundColor, backgroundImg"
    });

    this.on("populate", () => {
      // Timers
      this.timer.bulkAdd([
        { title: '25/5', studyLength: 25, breakLength: 5, repetitions: 4, freeMode: false },
        { title: '50/10', studyLength: 50, breakLength: 10, repetitions: 3, freeMode: false },
        { title: 'Free', studyLength: 0, breakLength: 0, repetitions: 1, freeMode: true },
      ]);
      //Themes
      this.themes.bulkAdd([
        { title: 'Forest', palette: 'bio', backgroundImg: 'https://images.pexels.com/photos/1423600/pexels-photo-1423600.jpeg' },
        { title: 'Clouds', palette: 'nord', backgroundImg: 'https://images.alphacoders.com/133/1332707.png' },
        { title: 'Aurora', palette: 'blallo', backgroundImg: 'https://images.pexels.com/photos/3573603/pexels-photo-3573603.jpeg' },
        { title: 'Space', palette: 'gptnight', backgroundImg: 'https://live.staticflickr.com/65535/52259221868_b757d6cdea_k_d.jpg' },
        { title: 'Mountain', palette: 'nord', backgroundImg: 'https://images.pexels.com/photos/1772973/pexels-photo-1772973.png' },
        { title: 'Beach', palette: 'pastel', backgroundImg: 'https://images.pexels.com/photos/65322/pexels-photo-65322.jpeg' },
        { title: 'Vaporwave', palette: 'vaporwave', backgroundImg: 'https://images.alphacoders.com/124/1249674.jpg' },
        { title: 'LOFI', palette: 'gptnight', backgroundImg: 'https://i.redd.it/injl33v9myl51.jpg' },
        { title: 'Barbie', palette: 'pastel', backgroundImg: 'https://wallpapercg.com/download/margot-robbie-4096x2304-16479.jpeg' },
        { title: 'Oppenheimer', palette: 'gptnight', backgroundImg: 'https://venezianews.b-cdn.net/wp-content/uploads/elementor/thumbs/Oppenheimer-qcqe56sjf98g5iharhgvboxysohac64vt3kbim5lio.jpg' },
        { title: 'OG', palette: 'verdone', backgroundImg: 'https://images.pexels.com/photos/66997/pexels-photo-66997.jpeg' },
        { title: 'Gandalf', palette: 'blallo', backgroundImg: 'https://media4.giphy.com/media/TcdpZwYDPlWXC/giphy.gif' }
      ]);
    })
  }
}

export const useDBStore = defineStore('dbStore', () => {
  const studyBuddyDB = new StudyBuddyDB();

  const themes = studyBuddyDB.themes;
  const timers = studyBuddyDB.timer;

  return { themes, timers };
});
