import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { TranslateModule, TranslateService } from '@ngx-translate/core'; 
import { AppService } from '@services/app.service';
import { Settings, SettingsService } from '@services/settings.service';

@Component({
    selector: 'app-top-menu',
    imports: [
        RouterModule,
        FlexLayoutModule,
        MatButtonModule,
        MatMenuModule,
        MatIconModule,
        TranslateModule
    ],
    templateUrl: './top-menu.component.html'
})
export class TopMenuComponent implements OnInit {
  public currencies = ['USD', 'EUR'];
  public currency:any; 

  public settings: Settings;
  constructor(public settingsService: SettingsService, public appService: AppService, public translateService: TranslateService) { 
    this.settings = this.settingsService.settings; 
  } 

  ngOnInit() {
    this.currency = this.currencies[0];  
  }

  public changeCurrency(currency: any){
    this.currency = currency;
  } 

  public changeLang(lang:string){ 
    this.translateService.use(lang);   
  } 

  public getLangText(lang: string){
    if(lang == 'de'){
      return 'German';
    }
    else if(lang == 'fr'){
      return 'French';
    }
    else if(lang == 'ru'){
      return 'Russian';
    }
    else if(lang == 'tr'){
      return 'Turkish';
    }
    else{
      return 'English';
    }
  } 

}
