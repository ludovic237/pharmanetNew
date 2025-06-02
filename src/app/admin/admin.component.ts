import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; 
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { AdminMenuService } from '@services/admin-menu.service';
import { DomHandlerService } from '@services/dom-handler.service';
import { Settings, SettingsService } from '@services/settings.service';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { FullScreenComponent } from './components/fullscreen/fullscreen.component';
import { LangsComponent } from './components/langs/langs.component';
import { MessagesComponent } from './components/messages/messages.component';
import { UserMenuComponent } from './components/user-menu/user-menu.component';
import { AdminMenuComponent } from './components/admin-menu/admin-menu.component';

@Component({
    selector: 'app-admin',
    imports: [
        RouterModule,
        MatToolbarModule,
        FlexLayoutModule,
        MatButtonModule,
        MatIconModule,
        MatSidenavModule,
        NgScrollbarModule,
        BreadcrumbComponent,
        FullScreenComponent,
        LangsComponent,
        MessagesComponent,
        UserMenuComponent,
        AdminMenuComponent
    ],
    templateUrl: './admin.component.html',
    styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  @ViewChild('sidenav') sidenav: any;
  public userImage = 'images/others/admin.jpg';
  public settings: Settings;
  public menuItems: Array<any>;
  public toggleSearchBar: boolean = false;
  
  constructor(public settingsService: SettingsService,
              public router: Router,
              private adminMenuService: AdminMenuService,
              public domHandlerService: DomHandlerService) {
              this.settings = this.settingsService.settings;
  }

  ngOnInit() {
    if (this.domHandlerService.window?.innerWidth <= 960) {
      this.settings.adminSidenavIsOpened = false;
      this.settings.adminSidenavIsPinned = false;
    };
    setTimeout(() => {
      this.settings.theme = 'blue';
    });
    this.menuItems = this.adminMenuService.getMenuItems();
  }

  ngAfterViewInit() {
    if (this.domHandlerService.winDocument.getElementById('preloader')) {
      this.domHandlerService.winDocument.getElementById('preloader').classList.add('hide');
    }
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.scrollToTop();
      }
      if (this.domHandlerService.window?.innerWidth <= 960) {
        this.sidenav.close();
      }
    });
    this.adminMenuService.expandActiveSubMenu(this.adminMenuService.getMenuItems());
  }

  public toggleSidenav() {
    this.sidenav.toggle();
  }

  public scrollToTop() {
    var scrollDuration = 200;
    var scrollStep = -this.domHandlerService.window?.pageYOffset / (scrollDuration / 20);
    var scrollInterval = setInterval(() => {
      if (this.domHandlerService.window?.pageYOffset != 0) {
        this.domHandlerService.window?.scrollBy(0, scrollStep);
      }
      else {
        clearInterval(scrollInterval);
      }
    }, 10);
    if (this.domHandlerService.window?.innerWidth <= 768) {
      setTimeout(() => {
        this.domHandlerService.window?.scrollTo(0, 0);
      });
    }
  }

  @HostListener('window:resize')
  public onWindowResize(): void {
    if (this.domHandlerService.window?.innerWidth <= 960) {
      this.settings.adminSidenavIsOpened = false;
      this.settings.adminSidenavIsPinned = false;
    }
    else {
      this.settings.adminSidenavIsOpened = true;
      this.settings.adminSidenavIsPinned = true;
    }
  }

}
