import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {Rent} from '../model/data';

@Injectable({
  providedIn: 'root'
})
export class RentService {
  private apiUrl = '/api/rents';

  constructor(private http: HttpClient) {
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getRents(): Observable<Rent[]> {
    return this.http.get<Rent[]>(this.apiUrl, {headers: this.getHeaders()});
  }

  getRentById(id: number): Observable<Rent> {
    return this.http.get<Rent>(`${this.apiUrl}/${id}`, {headers: this.getHeaders()});
  }

  createRent(rent: Rent): Observable<Rent> {
    return this.http.post<Rent>(this.apiUrl, rent, {headers: this.getHeaders()});
  }

  updateRent(id: number, rent: Rent): Observable<Rent> {
    return this.http.put<Rent>(`${this.apiUrl}/${id}`, rent, {headers: this.getHeaders()});
  }

  deleteRent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {headers: this.getHeaders()});
  }
}
