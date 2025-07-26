import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class PrescripteursService {
  private url = environment.url+'/api/prescripteurs';

  constructor(
    private http: HttpClient) {
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getPrescripteurs(): Observable<any[]> {
    return this.http.get<any[]>(this.url, {headers: this.getHeaders()});
  }

  addPrescripteur(prescripteur: any): Observable<any> {
    return this.http.post<any>(this.url, prescripteur, {headers: this.getHeaders()});
  }

  updatePrescripteur(id: number, prescripteur: any): Observable<any> {
    return this.http.put<any>(`${this.url}/${id}`, prescripteur, {headers: this.getHeaders()});
  }

  deletePrescripteur(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`, {headers: this.getHeaders()});
  }
}
