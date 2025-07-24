import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Page} from "ngx-pagination";

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
  supprimerVente(venteId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${venteId}/supprimer`, {headers: this.getHeaders()});
  }

  // Load ongoing unpaid sales
  listerVentesNonEncaissees(page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/vente-non-encaissees?page=${page}&size=${size}`, {headers: this.getHeaders()});
  }

  // Load ongoing unpaid sales
  listerVentes(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/lister`, {headers: this.getHeaders()});
  }

  fetchVentesPageable(page: number, size: number,
                         etat: string,
                         dateVente: string,
                         dateEncaissement: string,
                         userId: string,
                         employeId: string,
                         prescripteurId: string,
                         caisseId: string): Observable<Page> {
    return this.http.get<Page>(this.apiUrl + `/pageable/lister?page=${page}&etat=${etat}&dateVente=${dateVente}&dateEncaissement=${dateEncaissement}&userId=${userId}&employeId=${employeId}&prescripteurId=${prescripteurId}&caisseId=${caisseId}&size=${size}`, {headers: this.getHeaders()});
  }


  // Load ongoing unpaid sales
  listerVentesPageable(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/pageable/lister`, {headers: this.getHeaders()});
  }

  // Load ongoing unpaid sales
  listerVentesEncaissees(page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/vente-encaissee?page=${page}&size=${size}`, {headers: this.getHeaders()});
  }

  // Load ongoing unpaid sales
  validateTicket(ticket: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/valider`, {headers: this.getHeaders()});
  }

  // Load ongoing unpaid sales
  chargerVentesEncaisser(venteId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${venteId}/encaissee`, {headers: this.getHeaders()});
  }



  getUtilisateurs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/utilisateurs`);
  }

  getEmployes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/employes`);
  }

  getPrescripteurs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/prescripteurs`);
  }

  getCaisses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/caisses`);
  }

  getVentesPageable(filters: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/pageable`, { params: filters });
  }

  // Get purchased products for a sale
  getProduitsAchetes(venteId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${venteId}/achetes`, { headers: this.getHeaders() });
  }

  // Get returned products for a sale
  getProduitsRetournes(venteId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${venteId}/retournes`, { headers: this.getHeaders() });
  }

  // Get the list of all returned products
  getProduitsRetournesListe(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/liste`, { headers: this.getHeaders() });
  }

  // Get the list of all returned products
  searchVenteByReference(reference:string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/details/`+reference, { headers: this.getHeaders() });
  }

  // Validate the return of products
  validerRetour(venteId:number,produitsRetour: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/retour/`+venteId, produitsRetour, { headers: this.getHeaders() });
  }

  encaisserVenteDirect(encaissementDirectData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/encaisser_direct`, encaissementDirectData, {headers: this.getHeaders()});
  }
}
