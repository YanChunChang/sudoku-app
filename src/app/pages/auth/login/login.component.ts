import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../services/auth/auth.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule, ButtonModule, TranslateModule, ToastModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [MessageService]
})
export class LoginComponent {
  form!: FormGroup;
  isLogginIn = false;
  message = '';
  error = '';
  notVerified = false;
  emailNotFound = false;
  invalidPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    private translate: TranslateService,
    ){}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
     email: ['', [Validators.required, Validators.email]],
     password: ['', Validators.required]
    });
  }

  login(){
    if (this.form.invalid) return;

    this.isLogginIn = true;
    const form = this.form.getRawValue();

    this.authService.login(form.email, form.password).subscribe({
      next: (res) => {
        this.message = this.translate.instant(res.messageKey);
        this.messageService.add({
          severity: 'success',
          summary: this.message,
          detail: this.translate.instant('LOGIN.SUCCESS_TEXT'),
          life: 5000
        });
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 2000);
      },
      error: (err) =>{
        const messageKey = err.error.messageKey;

        this.notVerified = messageKey === 'LOGIN.NOT_VERIFIED';
        this.emailNotFound = messageKey === 'LOGIN.EMAIL_NOT_FOUND';
        this.invalidPassword = messageKey === 'LOGIN.INVALID_PASSWORD';

        this.error = this.translate.instant(err.error.messageKey);
        this.message = '';
        this.isLogginIn = false;
      }
    })
  }

}
