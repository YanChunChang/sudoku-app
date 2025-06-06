import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
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


@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [TableModule, ButtonModule, CommonModule, FormsModule, MultiSelectModule, TranslateModule, InputTextModule, SelectModule, IconFieldModule, InputIconModule],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss'
})
export class LeaderboardComponent {
  @ViewChild('dt2') dt2: any;
  players: any[] = [];
  cols: { field: string, header: string; sortable: boolean}[] = [];
  selectedColumns: { field: string; header: string; }[] = [];
  levelOrder = {
    'easy': 1,
    'medium': 2,
    'hard': 3,
    'expert': 4
  };
  

  constructor(
    private route: ActivatedRoute,
    private leaderboardService: LeaderboardService,
    private cd: ChangeDetectorRef,
    private translate: TranslateService) { }


  ngOnInit() {
    // this.productService.getProductsMini().then((data) => {
    //     this.products = data;
    //     this.cd.markForCheck();
    // });
    this.route.queryParams.subscribe(params => {
      const playerMode = params['playerMode'] || '';
      const playMode = params['playMode'] || '';
      const level = params['level'] || '';
      const limit = parseInt(params['limit']) || 50;

      console.log('Loading leaderboard with:', playerMode, playMode, level, limit);

      this.leaderboardService.getLeaderboard(playerMode, playMode, level, limit).subscribe(data => {
        console.log(data)
        this.players = data.map((player, index) => ({
          ...player,
          ranking: index + 1,
          userTypeTranslated: this.translate.instant('LEADERBOARD.' + (player.userType || '').toUpperCase()),
          playerModeTranslated: this.translate.instant('LEADERBOARD.' + (player.playerMode || '').toUpperCase()),
          playModeTranslated: this.translate.instant('LEADERBOARD.' + (player.playMode || '').toUpperCase()),
          levelTranslated: this.translate.instant('LEADERBOARD.' + (player.level || '').toUpperCase()),
        }));
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

  formattTime(seconds: number): string{
    return formattedTime(seconds);
  }

  filterGlobal(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.dt2.filterGlobal(value, 'contains');
  }
  
}
