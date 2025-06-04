import { ChangeDetectorRef, Component } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { LeaderboardService } from '../../services/leaderboard/leaderboard-service.service';
import { formattedTime } from '../../utils/utils';


@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [TableModule, ButtonModule, CommonModule, FormsModule, MultiSelectModule, TranslateModule],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss'
})
export class LeaderboardComponent {
  players: any[] = [];
  cols: { field: string, header: string; }[] = [];
  selectedColumns: { field: string; header: string; }[] = [];

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
        this.players = data;
        console.log(this.players);
      });

    });


    this.cols = [
      { field: 'nickname', header: this.translate.instant('LEADERBOARD.NAME') },
      { field: 'playerMode', header: this.translate.instant('LEADERBOARD.PLAYMODE') },
      { field: 'playMode', header: this.translate.instant('LEADERBOARD.GAMETYPE') },
      { field: 'level', header: this.translate.instant('LEADERBOARD.LEVEL') },
      { field: 'time', header: this.translate.instant('LEADERBOARD.PLAYINGTIME') },
      { field: 'date', header: this.translate.instant('LEADERBOARD.DATE') },
    ];
    this.selectedColumns = [...this.cols];
  }

  formattTime(seconds: number): string{
    return formattedTime(seconds);
  }
}
