import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { userData } from '../../../models/userData';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule, ButtonModule, TranslateModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  form!: FormGroup;
  isSignedIn = false;
  message = '';
  error = '';

  constructor(
    private formBuilder: FormBuilder, 
    private authService: AuthService, 
    private translate: TranslateService,
    private router: Router) { 
    this.form = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
     });
  }
  
  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSignedIn = true;
    const form = this.form.getRawValue();

    const registerData: userData = {
      name: form.username,
      email: form.email,
      password: form.password
    };

    this.authService.register(registerData).subscribe({
      next: (res) => {
        localStorage.setItem('email', res.email);
        this.message = this.translate.instant(res.messageKey);
        this.error = '';
        this.form.reset();
        this.router.navigate(['/verifyemail']);
      },
      error: (err) => {
        this.error = this.translate.instant(err.error.messageKey);
        this.message = '';
      },
      complete: () => {
        this.isSignedIn = false;
      }
    });
  }
}
