import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Forme} from "@models/product";

@Injectable({
  providedIn: 'root'
})
export class EtageresService {
  private url = 'api/etagere';

  constructor(private http: HttpClient) {
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getEtageress(): Observable<any[]> {
    return this.http.get<any[]>(this.url, {headers: this.getHeaders()});
  }

  addEtageres(forme: any): Observable<any> {
    return this.http.post<any>(this.url, forme, {headers: this.getHeaders()});
  }

  updateEtageres(id: number, forme: any): Observable<any> {
    return this.http.put<any>(`${this.url}/${id}`, forme, {headers: this.getHeaders()});
  }

  deleteEtageres(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`, {headers: this.getHeaders()});
  }
}
