import { Routes } from '@angular/router';
import { SudokuBoardComponent } from './components/sudoku-board/sudoku-board.component';
import { WelcomePageComponent } from './components/welcome-page/welcome-page.component';

export const routes: Routes = [{
    path:'',
    component: WelcomePageComponent
  },
  {
    path:'sudoku',
    component: SudokuBoardComponent
  },];
