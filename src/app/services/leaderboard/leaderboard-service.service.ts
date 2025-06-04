import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ScoreData } from '../../models/userData';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private apiUrl = 'http://localhost:3000/api/leaderboard';
  constructor(private http: HttpClient) { }

  submitScore(scoreData: ScoreData): Observable<{ messageKey: string }> {
    return this.http.post<{ messageKey: string }>(`${this.apiUrl}`, scoreData);
  }
}
