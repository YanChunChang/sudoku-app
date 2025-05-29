import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule, ButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  form!: FormGroup;
  isLogginIn = false;
  isRecoveringPassword = false;

  constructor(
    private formBuilder: FormBuilder, 
    ){}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
     email: ['', [Validators.required, Validators.email]],
     password: ['', Validators.required]
    });
  }

  login(){
    this.isLogginIn = true;
    this.isLogginIn = false;
  }

  recoverPassword(){
    this.isRecoveringPassword = true;
    this.isRecoveringPassword = false;
  }
}
