import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VentesService {
  private apiUrl = '/api/ventes';

  constructor(private http: HttpClient) {
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Create a sale without payment
  creerVenteSansEncaissement(venteData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/creer-sans-encaissement`, venteData, {headers: this.getHeaders()});
  }

  // Process payment for a sale
  encaisserVente(venteId: number, encaissementData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${venteId}/encaisser`, encaissementData, {headers: this.getHeaders()});
  }

  // Load ongoing unpaid sales
  chargerVentesEnCoursNonEncaisser(venteId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${venteId}/non-encaissee`, {headers: this.getHeaders()});
  }

  // Load ongoing unpaid sales
  listerVentesNonEncaissees(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/vente-non-encaissees`, {headers: this.getHeaders()});
  }

  // Load ongoing unpaid sales
  listerVentes(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/lister`, {headers: this.getHeaders()});
  }

  // Load ongoing unpaid sales
  listerVentesEncaissees(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/vente-encaissee`, {headers: this.getHeaders()});
  }

  // Load ongoing unpaid sales
  validateTicket(ticket: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/valider`, {headers: this.getHeaders()});
  }

  // Load ongoing unpaid sales
  chargerVentesEncaisser(venteId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${venteId}/encaissee`, {headers: this.getHeaders()});
  }

}
