import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {User} from '../common/models/user.model';
import {environment} from "../../environments/environment";

@Injectable()
export class UsersService {
  public url = environment.url+"/api/admin/users";

  constructor(
    public http: HttpClient) {
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.url, {headers: this.getHeaders()});
  }

  addUser(user: any) {
    return this.http.post(this.url, user, {headers: this.getHeaders()});
  }

  updateUser(user: any) {
    return this.http.put(this.url+'/'+user.id, user, {headers: this.getHeaders()});
  }

  deleteUser(id: number) {
    return this.http.delete(this.url + "/" + id, {headers: this.getHeaders()});
  }
}
