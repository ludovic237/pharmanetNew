import { DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { Product } from '@models/product'; 
import { AppService } from '@services/app.service';
import { RatingComponent } from '@shared-components/rating/rating.component';

@Component({
    selector: 'app-compare',
    imports: [
        RouterModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        DecimalPipe,
        RatingComponent,
        MatChipsModule
    ],
    templateUrl: './compare.component.html',
    styleUrl: './compare.component.scss'
})
export class CompareComponent implements OnInit {

  constructor(public appService: AppService, public snackBar: MatSnackBar) { }

  ngOnInit() {
    this.appService.Data.cartList.forEach(cartProduct => {
      this.appService.Data.compareList.forEach(product => {
        if (cartProduct.id == product.id) {
          product.cartCount = cartProduct.cartCount;
        }
      });
    });
  }

  public remove(product: Product) {
    const index: number = this.appService.Data.compareList.indexOf(product);
    if (index !== -1) {
      this.appService.Data.compareList.splice(index, 1);
    }
  }

  public clear() {
    this.appService.Data.compareList.length = 0;
  }

  public addToCart(product: Product) {
    product.cartCount = product.cartCount + 1;
    if (product.cartCount <= product.availibilityCount) {
      this.appService.addToCart(product);
    }
    else {
      product.cartCount = product.availibilityCount;
      this.snackBar.open('You can not add more items than available. In stock ' + product.availibilityCount + ' items and you already added ' + product.cartCount + ' item to your cart', '×', { panelClass: 'error', verticalPosition: 'top', duration: 5000 });
    }
  }

}
