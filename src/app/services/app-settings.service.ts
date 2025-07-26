import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Category} from '@models/category';
import {Product} from '@models/product';
import {environment} from '../../environments/environment';
import {AuthService} from "@services/auth.service";
import {analytics} from "../common/data/dashboard.data";

export class Data {
  constructor(
    public authService: AuthService,
    public snackBar: MatSnackBar, public categories: Category[],
    public compareList: Product[],
    public wishList: Product[],
    public cartList: Product[],
    public totalPrice: number | null,
    public totalCartCount: number | null) {
  }
}

@Injectable({
  providedIn: 'root'
})
export class AppSettingsService {
  public Data: any = {}

  public url = environment.url + '/data/';
  private apiUrl = environment.url+'/api/admin/setting';

  private settingsUpdated = new BehaviorSubject<string>(null);
  settingsUpdated$ = this.settingsUpdated.asObservable();

  constructor(
    public authService: AuthService,
    public snackBar: MatSnackBar, public http: HttpClient) {
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  loadSetting(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {headers: this.getHeaders()});
  }

  getSetting(key: String): Observable<any> {
    return this.http.get<any>(this.apiUrl + '/' + key, {headers: this.getHeaders()});
  }

  setSetting(key: String, value: String): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/' + key, value, {headers: this.getHeaders()});
  }

  refreshSetting() {
    this.loadSetting().subscribe({
      next: (data: any[]) => {
        console.log("refreshSetting")
        localStorage.setItem('app_name', data[0].value);
        localStorage.setItem('vente_mode', data[1].value);
        localStorage.setItem('show_menu_stats', data[2].value);
      },
      error: (err: any) => {
        console.error('Error loading settings:', err);
      }
    });
  }

  // Call this method to notify components of updates
  notifySettingsUpdated(param:string): void {
    this.settingsUpdated.next(param);
  }

}
