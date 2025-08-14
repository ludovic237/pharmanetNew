import {Injectable, NgZone} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Category} from '@models/category';
import {Product} from '@models/product';
import {environment} from '../../environments/environment';
import {AuthService} from "@services/auth.service";
import {Router} from "@angular/router";

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
export class IdleService {
  public Data: any = {}
  timeout: any;
  idleTime = 5 * 60 * 100; // 5 minutes
  public url = environment.url + '/data/';

  constructor(
    public authService: AuthService,
    private router: Router,
    private ngZone: NgZone,
    public snackBar: MatSnackBar, public http: HttpClient) {
    this.startWatching()
  }

  startWatching() {
    ['mousemove', 'keydown', 'scroll', 'click'].forEach(event => {
      window.addEventListener(event, () => this.resetTimer())
    })
  }

  resetTimer() {
    clearTimeout(this.timeout)
    this.ngZone.runOutsideAngular(() => {
      this.timeout = setTimeout(() => {
        this.ngZone.run(() =>
          this.authService.logout().subscribe({
            next: (data) => {
              localStorage.removeItem('token');
              window.location.href = '/sign-in';
            },
            error: (err) => {
              console.error('Error  subscription:', err);
              if (err.status === 401 || err.status === 403) {
                this.authService.logout();
                this.snackBar.open('Déconnexion réussie.', '×', {
                  panelClass: 'success',
                  verticalPosition: 'top',
                  duration: 3000,
                });
                localStorage.removeItem('token');
                window.location.href = '/sign-in';
              }
            }
          }))
      }, this.idleTime)
    })
  }


}
