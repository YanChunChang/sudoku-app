import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  private apiUrl = 'http://localhost:3000';
  constructor(private http: HttpClient) { }
  getBackendMessage(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}
