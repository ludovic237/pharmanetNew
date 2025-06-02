import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { DomHandlerService } from '@services/dom-handler.service';
import { Settings, SettingsService } from '@services/settings.service';

@Component({
    selector: 'app-account',
    imports: [
        RouterModule,
        MatSidenavModule,
        MatButtonModule,
        MatIconModule,
        FlexLayoutModule
    ],
    templateUrl: './account.component.html',
    styleUrl: './account.component.scss'
})
export class AccountComponent implements OnInit {
  @ViewChild('sidenav', { static: true }) sidenav: any;
  public sidenavOpen: boolean = true;
  public links = [
    { name: 'Account Dashboard', href: 'dashboard', icon: 'dashboard' },
    { name: 'Account Information', href: 'information', icon: 'info' },
    { name: 'Addresses', href: 'addresses', icon: 'location_on' },
    { name: 'Order History', href: 'orders', icon: 'add_shopping_cart' },
    { name: 'Logout', href: '/sign-in', icon: 'power_settings_new' },
  ];
  public settings: Settings;
  
  constructor(public router: Router, public domHandlerService: DomHandlerService, public settingsService: SettingsService) {
    this.settings = this.settingsService.settings;
  }

  ngOnInit() {
    if (this.domHandlerService.window?.innerWidth < 960) {
      this.sidenavOpen = false;
    };
  }

  @HostListener('window:resize')
  public onWindowResize(): void {
    (this.domHandlerService.window?.innerWidth < 960) ? this.sidenavOpen = false : this.sidenavOpen = true;
  }

  ngAfterViewInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (this.domHandlerService.window?.innerWidth < 960) {
          this.sidenav.close();
        }
      }
    });
  }

}
