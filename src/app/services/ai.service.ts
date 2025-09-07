import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = '/api/v1/ai';

@Injectable({ providedIn: 'root' })
export class AiService {
  constructor(private http: HttpClient) {}

  forecast(produitId: number, horizonDays = 14, historyDays = 180): Observable<any> {
    const params = new HttpParams()
      .set('horizon_days', horizonDays)
      .set('history_days', historyDays);
    return this.http.get(`${API}/forecast/${produitId}`, { params });
  }

  replenishment(produitId: number, lead = 7, target = 21): Observable<any> {
    const params = new HttpParams()
      .set('lead_time_days', lead)
      .set('target_coverage_days', target);
    return this.http.get(`${API}/replenishment/${produitId}`, { params });
  }

  lowStock(threshold = 5, limit = 100): Observable<any> {
    const params = new HttpParams()
      .set('threshold', threshold)
      .set('limit', limit);
    return this.http.get(`${API}/alerts/low-stock`, { params });
  }

  recommendations(forProduitId?: number): Observable<any> {
    let params = new HttpParams();
    if (forProduitId != null) params = params.set('for_produit_id', forProduitId);
    return this.http.get(`${API}/recommendations`, { params });
  }

  anomalies(produitId: number, days = 180): Observable<any> {
    const params = new HttpParams().set('produit_id', produitId).set('days', days);
    return this.http.get(`${API}/anomalies/sales`, { params });
  }

  optimizeDashboard(): Observable<any> {
    return this.http.get(`${API}/optimize/dashboard`);
  }
}
