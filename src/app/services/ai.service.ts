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

  replenishment(produitId: number,
                lead = 7,
                history_days = 180,
                target = 21): Observable<any> {
    const params = new HttpParams()
      .set('lead_time_days', lead)
      .set('target_coverage_days', target)
      .set('history_days', history_days);
    return this.http.get(`${API}/replenishment/${produitId}`, {params});
  }

  lowStock(threshold = 5, limit = 100): Observable<any> {
    const params = new HttpParams()
      .set('threshold', threshold)
      .set('limit', limit);
    return this.http.get(`${API}/alerts/low-stock`, {params});
  }

  recommendations(forProduitId?: number, top?: number, limitBaskets?: number,): Observable<any> {
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
    page: number = 0,
    size: number = 360,
    horizon_days: number = 100,
    search: string = null,
  ): Observable<any> {
    let params = new HttpParams();
    if (page != null) params = params.set('page', page);
    if (size != null) params = params.set('size', size);
    if (horizon_days != null) params = params.set('horizon_days', horizon_days);
    // if (search != null) params = params.set('search', search);
    return this.http.get(`${API}/optimize-dashboard`, {params});
  }

  optimizeBestSell(
    lastSell: number = 100,
    page: number = 0,
    size: number = 10,
    topProductNumberInBasket: number = 100,
    totalProductNumber: number = 0,
  ): Observable<any> {
    let params = new HttpParams();
    if (lastSell != null) params = params.set('last_sell', lastSell);
    if (topProductNumberInBasket != null) params = params.set('top_product_number_in_basket', topProductNumberInBasket);
    if (totalProductNumber != null) params = params.set('total_product_number', totalProductNumber);
    if (page != null) params = params.set('page', page);
    if (size != null) params = params.set('size', size);
    return this.http.get(`${API}/optimize/best-sell`, {params});
  }

  optimizeBestSellRange(
    lastSell: number = 100,
    supprimer: number = 0,
    start: string = "2022-12-14",
    end: string = "2025-12-14",
    topProductNumberInBasket: number = 100,
    totalProductNumber: number = 0,
  ): Observable<any> {
    let params = new HttpParams();
    if (lastSell != null) params = params.set('last_sell', lastSell);
    if (topProductNumberInBasket != null) params = params.set('top_product_number_in_basket', topProductNumberInBasket);
    if (totalProductNumber != null) params = params.set('total_product_number', totalProductNumber);
    if (start != null) params = params.set('start', start);
    if (end != null) params = params.set('end', end);
    if (supprimer != null) params = params.set('supprimer', supprimer);
    return this.http.get(`${API}/optimize/best-sell-range`, {params});
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


  topProducts(limit: number = 10, from: string = "2022-12-14", to: string = "2025-12-14"): Observable<any[]> {
    const params = new HttpParams()
      .set('limit', limit)
      .set('from', from)
      .set('to', to);
    return this.http.get<any[]>(`${base}/top-products`, {params, headers: this.getHeaders()});
  }

  optimizeDashboardNew(
  ): Observable<any> {
    let params = new HttpParams();
    return this.http.get(`${API}/optimize-dashboard`, {params});
  }
}
