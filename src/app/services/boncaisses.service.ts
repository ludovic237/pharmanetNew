import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from "../../environments/environment";

export interface BonCaisse {
  id?: number;
  codebarreId?: string;
  dateGenerer?: string;
  dateEncaisser?: string;
  type?: string;
  supprimer?: number;
  montant?: number;
  caisseIdEncaisser?: number;
}

@Injectable({
  providedIn: 'root',
})
export class BonCaisseService {
  private url = environment.url+'/api/admin/bons';

  constructor(private http: HttpClient) {
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getAllBons(): Observable<BonCaisse[]> {
    return this.http.get<BonCaisse[]>(this.url, {headers: this.getHeaders()});
  }

  getAllBonsPageable(page: number, size: number): Observable<any[]> {
    return this.http.get<any[]>(this.url+`/pageable?page=${page}&size=${size}`, {headers: this.getHeaders()});
  }

  getBonById(id: number): Observable<BonCaisse> {
    return this.http.get<BonCaisse>(`${this.url}/${id}`, {headers: this.getHeaders()});
  }

  getBonByCodebarreId(codebarreId: string): Observable<BonCaisse> {
    return this.http.get<BonCaisse>(`${this.url}/codebarre/${codebarreId}`, {headers: this.getHeaders()});
  }

  createBon(bon: BonCaisse): Observable<BonCaisse> {
    return this.http.post<BonCaisse>(this.url, bon, {headers: this.getHeaders()});
  }

  updateBon(codebarreId: string): Observable<BonCaisse> {
    return this.http.put<BonCaisse>(`${this.url}/${codebarreId}`, {}, {headers: this.getHeaders()});
  }

  deleteBon(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`, {headers: this.getHeaders()});
  }
}
