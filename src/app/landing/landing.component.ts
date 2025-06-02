import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { DomHandlerService } from '@services/dom-handler.service';
import { Settings, SettingsService } from '@services/settings.service';

@Component({
    selector: 'app-landing',
    imports: [
        RouterModule,
        FlexLayoutModule,
        MatSidenavModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatToolbarModule
    ],
    templateUrl: './landing.component.html',
    styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit {
  public settings: Settings;
  constructor(public settingsService: SettingsService, public router: Router, public domHandlerService: DomHandlerService) {
    this.settings = this.settingsService.settings;
  }

  ngOnInit(): void {
    this.settings.rtl = false;
  }

  public getDemo(number: number) {
    if (number == 1) {
      this.settings.theme = 'green';
      this.settings.rtl = false;
      this.router.navigate(['/']);
    }
    if (number == 2) {
      this.settings.theme = 'green';
      this.settings.rtl = true;
      this.router.navigate(['/']);
    }
    if (number == 3) {
      this.settings.theme = 'blue';
      this.settings.rtl = false;
      this.router.navigate(['/admin']);
    }
    if (number == 4) {
      this.settings.theme = 'blue';
      this.settings.rtl = true;
      this.router.navigate(['/admin']);
    }
  }

  public getSkin(num: number) {
    if (num == 1) {
      this.settings.theme = 'blue';
    }
    if (num == 2) {
      this.settings.theme = 'green';
    }
    if (num == 3) {
      this.settings.theme = 'red';
    }
    if (num == 4) {
      this.settings.theme = 'pink';
    }
    if (num == 5) {
      this.settings.theme = 'purple';
    }
    if (num == 6) {
      this.settings.theme = 'grey';
    }
    this.settings.rtl = false;
    this.router.navigate(['/']);
  }


  public scrollToDemos() {
    const elmnt = this.domHandlerService.winDocument.getElementById("demos");
    elmnt.scrollIntoView({ behavior: "smooth" });
  }
  public goToTop() {
    const elmnt = this.domHandlerService.winDocument.getElementById("top");
    elmnt.scrollIntoView({ behavior: "smooth" });
  }

}
