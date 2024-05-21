
import Dexie, { type Table } from 'dexie';
import type { Timer, Theme, PomodoroDBO } from '@/types';
import { defineStore } from 'pinia';

function getThemes() {
  const themes: Partial<Theme>[] = [
    { title: 'Forest',      category: '🌲 Nature', palette: 'bio',      backgroundVideo: 'https://www.youtube.com/watch?v=xNN7iTA57jM', showOnlyMusic: true },
    { title: 'Mountain',    category: '🌲 Nature', palette: 'nord',     },
    { title: 'Rocks',       category: '🌲 Nature', palette: 'gptday',   },
    { title: 'Rain',        category: '🌲 Nature', palette: 'gptnight', backgroundVideo: 'https://www.youtube.com/watch?v=mPZkdNFkNps' },
    { title: 'Space',       category: '🌲 Nature', palette: 'gptnight', },
    { title: 'Night',       category: '🌲 Nature', palette: 'dark',     },
    { title: 'Aurora',      category: '🌲 Nature', palette: 'blallo',   },
    { title: 'Beach',       category: '🌲 Nature', palette: 'pastel',   },
    { title: 'Ghibli',      category: '🎨 Art',    palette: 'verdone',  backgroundVideo: 'https://www.youtube.com/watch?v=z9Ug-3qhrwY' },
    { title: 'Wave',        category: '🎨 Art',    palette: 'nord',     },
    { title: 'Vaporwave',   category: '🎨 Art',    palette: 'vaporwave',backgroundVideo: 'https://www.youtube.com/watch?v=rqJDO3TWnac' },
    { title: 'Purple',      category: '🏢 Urban',  palette: 'purple',   },
    { title: 'LOFI',        category: '🏢 Urban',  palette: 'gptnight', backgroundVideo: 'https://www.youtube.com/watch?v=jfKfPfyJRdk' },
    { title: 'City',        category: '🏢 Urban',  palette: 'nord',     backgroundColor: 'https://www.youtube.com/watch?v=Vg1mpD1BICI', showOnlyMusic: true },
    { title: 'Fog',         category: '🏢 Urban',  palette: 'gptday',   },
    { title: 'Barbie',      category: '🍿 Movies', palette: 'pastel',   },
    { title: 'Oppenheimer', category: '🍿 Movies', palette: 'gptnight', },
    { title: 'Dune',        category: '🍿 Movies', palette: 'desert',   },
    { title: 'Gandalf',     category: '🍿 Movies', palette: 'blallo',   }
  ]
  return themes.map((t) => ({ ...t, previewImg: `/images/themes/${t.title}.webp`, backgroundImg: `https://api.studybuddy.it/images/${t.title}`, og: true }));
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
      await trans.table('themes').clear();
      await trans.table('themes').bulkAdd(getThemes());
    });
    this.version(6).stores({
      timer: "++id,title,studyLength,breakLength,repetitions,freeMode",
      themes: "++id,title,palette,category,backgroundColor,backgroundImg",
      pomodori: "++id,datetime,tag"
    }).upgrade(async trans => {
      await trans.table('themes').clear();
      await trans.table('themes').bulkAdd(getThemes());
    });
    this.version(7).stores({
      timer: "++id,title,studyLength,breakLength,repetitions,freeMode",
      themes: "++id,title,palette,category,backgroundColor,backgroundImg,og",
      pomodori: "++id,datetime,tag"
    }).upgrade(async trans => {
      await trans.table('themes').bulkDelete(
        await trans.table('themes').toArray().then(tt => tt.filter(t => t.og).map(t => t.id))
      )
      await trans.table('themes').bulkAdd(getThemes());
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
//     console.log('Month', m);
//   }
// }

export const useDBStore = defineStore('dbStore', () => {
  const studyBuddyDB = new StudyBuddyDB();

  const themes = studyBuddyDB.themes;
  const timers = studyBuddyDB.timer;
  const pomodori = studyBuddyDB.pomodori;

  return { themes, timers, pomodori };
});
