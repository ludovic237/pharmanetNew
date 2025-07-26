import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class FournisseursService {
  private url = environment.url+'/api/fournisseurs';

  constructor(private http: HttpClient) {
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getFournisseurs(): Observable<any[]> {
    return this.http.get<any[]>(this.url, {headers: this.getHeaders()});
  }

  addFournisseur(fournisseur: any): Observable<any> {
    return this.http.post<any>(this.url, fournisseur, {headers: this.getHeaders()});
  }

  updateFournisseur(id: number, fournisseur: any): Observable<any> {
    return this.http.put<any>(`${this.url}/${id}`, fournisseur, {headers: this.getHeaders()});
  }

  deleteFournisseur(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`, {headers: this.getHeaders()});
  }
}
