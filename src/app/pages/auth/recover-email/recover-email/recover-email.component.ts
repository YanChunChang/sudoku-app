import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-recover-email',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, CommonModule, ButtonModule, RouterModule],
  templateUrl: './recover-email.component.html',
  styleUrl: './recover-email.component.scss'
})
export class RecoverEmailComponent {
  form! : FormGroup;
  isSubmitted: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private authService: AuthService,
    private router: Router
  ){}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  recover(){
    if(this.form.invalid) return;

    this.isSubmitted = true;
    const form = this.form.getRawValue();

    this.authService.resetPassword(form.email).subscribe({
      next: (res) =>{

      },
      error: (err) =>{

      }
    })
  }
}