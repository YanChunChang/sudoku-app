import { Routes } from '@angular/router';
import { SudokuBoardComponent } from './components/sudoku-board/sudoku-board.component';
import { WelcomePageComponent } from './pages/welcome-page/welcome-page.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { VerifyComponent } from './pages/auth/verify/verify.component';
import { VerifyEmailComponent } from './pages/auth/verify-email/verify-email.component';
import { RecoverEmailComponent } from './pages/auth/recover-email/recover-email.component';
import { ResetPasswordComponent } from './pages/auth/reset-password/reset-password.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'sudoku',
    pathMatch: 'full'
  },
  {
    path: 'sudoku/settings',
    component: SettingsComponent
  },
  {
    path: 'sudoku',
    component: WelcomePageComponent
  },
  {
    path: 'sudoku/:player',
    component: WelcomePageComponent
  },
  {
    path: 'sudoku/:player/:playmode',
    component: WelcomePageComponent
  },
  {
    path: 'sudoku/:player/:playmode/:level',
    component: SudokuBoardComponent
  },
  {
    path: 'sudoku/:player/:playmode/:level',
    component: SudokuBoardComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  { 
    path: 'register', 
    component: RegisterComponent 
  },
  { 
    path: 'verify', 
    component: VerifyComponent
  },
  { 
    path: 'verifyemail', 
    component: VerifyEmailComponent 
  },
  {
    path: 'login/recover-email',
    component: RecoverEmailComponent
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent
  },
  // {
  //   path: 'sudoku',
  //   component: WelcomePageComponent,
  //   children: [
  //     {
  //       path: ':player',
  //       children: [
  //         {
  //           path: ':playmode',
  //           children: [
  //           ]
  //         }
  //       ]
  //     }
  //   ]
  // },
];
