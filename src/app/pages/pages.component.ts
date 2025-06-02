import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Category } from '@models/category';
import { Product } from '@models/product';
import { AppService } from '@services/app.service';
import { DomHandlerService } from '@services/dom-handler.service';
import { Settings, SettingsService } from '@services/settings.service';
import { SidenavMenuService } from '@services/sidenav-menu.service';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatBadgeModule } from '@angular/material/badge';
import { SidenavMenuComponent } from '../theme/components/sidenav-menu/sidenav-menu.component';
import { TranslateModule } from '@ngx-translate/core';
import { TopMenuComponent } from '../theme/components/top-menu/top-menu.component';
import { MatMenuModule } from '@angular/material/menu';
import { CategoryListComponent } from '../shared-components/category-list/category-list.component';
import { DecimalPipe } from '@angular/common';
import { MenuComponent } from '../theme/components/menu/menu.component';
import { BreadcrumbComponent } from '../theme/components/breadcrumb/breadcrumb.component';
import { OptionsComponent } from '../theme/components/options/options.component';
import { FooterComponent } from '../theme/components/footer/footer.component';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-pages',
    imports: [
        RouterModule,
        FlexLayoutModule,
        MatSidenavModule,
        MatIconModule,
        MatToolbarModule,
        MatMenuModule,
        MatBadgeModule,
        MatButtonModule,
        TranslateModule,
        SidenavMenuComponent,
        TopMenuComponent,
        CategoryListComponent,
        MenuComponent,
        BreadcrumbComponent,
        OptionsComponent,
        FooterComponent,
        DecimalPipe
    ],
    templateUrl: './pages.component.html',
    styleUrl: './pages.component.scss',
    providers: [SidenavMenuService]
})
export class PagesComponent implements OnInit {
  public showBackToTop: boolean = false;
  public categories: Category[];
  public category: Category = new Category(0, '', false, 0);
  public sidenavMenuItems: Array<any>;
  @ViewChild('sidenav', { static: true }) sidenav: any;

  public settings: Settings;
  constructor(public settingsService: SettingsService,
              public appService: AppService,
              public sidenavMenuService: SidenavMenuService,
              public router: Router,
              public domHandlerService: DomHandlerService) {
    this.settings = this.settingsService.settings;
  }

  ngOnInit() {
    this.getCategories();
    this.sidenavMenuItems = this.sidenavMenuService.getSidenavMenuItems();
    setTimeout(() => {
      this.settings.theme = 'grey';
    });
  }

  public getCategories() {
    this.appService.getCategories().subscribe(data => {
      this.categories = data;
      this.category = data[0];
      this.appService.Data.categories = data;
    })
  }

  public changeCategory(event: any) {
    if (event.target) {
      this.category = this.categories.filter(category => category.name == event.target.innerText)[0];
    }
    if (this.domHandlerService.window?.innerWidth < 960) {
      this.stopClickPropagate(event);
    }
  }

  public remove(product: Product) {
    const index: number = this.appService.Data.cartList.indexOf(product);
    if (index !== -1) {
      this.appService.Data.cartList.splice(index, 1);
      this.appService.Data.totalPrice = this.appService.Data.totalPrice! - product.newPrice * product.cartCount;
      this.appService.Data.totalCartCount = this.appService.Data.totalCartCount! - product.cartCount;
      this.appService.resetProductCartCount(product);
    }
  }

  public clear() {
    this.appService.Data.cartList.forEach(product => {
      this.appService.resetProductCartCount(product);
    });
    this.appService.Data.cartList.length = 0;
    this.appService.Data.totalPrice = 0;
    this.appService.Data.totalCartCount = 0;
  }


  public changeTheme(theme: string) {
    this.settings.theme = theme;
  }

  public stopClickPropagate(event: any) {
    event.stopPropagation();
    event.preventDefault();
  }

  public search() { }


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
        this.domHandlerService.winScroll(0, 0);
      });
    }
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll($event: any) {
    const scrollTop = Math.max(this.domHandlerService.window?.pageYOffset, this.domHandlerService.winDocument.documentElement.scrollTop, this.domHandlerService.winDocument.body.scrollTop);
    let header_toolbar = this.domHandlerService.winDocument.getElementById('header-toolbar');
    if (header_toolbar) {
      if (scrollTop >= header_toolbar.clientHeight) {
        this.settings.mainToolbarFixed = true;
      }
      else {
        if (!this.domHandlerService.winDocument.documentElement.classList.contains('cdk-global-scrollblock')) {
          this.settings.mainToolbarFixed = false;
        }
      }
    }
    else {
      this.settings.mainToolbarFixed = true;
    }
    ($event.target.documentElement.scrollTop > 300) ? this.showBackToTop = true : this.showBackToTop = false;
  }

  ngAfterViewInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.sidenav.close();
      }
    });
    this.sidenavMenuService.expandActiveSubMenu(this.sidenavMenuService.getSidenavMenuItems());
  }

  public closeSubMenus() {
    if (this.domHandlerService.window?.innerWidth < 960) {
      this.sidenavMenuService.closeAllSubMenus();
    }
  }

}
