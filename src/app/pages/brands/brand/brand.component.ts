import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatExpansionModule } from '@angular/material/expansion';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Category } from '@models/category';
import { Product } from '@models/product';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { AppService } from '@services/app.service';
import { DomHandlerService } from '@services/dom-handler.service';
import { Settings, SettingsService } from '@services/settings.service';
import { ProductDialogComponent } from '@shared-components/product-dialog/product-dialog.component';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { CategoryListComponent } from '@shared-components/category-list/category-list.component';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { PipesModule } from '../../../theme/pipes/pipes.module';
import { DecimalPipe } from '@angular/common';
import { RatingComponent } from '@shared-components/rating/rating.component';
import { ControlsComponent } from '@shared-components/controls/controls.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-brand',
    imports: [
        RouterModule,
        FlexLayoutModule,
        MatSidenavModule,
        NgScrollbarModule,
        MatExpansionModule,
        CategoryListComponent,
        MatSliderModule,
        FormsModule,
        MatIconModule,
        MatCheckboxModule,
        MatMenuModule,
        MatCardModule,
        MatChipsModule,
        PipesModule,
        DecimalPipe,
        RatingComponent,
        ControlsComponent,
        NgxPaginationModule,
        MatButtonModule
    ],
    templateUrl: './brand.component.html',
    styleUrl: './brand.component.scss'
})
export class BrandComponent implements OnInit {
  @ViewChild('sidenav', { static: true }) sidenav: any;
  public sidenavOpen: boolean = true;
  private sub: any;
  public viewType: string = 'grid';
  public viewCol: number = 25;
  public counts = [12, 24, 36];
  public count: number;
  public sortings = ['Sort by Default', 'Best match', 'Lowest first', 'Highest first'];
  public sort: string;
  public products: Array<Product> = [];
  public categories: Category[];
  public priceFrom: number = 750;
  public priceTo: number = 1599;
  public colors = [
    { name: "#5C6BC0", selected: false },
    { name: "#66BB6A", selected: false },
    { name: "#EF5350", selected: false },
    { name: "#BA68C8", selected: false },
    { name: "#FF4081", selected: false },
    { name: "#9575CD", selected: false },
    { name: "#90CAF9", selected: false },
    { name: "#B2DFDB", selected: false },
    { name: "#DCE775", selected: false },
    { name: "#FFD740", selected: false },
    { name: "#00E676", selected: false },
    { name: "#FBC02D", selected: false },
    { name: "#FF7043", selected: false },
    { name: "#F5F5F5", selected: false },
    { name: "#696969", selected: false }
  ];
  public sizes = [
    { name: "S", selected: false },
    { name: "M", selected: false },
    { name: "L", selected: false },
    { name: "XL", selected: false },
    { name: "2XL", selected: false },
    { name: "32", selected: false },
    { name: "36", selected: false },
    { name: "38", selected: false },
    { name: "46", selected: false },
    { name: "52", selected: false },
    { name: "13.3\"", selected: false },
    { name: "15.4\"", selected: false },
    { name: "17\"", selected: false },
    { name: "21\"", selected: false },
    { name: "23.4\"", selected: false }
  ];
  public page: any;
  public settings: Settings;
  
  constructor(public settingsService: SettingsService,
              private activatedRoute: ActivatedRoute,
              public appService: AppService,
              public dialog: MatDialog,
              private router: Router,
              public domHandlerService: DomHandlerService) {
    this.settings = this.settingsService.settings;
  }

  ngOnInit() {
    this.count = this.counts[0];
    this.sort = this.sortings[0];
    this.sub = this.activatedRoute.params.subscribe(params => {
      // console.log(params['name']);
    });
    if (this.domHandlerService.window?.innerWidth < 960) {
      this.sidenavOpen = false;
    };
    if (this.domHandlerService.window?.innerWidth < 1280) {
      this.viewCol = 33.3;
    };

    this.getCategories();
    this.getAllProducts();
  }

  public getAllProducts() {
    this.appService.getProducts("brand").subscribe(data => {
      this.products = data;
      //for show more product  
      for (var index = 0; index < 3; index++) {
        this.products = this.products.concat(this.products);
      }
    });
  }

  public getCategories() {
    if (this.appService.Data.categories.length == 0) {
      this.appService.getCategories().subscribe(data => {
        this.categories = data;
        this.appService.Data.categories = data;
      });
    }
    else {
      this.categories = this.appService.Data.categories;
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  @HostListener('window:resize')
  public onWindowResize(): void {
    (this.domHandlerService.window?.innerWidth < 960) ? this.sidenavOpen = false : this.sidenavOpen = true;
    (this.domHandlerService.window?.innerWidth < 1280) ? this.viewCol = 33.3 : this.viewCol = 25;
  }

  public changeCount(count: number) {
    this.count = count;
    this.getAllProducts();
  }

  public changeSorting(sort: string) {
    this.sort = sort;
  }

  public changeViewType(viewType: string, viewCol: number) {
    this.viewType = viewType;
    this.viewCol = viewCol;
  }

  public openProductDialog(product: Product) {
    let dialogRef = this.dialog.open(ProductDialogComponent, {
      data: product,
      panelClass: 'product-dialog',
      direction: (this.settings.rtl) ? 'rtl' : 'ltr'
    });
    dialogRef.afterClosed().subscribe(product => {
      if (product) {
        this.router.navigate(['/products', product.id, product.name]);
      }
    });
  }

  public onPageChanged(event: any) {
    this.page = event;
    this.getAllProducts();
    this.domHandlerService.winScroll(0, 0);
  }

  public onChangeCategory(event: any) {
    if (event.target) {
      this.router.navigate(['/products', event.target.innerText.toLowerCase()]);
    }
  }

}