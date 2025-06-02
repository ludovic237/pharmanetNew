import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Invoice } from '../model/data';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = '/api/pdf/invoice';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.apiUrl, {headers: this.getHeaders()});
  }

  getInvoiceById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/download?subscriptionId=${id}`, {headers: this.getHeaders()});
  }

  createInvoice(invoice: Invoice): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, invoice, {headers: this.getHeaders()});
  }

  updateInvoice(id: number, invoice: Invoice): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.apiUrl}/${id}`, invoice, {headers: this.getHeaders()});
  }

  deleteInvoice(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {headers: this.getHeaders()});
  }
}
