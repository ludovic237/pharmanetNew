import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from "../../environments/environment";

// const API = environment.url + '/api/ai';
// const base = `${environment.url}/api/dashboard`;


@Injectable({providedIn: 'root'})
export class ConfigService {
  constructor(private http: HttpClient) {
  }

  config(): Observable<any> {
    const params = new HttpParams()
    return this.http.post(`/api/config/save`, {params});
  }

}
