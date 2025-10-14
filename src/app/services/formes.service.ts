import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Forme} from "@models/product";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class FormeService {
  private url = environment.url+'/api/formes';

  constructor(private http: HttpClient) {
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getFormes(): Observable<Forme[]> {
    return this.http.get<Forme[]>(this.url, {headers: this.getHeaders()});
  }

  getFormesPage(page: number, size: number, search: string): Observable<any[]> {
    return this.http.get<any[]>(this.url+`/pageable?page=${page}&size=${size}&search=${search}`, {headers: this.getHeaders()});
  }

  addForme(forme: Forme): Observable<Forme> {
    return this.http.post<Forme>(this.url, forme, {headers: this.getHeaders()});
  }

  updateForme(forme: Forme): Observable<Forme> {
    return this.http.put<Forme>(`${this.url}/${forme.id}`, forme, {headers: this.getHeaders()});
  }

  deleteForme(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`, {headers: this.getHeaders()});
  }
}
