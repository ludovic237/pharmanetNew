import { Component, HostListener, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { Product } from '@models/product';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { AppService } from '@services/app.service';
import { DomHandlerService } from '@services/dom-handler.service';
import { ConfirmDialogComponent } from '@shared-components/confirm-dialog/confirm-dialog.component';
import { RatingComponent } from '@shared-components/rating/rating.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { PipesModule } from '../../../theme/pipes/pipes.module';
import { DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-product-list',
    imports: [
        RouterModule,
        FlexLayoutModule,
        MatCardModule,
        MatChipsModule,
        MatButtonModule,
        MatIconModule,
        RatingComponent,
        NgxPaginationModule,
        PipesModule,
        DecimalPipe
    ],
    templateUrl: './product-list.component.html',
    styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  public products: Array<Product> = [];
  public viewCol: number = 25;
  public page: any;
  public count = 12;
  
  constructor(public appService: AppService, public dialog: MatDialog, public domHandlerService: DomHandlerService) { }

  ngOnInit(): void {
    if (this.domHandlerService.window?.innerWidth < 1280) {
      this.viewCol = 33.3;
    };
    this.getCategories();
    this.getAllProducts();
  }

  public getAllProducts() {
    this.appService.getProducts("featured").subscribe(data => {
      this.products = data;
      //for show more product  
      for (var index = 0; index < 3; index++) {
        this.products = this.products.concat(this.products);
      }
    });
  }

  public onPageChanged(event: any) {
    this.page = event;
    this.domHandlerService.winScroll(0, 0);
  }

  @HostListener('window:resize')
  public onWindowResize(): void {
    (this.domHandlerService.window?.innerWidth < 1280) ? this.viewCol = 33.3 : this.viewCol = 25;
  }


  public remove(product: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: {
        title: "Confirm Action",
        message: "Are you sure you want delete this product?"
      }
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        const index: number = this.products.indexOf(product);
        if (index !== -1) {
          this.products.splice(index, 1);
        }
      }
    });
  }

  public getCategories() {
    if (this.appService.Data.categories.length == 0) {
      this.appService.getCategories().subscribe(data => {
        this.appService.Data.categories = data;
      });
    }
  }

}
