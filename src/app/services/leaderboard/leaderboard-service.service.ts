import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ScoreData } from '../../models/userData';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private apiUrl = `${environment.apiUrl}/leaderboard`;
  constructor(private http: HttpClient, private authService: AuthService) { }

  submitScore(scoreData: ScoreData, isLoggedIn: boolean): Observable<any> {
    if (isLoggedIn) {
      // registered → take Token
      const token = this.authService.getToken();
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });
      return this.http.post(`${this.apiUrl}`, scoreData, { headers });
    } else {
      // guest → send data to /guest without Header
      return this.http.post(`${this.apiUrl}/guest`, scoreData);
    }
  }

  getLeaderboard(playerMode: string, playMode: string, level: string, limit: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`, {
      params: {
        playerMode,
        playMode,
        level,
        limit: limit.toString()
      }
    });
  }
}
