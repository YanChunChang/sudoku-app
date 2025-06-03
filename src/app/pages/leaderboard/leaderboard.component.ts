import { ChangeDetectorRef, Component } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectButton } from 'primeng/selectbutton';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { TranslateModule, TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [TableModule, ButtonModule, CommonModule, FormsModule, MultiSelectModule, TranslateModule],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss'
})
export class LeaderboardComponent {
  products =[];

  cols: {field: string, header: string;}[] = [];
  selectedColumns: { field: string; header: string; }[] = [];

  constructor(private cd: ChangeDetectorRef, private translate: TranslateService) {}

  ngOnInit() {
      // this.productService.getProductsMini().then((data) => {
      //     this.products = data;
      //     this.cd.markForCheck();
      // });
      
      this.cols = [
          { field: 'name' , header: this.translate.instant('LEADERBOARD.NAME') },
          { field: 'Playmode', header: this.translate.instant('LEADERBOARD.PLAYMODE') },
          { field: 'gameType', header: this.translate.instant('LEADERBOARD.GAMETYPE') },
          { field: 'level', header: this.translate.instant('LEADERBOARD.LEVEL') },
          { field: 'palyingTime', header: this.translate.instant('LEADERBOARD.PLAYINGTIME') },
          { field: 'date', header: this.translate.instant('LEADERBOARD.DATE') },
      ];
      console.log(this.translate.instant('LEADERBOARD.NAME'));
      this.selectedColumns = this.cols;
  }
}
