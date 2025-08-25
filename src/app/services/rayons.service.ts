import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Rayon} from "@models/product";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class RayonService {
  private url = environment.url+'/api/rayons';

  constructor(
    private http: HttpClient) {
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getRayons(): Observable<Rayon[]> {
    return this.http.get<Rayon[]>(this.url, {headers: this.getHeaders()});
  }

  getRayonsPage(page: number, size: number): Observable<any> {
    return this.http.get<any>(this.url+`/pageable?page=${page}&size=${size}`, {headers: this.getHeaders()});
  }

  addRayon(rayon: Rayon): Observable<Rayon> {
    return this.http.post<Rayon>(this.url, rayon, {headers: this.getHeaders()});
  }

  updateRayon(id: number, rayon: Rayon): Observable<Rayon> {
    return this.http.put<Rayon>(`${this.url}/${id}`, rayon, {headers: this.getHeaders()});
  }

  deleteRayon(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`, {headers: this.getHeaders()});
  }
}
