import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { userData } from '../../models/userData';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) { }
  
  register(registerData: userData): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, registerData);
  }

  verifyEmail(token: string): Observable<{ messageKey: string }> {
    return this.http.get<{ messageKey: string }>(`${this.apiUrl}/verify?token=${token}`);
  }

  resendVerificationEmail(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resend-verification`, { email });
  }

  login(email: string, password: string): Observable<any>{
      return this.http.post<{ token: string, user: any }>(`${this.apiUrl}/login`, { email, password })
        .pipe(tap(res => {
          localStorage.setItem('token', res.token);
        }));
  }

  getToken() {
    return localStorage.getItem('token');
  }
}
