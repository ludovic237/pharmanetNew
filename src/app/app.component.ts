import {NgClass} from '@angular/common';
import {Component} from '@angular/core';
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
export class AppComponent {
  loading: boolean = false;
  public settings: Settings;
  isServer: boolean = true;

  constructor(public settingsService: SettingsService,
              public router: Router,
              public translate: TranslateService,
              public appSettingsService: AppSettingsService,
              public domHandlerService: DomHandlerService) {
    this.settings = this.settingsService.settings;
    translate.addLangs(['en', 'de', 'fr', 'ru', 'tr']);
    translate.setDefaultLang('en');
    translate.use('en');
  }

  ngOnInit() {
    this.appSettingsService.refreshSetting()
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
