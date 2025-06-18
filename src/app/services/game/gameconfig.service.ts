import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GameConfigService {
  public selectedMode: 'single' | 'multi' | null = null;
  public selectedChallenge: 'normal' | 'countdown' | null = null;
  public selectedLevel: 'easy' | 'medium' | 'hard' | 'expert' | null = null;
  public countdownTime = new Map<string, number> ([
    ['easy', 600],
    ['medium', 1200],
    ['hard', 1800],
    ['expert', 2400],
  ]);
}
