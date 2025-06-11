import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Categorie} from "@models/product";

@Injectable({
  providedIn: 'root'
})
export class CategorieService {
  private url = 'api/categories';

  constructor(private http: HttpClient) {
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getCategories(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(this.url, {headers: this.getHeaders()});
  }

  addCategorie(categorie: Categorie): Observable<Categorie> {
    return this.http.post<Categorie>(this.url, categorie, {headers: this.getHeaders()});
  }

  updateCategorie(id: number, categorie: Categorie): Observable<Categorie> {
    return this.http.put<Categorie>(`${this.url}/${id}`, categorie, {headers: this.getHeaders()});
  }

  deleteCategorie(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`, {headers: this.getHeaders()});
  }
}
