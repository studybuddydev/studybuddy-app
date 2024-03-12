import { defineStore } from 'pinia'
import { useDBStore } from "@/stores/db";
import type { PomodoroDBO, PomodoroRecord, PomodotoStatus } from '@/types';
import * as timeUtils from '@/utils/time';
import * as reportUtils from '@/utils/report';
import { useSettingsStore } from "@/stores/settings";
import { ref } from 'vue';
import { openDB } from 'idb';

export const usePomodoroDBStore = defineStore('pomoDBStore', () => {
  const db = useDBStore();
  const settings = useSettingsStore();

  const pomodoroRecords = ref<PomodoroRecord[]>([]);

  function parsePomodorDbo(p: PomodoroDBO): PomodoroRecord {
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
  }
  async function addPomodoroToRecords(pomo: PomodotoStatus) {
    const p: PomodoroDBO = {
      end: pomo.end,
      endedAt: pomo.endedAt,
      breaksDone: pomo.breaksDone.map(b => ({ start: b.start, end: b.end ?? b.start })),
      freeMode: pomo.freeMode,
      datetime: new Date(pomo.startedAt ?? Date.now())
    }
    const parsed = parsePomodorDbo(p);
    parsed.id = await db.pomodori.add(p);
    pomodoroRecords.value.unshift(parsed);
  }
  async function deletePomodoroRecord(id: number) {
    pomodoroRecords.value = pomodoroRecords.value.filter(p => p.id !== id);
    await db.pomodori.delete(id);
  }

  // --- TAGS ---
  const tags = ref<string[]>([]);
  const tagColors = ref<{ [id: string]: string; }>({});
  async function updateTag(pRec: PomodoroRecord, tag?: string) {
    if (!pRec.id) return;
    const p = await db.pomodori.get(pRec.id);
    if (p) {
      p.tag = tag;
      pRec.tag = tag;
      await db.pomodori.put(p, pRec.id);
    }
    await updateTags();
  }
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
  updateTags();


  // migrate to new db -- remove after a while
  (async () => {
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
          datetime: p.datetime
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
    pomodoroRecords, tags, tagColors,
    addPomodoroToRecords,
    deletePomodoroRecord,
    updateTag
  };
});