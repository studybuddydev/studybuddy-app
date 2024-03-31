import type { ManifestOptions } from 'vite-plugin-pwa';

export default {
  name: 'StudyBuddy',
  short_name: 'StudyBuddy',
  description: 'Studybuddy is a all in one productivity platform that help university students with time management, in order to achieve more in less time and mantain an healthy lifestyle during academic years.',
  categories: ['education', 'productivity'],
  dir: 'ltr',
  scope: '/',
  start_url: '/',
  display: 'standalone',
  background_color: '#094D4E',
  theme_color: '#094D4E',
  id: "?homescreen=1",
  launch_handler: {
    client_mode: "auto"
  },
  edge_side_panel: {
    "preferred_width": 480
  },
  display_override: ["window-controls-overlay", "fullscreen", "minimal-ui"],
  screenshots:  [
    {
      src: "/images/screenshots/screen01.webp",
      sizes: "2400x1080",
      type: "image/png",
      form_factor: "narrow",
      label: "Timer pomodoro"
    },
    {
      src: "/images/screenshots/screen02.webp",
      sizes: "2400x1080",
      type: "image/png",
      form_factor: "narrow",
      label: "Welcome page"
    },
    {
      src: "/images/screenshots/screen03.png",
      sizes: "2400x1080",
      type: "image/png",
      form_factor: "narrow",
      label: "Pomodoro report"
    },
  ],
  orientation: "portrait",
  icons: [{
    src: '/images/icons/icon-72.png',
    sizes: '72x72',
    type: 'image/png',
  },{
    src: '/images/icons/icon-144.png',
    sizes: '144x144',
    type: 'image/png',
  },{
    src: '/images/icons/icon-192.png',
    sizes: '192x192',
    type: 'image/png',
  },{
    src: '/images/icons/icon-512.png',
    sizes: '512x512',
    type: 'image/png',
  },{
    src: '/images/icons/icon-1024.png',
    sizes: '1024x1024',
    type: 'image/png',
  }]
} as Partial<ManifestOptions>;