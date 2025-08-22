import {NgClass} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {DomHandlerService} from '@services/dom-handler.service';
import {Settings, SettingsService} from '@services/settings.service';
import {NgxSpinnerModule} from 'ngx-spinner';
import {ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatInputModule} from "@angular/material/input";
import {AppSettingsService} from "@services/app-settings.service";
import {AuthService} from "@services/auth.service";
import {filter} from "rxjs";
import {LoaderService} from "@services/loader.service";

@Component({
  selector: 'app-root',
  imports: [
    NgClass,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    RouterOutlet,
    TranslateModule,
    NgxSpinnerModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  loading: boolean = false;
  public settings: Settings;
  isServer: boolean = true;

  constructor(public settingsService: SettingsService,
              public router: Router,
              public loader: LoaderService,
              public translate: TranslateService,
              public authService: AuthService,
              public appSettingsService: AppSettingsService,
              public domHandlerService: DomHandlerService) {
    // router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() =>
    //   loader.reset()
    // )
    this.settings = this.settingsService.settings;
    translate.addLangs(['en', 'de', 'fr', 'ru', 'tr']);
    translate.setDefaultLang('en');
    translate.use('en');
  }

  ngOnInit() {
    // this.appSettingsService.refreshSetting()
    // const token = localStorage.getItem('token');
    // console.log("token");
    // console.log(token);
    // if (token){
    //   this.authService.checkSession().subscribe({
    //     next: (response) => {
    //       window.location.href = '/admin';
    //     },
    //     error: (err) => {
    //       if (err.status === 401 || err.status === 403) {
    //         localStorage.removeItem('token');
    //         window.location.href = '/sign-in';
    //       }
    //     },
    //   });
    // }
    // else {
    //
    // }


    if (this.domHandlerService.isBrowser) {
      setTimeout(() => {
        this.isServer = false;
      })
    }
  }

  ngAfterViewInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.domHandlerService.winScroll(0, 0);
      }
    })
  }
}
