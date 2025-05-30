import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule, ButtonModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  form!: FormGroup;
  isLogginIn = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
    ){}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
     email: ['', [Validators.required, Validators.email]],
     password: ['', Validators.required]
    });
  }

  login(){
    this.isLogginIn = true;
    const form = this.form.getRawValue();
    this.authService.login(form.email, form.password).subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err) =>{
        console.log(err);
      }
    })

    this.isLogginIn = false;
    this.router.navigate(['/'])
  }

}
