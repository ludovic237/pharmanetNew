import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentLineService {
  private apiUrl = '/api/admin/payment-lines';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getPaymentLines(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl,{headers: this.getHeaders()});
  }

  getPaymentLineById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`,{headers: this.getHeaders()});
  }

  createPaymentLine(paymentLine: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, paymentLine,{headers: this.getHeaders()});
  }

  updatePaymentLine(id: number, paymentLine: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, paymentLine,{headers: this.getHeaders()});
  }

  deletePaymentLine(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`,{headers: this.getHeaders()});
  }
}
