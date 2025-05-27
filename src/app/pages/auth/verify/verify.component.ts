import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  templateUrl: './verify.component.html',
  styleUrl: './verify.component.scss'
})
export class VerifyComponent {
  message = '';
  isSuccess = false;
  isToken = true;

  constructor(
    private route: ActivatedRoute, 
    private http: HttpClient, 
    private authService: AuthService,
    private translate: TranslateService) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];

      if (token) {
        this.authService.verifyEmail(token)
          .subscribe({
            next: (res) => {
              this.message =this.translate.instant(res.messageKey);
              this.isSuccess = true;
            },
            error: (err) => {
              this.message = this.translate.instant(err.error.messageKey);
              this.isSuccess = false;
            }
          });
      } else {
        this.isToken = false;
        this.isSuccess = false;
      }
    });
  }
}
