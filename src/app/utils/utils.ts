export type TimerMode = 'up' | 'down';

export function pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

export function formattedTime(elapsedSeconds: number): string {
    const hour = Math.floor(elapsedSeconds / 3600);
    let restTime = elapsedSeconds - hour * 3600;
    const minutes = Math.floor(restTime / 60);
    const seconds = elapsedSeconds % 60;
    return `${pad(hour)}:${pad(minutes)}:${pad(seconds)}`;
  }