import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Page} from "ngx-pagination";

@Injectable({
  providedIn: 'root'
})
export class EnrayonsService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {
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
      enRayonId:enRayonId,
      produitDetailId:produitDetailId
    }, {headers: this.getHeaders()});
  }

  getProduitsEnRayonPageable(page: number, size: number, nomProduit: string, bientotPerimee: boolean, joursAvantPeremption: number, enStock: boolean): Observable<Page> {
    return this.http.get<Page>(this.apiUrl + `/en-rayon/pageable?page=${page}&nomProduit=${nomProduit}&bientotPerimee=${bientotPerimee}&joursAvantPeremption=${joursAvantPeremption}&enStock=${enStock}&size=${size}`, {headers: this.getHeaders()});
  }

}
