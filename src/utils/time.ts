import type { PomodoroBase, DisplaySession, PomodoroRecord } from '@/types';

const SECONDS_MULTIPLIER = 1000;

const defaultOptions = {
  html: true,
  showSeconds: true,
  format: 'semicolon' as 'hms' | 'semicolon'
}
export function timeFormatted(seconds: number, options: {
  html?: boolean,
  showSeconds?: boolean,
  format?: 'hms' | 'semicolon'
} = {}) {
  options = { ...defaultOptions, ...options };
  seconds = Math.max(0, Math.floor(seconds));

  let secondsLeft = seconds; // Math.floor(time  / MINUTE_MULTIPLIER * 60);
  let h = Math.floor(secondsLeft / 3600);
  secondsLeft -= h * 3600;
  let m = options.showSeconds ? Math.floor(secondsLeft / 60) : Math.round(secondsLeft / 60);
  secondsLeft -= m * 60;
  let s = Math.floor(secondsLeft);

  if (m >= 60) {
    m = 0;
    h++;
  }

  const sStr = `${s.toString().padStart(2, '0')}`;
  const mStr = `${h > 0 ? m.toString().padStart(2, '0') : m.toString()}`;

  if (options.format === 'semicolon') {
    const sss = options.html ? `<span class="${h > 0 ? 'small seconds' : 'seconds'}">:${sStr}</span>` : `:${sStr}`;
    const hhh = h > 0 ? `${h}:` : '';
    return `${hhh}${mStr}${options.showSeconds ? sss : ''}`;
  } else if (options.format === 'hms') {
    return `${h > 0 ? ` ${h}h ` : ''}${mStr}m${options.showSeconds ? ` ${sStr}s` : ''}`;
  }
  return '';
}

export function parseTime(time: number) {
  return timeFormatted(time / SECONDS_MULTIPLIER, { html: false });
}

export function parseDisplaySession(
    l: { start: number, end?: number, done?: boolean }[],
    now: number,
    end: number,
    showSeconds: boolean
  ): DisplaySession[] {
  return l.filter(b => b.end).map((b, i) => {
    const startPerc = Math.min(100, 100 * b.start / end);
    const bEnd = b.end ?? now;
    const lengthPerc = Math.min(100 - startPerc, (100 * (bEnd / end)) - startPerc);
    return {
      startPerc, lengthPerc,
      lengthTime: timeFormatted((bEnd - b.start) / SECONDS_MULTIPLIER, { html: false, showSeconds }),
      minutes: Math.round((bEnd - b.start) / (SECONDS_MULTIPLIER * 60)),
      done: b.done,
      index: i,
      small: lengthPerc < 3
    }
  })
}

export function getDisplayBreaksRecord(pomo: PomodoroRecord, end: number, showSeconds: boolean): DisplaySession[] {
  const breaks = pomo.breaksDone.map(x => ({ ...x, done: true })) ?? [];
  return parseDisplaySession(breaks, 0, end, showSeconds);
}
export function getDisplayStudyRecord(pomo: PomodoroBase, end: number, showSeconds: boolean, now: number = -1): DisplaySession[] {
  const res: { start: number, end?: number }[] = [{ start: 0 }];
  for (const b of pomo.breaksDone) {
    res.at(-1)!.end = b.start;
    if (b.end && (now === -1 || b.end + 5000 < now)) res.push({ start: b.end });
  }
  if (res.at(-1)!.end === undefined) res.at(-1)!.end = now === -1 ? end : now;
  return parseDisplaySession(res, now, end, showSeconds);
}
