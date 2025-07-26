import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Categorie} from "@models/product";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class CaisseService {
  private url = environment.url+'/api/caisses';

  constructor(private http: HttpClient) {
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  listerCaisses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/lister`, {headers: this.getHeaders()});
  }

  listerCaissesPageable(page: number, size: number, sortBy: string): Observable<any> {
    return this.http.get<any>(`${this.url}/lister/pageable`, {
      headers: this.getHeaders(),
      params: {page: page.toString(), size: size.toString(), sortBy}
    });
  }

  isCaisseOuverte(): Observable<any> {
    return this.http.get<any>(`${this.url}/ouverte`, {headers: this.getHeaders()});
  }

  setCaisseToClosed(): Observable<any> {
    return this.http.put(`${this.url}/active/attente-cloture`, {}, {headers: this.getHeaders()});
  }

  cloturerCaisse(fondCaisseFerme: number, fermetureCaisse: string): Observable<any> {
    return this.http.post(`${this.url}/cloturer`, {fondCaisseFerme, fermetureCaisse}, {headers: this.getHeaders()});
  }

  ouvrirCaisse(fondCaisseOuvert: number, ouvertureCaisse: string): Observable<any> {
    return this.http.post(`${this.url}/ouvrir`, {fondCaisseOuvert, ouvertureCaisse}, {headers: this.getHeaders()});
  }

  getCaisseClosureDetails(): Observable<any> {
    return this.http.get(`${this.url}/cloture/details`, {headers: this.getHeaders()});
  }

  getCaisseReport(caisseId: number): Observable<any> {
    return this.http.get<any>(this.url + `/${caisseId}/rapport`, {headers: this.getHeaders()});
  }

  getAllCaisses(page: number, size: number, sortBy: string): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy);

    return this.http.get<any>(`${this.url}/all/pageable`, {
      headers: this.getHeaders(),
      params: params
    });
  }

  // Before
  // Missing getFilteredCaisses method in CaisseService

  // After
  getFilteredCaisses(filters: {
    caisseId: number | null;
    startDate: Date | null;
    endDate: Date | null
  }): Observable<any> {
    const params = new HttpParams()
      .set('caisseId', filters.caisseId ? filters.caisseId.toString() : '')
      .set('startDate', filters.startDate ? filters.startDate.toISOString() : '')
      .set('endDate', filters.endDate ? filters.endDate.toISOString() : '');

    return this.http.get<any>(`${this.url}/all/filter`, {params});
  }

}
