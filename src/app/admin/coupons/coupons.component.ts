import { Component, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Category } from '@models/category';
import { AppService } from '@services/app.service';
import { DomHandlerService } from '@services/dom-handler.service';
import { Settings, SettingsService } from '@services/settings.service';
import { coupons } from '../../common/data/coupons';
import { CouponDialogComponent } from './coupon-dialog/coupon-dialog.component';
import { ConfirmDialogComponent } from '@shared-components/confirm-dialog/confirm-dialog.component';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { NgxPaginationModule } from 'ngx-pagination';
import { PipesModule } from '../../theme/pipes/pipes.module';
import { DatePipe } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-coupons',
    imports: [
        FlexLayoutModule,
        MatCardModule,
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatTooltipModule,
        NgxPaginationModule,
        PipesModule,
        DatePipe
    ],
    templateUrl: './coupons.component.html',
    styleUrl: './coupons.component.scss'
})
export class CouponsComponent implements OnInit {
  public coupons: any[] = [];
  public stores = [
    { id: 1, name: 'Store 1' },
    { id: 2, name: 'Store 2' }
  ];
  public discountTypes = [
    { id: 1, name: 'Percentage discount' },
    { id: 2, name: 'Fixed Cart Discount' },
    { id: 3, name: 'Fixed Product Discount' }
  ];
  public categories: Category[];
  public page: any;
  public count = 6;
  domHandlerService = inject(DomHandlerService);
  public settings: Settings;
  constructor(public appService: AppService, public dialog: MatDialog, public settingsService: SettingsService) {
    this.settings = this.settingsService.settings;
  }

  ngOnInit(): void {
    this.coupons = coupons;
    this.getCategories();
  }

  public getCategories() {
    this.appService.getCategories().subscribe(data => {
      this.categories = data;
      this.categories.shift();
    });
  }

  public onPageChanged(event: any) {
    this.page = event;
    this.domHandlerService.winScroll(0, 0);
  }

  public openCouponDialog(data: any) {
    const dialogRef = this.dialog.open(CouponDialogComponent, {
      data: {
        coupon: data,
        stores: this.stores,
        categories: this.categories,
        discountTypes: this.discountTypes
      },
      panelClass: ['theme-dialog'],
      autoFocus: false,
      direction: (this.settings.rtl) ? 'rtl' : 'ltr'
    });
    dialogRef.afterClosed().subscribe(coupon => {
      if (coupon) {
        const index: number = this.coupons.findIndex(x => x.id == coupon.id);
        if (index !== -1) {
          this.coupons[index] = coupon;
        }
        else {
          let last_coupon = this.coupons[this.coupons.length - 1];
          coupon.id = last_coupon.id + 1;
          this.coupons.push(coupon);
        }
      }
    });
  }

  public remove(coupon: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: {
        title: "Confirm Action",
        message: "Are you sure you want remove this coupon?"
      }
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        const index: number = this.coupons.indexOf(coupon);
        if (index !== -1) {
          this.coupons.splice(index, 1);
        }
      }
    });
  }

}
