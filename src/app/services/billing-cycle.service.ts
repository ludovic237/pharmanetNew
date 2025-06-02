import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BillingCycleService {
  private apiUrl = '/api/admin/billing-cycle';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getBillingCycles(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl,{headers: this.getHeaders()});
  }

  getBillingCyclesDetails(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl+"/details",{headers: this.getHeaders()});
  }

  getBillingCyclesDetailsFilter(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl+"/filter",{headers: this.getHeaders()});
  }

  getBillingCycleById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`,{headers: this.getHeaders()});
  }

  createBillingCycle(billingCycle: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, billingCycle,{headers: this.getHeaders()});
  }

  updateBillingCycle(id: number, billingCycle: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, billingCycle,{headers: this.getHeaders()});
  }

  deleteBillingCycle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`,{headers: this.getHeaders()});
  }
}
