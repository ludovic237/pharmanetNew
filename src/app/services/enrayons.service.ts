import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Page} from "ngx-pagination";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class EnrayonsService {
  private apiUrl = environment.url + '/api';

  constructor(
    private http: HttpClient) {
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getProduitsEnRayon(produitId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/en-rayon/par-produit?produitId=${produitId}`, {headers: this.getHeaders()});
  }

  ajouterVente(venteData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/ventes/ajouter`, venteData, {headers: this.getHeaders()});
  }

  mettreAJourProduitEnRayon(rayon: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + "/en-rayon/save", rayon, {headers: this.getHeaders()});
  }

  decrementerStock(enRayonId: string, produitDetailId: string): Observable<any> {
    return this.http.post<any>(this.apiUrl + `/en-rayon/increment-produit-detail`, {
      enRayonId: enRayonId,
      produitDetailId: produitDetailId
    }, {headers: this.getHeaders()});
  }

  getProduitsEnRayonPageable(page: number, size: number, nomProduit: string, startDate: string,
                             endDate: string, bientotPerimee: boolean, joursAvantPeremption: number, enStock: boolean): Observable<Page> {
    return this.http.get<Page>(this.apiUrl + `/en-rayon/pageable/new?page=${page}&startDate=${startDate}&endDate=${endDate}&nomProduit=${nomProduit}&bientotPerimee=${bientotPerimee}&joursAvantPeremption=${joursAvantPeremption}&enStock=${enStock}&size=${size}`, {headers: this.getHeaders()});
  }

  getProduitsEnRayonPageableProduitRange(page: number,
                                         size: number,
                                         nomProduit: string,
                                         produitId: string,
                                         supprimer: string,
                                         startDate: string,
                                         endDate: string,
                                         bientotPerimee: boolean, joursAvantPeremption: number, enStock: boolean): Observable<any> {
    return this.http.get<any>(this.apiUrl + `/en-rayon/product/pageable/new?page=${page}&nomProduit=${nomProduit}&supprimer=${supprimer}&produitId=${produitId}&startDate=${startDate}&endDate=${endDate}&bientotPerimee=${bientotPerimee}&joursAvantPeremption=${joursAvantPeremption}&enStock=${enStock}&size=${size}`, {headers: this.getHeaders()});
  }

  deleteEnRayon(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/en-rayon/${id}`, {headers: this.getHeaders()});
  }

  resetNegativeStock(
    produitIds?: number[],
    resetAll?: boolean,
    onlyNegative?: boolean,
  ): Observable<any> {
    return this.http.get<any>(this.apiUrl + `/en-rayon/reset_rayon?produit_ids=${produitIds}&reset_all=${resetAll}&only_negative=${onlyNegative}`, {headers: this.getHeaders()});
  }
}
