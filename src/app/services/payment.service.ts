import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = '/api/admin/payments';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getPayments(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl,{headers: this.getHeaders()});
  }

  getPaymentById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/payment_info`,{headers: this.getHeaders()});
  }

  createPayment(payment: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, payment,{headers: this.getHeaders()});
  }

  updatePayment(id: number, payment: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payment,{headers: this.getHeaders()});
  }

  deletePayment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`,{headers: this.getHeaders()});
  }
}
