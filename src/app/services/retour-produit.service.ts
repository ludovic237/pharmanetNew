import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Product} from '@models/product';
import {AuthService} from "@services/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class RetourProduitService {
  private baseUrl = environment.url+'/api/api/retour-produits';

  constructor(
    private http: HttpClient) {
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }


  // Get all rayons
  getRayons(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/rayons`, {headers: this.getHeaders()});
  }


  // List paginated retour produits with details
  listerRetourProduitsAvecDetails(page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/liste?page=${page}&size=${size}`, {headers: this.getHeaders()});
  }

  // Return products sold and in stock
  retournerProduitsVendusEtEnRayon(venteId: number, produitsRetour: any[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/retour/${venteId}`, produitsRetour, {headers: this.getHeaders()});
  }
}
