import { Component, Input } from '@angular/core';
import { Product } from '@models/product';
import { SwiperConfigInterface, SwiperModule } from '../../theme/components/swiper/swiper.module';
import { Settings, SettingsService } from '@services/settings.service';
import { AppService } from '@services/app.service';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RatingComponent } from '@shared-components/rating/rating.component';
import { ControlsComponent } from '@shared-components/controls/controls.component';
import { DecimalPipe } from '@angular/common';
import { PipesModule } from '../../theme/pipes/pipes.module';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { ProductDialogComponent } from '@shared-components/product-dialog/product-dialog.component';

@Component({
    selector: 'app-products-carousel',
    imports: [
        FlexLayoutModule,
        RouterModule,
        SwiperModule,
        MatCardModule,
        MatChipsModule,
        MatButtonModule,
        MatIconModule,
        RatingComponent,
        ControlsComponent,
        DecimalPipe,
        PipesModule
    ],
    templateUrl: './products-carousel.component.html',
    styleUrl: './products-carousel.component.scss'
})
export class ProductsCarouselComponent {
  @Input('products') products: Array<Product> = [];
  public config: SwiperConfigInterface = {};
  public settings: Settings;
  constructor(public settingsService: SettingsService, public appService: AppService, public dialog: MatDialog, private router: Router) {
    this.settings = this.settingsService.settings;
  }

  ngAfterViewInit() {
    this.config = {
      observer: true,
      slidesPerView: 1,
      spaceBetween: 16,
      keyboard: true,
      navigation: true,
      pagination: false,
      grabCursor: true,
      loop: false,
      preloadImages: false,
      lazy: true,
      breakpoints: {
        480: {
          slidesPerView: 1
        },
        740: {
          slidesPerView: 2
        },
        960: {
          slidesPerView: 3
        },
        1280: {
          slidesPerView: 4
        },
        1500: {
          slidesPerView: 5
        }
      }
    }
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
}
