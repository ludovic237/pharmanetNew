import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Page} from "ngx-pagination";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class InventaireService {
  private apiUrl = environment.url+'/api/admin/inventaire';

  constructor(private http: HttpClient) {
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getInventaire(page: number, size: number, etat: string | null, dateDebut: Date | null, dateFin: Date | null): Observable<any> {
    const params: any = {};
    if (etat) params.etat = etat;
    if (dateDebut) params.dateDebut = dateDebut.toISOString();
    if (dateFin) params.dateFin = dateFin.toISOString();

    return this.http.get<any>(`${this.apiUrl}/list?page=${page}&size=${size}`, {params, headers: this.getHeaders()});
  }

  listerProduitsParInventaireAvecFiltre(inventaireId: string, filtre: string, page: number, size: number): Observable<any> {
    const params: any = {};
    return this.http.get<any>(`${this.apiUrl}/pageable/${inventaireId}/filter/products?filtre=${filtre}&page=${page}&size=${size}`, {headers: this.getHeaders()});
  }

  listerProduitsParInventaireAsMap(inventaireId: string, page: number, size: number): Observable<any> {
    const params: any = {};
    return this.http.get<any>(`${this.apiUrl}/pageable/${inventaireId}/products?page=${page}&size=${size}`, {headers: this.getHeaders()});
  }

  addInventaire(inventaire: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, inventaire, {headers: this.getHeaders()});
  }

  createInventaire(inventaire: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-new`, inventaire, {headers: this.getHeaders()});
  }

  updateInventaire(inventaire: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/mettre-a-jour/${inventaire.id}`, inventaire, {headers: this.getHeaders()});
  }

  addProductToInventory(inventaire: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/valid/product/${inventaire.id}`, inventaire, {headers: this.getHeaders()});
  }

  invalideProductToInventory(produitInventaireId: any): Observable<any> {
    return this.http.delete(`${this.apiUrl}/update/invalid/product/${produitInventaireId}`, {headers: this.getHeaders()});
  }

  deleteInventaire(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/supprimer/${id}`, {headers: this.getHeaders()});
  }

  setPage(page: number): void {
    localStorage.setItem('inventairePage', page.toString());
  }

  cloturerInventaire(inventaireId: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/close/${inventaireId}`, {headers: this.getHeaders()});
  }

  terminerInventaire(inventaireId: any, commentaire: String): Observable<any> {
    return this.http.get(`${this.apiUrl}/terminer/${inventaireId}?commentaire=${commentaire}`, {headers: this.getHeaders()});
  }

  getInfoProduitsInventaire(inventaireId: string): Observable<any> {
    const params: any = {};
    return this.http.get<any>(`${this.apiUrl}/info/produit_inventaire/${inventaireId}`, {headers: this.getHeaders()});
  }
}
