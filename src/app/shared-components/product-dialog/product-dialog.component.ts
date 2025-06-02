import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { SwiperConfigInterface, SwiperModule } from '../../theme/components/swiper/swiper.module';
import { AppService } from '@services/app.service';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Product } from '@models/product';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RatingComponent } from '@shared-components/rating/rating.component';
import { ControlsComponent } from '@shared-components/controls/controls.component';
import { PipesModule } from '../../theme/pipes/pipes.module';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';

@Component({
    selector: 'app-product-dialog',
    imports: [
        SwiperModule,
        FlexLayoutModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        RatingComponent,
        ControlsComponent,
        PipesModule
    ],
    templateUrl: './product-dialog.component.html',
    styleUrl: './product-dialog.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class ProductDialogComponent {
  public config: SwiperConfigInterface = {};
  constructor(public appService: AppService,
              public dialogRef: MatDialogRef<ProductDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public product: Product) { }

  ngAfterViewInit() {
    this.config = {
      slidesPerView: 1,
      spaceBetween: 0,
      keyboard: true,
      navigation: true,
      pagination: false,
      grabCursor: true,
      loop: false,
      preloadImages: false,
      lazy: true,
      effect: "fade",
      fadeEffect: {
        crossFade: true
      }
    }
  }

  public close(): void {
    this.dialogRef.close();
  }
}