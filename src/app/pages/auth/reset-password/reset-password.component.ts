import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../services/auth/auth.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule, ReactiveFormsModule, ButtonModule, ToastModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  providers: [MessageService]
})
export class ResetPasswordComponent {
  form!: FormGroup;
  isSubmitted = false;
  error = '';
  message = '';
  isToken = true;
  token: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];

      if (!this.token) {
        this.message = this.translate.instant('RESET_PASSWORD.INVALID_TOKEN');
      }
    });

    this.form = this.formBuilder.group({
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    console.log(this.form.status);
    this.form.statusChanges.subscribe(status => console.log('Form status:', status));

  }

  passwordMatchValidator(form: FormGroup) {

    const passwordControl = form.get('newPassword');
    const confirmPasswordControl = form.get('confirmPassword');

    if (!passwordControl || !confirmPasswordControl) {
      return null;
    }

    const password = passwordControl.value;
    const confirmPassword = confirmPasswordControl.value;

    if (password !== confirmPassword) {
      confirmPasswordControl.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      // Remove error when match is correct:
      if (confirmPasswordControl.hasError('mismatch')) {
        confirmPasswordControl.setErrors(null);
      }
      return null;
    }
  }

  resetPassword() {
    if (this.form.invalid || !this.token) return;

    this.isSubmitted = true;
    const formValue = this.form.getRawValue();

    this.authService.resetPassword(this.token, formValue.newPassword).subscribe({
      next: (res) => {
        this.message = this.translate.instant(res.messageKey);
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('RESET_PASSWORD.SUCCESS'),
          detail: this.message
        });
        this.isSubmitted = false;

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.message = this.translate.instant(err.error.messageKey);
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('RESET_PASSWORD.ERROR'),
          detail: this.message
        });
        this.isSubmitted = false;
      }
    });
  }
}
