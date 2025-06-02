import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DomHandlerService } from '@services/dom-handler.service';
import { Settings, SettingsService } from '@services/settings.service';
import { NgxSpinnerModule } from 'ngx-spinner';

@Component({
    selector: 'app-root',
    imports: [
        NgClass,
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
              public domHandlerService: DomHandlerService){
    this.settings = this.settingsService.settings;
    translate.addLangs(['en','de','fr','ru','tr']);
    translate.setDefaultLang('en'); 
    translate.use('en');
  }

  ngOnInit() {
   if (this.domHandlerService.isBrowser) {
      setTimeout(() => {
        this.isServer = false;
      })
    }  
  }

  ngAfterViewInit(){
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.domHandlerService.winScroll(0, 0); 
      }
    })  
  }
}
