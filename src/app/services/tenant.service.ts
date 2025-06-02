import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {Tenant} from '../model/data';

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private apiUrl = '/api/tenants';

  constructor(private http: HttpClient) {
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getTenants(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {headers: this.getHeaders()});
  }

  getTenantsDetails(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + "/details", {headers: this.getHeaders()});
  }

  getTenantById(id: number): Observable<Tenant> {
    return this.http.get<Tenant>(`${this.apiUrl}/${id}`, {headers: this.getHeaders()});
  }

  createTenant(tenant: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, tenant, {headers: this.getHeaders()});
  }

  updateTenant(id: number, tenant: Tenant): Observable<Tenant> {
    return this.http.put<Tenant>(`${this.apiUrl}/${id}`, tenant, {headers: this.getHeaders()});
  }

  deleteTenant(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {headers: this.getHeaders()});
  }

  getTenantDetailById(id: number): Observable<any> {
    return this.http.get<Tenant>(`${this.apiUrl}/${id}/details`, {headers: this.getHeaders()});
  }

}
