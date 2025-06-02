import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../common/models/user.model';

@Injectable()
export class UsersService {
  public url = "api/users";
  constructor(public http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getUsers(): Observable<User[]> {
      return this.http.get<User[]>(this.url, {headers: this.getHeaders()});
  }

  addUser(user:User){
      return this.http.post(this.url, user, {headers: this.getHeaders()});
  }

  updateUser(user:User){
      return this.http.put(this.url, user, {headers: this.getHeaders()});
  }

  deleteUser(id: number) {
      return this.http.delete(this.url + "/" + id, {headers: this.getHeaders()});
  }
}
