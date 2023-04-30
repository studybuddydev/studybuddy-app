export const themes = {
  verdone: {
    dark: false,
    colors: {
      background: '#009999',
      surface: '#094D4E',
      primary: '#FF7600',
      'primary-darken-1': '#ffffff',
      secondary: '#E7DB37',
      'secondary-darken-1': '#018786',
      error: '#B00020',
      info: '#2196F3',
      success: '#4CAF50',
      warning: '#FB8C00',
    }
  },
  pastel: {
    dark: false,
    colors: {
      background: '#fffffc',
      surface: '#fffff0',
      primary: '#ffc6ff',
      'primary-darken-1': '#bdb2ff',
      secondary: '#caffbf',
      'secondary-darken-1': '#9bf6ff',
      error: '#ffadad',
      info: '#9bf6ff',
      success: '#caffbf',
      warning: '#ffd6a5',
    }
  },
  bio: {
    dark: false,
    colors: {
      background: '#fefae0',
      surface: '#fefae0',
      primary: '#606c38',
      'primary-darken-1': '#283618',
      secondary: '#dda15e',
      'secondary-darken-1': '#bc6c25',
      error: '#B00020',
      info: '#2196F3',
      success: '#4CAF50',
      warning: '#FB8C00',
    }
  },
  nord: {
    dark: false,
    colors: {
      background: '#4C566A',
      surface: '#3B4252',
      primary: '#88C0D0',
      'primary-darken-1': '#8FBCBB',
      secondary: '#5E81AC',
      'secondary-darken-1': '#81A1C1',
      error: '#BF616A',
      info: '#B48EAD',
      success: '#A3BE8C',
      warning: '#EBCB8B',
    }
  },
  blallo: {
    dark: true,
    colors: {
      background: '#3d58a7',
      surface: '#223c88',
      primary: '#fdd93d',
      'primary-darken-1': '#d4b22e',
      secondary: '#71e943',
      'secondary-darken-1': '#45a421',
      error: '#ff6868',
      info: '#6dcff6',
      success: '#82ca9c',
      warning: '#bd8cbf',
    }
  },
  gptday: {
    dark: false,
    colors: {
      background: '#F5F5F5',
      surface: '#FFFFFF',
      primary: '#0077C2',
      'primary-darken-1': '#005DA6',
      secondary: '#FFA500',
      'secondary-darken-1': '#FF8C00',
      error: '#FF3333',
      info: '#00BFFF',
      success: '#00CC66',
      warning: '#FFD700',
    }
  },
  gptnight: {
    dark: true,
    colors: {
      background: '#1C1C1C',
      surface: '#252525',
      primary: '#0077C2',
      'primary-darken-1': '#005DA6',
      secondary: '#FFA500',
      'secondary-darken-1': '#FF8C00',
      error: '#FF3333',
      info: '#00BFFF',
      success: '#00CC66',
      warning: '#FFD700',
    }
  }
}

export const themeList = [
  { value: 'light', title: 'Light', color: 'white' },
  { value: 'dark', title: 'Dark', color: 'black' },
  { value: 'verdone', title: 'Verdone', color: '#207178' },
  { value: 'pastel', title: 'Pastellone', color: '#ffc6ff' },
  { value: 'bio', title: 'Biologico', color: '#606c38' },
  { value: 'nord', title: 'Nordico', color: '#88C0D0' },
  { value: 'blallo', title: 'Blallo', color: '#fdd93d' },
  { value: 'gptday', title: 'GPT Day', color: '#0077C2' },
  { value: 'gptnight', title: 'GPT Night', color: '#005DA6' },
]