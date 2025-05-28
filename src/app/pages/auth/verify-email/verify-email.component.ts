import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [RouterModule, ButtonModule, TranslateModule, ToastModule],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss',
  providers: [MessageService]
})
export class VerifyEmailComponent {
  message = '';
  error = '';

  constructor(private authService: AuthService, private translate: TranslateService, private messageService: MessageService) { }
  
  resendVerificationEmail(): void {
    const email = localStorage.getItem('email');
    if (!email) {
      console.error('No email found in local storage.');
      return;
    } else {
      this.authService.resendVerificationEmail(email).subscribe({
        next: (res) => {
          this.message = this.translate.instant(res.messageKey);
          this.error = '';
          this.messageService.add({
            severity: 'success',
            summary: this.message,
            detail: this.translate.instant('VERIFY_EMAIL.RESEND.SUCCESS_TEXT')
          });
        },
        error: (err) => {
          this.error = this.translate.instant(err.error.messageKey);
          this.message = '';
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('VERIFY_EMAIL.RESEND.ERROR'),
            detail: this.error
          });
        }
      });
    }
  }
}
