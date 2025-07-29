import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Categorie} from "@models/product";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class CategorieService {
  private url = environment.url+'/api/categories';

  constructor(private http: HttpClient) {
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(this.url, {headers: this.getHeaders()});
  }

  addCategorie(categorie: any): Observable<Categorie> {
    return this.http.post<Categorie>(this.url, categorie, {headers: this.getHeaders()});
  }

  updateCategorie(categorie: any): Observable<Categorie> {
    return this.http.put<Categorie>(`${this.url}/${categorie.id}`, categorie, {headers: this.getHeaders()});
  }

  deleteCategorie(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`, {headers: this.getHeaders()});
  }
}
