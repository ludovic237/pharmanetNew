import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Product, Rayon} from "@models/product";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ProduitdetailsService {
  private url = environment.url+'/api/produits-detail';

  constructor(
    private http: HttpClient) {
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  searchProduitDetailsByName(nom: string, page: number, size: number): Observable<any[]> {
    // Crée les paramètres de la requête URL (ex: ?nom=doliprane)
    const params = new HttpParams().set('nom', nom);
    if (page == -1) {
      page = 0
    }
    // Effectue la requête GET vers l'endpoint /api/produits-detail/search
    return this.http.get<any[]>(`${this.url}/search/pageable?page=${page}&size=${size}`, {headers: this.getHeaders(), params: params});
  }

  getProduitDetailsList(searchTerm: string, page: number, size: number): Observable<any[]> {
    if (page == -1) {
      page = 0
    }
    return this.http.get<any[]>(`${this.url}/list/pageable?query=${searchTerm}&page=${page}&size=${size}`, {headers: this.getHeaders()});
  }

  getProduitDetailsInfo(produitId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/info/` + produitId, {headers: this.getHeaders()});
  }

  createProductDetail(product: any): Observable<Product> {
    return this.http.post<any>(`${this.url}/add`, product, {headers: this.getHeaders()});
  }

  updateProductDetail(produitDetailId: number, product: any): Observable<Product> {
    return this.http.post<any>(`${this.url}/update/` + produitDetailId, product, {headers: this.getHeaders()});
  }

  removeParentDetail(productId: number, productDetailId: number): Observable<any> {
    return this.http.get<any>(`${this.url}/remove/prarent?productId=${productId}&productDetailId=${productDetailId}`, {headers: this.getHeaders()});
  }

  removeProduitDetail(productDetailId: number): Observable<any> {
    return this.http.get<any>(`${this.url}/remove?productDetailId=${productDetailId}`, {headers: this.getHeaders()});
  }

}
