import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { TimerMode } from '../../utils/utils';

@Injectable({
  providedIn: 'root'
})
export class LocalTimerService {
  private time$ = new BehaviorSubject<number>(0);
  private subscription: Subscription | null = null;
  private currentTime: number = 0;
  private mode!: TimerMode;
  private pausedSubject = new BehaviorSubject<boolean>(false);

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
      });
    } else {
      this.subscription = interval(1000).subscribe(() => {
        if (this.currentTime > 0) {
          this.currentTime--;
          this.time$.next(this.currentTime);
        } else {
          this.pause();
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

  //Stop timer completely for winning the game
  stop() {
    if(this.subscription){
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    // this.currentTime = 0;
    // this.time$.next(0);
    this.pausedSubject.next(false);
  }

  setPaused(state: boolean) {
    this.pausedSubject.next(state);
  }

  get timeObservable() {
    return this.time$.asObservable();
  }

  get isPausedObservable() {
    return this.pausedSubject.asObservable();
  }

}
