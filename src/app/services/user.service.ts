import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {UserNew} from '../model/data';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/api/admin/users';

  constructor(private http: HttpClient) {
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    // return new HttpHeaders();
  }

  getUsers(): Observable<UserNew[]> {
    return this.http.get<UserNew[]>(this.apiUrl, {headers: this.getHeaders()});
  }

  getUserById(id: number): Observable<UserNew> {
    return this.http.get<UserNew>(`${this.apiUrl}/${id}`, {headers: this.getHeaders()});
  }

  createUser(user: UserNew): Observable<UserNew> {
    return this.http.post<UserNew>(this.apiUrl, user, {headers: this.getHeaders()});
  }

  updateUser(id: number, user: UserNew): Observable<UserNew> {
    return this.http.put<UserNew>(`${this.apiUrl}/${id}`, user, {headers: this.getHeaders()});
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {headers: this.getHeaders()});
  }

  addUser(user: UserNew) {
    console.log("addUser");
    console.log(user);
    return this.http.post(`${this.apiUrl}`,  user, {headers: this.getHeaders()});
  }

}
