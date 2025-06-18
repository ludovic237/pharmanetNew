import { Injectable } from '@angular/core';
      import { HttpClient } from '@angular/common/http';
      import { Observable } from 'rxjs';

      @Injectable({
        providedIn: 'root'
      })
      export class VentesService {
        private apiUrl = '/api/ventes';

        constructor(private http: HttpClient) {}


        // Create a sale without payment
        creerVenteSansEncaissement(venteData: any): Observable<any> {
          return this.http.post(`${this.apiUrl}/creer-sans-encaissement`, venteData);
        }

        // Process payment for a sale
        encaisserVente(venteId: number, encaissementData: any): Observable<any> {
          return this.http.post(`${this.apiUrl}/${venteId}/encaisser`, encaissementData);
        }

        // Load ongoing unpaid sales
        chargerVentesEnCoursNonEncaisser(venteId: number): Observable<any> {
          return this.http.get<any>(`${this.apiUrl}/${venteId}/non-encaissee`);
        }
      }
