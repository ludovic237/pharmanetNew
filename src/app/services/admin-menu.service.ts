import {Injectable} from '@angular/core';
import {Location} from '@angular/common';
import {Router} from '@angular/router';
import {DomHandlerService} from './dom-handler.service';
import {AdminMenu} from '@models/admin-menu.model';
import {AppService} from "@services/app.service";
import {getFilteredAdminMenuPharmaItems} from "../common/data/admin-menu-pharma";
import {AppSettingsService} from "@services/app-settings.service";
// import { adminMenuItems } from '../common/data/admin-menu';


@Injectable({
  providedIn: 'root'
})
export class AdminMenuService {
  constructor(private location: Location,
              private router: Router,
              private appService: AppService,
              private appSettingsService: AppSettingsService,
              public domHandlerService: DomHandlerService) {
  }

  public getMenuItems(): Array<AdminMenu> {
    this.appSettingsService.settingsUpdated$.subscribe((param: any) => {
      return getFilteredAdminMenuPharmaItems(param);
    });
    return getFilteredAdminMenuPharmaItems(localStorage.getItem("vente_mode"));
  }

  public getMenuItemsWithParam(param: string): Array<AdminMenu> {
    return getFilteredAdminMenuPharmaItems(param);
  }

  public expandActiveSubMenu(menu: Array<AdminMenu>) {
    let url = this.location.path();
    let routerLink = decodeURIComponent(url);
    let activeMenuItem = menu.find(item => item.routerLink === routerLink);
    if (activeMenuItem) {
      let menuItem = activeMenuItem;
      while (menuItem.parentId != 0) {
        let parentMenuItem = menu.find(item => item.id == menuItem.parentId);
        menuItem = parentMenuItem;
        this.toggleMenuItem(menuItem.id);
      }
    }
  }

  public toggleMenuItem(menuId: number) {
    let menuItem = this.domHandlerService.winDocument.getElementById('menu-item-' + menuId);
    let subMenu = this.domHandlerService.winDocument.getElementById('sub-menu-' + menuId);
    if (subMenu) {
      if (subMenu.classList.contains('show')) {
        subMenu.classList.remove('show');
        menuItem.classList.remove('expanded');
      } else {
        subMenu.classList.add('show');
        menuItem.classList.add('expanded');
      }
    }
  }

  public closeOtherSubMenus(menu: Array<AdminMenu>, menuId: number) {
    let currentMenuItem = menu.find(item => item.id == menuId);
    menu.forEach(item => {
      if ((item.id != menuId && item.parentId == currentMenuItem.parentId) || (currentMenuItem.parentId == 0 && item.id != menuId)) {
        let subMenu = this.domHandlerService.winDocument.getElementById('sub-menu-' + item.id);
        let menuItem = this.domHandlerService.winDocument.getElementById('menu-item-' + item.id);
        if (subMenu) {
          if (subMenu.classList.contains('show')) {
            subMenu.classList.remove('show');
            menuItem.classList.remove('expanded');
          }
        }
      }
    });
  }

  public closeAllSubMenus() {
    getFilteredAdminMenuPharmaItems(localStorage.getItem("vente_mode")).forEach((item: AdminMenu) => {
      let subMenu = this.domHandlerService.winDocument.getElementById('sub-menu-' + item.id);
      let menuItem = this.domHandlerService.winDocument.getElementById('menu-item-' + item.id);
      if (subMenu) {
        if (subMenu.classList.contains('show')) {
          subMenu.classList.remove('show');
          menuItem.classList.remove('expanded');
        }
      }
    });
  }

}
