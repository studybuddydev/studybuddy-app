
import Dexie, { type Table } from 'dexie';
import type { Timer, Theme, PomodoroDBO } from '@/types';
import { defineStore } from 'pinia';

function getThemes() {
  return [
    { title: 'Forest', palette: 'bio' },
    { title: 'Mountain', palette: 'nord' },
    { title: 'Rocks', palette: 'gptday' },

    { title: 'Space', palette: 'gptnight' },
    { title: 'Night', palette: 'dark' },
    { title: 'Aurora', palette: 'blallo' },

    { title: 'Ghibli', palette: 'verdone' },
    { title: 'LOFI', palette: 'gptnight' },
    { title: 'Wave', palette: 'nord' },

    { title: 'Purple', palette: 'purple' },
    { title: 'Beach', palette: 'pastel' },
    { title: 'Vaporwave', palette: 'vaporwave' },

    { title: 'Barbie', palette: 'pastel' },
    { title: 'Oppenheimer', palette: 'gptnight' },
    { title: 'Dune', palette: 'desert' },

    { title: 'City', palette: 'nord' },
    { title: 'Fog', palette: 'gptday' },
    { title: 'Gandalf', palette: 'blallo' }

  ].map((t) => ({ ...t, previewImg: `/images/themes/${t.title}.webp`, backgroundImg: `https://api.studybuddy.it/images/${t.title}`, og: true }));
}

function getTimers() {
  return [
    { title: 'Free', studyLength: 0, breakLength: 0, repetitions: 1, freeMode: true },
    { title: '25/5', studyLength: 25, breakLength: 5, repetitions: 4, freeMode: false },
    { title: '50/10', studyLength: 50, breakLength: 10, repetitions: 3, freeMode: false },
  ];
}

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
    this.version(5).stores({
      timer: "++id,title,studyLength,breakLength,repetitions,freeMode",
      themes: "++id,title,palette,backgroundColor,backgroundImg",
      pomodori: "++id,datetime,tag"
    }).upgrade(async trans => {
      trans.table('themes').clear();
      trans.table('themes').bulkAdd(getThemes());
    });
    this.on("populate", () => {
      this.timer.bulkAdd(getTimers());
      this.themes.bulkAdd(getThemes());
    })
  }

}

// async function addPomodoriTest(pomodori: Table<PomodoroDBO, number>) {
//   function getRandom(n: number = 7200000) {
//     return Math.floor(Math.random() * n);
//   }
//   await pomodori.clear()
//   for (let m = 0; m < 12; m++) {
//     for (let d = 1; d < 28; d++) {
//       for (let i = 0; i < 50; i++) {
//         const breaks = []
//         let tIndex = 0;
//         for (let b = 0; b < Math.floor(Math.random() * 5); b++) {
//           const start = Math.floor(Math.random() * 720000) + tIndex;
//           const end = Math.floor(Math.random() * 720000) + start;
//           const b = { start, end }
//           tIndex += b.end
//           breaks.push(b)
//         }
//         await pomodori.add({ end: 7200000, endedAt: getRandom(),
//           breaksDone: breaks, freeMode: false, deepWork: true,
//           datetime: new Date(2023, m, d, getRandom(24), getRandom(60), getRandom(60), 0) })
//       }
//     }
//   console.log(`Added pomodoro ${m}`)
//   }
// }

export const useDBStore = defineStore('dbStore', () => {
  const studyBuddyDB = new StudyBuddyDB();

  const themes = studyBuddyDB.themes;
  const timers = studyBuddyDB.timer;
  const pomodori = studyBuddyDB.pomodori;

  return { themes, timers, pomodori };
});
