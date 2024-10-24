
import Dexie, { type Table, type Transaction } from 'dexie';
import type { Timer, Theme, PomodoroDBO, ExamDBO, UpdatesDBO } from '@/types';
import { defineStore } from 'pinia';

function getThemes() {
  const themes: Partial<Theme>[] = [
    { title: 'Autumn',      category: '🌲 Nature', palette: 'bio',      },
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
  const xx = themes.map((t) => ({ ...t, previewImg: `/images/themes/${t.title}.webp`, backgroundImg: `https://api.studybuddy.it/images/${t.title}`, og: true }));
  console.log(xx.map(t => t.backgroundImg));
  return xx
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
  public pomodori!: Table<PomodoroDBO, string>;
  public exams!: Table<ExamDBO, number>;
  public updates!: Table<UpdatesDBO, number>;



  public constructor() {
    super("StudyBuddyDB");

    let themeRefreshed: boolean = false;

    const refreshThemes = async function (trans: Transaction) {
      await trans.table('themes').bulkDelete(
        await trans.table('themes').toArray().then(tt => tt.filter(t => t.og).map(t => t.id))
      )
      await trans.table('themes').bulkAdd(getThemes());
      themeRefreshed = true;
    }



    this.version(3).stores({
      timer: "++id,title,studyLength,breakLength,repetitions,freeMode",
      themes: "++id,title,palette,backgroundColor,backgroundImg",
      pomodori: "++id,endedAt,end,freeMode,datetime"
    });
    this.version(5).stores({
      timer: "++id,title,studyLength,breakLength,repetitions,freeMode",
      themes: "++id,title,palette,backgroundColor,backgroundImg",
      pomodori: "++id,datetime,tag"
    }).upgrade(async trans => { await refreshThemes(trans) });
    this.version(6).stores({
      timer: "++id,title,studyLength,breakLength,repetitions,freeMode",
      themes: "++id,title,palette,category,backgroundColor,backgroundImg",
      pomodori: "++id,datetime,tag"
    }).upgrade(async trans => { await refreshThemes(trans) });
    this.version(7).stores({
      timer: "++id,title,studyLength,breakLength,repetitions,freeMode",
      themes: "++id,title,palette,category,backgroundColor,backgroundImg,og",
      pomodori: "++id,datetime,tag"
    }).upgrade(async trans => { await refreshThemes(trans) });
    this.version(11).stores({
      updates: "++id,entityName,lastUpdate",
      timer: "++id,title,studyLength,breakLength,repetitions,freeMode",
      themes: "++id,title,palette,category,backgroundColor,backgroundImg,og",
      pomodori: "++id,datetime,tag,remoteUpdated",
      exams: "++id,_id,examId,examName"
    }).upgrade(async trans => {
      await trans.table('pomodori').toCollection().modify({ remoteUpdated: 0 });
    });
    this.version(13).stores({
      updates: "++id,entityName,lastUpdate",
      timer: "++id,title,studyLength,breakLength,repetitions,freeMode",
      themes: "++id,title,palette,category,backgroundColor,backgroundImg,og",
      pomodori: "++id,datetime,tag,remoteUpdated",
      exams: "++id,_id,dataExamId,name"
    }).upgrade(async trans => { await refreshThemes(trans) });
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

export enum EntitiesEnum {
  themes = 'themes',
  timers = 'timers',
  pomodori = 'pomodori',
  exams = 'exams'
}

export const useDBStore = defineStore('dbStore', () => {
  const studyBuddyDB = new StudyBuddyDB();

  const themes = studyBuddyDB.themes;
  const timers = studyBuddyDB.timer;
  const pomodori = studyBuddyDB.pomodori;
  const exams = studyBuddyDB.exams;


  async function getLastUpdatedDBO(entity: EntitiesEnum) {
    return await studyBuddyDB.updates.where('entityName').equals(entity).first();
  }

  async function getLastUpdated(entity: EntitiesEnum): Promise<Date> {
    return (await getLastUpdatedDBO(entity))?.lastUpdate ?? new Date('1970-01-01');
  }

  async function setLastUpdated(entity: EntitiesEnum, lastUpdate: Date) {
    const existing = await getLastUpdatedDBO(entity);
    if (existing) {
      await studyBuddyDB.updates.update(existing.id!, { lastUpdate });
    } else {
      await studyBuddyDB.updates.add({ entityName: entity, lastUpdate });
    }
  }

  return {
      studyBuddyDB,
      themes, timers, pomodori, exams,
      getLastUpdated, setLastUpdated
    };
});
