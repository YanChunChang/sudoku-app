import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { TimerMode, formattedTime } from '../../utils/utils';

@Injectable({
  providedIn: 'root'
})
export class LocalTimerService {
  private time$ = new BehaviorSubject<number>(0);
  private subscription: Subscription | null = null;
  private currentTime: number = 0;
  private mode!: TimerMode;
  private pausedSubject = new BehaviorSubject<boolean>(false);
  private gameLostSubject = new BehaviorSubject<boolean>(false);
  gameLost$ = this.gameLostSubject.asObservable();

  start(mode: TimerMode, startFrom: number) {
    if (this.subscription?.closed === false) return;

    this.mode = mode;
    if (this.currentTime === 0) {
      this.currentTime = startFrom;
    }

    this.pausedSubject.next(false);

    if (mode === "up") {
      this.subscription = interval(1000).subscribe(() => {
        this.currentTime++;
        this.time$.next(this.currentTime);
        localStorage.setItem('currentTime', this.currentTime.toString());
      });
    } else {
      this.subscription = interval(1000).subscribe(() => {
        if (this.currentTime > 0) {
          this.currentTime--;
          this.time$.next(this.currentTime);
          localStorage.setItem('currentTime', this.currentTime.toString());
        } else {
          this.pause();
          this.gameLostSubject.next(true);
        }
      });
    }
  }

  pause() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
      this.pausedSubject.next(true);
    }
  }

  reset() {
    this.pause();
    this.currentTime = this.mode === 'up' ? 0 : this.currentTime;
    this.start(this.mode, this.currentTime);
  }

  resetGameOver(){
    this.gameLostSubject.next(false);
  }

  //Stop timer completely for winning the game
  stop(isAppNavigation: boolean) {
    if(this.subscription){
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    //if route changed, then remove currentTime from localstorage
    if (isAppNavigation) {
      localStorage.removeItem('currentTime');
    }
    this.pausedSubject.next(false);
  }

  setPaused(state: boolean) {
    this.pausedSubject.next(state);
  }

  initialize(mode: TimerMode, startFrom: number, loadStorage: boolean = false) {
    if (loadStorage) {
      const savedTime = localStorage.getItem('currentTime');
      this.currentTime = savedTime !== null ? parseInt(savedTime, 10) : startFrom;
    } else {
      this.currentTime = startFrom;
    }
    this.start(mode, this.currentTime);
  }
  
  getCurrentTime(){
    formattedTime(this.currentTime);
    return this.currentTime;
  }

  get timeObservable() {
    return this.time$.asObservable();
  }

  get isPausedObservable() {
    return this.pausedSubject.asObservable();
  }

}
