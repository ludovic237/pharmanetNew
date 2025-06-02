import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = '/api/admin/dashboard';

  constructor(private http: HttpClient) {
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

getDashboards(startDate?: string, endDate?: string): Observable<any> {
  const params: any = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  return this.http.get<any>(this.apiUrl + '/info?' +
    'startDate='+startDate+'&' +
    'endDate='+endDate, {headers:this.getHeaders()});
}


}
