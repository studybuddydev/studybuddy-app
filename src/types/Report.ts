import type { PomodoroBase, PomoReport } from '.';

export default class Report {
  private report: PomoReport;
  private WEIGHT_EFFICIENCY = 0.7;
  private WEIGHT_DURATION = 0.3;
  private OPTIMAL_STUDY_RATIO = 5/6;

  constructor(pomo?: PomodoroBase) {
    if (!pomo) {
      this.report = { timeTotal: 0, timeStudy: 0, timeBreak: 0, nrBreaks: 0, points: 0 };
      return;
    } 
    const timeBreak = pomo.breaksDone.reduce((acc, curr) => acc + ((curr.end ?? curr.start) - curr.start), 0);
    const timeTotal = pomo.endedAt ?? pomo.end;
    const timeStudy = timeTotal - timeBreak;

    const durataPomelli: number[] = [];
    let prevBreakEnd = 0;
    for (let i = 0; i < pomo.breaksDone.length; i++) {
      durataPomelli.push(pomo.breaksDone[i].start - prevBreakEnd);
      prevBreakEnd = pomo.breaksDone[i].end ?? 0;
    }
    durataPomelli.push(pomo.end - prevBreakEnd);

    const scorePomelli = durataPomelli
      .map(p => p / 60000)
      .map(p => p < 20 ? (p / 20) : ( p > 50 ? (50 / p) : 1 ))
      .reduce((a, b) => a + b, 0) / durataPomelli.length;
    const score = 
      (this.WEIGHT_EFFICIENCY * ( 1 - Math.abs((timeStudy / timeTotal) - (this.OPTIMAL_STUDY_RATIO)) ) )
      + (this.WEIGHT_DURATION * scorePomelli)

    this.report = {
      timeTotal: timeTotal,
      timeStudy: timeStudy,
      timeBreak: timeBreak,
      nrBreaks: pomo.breaksDone.length,
      points: Math.max(Math.min(score, 1), 0)
    };
  }

  public getReport() {
    return this.report;
  }
}