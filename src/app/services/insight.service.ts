import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from "../../environments/environment";

export interface KPI {
  label: string;
  value: number | string;
  deltaPct?: number;
  up?: boolean;
}

export interface MonthlySales {
  months: string[];
  current: number[];
  previous: number[];
}

export interface WeeklySeasonality {
  weekLabels: string[];
  actual: number[];
  mean: number[];
}

export interface CategorySlice {
  category: string;
  value: number;
  percent: number;
}

export interface DailySales {
  labels: string[];
  totals: number[];
  total7: number;
  avgPerDay: number;
}

@Injectable({providedIn: 'root'})
export class InsightService {
  private base = environment.url + '/api/insights';
  private baseDashboard = environment.url + '/api/dashboard';

  constructor(private http: HttpClient) {
  }

  kpis(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/kpis?days=30`);
  }

  monthlySales(): Observable<any> {
    return this.http.get<any>(`${this.baseDashboard}/sales-monthly?from=2022-12-14&to=2025-12-14`);
  }

  weeklySeasonality(weeks = 160): Observable<any> {
    const params = new HttpParams().set('weeks', weeks);
    return this.http.get<any>(`${this.base}/weekly-seasonality`, {params});
  }

  weeklySeasonalityRange(start: string, end: string): Observable<any> {
    const params = new HttpParams()
      .set('start', start)
      .set('end', end);
    return this.http.get<any>(`${this.base}/weekly-seasonality/range`, {params});
  }

  salesByCategory(days = 30, from: string, to: string): Observable<any[]> {
    const params = new HttpParams().set('days', days);
    params.set("from", from);
    params.set("to", to);
    return this.http.get<any[]>(`${this.base}/sales-by-category?start=${from}&end=${to}`, {params});
  }

  dailySales(): Observable<any> {
    return this.http.get<any>(`${this.base}/daily_sales?produit_id=1001&horizon_days=360&history_days=360`);
  }
}
