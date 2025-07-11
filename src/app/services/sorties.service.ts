import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Rayon} from "@models/product";

@Injectable({
  providedIn: 'root'
})
export class SortiesService {
  private url = 'api/sortie-stock';

  constructor(private http: HttpClient) {
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

}
