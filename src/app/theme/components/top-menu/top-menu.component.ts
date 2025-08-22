import {Component, OnInit} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {RouterModule} from '@angular/router';
import {FlexLayoutModule} from '@ngbracket/ngx-layout';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {AppService} from '@services/app.service';
import {Settings, SettingsService} from '@services/settings.service';
import {MatSnackBar} from "@angular/material/snack-bar";
import {AuthService} from "@services/auth.service";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-top-menu',
  imports: [
    RouterModule,
    FlexLayoutModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    CommonModule,
    TranslateModule
  ],
  templateUrl: './top-menu.component.html'
})
export class TopMenuComponent implements OnInit {
  username: any = null;
  hasToken: boolean = false;
  public currencies = ['USD', 'EUR'];
  public currency: any;

  public settings: Settings;

  constructor(
    public authService: AuthService,
    public snackBar: MatSnackBar, public settingsService: SettingsService,
    public appService: AppService,
    public translateService: TranslateService) {
    this.settings = this.settingsService.settings;
  }

  ngOnInit() {
    // this.username = !!localStorage.getItem('nom')
    this.currency = this.currencies[0];
    // this.hasToken = !!localStorage.getItem('token');


  }

  public changeCurrency(currency: any) {
    this.currency = currency;
  }

  public changeLang(lang: string) {
    this.translateService.use(lang);
  }

  public getLangText(lang: string) {
    if (lang == 'de') {
      return 'German';
    } else if (lang == 'fr') {
      return 'French';
    } else if (lang == 'ru') {
      return 'Russian';
    } else if (lang == 'tr') {
      return 'Turkish';
    } else {
      return 'English';
    }
  }

  logoutUser(): void {
    this.authService.logout().subscribe({
      next: () => {
        localStorage.removeItem('token');
        localStorage.setItem("lastLink", window.location.href);
        ;
        this.snackBar.open('Déconnexion réussie.', '×', {
          panelClass: 'success',
          verticalPosition: 'top',
          duration: 3000,
        });
        // Redirect to login page or clear session
        window.location.href = '/sign-in';
      },
      error: (err: any) => {
        console.error('Erreur lors de la déconnexion:', err);
        this.snackBar.open('Erreur lors de la déconnexion.', '×', {
          panelClass: 'error',
          verticalPosition: 'top',
          duration: 3000,
        });
      }
    });
  }
}
