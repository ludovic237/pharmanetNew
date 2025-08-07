import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class DepenseService {
  private apiUrl = environment.url+'/api/depenses';

   constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getAllDepenses(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getAllDepensesPageable(page: number, size: number): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl+`/pageable?page=${page}&size=${size}`, { headers: this.getHeaders() });
  }

  createDepense(depense: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, depense, { headers: this.getHeaders() });
  }

  deleteDepense(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
