import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Fabriquant} from "@models/product";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class FabriquantService {
  private url = environment.url+'/api/fabriquants';

  constructor(private http: HttpClient) {
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getFabriquants(): Observable<Fabriquant[]> {
    return this.http.get<Fabriquant[]>(this.url, {headers: this.getHeaders()});
  }

  addFabriquant(fabriquant: Fabriquant): Observable<Fabriquant> {
    return this.http.post<Fabriquant>(this.url, fabriquant, {headers: this.getHeaders()});
  }

  updateFabriquant(id: number, fabriquant: Fabriquant): Observable<Fabriquant> {
    return this.http.put<Fabriquant>(`${this.url}/${id}`, fabriquant, {headers: this.getHeaders()});
  }

  deleteFabriquant(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`, {headers: this.getHeaders()});
  }
}
