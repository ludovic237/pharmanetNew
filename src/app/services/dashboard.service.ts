import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {
  AlertsDto, CategorySales, KpiDto, OrderRow,
  SalesMonthlyPoint, StockAlertRow, TopProduct
} from './../model/data';

import {environment} from '../../environments/environment';

@Injectable({providedIn: 'root'})
export class DashboardService {
  private base = `${environment.url}/api/dashboard`;

  constructor(private http: HttpClient) {
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  kpis(from: string, to: string): Observable<KpiDto> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<KpiDto>(`${this.base}/kpis`, {params, headers: this.getHeaders()});
  }

  salesMonthly(from: string, to: string): Observable<SalesMonthlyPoint[]> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<SalesMonthlyPoint[]>(`${this.base}/sales-monthly`, {params, headers: this.getHeaders()});
  }

  salesByCategory(from: string, to: string): Observable<CategorySales[]> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<CategorySales[]>(`${this.base}/sales-by-category`, {params, headers: this.getHeaders()});
  }

  topProducts(limit: number, from: string, to: string): Observable<TopProduct[]> {
    const params = new HttpParams()
      .set('limit', limit)
      .set('from', from)
      .set('to', to);
    return this.http.get<TopProduct[]>(`${this.base}/top-products`, {params, headers: this.getHeaders()});
  }

  ordersRecent(page = 0, size = 10): Observable<OrderRow[]> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<OrderRow[]>(`${this.base}/orders-recent`, {params, headers: this.getHeaders()});
  }

  stockAlerts(low = 10, days = 30, limit = 20): Observable<StockAlertRow[]> {
    const params = new HttpParams()
      .set('low', low)
      .set('days', days)
      .set('limit', limit);
    return this.http.get<StockAlertRow[]>(`${this.base}/stock-alerts`, {params, headers: this.getHeaders()});
  }
}
