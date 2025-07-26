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

const test = () => {
  return [
    new AdminMenu(10, 'ADMIN_NAV.DASHBOARD', '/admin', null, 'dashboard', null, false, 0),
    new AdminMenu(20, 'Catalogue', null, null, 'grid_on', null, true, 0),
    new AdminMenu(21, 'Categories', '/admin/products/categories', null, 'category', null, false, 20),
    new AdminMenu(22, 'ADMIN_NAV.PRODUCT_LIST', '/admin/products/product-list', null, 'list', null, false, 20),
    new AdminMenu(23, 'ADMIN_NAV.PRODUCT_DETAIL', '/admin/products/product-detail', null, 'remove_red_eye', null, false, 20),
    new AdminMenu(24, 'ADMIN_NAV.ADD_PRODUCT', '/admin/products/add-product', null, 'add_circle_outline', null, false, 20),
    new AdminMenu(25, 'Formes', '/admin/products/formes', null, 'category', null, false, 20),
    new AdminMenu(26, 'Fabriquants', '/admin/products/fabriquants', null, 'factory', null, false, 20),
    new AdminMenu(27, 'Rayons', '/admin/products/rayons', null, 'store', null, false, 20),
    new AdminMenu(28, 'magasins', '/admin/products/magasins', null, 'store_mall_directory', null, false, 20),
    new AdminMenu(29, 'Rapport caisse', '/admin/products/rapport-caisse', null, 'store_mall_directory', null, false, 20),
    new AdminMenu(30, 'Produit detail list', '/admin/products/product-detail-list', null, 'store_mall_directory', null, false, 20),

    // Vente menu and submenus
    new AdminMenu(300, 'ventes', null, null, 'shopping_cart', null, true, 0),
    new AdminMenu(301, 'liste ventes', '/admin/ventes/list', null, 'list', null, false, 300),
    new AdminMenu(303, 'ajouter vente', '/admin/ventes/ajouter-vente', null, 'bar_chart', null, false, 300),
    new AdminMenu(304, 'retour produit', '/admin/ventes/retour-produit', null, 'bar_chart', null, false, 300),

    new AdminMenu(400, 'commande', '/admin/commandes/lister-ajouter-commande', null, 'assignment', null, false, 0),

    // Stock menu and submenus
    new AdminMenu(500, 'Stock', null, null, 'inventory', null, true, 0),
    new AdminMenu(501, 'Entrées', '/admin/stock/entrees', null, 'input', null, false, 500),
    new AdminMenu(502, 'Sorties', '/admin/stock/sorties', null, 'output', null, false, 500),
    new AdminMenu(503, 'Inventaire', '/admin/stock/inventaire', null, 'list_alt', null, false, 500),

    new AdminMenu(600, 'Parametre', '/admin/setting', null, 'assignment', null, false, 0),

  ];
};

const test2 = () => {
  return [
    new AdminMenu(10, 'ADMIN_NAV.DASHBOARD', '/admin', null, 'dashboard', null, false, 0),
    new AdminMenu(20, 'Catalogue', null, null, 'grid_on', null, true, 0),
    new AdminMenu(26, 'Fabriquants', '/admin/products/fabriquants', null, 'factory', null, false, 20),
    new AdminMenu(27, 'Rayons', '/admin/products/rayons', null, 'store', null, false, 20),
    new AdminMenu(28, 'magasins', '/admin/products/magasins', null, 'store_mall_directory', null, false, 20),
    new AdminMenu(29, 'Rapport caisse', '/admin/products/rapport-caisse', null, 'store_mall_directory', null, false, 20),
    new AdminMenu(30, 'Produit detail list', '/admin/products/product-detail-list', null, 'store_mall_directory', null, false, 20),

    // Vente menu and submenus
    new AdminMenu(300, 'ventes', null, null, 'shopping_cart', null, true, 0),
    new AdminMenu(301, 'liste ventes', '/admin/ventes/list', null, 'list', null, false, 300),
    new AdminMenu(303, 'ajouter vente', '/admin/ventes/ajouter-vente', null, 'bar_chart', null, false, 300),

    new AdminMenu(400, 'commande', '/admin/commandes/lister-ajouter-commande', null, 'assignment', null, false, 0),

    // Stock menu and submenus
    new AdminMenu(500, 'Stock', null, null, 'inventory', null, true, 0),
    new AdminMenu(501, 'Entrées', '/admin/stock/entrees', null, 'input', null, false, 500),
    new AdminMenu(502, 'Sorties', '/admin/stock/sorties', null, 'output', null, false, 500),

    new AdminMenu(600, 'Parametre', '/admin/setting', null, 'assignment', null, false, 0),

  ];
};

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
    AdminMenuComponent
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  @ViewChild('sidenav') sidenav: any;
  public userImage = 'images/others/admin.jpg';
  public settings: Settings;
  public menuItems: any[];
  public toggleSearchBar: boolean = false;

  constructor(
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    public authService: AuthService,
    public snackBar: MatSnackBar, public settingsService: SettingsService,
    public router: Router,
    private adminMenuService: AdminMenuService,
    private appSettingsService: AppSettingsService,
    private appService: AppService,
    public domHandlerService: DomHandlerService) {
    this.settings = this.settingsService.settings;
  }

  ngOnInit() {
    if (this.domHandlerService.window?.innerWidth <= 960) {
      this.settings.adminSidenavIsOpened = false;
      this.settings.adminSidenavIsPinned = false;
    }
    ;
    setTimeout(() => {
      this.settings.theme = 'green';
    });
    this.loadMenuItems()
    this.appSettingsService.settingsUpdated$.subscribe((param: string) => {
      const venteMode = localStorage.getItem('vente_mode') || 'default';
      this.menuItems = this.adminMenuService.getMenuItemsWithParam(venteMode)
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
    this.menuItems = this.adminMenuService.getMenuItemsWithParam(venteMode);
  }

  logoutUser(): void {
    this.authService.logout().subscribe({
      next: () => {
        localStorage.removeItem('token');
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
        console.log('User canceled the action.');
      }
    });
  }

}
