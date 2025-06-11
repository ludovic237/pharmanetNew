import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {User, UserNew} from "../model/data";

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = '/api/auth';

  constructor(private http: HttpClient) {
  }

  private loggedIn = new BehaviorSubject<boolean>(false);

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, {username, password});
  }

  registerUser(firstName: string, lastName: string, role: string, phone: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, {firstName, lastName, role, phone, email, password});
  }

  saveUser(user:UserNew): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, user);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout`, {});
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
    this.loggedIn.next(true);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn() {
    return this.loggedIn.asObservable();
  }

  // logout() {
  //   localStorage.removeItem('token');
  //   this.loggedIn.next(false);
  // }
}
