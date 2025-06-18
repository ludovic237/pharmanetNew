import { Injectable } from '@angular/core';
  import {HttpClient, HttpHeaders} from '@angular/common/http';
  import { Observable } from 'rxjs';

  @Injectable({
    providedIn: 'root'
  })
  export class EnrayonsService {
    private apiUrl = '/api';

    constructor(private http: HttpClient) {}

    private getHeaders(): HttpHeaders {
      const token = localStorage.getItem('token');
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    }

    getProduitsEnRayon(produitId: number): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiUrl}/en-rayon/par-produit?produitId=${produitId}`, { headers: this.getHeaders() });
    }

    ajouterVente(venteData: any): Observable<any> {
      return this.http.post(`${this.apiUrl}/ventes/ajouter`, venteData, { headers: this.getHeaders() });
    }
  }
