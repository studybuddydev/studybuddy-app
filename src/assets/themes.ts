export const themes: {
  [id: string]: {
    dark: boolean,
    colors: {
      background: string,
      surface: string,
      primary: string,
      secondary: string,
      accent?: string,
      error?: string,
      info?: string,
      success?: string,
      warning?: string,
      snake?: string,
    }
  }
} = {

  gptnight: {
    dark: true,
    colors: {
      background: '#1C1C1C',
      surface: '#252525',
      primary: '#0077C2',
      secondary: '#FF7600',
      accent: '#FFA500 ',
      error: '#FF3333',
      warning: '#FFD700'
      // info: '#00BFFF',
      // success: '#00CC66',
    }
  },

  gptday: {
    dark: false,
    colors: {
      background: '#F5F5F5',
      surface: '#FFFFFF',
      primary: '#0077C2',
      secondary: '#FFA500',
      accent: '#FF7600',
      error: '#FF3333',
      warning: '#FF7600',
      // info: '#00BFFF',
      // success: '#00CC66',
    }
  },

  nord: {
    dark: true,
    colors: {
      background: '#4C566A',
      surface: '#3B4252',
      primary: '#88C0D0',
      secondary: '#5E81AC',
      accent: '#FB8C00',
      error: '#BF616A',
      warning: '#EBCB8B',
      // info: '#B48EAD',
      // success: '#A3BE8C',
    }
  },

  bio: {
    dark: false,
    colors: {
      background: '#f7f2da',
      surface: '#ecead2',
      primary: '#2E4C3D',
      secondary: '#e9c46a',
      accent: '#FB8C00',
      error: '#B00020',
      warning: '#FB8C00',
      // info: '#2196F3',
      // success: '#4CAF50',
    }
  },

  dark: {
    dark: true,
    colors: {
      background: '#212121',
      surface: '#252525',
      primary: '#bb86fc',
      secondary: '#991717',
      accent: '#03dac5',
      snake: '#03dac5',
      error: '#991717',
      warning: '#FFD700',
      // info: '#00BFFF',
      // success: '#00CC66',
    }
  },

  pastel: {
    dark: false,
    colors: {
      background: '#fcfae8',
      surface: '#fff7d0',
      primary: '#caa0ff',
      secondary: '#db5856',
      accent: '#9bf6ff',
      error: '#db5856',
      warning: '#ffd6a5',
      // info: '#9bf6ff',
      // success: '#caffbf',
    }
  },

  purple: {
    dark: true,
    colors: {
      background: '#0F051A',
      surface: '#170c25',
      primary: '#B888EA',
      secondary: '#85186A',
      accent: '#DD4092',
      error: '#FF3333',
    }
  },




  blallo: {
    dark: true,
    colors: {
      background: '#3d58a7',
      surface: '#223c88',
      primary: '#fdd93d',
      secondary: '#e50000',
      accent: '#71e943',
      snake: '#71e943',
      error: '#e50000',
      warning: '#fdd93d',
      // info: '#6dcff6',
      // success: '#82ca9c',
    }
  },

  verdone: {
    dark: false,
    colors: {
      background: '#009999',
      surface: '#094D4E',
      primary: '#FF8749',
      secondary: '#BE0119',
      accent: '#FFB400',
      error: '#BE0119',
      warning: '#FFB400',
      // info: '#2196F3',
      // success: '#4CAF50',
    }
  },

  desert: {
    dark: false,
    colors: {
      background: '#a48557',
      surface: '#cdb996',
      primary: '#537479',
      secondary: '#273736',
      accent: '#cc7025',
      warning: '#cc7025',
      error: '#e50000',
    }
  },

  vaporwave: {
    dark: true,
    colors: {
      background: '#375971',      // Pastel pink
      surface: '#0a0c37',         // Light lavender
      primary: '#ff61c6',         // Neon green
      secondary: '#9600ff',       // Pastel magenta
      accent: '#5cecff',       // Pastel magenta
      snake: '#5cecff',           // Neon green (same as primary)
      // error: '#ff6666',           // Neon red
      // info: '#66ccff',            // Pastel blue
      // success: '#99ff99',         // Light green
      // warning: '#ff9900',         // Pastel yellow
    }
  },

}

const paletteTitles: { [id: string]: string } = {
  "purple": 'Purple',
  "light": 'Light',
  "dark": 'Dark',
  "verdone": 'Verdone',
  "pastel": 'Pastellone',
  "bio": 'Biologico',
  "nord": 'Nordico',
  "blallo": 'Blallo',
  "gptday": 'Day',
  "gptnight": 'Night',
  "vaporwave": 'Vaporwave',
  "desert": 'Desert'
}


export const paletteList = Object.keys(themes).map((key) => ({
  value: key,
  title: paletteTitles[key],
  color: themes[key].colors.primary,
  background: themes[key].colors.background
}))
