export default {
  api: {
    endpoint:  import.meta.env.VITE_API_ENDPOINT
  },
  timer: {
    speedMultiplier: +(import.meta.env.VITE_TIMER_SPEED_MULTIPLIER ?? 1),
    shortPomoMinutes: +(import.meta.env.VITE_TIMER_MINUTES_SHORTPOMO ?? 5),
    longBreakMinutes: +(import.meta.env.VITE_TIMER_MINUTES_LONGBREAK ?? 15),
    stopPomoMinutes: +(import.meta.env.VITE_TIMER_MINUTES_STOPPOMODORO ?? 60),
  }
}