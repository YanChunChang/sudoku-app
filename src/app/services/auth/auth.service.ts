import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
}
