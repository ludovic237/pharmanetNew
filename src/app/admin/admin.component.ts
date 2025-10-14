import {ChangeDetectorRef, Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {NavigationEnd, Router, RouterModule} from '@angular/router';
import {FlexLayoutModule} from '@ngbracket/ngx-layout';
import {AdminMenuService} from '@services/admin-menu.service';
import {DomHandlerService} from '@services/dom-handler.service';
import {Settings, SettingsService} from '@services/settings.service';
import {NgScrollbarModule} from 'ngx-scrollbar';
import {BreadcrumbComponent} from './components/breadcrumb/breadcrumb.component';
import {FullScreenComponent} from './components/fullscreen/fullscreen.component';
import {LangsComponent} from './components/langs/langs.component';
import {MessagesComponent} from './components/messages/messages.component';
import {UserMenuComponent} from './components/user-menu/user-menu.component';
import {AdminMenuComponent} from './components/admin-menu/admin-menu.component';
import {AppService} from "@services/app.service";
import {AuthService} from "@services/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AppSettingsService} from "@services/app-settings.service";
import {getFilteredAdminMenuPharmaItems} from "../common/data/admin-menu-pharma";
import {subscribe} from "node:diagnostics_channel";
import {AdminMenu} from "@models/admin-menu.model";
import {ConfirmationDialogComponent} from "./vente/encaisser-vente/confirmation-dialog/confirmation-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {LoaderService} from "@services/loader.service";
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {join} from "node:path";
import {MatMenuModule} from "@angular/material/menu";


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
    TranslateModule,
    BreadcrumbComponent,
    FullScreenComponent,
    AdminMenuComponent,
    MatMenuModule,
    MatIconModule
],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {

  nom = "No Name";
  role = "N/A";
  @ViewChild('sidenav') sidenav: any;
  public userImage = 'images/others/admin.jpg';
  public settings: Settings;
  public menuItems: any[];
  public toggleSearchBar: boolean = false;

  constructor(
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
     public loaderService: LoaderService,
    public authService: AuthService,
    public snackBar: MatSnackBar, public settingsService: SettingsService,
    public router: Router,
    public translateService: TranslateService,
    private adminMenuService: AdminMenuService,
    private appSettingsService: AppSettingsService,
    private appService: AppService,
    public domHandlerService: DomHandlerService) {
    this.settings = this.settingsService.settings;
  }

  ngOnInit() {
    this.nom = localStorage.getItem("nom")
    this.role = localStorage.getItem("role") ? localStorage.getItem("role") : "N/A";

    if (this.domHandlerService.window?.innerWidth <= 960) {
      this.settings.adminSidenavIsOpened = false;
      this.settings.adminSidenavIsPinned = false;
    }
    ;
    setTimeout(() => {
      this.settings.theme = 'orange';
    });
    this.loadMenuItems()
    this.appSettingsService.settingsUpdated$.subscribe((param: string) => {
      const venteMode = localStorage.getItem('vente_mode') || 'default';

      // this.menuItems = this.adminMenuService.getMenuItemsWithParam(venteMode)
      this.menuItems = this.adminMenuService.getMenuItemsWithParam(venteMode).filter(item =>
        item.roles.includes(this.role)
      );
      this.cdr.detectChanges();
    });

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
    const venteMode = localStorage.getItem('vente_mode') || 'default';

    this.adminMenuService.expandActiveSubMenu(this.adminMenuService.getMenuItemsWithParam(venteMode));
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
      } else {
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
    } else {
      this.settings.adminSidenavIsOpened = true;
      this.settings.adminSidenavIsPinned = true;
    }
  }

  private loadMenuItems() {
    const venteMode = localStorage.getItem('vente_mode') || 'default';
    this.menuItems = this.adminMenuService.getMenuItemsWithParam(venteMode).filter(item =>
      item.roles.includes(this.role)
    );

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
        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
          localStorage.removeItem('token');
          localStorage.setItem("lastLink", window.location.href);
          ;
          this.snackBar.open('Déconnexion réussie.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
            localStorage.removeItem('token');
          window.location.href = '/sign-in';
        }
      }
    });
  }

  showConfirmation() {
    // recharger les données
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      // width: '50%',
      data: {
        type: 'logout', data: {}
      },
      panelClass: ['theme-dialog'],
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe((data: boolean) => {
      if (data === true) {
        this.logoutUser()
      } else {
        // Handle the "No" or dismissal case

      }
    });
  }

  getInitials(name:string){
    return name.trim().split(/\s+/).slice(0,2).map(w => w.charAt(0).toUpperCase()).join('')
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

  public changeLang(lang: string) {
    this.translateService.use(lang);
  }
}
