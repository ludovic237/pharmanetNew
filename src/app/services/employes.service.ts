import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../common/models/user.model';

@Injectable()
export class EmployesService {
  public url = "api/admin/users-employees";
   constructor(
    public http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getEmployes(): Observable<any[]> {
      return this.http.get<any[]>(this.url, { headers: this.getHeaders() });
  }

  addEmploye(user:any){
      return this.http.post(this.url, user, { headers: this.getHeaders() });
  }

  updateEmploye(user:any){
      return this.http.put(this.url, user, { headers: this.getHeaders() });
  }

  deleteEmploye(id: number) {
      return this.http.delete(this.url + "/" + id, { headers: this.getHeaders() });
  }
}
