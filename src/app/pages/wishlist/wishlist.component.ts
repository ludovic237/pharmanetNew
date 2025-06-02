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
import { ControlsComponent } from '@shared-components/controls/controls.component';

@Component({
    selector: 'app-wishlist',
    imports: [
        RouterModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        ControlsComponent,
        DecimalPipe
    ],
    templateUrl: './wishlist.component.html',
    styleUrl: './wishlist.component.scss'
})
export class WishlistComponent implements OnInit {
  public quantity: number = 1;
  constructor(public appService: AppService, public snackBar: MatSnackBar) { }

  ngOnInit() {
    this.appService.Data.cartList.forEach(cartProduct => {
      this.appService.Data.wishList.forEach(product => {
        if (cartProduct.id == product.id) {
          product.cartCount = cartProduct.cartCount;
        }
      });
    });
  }

  public remove(product: Product) {
    const index: number = this.appService.Data.wishList.indexOf(product);
    if (index !== -1) {
      this.appService.Data.wishList.splice(index, 1);
    }
  }

  public clear() {
    this.appService.Data.wishList.length = 0;
  }

  public getQuantity(val: any) {
    this.quantity = val.soldQuantity;
  }

  public addToCart(product: Product): void {
    const currentProduct = this.appService.Data.cartList.find(item => item.id === product.id);
    if (currentProduct) {
      const availableCount = product.availibilityCount;
      const addedCount = currentProduct.cartCount + this.quantity;

      if (addedCount <= availableCount) {
        product.cartCount = addedCount;
      }
      else {
        const errorMessage = `You cannot add more items than available. In stock ${availableCount} items and you already added ${currentProduct.cartCount} item(s) to your cart`;
        this.snackBar.open(errorMessage, '×', { panelClass: 'error', verticalPosition: 'top', duration: 5000 });
        return;
      }
    }
    else {
      product.cartCount = this.quantity;
    }
    this.appService.addToCart(product);
  }

}