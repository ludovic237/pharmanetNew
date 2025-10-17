import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from "../../environments/environment";

const API = environment.url + '/api';
// const base = `${environment.url}/api/dashboard`;


@Injectable({providedIn: 'root'})
export class ConfigService {
  constructor(private http: HttpClient) {
  }

  config(data: any): Observable<any> {
    const params = new HttpParams()
      .set('db_host', data.db_host)
      .set('db_name', data.db_name)
      .set('db_password', data.db_password)
      .set('db_port', data.db_port)
      .set('db_type', data.db_type)
      .set('db_user', data.db_user)
    return this.http.post(API+`/config/save`, data, {});
  }

  testDataConfig(): Observable<any> {
    return this.http.get(API+`/config/ping_db`);
  }

  getConfig(): Observable<any> {
    return this.http.get(API+`/config/data`);
  }

}
