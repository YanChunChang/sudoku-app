import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-recover-email',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, CommonModule, ButtonModule, RouterModule, ToastModule],
  templateUrl: './recover-email.component.html',
  styleUrl: './recover-email.component.scss',
  providers: [MessageService]
})
export class RecoverEmailComponent {
  form!: FormGroup;
  isSubmitted: boolean = false;
  emailSent: boolean = false;
  emailNotFound : boolean = false;
  error: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  recover() {
    if (this.form.invalid) return;

    this.isSubmitted = true;
    const form = this.form.getRawValue();

    this.authService.recoverEmail(form.email).subscribe({
      next: (res) => {
        this.isSubmitted = false;
        this.emailSent = true;
      },
      error: (err) => {
        const messageKey = err.error.messageKey;

        this.emailNotFound = messageKey === 'FORGOT_PASSWORD.EMAIL_NOT_FOUND';
        this.error = this.translate.instant(err.error.messageKey);

        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('FORGOT_PASSWORD.ERROR'),
          detail: this.translate.instant(messageKey)
        });

        this.isSubmitted = false;
      }
    })
  }
}