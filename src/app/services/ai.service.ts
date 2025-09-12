import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from "../../environments/environment";

const API = environment.url + '/api/ai';
const base = `${environment.url}/api/dashboard`;


@Injectable({providedIn: 'root'})
export class AiService {
  constructor(private http: HttpClient) {
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  forecast(produitId: number, horizonDays = 14, historyDays = 180): Observable<any> {
    const params = new HttpParams()
      .set('horizon_days', horizonDays)
      .set('history_days', historyDays);
    return this.http.get(`${API}/forecast/${produitId}`, {params});
  }

  replenishment(produitId: number, lead = 7, target = 21): Observable<any> {
    const params = new HttpParams()
      .set('lead_time_days', lead)
      .set('target_coverage_days', target);
    return this.http.get(`${API}/replenishment/${produitId}`, {params});
  }

  lowStock(threshold = 5, limit = 100): Observable<any> {
    const params = new HttpParams()
      .set('threshold', threshold)
      .set('limit', limit);
    return this.http.get(`${API}/alerts/low-stock`, {params});
  }

  recommendations(forProduitId?: number,top?: number, limitBaskets?: number,): Observable<any> {
    let params = new HttpParams();
    if (forProduitId != null) params = params.set('for_produit_id', forProduitId);
    if (top != null) params = params.set('top_k', top);
    if (limitBaskets != null) params = params.set('limit_baskets', limitBaskets);
    return this.http.get(`${API}/recommendations`, {params});
  }

  anomalies(produitId: number, days = 180): Observable<any> {
    const params = new HttpParams().set('produit_id', produitId).set('days', days);
    return this.http.get(`${API}/anomalies/sales`, {params});
  }

  optimizeDashboard(
    lastSell: number = 100,
    lastDaySell: number = 360,
    topProductNumberInBasket: number = 100,
    totalProductNumber: number = 0,
    totalQtyConcernerByProduct: number = 100,
  ): Observable<any> {
    let params = new HttpParams();
    if (lastSell != null) params = params.set('last_sell', lastSell);
    if (lastDaySell != null) params = params.set('last_day_sell', lastDaySell);
    if (topProductNumberInBasket != null) params = params.set('top_product_number_in_basket', topProductNumberInBasket);
    if (totalProductNumber != null) params = params.set('total_product_number', totalProductNumber);
    if (totalQtyConcernerByProduct != null) params = params.set('total_qty_concerner_by_product', totalQtyConcernerByProduct);
    return this.http.get(`${API}/optimize/dashboard`, {params});
  }

  associations(limit = 10): Observable<any[]> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<any[]>(`${API}/associations`, {params});
  }

  suggestReplenishment(days = 30): Observable<any[]> {
    const params = new HttpParams().set('days', days);
    return this.http.get<any[]>(`${API}/replenishment`, {params});
  }

  // lowStock(): Observable<LowStockItem[]> {
  //   return this.http.get<LowStockItem[]>(`${API}/low-stock`);
  // }


  topProducts(limit: number=10, from: string="2022-12-14", to: string="2025-12-14"): Observable<any[]> {
    const params = new HttpParams()
      .set('limit', limit)
      .set('from', from)
      .set('to', to);
    return this.http.get<any[]>(`${base}/top-products`, {params, headers: this.getHeaders()});
  }
}
