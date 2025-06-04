import { Component } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { GameConfigService } from '../../services/game/gameconfig.service';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth/auth.service';
import { TooltipModule } from 'primeng/tooltip';


@Component({
  selector: 'app-welcome-page',
  standalone: true,
  imports: [RouterModule, ButtonModule, CommonModule, TranslateModule, TooltipModule],
  templateUrl: './welcome-page.component.html',
  styleUrl: './welcome-page.component.scss'
})
export class WelcomePageComponent {
  isLoggedIn = false;

  currentPlayer: string | null = null;
  currentPlaymode: string | null = null;
  currentLevel: string | null = null;

  constructor(
    private gameConfigService: GameConfigService, 
    private router: Router, 
    private route: ActivatedRoute,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
    });
    this.route.paramMap.subscribe(params => {
        const player = params.get('playermode');
        const mode = params.get('playmode');
        const level = params.get('level');
  
        if (player === 'single' || player === 'multi') {
          this.currentPlayer = player;
          this.gameConfigService.selectedMode = player;
        }else {
          this.currentPlayer = null;
        }

        this.currentPlaymode = mode;
        this.currentLevel = level;
  
        this.gameConfigService.selectedChallenge = mode === 'normal' || mode === 'countdown' ? mode : null;
        this.gameConfigService.selectedLevel = level === 'easy' || level === 'medium' || level === 'hard' || level === 'expert' ? level : null;
      });
  }

  // getDeepestChild(route: ActivatedRoute): ActivatedRoute {
  //   while (route.firstChild) {
  //     route = route.firstChild;
  //   }
  //   return route;
  // }

  selectMode(mode: 'single' | 'multi') {
    this.gameConfigService.selectedMode = mode;
    this.router.navigate(['/sudoku', this.gameConfigService.selectedMode]);
  }

  selectChallenge(challenge: 'normal' | 'countdown') {
    this.gameConfigService.selectedChallenge = challenge;
    this.router.navigate(['/sudoku', this.gameConfigService.selectedMode, this.gameConfigService.selectedChallenge]);
  }

  goToGame(level: 'easy' | 'medium' | 'hard' | 'expert') {
    this.gameConfigService.selectedLevel = level;

    this.router.navigate(['/sudoku', this.gameConfigService.selectedMode, this.gameConfigService.selectedChallenge,
    this.gameConfigService.selectedLevel]);

  }
  
  resetSelectedMode(): void {
    this.gameConfigService.selectedMode = null;
    this.router.navigate(['/sudoku']);
  }
  
  resetSelectedChallenge(): void {
    this.gameConfigService.selectedChallenge = null;
    this.router.navigate(['/sudoku', this.gameConfigService.selectedMode]);
  }
  
  onClickSettings() {
    this.router.navigate(['/sudoku/settings']);
  }
}
