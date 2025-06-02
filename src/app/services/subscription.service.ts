import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {Subscription} from '../model/data';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private apiUrl = '/api/subscriptions';

  constructor(private http: HttpClient) {
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getSubscriptions(): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(this.apiUrl, {headers: this.getHeaders()});
  }

  getSubscriptionByITenantId(tenantId: number): Observable<any> {
    return this.http.get<Subscription>(`${this.apiUrl}/tenant/${tenantId}/info`, {headers: this.getHeaders()});
  }

  getSubscriptionById(id: number): Observable<Subscription> {
    return this.http.get<Subscription>(`${this.apiUrl}/${id}`, {headers: this.getHeaders()});
  }

  createSubscription(subscription: Subscription): Observable<Subscription> {
    return this.http.post<Subscription>(this.apiUrl, subscription, {headers: this.getHeaders()});
  }

  processPayment(subscription: any): Observable<Subscription> {
    return this.http.post<Subscription>(this.apiUrl + '/process-payment', subscription, {headers: this.getHeaders()});
  }

  processMultiplePayment(subscription: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/process-payment/multiple', subscription, {headers: this.getHeaders()});
  }

  updateSubscription(id: number, subscription: Subscription): Observable<Subscription> {
    return this.http.put<Subscription>(`${this.apiUrl}/${id}`, subscription, {headers: this.getHeaders()});
  }

  deleteSubscription(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {headers: this.getHeaders()});
  }


  canceledSubscription(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/canceled/${id}`, {headers: this.getHeaders()});
  }

  saveSubscriptionsTenantWithInvoice(data: any): Observable<Subscription> {
    return this.http.post<Subscription>(`${this.apiUrl}/tenant/save-subscriptions`, data, {headers: this.getHeaders()});
  }

  getSubscriptionFormattedData(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/get-subscription`, {headers: this.getHeaders()});
  }

  updateSubscriptionStatus(id: number, status: string): Observable<any> {
    const url = `${this.apiUrl}/${id}/status`;
    const body = {status: status};
    return this.http.put<any>(url, body, {headers: this.getHeaders()});
  }
}
