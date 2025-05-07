import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss'
})
export class TimerComponent {
  elapsedSeconds: number = 0;
  timerSubscription!: Subscription;
  isRunning: boolean = false;

  startTimer() {
    if (this.timerSubscription?.closed === false) return;
    this.isRunning = true;
    this.timerSubscription = interval(1000).subscribe(() => {
      this.elapsedSeconds++;
    });
  }

  stopTimer() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    this.isRunning = false;
  }

  resetTimer() {
    this.stopTimer();
    this.elapsedSeconds = 0;
    this.startTimer();
  }

  get formattedTime(): string {
    const hour = Math.floor(this.elapsedSeconds / 360);
    let restTime = this.elapsedSeconds - hour * 360;
    const minutes = Math.floor(restTime / 60);
    const seconds = this.elapsedSeconds % 60;
    return `${this.pad(hour)}:${this.pad(minutes)}:${this.pad(seconds)}`;
  }


  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  ngOnDestroy() {
    this.stopTimer();
  }
}
