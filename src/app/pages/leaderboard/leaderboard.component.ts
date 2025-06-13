import { Component, ViewChild } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { LeaderboardService } from '../../services/leaderboard/leaderboard-service.service';
import { formattedTime } from '../../utils/utils';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [TableModule, ButtonModule, CommonModule, FormsModule, MultiSelectModule, TranslateModule, InputTextModule, SelectModule, IconFieldModule, InputIconModule, ToastModule],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss',
  providers: [MessageService]
})
export class LeaderboardComponent {
  @ViewChild('dt2') dt2: any;
  players: any[] = [];
  cols: { field: string, header: string; sortable: boolean }[] = [];
  selectedColumns: { field: string; header: string; }[] = [];
  isCurrentUser: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private leaderboardService: LeaderboardService,
    private translate: TranslateService,
    private messageService: MessageService,) { }


  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const playerMode = params['playerMode'] || '';
      const playMode = params['playMode'] || '';
      const level = params['level'] || '';
      const limit = parseInt(params['limit']) || 50;

      console.log('Loading leaderboard with:', playerMode, playMode, level, limit);

      this.leaderboardService.getLeaderboard(playerMode, playMode, level, limit).subscribe(data => {
        this.players = data.map((player, index) => ({
          ...player,
          ranking: index + 1,
          userTypeTranslated: this.translate.instant('LEADERBOARD.' + (player.userType || '').toUpperCase()),
          playerModeTranslated: this.translate.instant('LEADERBOARD.' + (player.playerMode || '').toUpperCase()),
          playModeTranslated: this.translate.instant('LEADERBOARD.' + (player.playMode || '').toUpperCase()),
          levelTranslated: this.translate.instant('LEADERBOARD.' + (player.level || '').toUpperCase()),
        }));
        const currentUserScore = JSON.parse(localStorage.getItem('lastScore')!);
        console.log('Current user score:', currentUserScore);
        console.log('Players loaded:', this.players);
        const currentUser = this.players.find(player => player._id === currentUserScore.id);
        if (currentUser) {
          console.log('Current user found:', currentUser);
          currentUser.isCurrentUser = true;
        }

        const index = this.players.findIndex(player => player._id === currentUserScore.id);
        if (index !== -1) {
          const pageSize = this.dt2.rows;
          const pageIndex = Math.floor(index / pageSize); // Seite berechnen
        
          setTimeout(() => {
            this.dt2.first = pageIndex * pageSize; // Springt zur richtigen Seite
          }, 0);
        } else {
          console.warn('Current user not found in leaderboard:', currentUserScore.id);
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('LEADERBOARD.NOTFOUND'),
            detail: this.translate.instant('LEADERBOARD.NOTFOUNDDETAIL'),
            life: 3000
          });
        }
      });
    });


    this.cols = [
      { field: 'nickname', header: this.translate.instant('LEADERBOARD.NAME'), sortable: true },
      { field: 'userTypeTranslated', header: this.translate.instant('LEADERBOARD.USER'), sortable: true },
      { field: 'playerModeTranslated', header: this.translate.instant('LEADERBOARD.PLAYMODE'), sortable: true },
      { field: 'playModeTranslated', header: this.translate.instant('LEADERBOARD.GAMETYPE'), sortable: true },
      { field: 'levelTranslated', header: this.translate.instant('LEADERBOARD.LEVEL'), sortable: true },
      { field: 'time', header: this.translate.instant('LEADERBOARD.PLAYINGTIME'), sortable: true },
      { field: 'date', header: this.translate.instant('LEADERBOARD.DATE'), sortable: true },
    ];
    this.selectedColumns = [...this.cols];
  }

  getRowClass(player: any): string {
    return player.isCurrentUser ? 'highlight-row' : '';
  }

  formattTime(seconds: number): string {
    return formattedTime(seconds);
  }

  filterGlobal(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.dt2.filterGlobal(value, 'contains');
  }

}
