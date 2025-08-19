import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Rayon} from "@models/product";
import {environment} from "../../environments/environment";
import {TicketCaisse} from "@services/tickets.service";

@Injectable({
  providedIn: 'root'
})
export class SortiesService {
  private url = environment.url+'/api/sortie-stock';

   constructor(
    private http: HttpClient) {
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getSortieStockPageable(
    page: number = 0,
    size: number = 10,
    sort: string = 'id',
    direction: string = 'asc',
    nomProduit?: string,
    typeSortie?: string,
    enRayonId?: string,
    produitDetailId?: string
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort)
      .set('direction', direction);

    if (nomProduit) params = params.set('nomProduit', nomProduit);
    if (typeSortie) params = params.set('typeSortie', typeSortie);
    if (enRayonId) params = params.set('enRayonId', enRayonId.toString());
    if (produitDetailId) params = params.set('produitDetailId', produitDetailId.toString());

    return this.http.get<any>(this.url, { headers: this.getHeaders(), params });
  }

  getSortieStockPageableProductRange(
    page: number = 0,
    size: number = 10,
    sort: string = 'id',
    direction: string = 'asc',
    nomProduit?: string,
    produitId?: string,
    supprimer?: string,
    startDate?: string,
    endDate?: string,
    typeSortie?: string,
    enRayonId?: string,
    produitDetailId?: string
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort)
      .set('direction', direction);

    if (nomProduit) params = params.set('nomProduit', nomProduit);
    if (produitId) params = params.set('produitId', produitId);
    if (supprimer) params = params.set('supprimer', supprimer);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (typeSortie) params = params.set('typeSortie', typeSortie);
    if (enRayonId) params = params.set('enRayonId', enRayonId.toString());
    if (produitDetailId) params = params.set('produitDetailId', produitDetailId.toString());

    return this.http.get<any>(this.url+"/product", { headers: this.getHeaders(), params });
  }

  addProduitDetail(sortie: any): Observable<any> {
    return this.http.post<any>(this.url+"/save", sortie, { headers: this.getHeaders() });
  }

}
