export function getYotubeId(url: string) {
  const match = url.match(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/);
  return (match && match[7].length == 11) ? match[7] : null;
}

export function isUrl(url: string) {
  const regExp = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/
  return regExp.test(url);
}


const timeouts: { [key: string]: number } = {};
export function debounce(key: string, fn: () => void, delay: number = 500) {
  if (timeouts[key]) {
    clearTimeout(timeouts[key]);
  }
  timeouts[key] = setTimeout(fn, delay);
}