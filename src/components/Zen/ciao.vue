          <div class="main-content">
            <div v-if="pomodoro.started && showTime">
              <p :class="pomodoro.status.isBreak ? 'timer blur font-casio' : 'timer blur timer-inpause font-casio'"
              v-if="!pomodoro.status.isBreak">{{ getTimerValue(pomodoro.status.isBreak) }}</p>
            </div>
            <div v-else-if="pomodoro.started">
              <p>buono studio</p>
            </div>
            <!-- welcome screen -->
            <div v-if="!pomodoro.started && first">
              <div class="blur rounded-box pa-7">
                <p class="text-primary font-press">{{ $t("pause.welcome") }}</p>
                <div class="title">
                  <img src="/images/logo.png" alt="logo" class='logo' />
                  <h1 class="text-primary">StudyBuddy</h1>
                </div>
              </div>
            </div>
            <!-- pause and finish screen -->
            <div v-else-if="pomodoro.getReport.reportDone" class="mb-5 blur rounded-box pa-7">
              <p class="pause font-press text-center">{{ $t("pause.pomoDone") }}</p>
              <h2 class="text-primary font-press text-center">{{ $t("pause.goodjob") }}</h2>
            </div>
            <div v-else-if="pomodoro.status.isBreak" class="mb-5 blur rounded-box pa-7">
              <p class="pause font-press text-left">{{ $t("pause.youare") }}</p>
              <h1 class="text-primary font-press text-center">{{ $t("pause.break") }}</h1>
            <p class="pausetime font-press text-right">da <span class="text-primary font-casio">{{ getTimerValue(true) }}</span></p>
          </div>

            <div class="pomopause">
              <v-btn class="btn bg-background btn-main btn-settings" v-if="!pomodoro.started && (first || pomodoro.getReport.reportDone)" @click="openSettingsTab = true">
                <v-icon size="32" icon="mdi-cog" />
              </v-btn>
              <v-btn class='btn bg-secondary pomo-btn pomo-box font-press btn-main-start' v-if="!pomodoro.started || pomodoro.status.isBreak"
                @click="pomodoro.status.interval === null ? pomodoro.startPomodoro() : pomodoro.nextStep()">
                <span>{{ $t("pause.study") }}</span>
                <v-icon class="icon">mdi-play</v-icon>
              </v-btn>
            </div>

            <!-- report table-->
            <div class="report font-press" v-if="pomodoro.getReport.reportDone">
              <div class="grid-container">
                <p>{{ "Tempo studio:" }}</p>
                <p class="report-value">{{ msToMinutes(pomodoro.getReport.studyLength - pomodoro.getReport.breakLength) }}</p>
                <p>{{ "Tempo pausa:" }}</p>
                <p class="report-value">{{ msToMinutes(pomodoro.getReport.breakLength) }}</p>
                <p>{{ "Tempo totale:" }}</p>
                <p class="report-value">{{ msToMinutes(pomodoro.getReport.studyLength) }}</p>
                <p>{{ "Nr. pause:" }}</p>
                <p class="report-value">{{ pomodoro.status.breaks.length }}</p>
                <p class="report-total">{{ "Punteggio:" }}</p>
                <p class="report-value report-total">{{ ((pomodoro.getReport.studyLength - pomodoro.getReport.breakLength) /
                  pomodoro.getReport.studyLength * 100).toFixed(1) }}%</p>
              </div>
            </div>

            <!-- pomodoro bar -->

          </div>