import { defineStore } from 'pinia'
import { useDBStore } from "@/stores/db";
import type { PomodoroBase, PomodoroDBO, PomodoroRecord, PomodoroTask, PomodotoStatus } from '@/types';
import * as timeUtils from '@/utils/time';
import * as reportUtils from '@/utils/report';
import { useSettingsStore } from "@/stores/settings";
import { ref } from 'vue';
import { openDB } from 'idb';

export const usePomodoroDBStore = defineStore('pomoDBStore', () => {
  const db = useDBStore();
  const settings = useSettingsStore();
  
  const streak = ref(0);
  const pomodoroRecords = ref<PomodoroRecord[]>([]);

  function parsePomodorDbo(p: PomodoroDBO): PomodoroRecord {
    if (p.deepWork === undefined) p.deepWork = true;
    return {
      ...p,
      displayBreaks: timeUtils.getDisplayBreaksRecord(p, p.endedAt ?? 0, settings.generalSettings.showSeconds),
      displayStudy: timeUtils.getDisplayStudyRecord(p, p.endedAt ?? 0, settings.generalSettings.showSeconds),
      report: reportUtils.getPomoReport(p),
    }
  }
  async function updatePomodoroRecords() {
    pomodoroRecords.value = (
      await db.pomodori.orderBy('datetime')
        .reverse()
        .limit(500)
        .toArray()
    ).map(p => parsePomodorDbo(p));
    updateStreak();
  }
  async function addPomodoroToRecords(pomo: PomodotoStatus): Promise<PomodoroRecord> {
    const dt = new Date(pomo.startedAt ?? Date.now());
    const p: PomodoroDBO = {
      end: pomo.end,
      endedAt: pomo.endedAt,
      breaksDone: pomo.breaksDone.map(b => ({ start: b.start, end: b.end ?? b.start })),
      freeMode: pomo.freeMode,
      datetime: dt,
      deepWork: true
    }

    const parsed = parsePomodorDbo(p);
    const first = await db.pomodori.where('datetime').equals(dt).first();
    if (!(first)) {
      parsed.id = await db.pomodori.add(p);
      pomodoroRecords.value.unshift(parsed);
      updateStreak();
    }
    return parsed;
  }
  async function deletePomodoroRecord(id: number) { 
    pomodoroRecords.value = pomodoroRecords.value.filter(p => p.id !== id);
    updateStreak();
    await db.pomodori.delete(id);
  }

  async function updatePomodoro(id: number, updatePomo: (p: PomodoroDBO) => PomodoroDBO) {
    const pomo = await db.pomodori.get(id);
    if (pomo) {
      await db.pomodori.put(updatePomo(pomo), id);
    }
  }

  // --- TAGS ---
  const tags = ref<string[]>([]);
  const tagColors = ref<{ [id: string]: string; }>({});
  async function updateTags() {
    const colorList = [
      '#33FFCC', '#FF1A66', '#FFFF99', '#809900', '#CC80CC',
      '#E6331A', '#CC9999', '#FFB399', '#80B300', '#E666B3',
      '#00E680', '#B33300', '#B366CC', '#6680B3', '#66994D',
      '#FF6633', '#00B3E6', '#991AFF', '#3366E6', '#B3B31A',
      '#99FF99', '#FF33FF', '#1AB399', '#B34D4D', '#4D8000',
      '#999966', '#E6B333', '#33991A', '#66664D', '#FF99E6',
      '#CCFF1A', '#E666FF', '#E6B3B3', '#66991A', '#4DB3FF'
    ];
    tags.value = (await db.pomodori.orderBy('tag').uniqueKeys()).map((t, i) => t.toString())
    tagColors.value = tags.value.reduce((acc, t, i) => {
      acc[t] = colorList[i % colorList.length];
      return acc;
    }, {} as { [id: string]: string; });
  }
  async function updateTag(id: number, tag: string | undefined) {
    await updatePomodoro(id, p => { p.tag = tag; return p; });
    await updateTags();
  }
  updateTags();

  async function updateRating(id: number, rating: number) {
    await updatePomodoro(id, p => { p.rating = rating; return p; });
  }
  async function updateDeepWork(id: number, deepWork: boolean) {
    await updatePomodoro(id, p => { p.deepWork = deepWork; return p; });
  }
  async function updateName(id: number, name: string) {
    await updatePomodoro(id, p => { p.name = name; return p; });
  }

  // --- TASKS ---
  async function updateTasks(id: number, tasks?: PomodoroTask[]) {
    await updatePomodoro(id, p => { p.tasks = tasks?.map(t => ({ task: t.task, done: t.done })); return p; });
  }

  // --- STREAK ---
  function getDay(d: Date) {
    return Math.floor((
      d.getTime() - d.getTimezoneOffset() * 60 * 1000
    ) / (24 * 60 * 60 * 1000));

  }

  function updateStreak() {
    const days = pomodoroRecords.value.map(p => getDay(p.datetime));
    const today = getDay(new Date());

    if (days.length === 0 || (today !== days[0] && today - 1 !== days[0])) {
      streak.value = 0;
      return;
    }

    let newStreak = 1;
    let i = 1
    while (i < days.length) {
      const d1 = days[i - 1];
      const d2 = days[i]; 
      if (d1 - 1 === d2) {
        newStreak++;
        i++;
      } else if (d1 === d2) {
        i++;
      } else {
        break;
      }
    }
    streak.value = newStreak;
  }

  (async () => {

    // migrate to new db -- remove after a while
    if ((await window.indexedDB.databases()).map(db => db.name).includes('sb-db')) {
      console.log('migrating db');

      const _db = await openDB('sb-db', 2, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('pomodori')) {
            const pomodori = db.createObjectStore('pomodori', { keyPath: 'id', autoIncrement: true });
            pomodori.createIndex('datetime', 'datetime', { unique: false });

          }
        }
      });

      const pomos = await _db.getAllFromIndex('pomodori', 'datetime',
        IDBKeyRange.lowerBound(new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)))
      )
      pomos.forEach(async (p: any) => {
        const newP: PomodoroDBO = {
          end: p.end,
          endedAt: p.endedAt,
          breaksDone: p.breaksDone.map((b: any) => ({ start: b.start, end: b.end })),
          freeMode: p.freeMode,
          datetime: p.datetime,
          deepWork: true
        }
        await db.pomodori.add(newP);
      });
      // delete old db
      const oldDb = await openDB('sb-db', 2);
      if (oldDb) {
        oldDb.close();
        indexedDB.deleteDatabase('sb-db');
      }
      console.log('migration done');
    }


    await updatePomodoroRecords();
  })();



  return {
    pomodoroRecords, tags, tagColors, streak, updatePomodoro, parsePomodorDbo,
    addPomodoroToRecords,
    deletePomodoroRecord,
    updateTag, updateRating, updateTasks, updateDeepWork, updateName
  };
});