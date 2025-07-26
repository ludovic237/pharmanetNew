import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Magasin} from "@models/product";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class MagasinService {
  private url = environment.url+'/api/magasins';

  constructor(
    private http: HttpClient) {
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getMagasins(): Observable<Magasin[]> {
    return this.http.get<Magasin[]>(this.url, {headers: this.getHeaders()});
  }

  addMagasin(magasin: Magasin): Observable<Magasin> {
    return this.http.post<Magasin>(this.url, magasin, {headers: this.getHeaders()});
  }

  updateMagasin(id: number, magasin: Magasin): Observable<Magasin> {
    return this.http.put<Magasin>(`${this.url}/${id}`, magasin, {headers: this.getHeaders()});
  }

  deleteMagasin(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`, {headers: this.getHeaders()});
  }
}
