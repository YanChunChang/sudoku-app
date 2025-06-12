import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { UserData } from '../../models/userData';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private loggedIn = new BehaviorSubject<boolean>(localStorage.getItem('token') ? true : false);
  public isLoggedIn$ = this.loggedIn.asObservable();


  constructor(private http: HttpClient, private router: Router) { }

  register(registerData: UserData): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, registerData);
  }

  verifyEmail(token: string): Observable<{ messageKey: string }> {
    return this.http.get<{ messageKey: string }>(`${this.apiUrl}/verify?token=${token}`);
  }

  resendVerificationEmail(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resend-verification`, { email });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<{ token: string, user: any }>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('username', res.user.name);
        this.loggedIn.next(true);
      }));
  }

  recoverEmail(email: string): Observable<{ messageKey: string }> {
    return this.http.post<{ messageKey: string }>(`${this.apiUrl}/login/recover-email`, { email })
  }

  resetPassword(token: string, newPassword: string) {
    return this.http.post<{ messageKey: string }>(`${this.apiUrl}/reset-password`, { token, newPassword });
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('token') ? true : false;
 }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.loggedIn.next(false);
    this.router.navigate(['/']);
  }


}
