import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Page} from "ngx-pagination";

@Injectable({
  providedIn: 'root'
})
export class InventaireService {
  private apiUrl = '/api/admin/inventaire';

  constructor(private http: HttpClient) {
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getInventaire(etat: string | null, dateDebut: Date | null, dateFin: Date | null): Observable<any> {
    const params: any = {};
    if (etat) params.etat = etat;
    if (dateDebut) params.dateDebut = dateDebut.toISOString();
    if (dateFin) params.dateFin = dateFin.toISOString();

    return this.http.get<any>(`${this.apiUrl}/list`, {params, headers: this.getHeaders()});
  }

  addInventaire(inventaire: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/ajouter`, inventaire, {headers: this.getHeaders()});
  }

  updateInventaire(inventaire: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/mettre-a-jour/${inventaire.id}`, inventaire, {headers: this.getHeaders()});
  }

  deleteInventaire(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/supprimer/${id}`, {headers: this.getHeaders()});
  }

  setPage(page: number): void {
    localStorage.setItem('inventairePage', page.toString());
  }

  cloturerInventaire(inventaire: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/close/${inventaire.id}`, inventaire, {headers: this.getHeaders()});
  }
}
