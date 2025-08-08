import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Rayon} from "@models/product";
import {environment} from "../../environments/environment";
import {TicketCaisse} from "@services/tickets.service";

@Injectable({
  providedIn: 'root'
})
export class TypeSortiesService {
  private url = environment.url+'/api/type-sortie';

   constructor(
    private http: HttpClient) {
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getTypeSortiePageable(
    page: number = 0,
    size: number = 10,
    sort: string = 'id',
    direction: string = 'desc',
    nom?: string,
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort)
      .set('direction', direction);

    if (nom) params = params.set('nom', nom);

    return this.http.get<any>(this.url, { headers: this.getHeaders(), params });
  }

  addTypeSortiel(sortie: any): Observable<any> {
    return this.http.post<any>(this.url+"/save", sortie, { headers: this.getHeaders() });
  }

}
