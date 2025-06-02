import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {HoustingUnit} from '../model/data';

@Injectable({
  providedIn: 'root'
})
export class HoustingUnitService {
  private apiUrl = '/api/housing-units';

  constructor(private http: HttpClient) {
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  gethousingUnits(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {headers: this.getHeaders()});
  }

  getUnoccupiedHoustingUnits(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl+"/unoccupied", {headers: this.getHeaders()});
  }

  gethousingUnitsOccupationDetails(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl+'/occupancy-details', {headers: this.getHeaders()});
  }

  gethousingUnitById(id: number): Observable<HoustingUnit> {
    return this.http.get<HoustingUnit>(`${this.apiUrl}/${id}`, {headers: this.getHeaders()});
  }

  createhousingUnit(housingUnit: HoustingUnit): Observable<HoustingUnit> {
    return this.http.post<HoustingUnit>(this.apiUrl, housingUnit, {headers: this.getHeaders()});
  }

  updatehousingUnit(id: number, housingUnit: HoustingUnit): Observable<HoustingUnit> {
    return this.http.put<HoustingUnit>(`${this.apiUrl}/${id}`, housingUnit, {headers: this.getHeaders()});
  }

  deletehousingUnit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {headers: this.getHeaders()});
  }

  getTenantDetailsByHousingUnit(housingUnitId: number,tenantId: number): Observable<HoustingUnit> {
    return this.http.get<HoustingUnit>(`${this.apiUrl}/${housingUnitId}/details?tenantId=`+tenantId, {headers: this.getHeaders()});
  }

}
