import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SwiperConfigInterface, SwiperDirective, SwiperModule } from '../../../theme/components/swiper/swiper.module';
import { Product } from '@models/product';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { AppService } from '@services/app.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DomHandlerService } from '@services/dom-handler.service';
import { emailValidator } from '../../../theme/utils/app-validators';
import { ProductZoomComponent } from './product-zoom/product-zoom.component';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PipesModule } from '../../../theme/pipes/pipes.module';
import { RatingComponent } from '@shared-components/rating/rating.component';
import { DecimalPipe } from '@angular/common';
import { ControlsComponent } from '@shared-components/controls/controls.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProductsCarouselComponent } from '@shared-components/products-carousel/products-carousel.component';
import { Settings, SettingsService } from '@services/settings.service';

@Component({
    selector: 'app-product',
    imports: [
        RouterModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        MatCardModule,
        MatChipsModule,
        SwiperModule,
        MatButtonModule,
        MatIconModule,
        PipesModule,
        RatingComponent,
        DecimalPipe,
        ControlsComponent,
        MatTabsModule,
        MatListModule,
        MatInputModule,
        MatTooltipModule,
        ProductsCarouselComponent
    ],
    templateUrl: './product.component.html',
    styleUrl: './product.component.scss'
})
export class ProductComponent implements OnInit {
  @ViewChild('zoomViewer', { static: true }) zoomViewer: ElementRef;
  @ViewChild(SwiperDirective, { static: true }) directiveRef: SwiperDirective;
  public config: SwiperConfigInterface = {};
  public product: Product;
  public image: any;
  public zoomImage: any;
  private sub: any;
  public form: FormGroup;
  public relatedProducts: Array<Product>;
  public settings: Settings;

  constructor(public settingsService: SettingsService,
              public appService: AppService,
              private activatedRoute: ActivatedRoute,
              public dialog: MatDialog,
              public formBuilder: FormBuilder,
              public domHandlerService: DomHandlerService) { 
    this.settings = this.settingsService.settings;
  }

  ngOnInit() {
    this.sub = this.activatedRoute.params.subscribe(params => {
      this.getProductById(params['id']);
    });
    this.form = this.formBuilder.group({
      'review': [null, Validators.required],
      'name': [null, Validators.compose([Validators.required, Validators.minLength(4)])],
      'email': [null, Validators.compose([Validators.required, emailValidator])]
    });
    this.getRelatedProducts();
  }

  ngAfterViewInit() {
    this.config = {
      observer: true,
      slidesPerView: 4,
      spaceBetween: 10,
      keyboard: true,
      navigation: true,
      pagination: false,
      loop: false,
      preloadImages: false,
      lazy: true,
      breakpoints: {
        480: {
          slidesPerView: 2
        },
        600: {
          slidesPerView: 3,
        }
      }
    }
  }

  public getProductById(id: number) {
    this.appService.getProductById(id).subscribe(data => {
      this.product = data;
      this.image = data.images[0].medium;
      this.zoomImage = data.images[0].big; 
      if (this.domHandlerService.isBrowser) {
        this.config.observer = false;
        setTimeout(() => {
          this.config.observer = true;
          // this.directiveRef.update()
        });
      }  
    });
  }

  public getRelatedProducts() {
    this.appService.getProducts('related').subscribe(data => {
      this.relatedProducts = data;
    })
  }

  public selectImage(image: any) {
    this.image = image.medium;
    this.zoomImage = image.big;
  }

  public onMouseMove(e: any) {
    if (this.domHandlerService.window?.innerWidth >= 1280) {
      var image, offsetX, offsetY, x, y, zoomer;
      image = e.currentTarget;
      offsetX = e.offsetX;
      offsetY = e.offsetY;
      x = offsetX / image.offsetWidth * 100;
      y = offsetY / image.offsetHeight * 100;
      zoomer = this.zoomViewer.nativeElement.children[0];
      if (zoomer) {
        zoomer.style.backgroundPosition = x + '% ' + y + '%';
        zoomer.style.display = "block";
        zoomer.style.height = image.height + 'px';
        zoomer.style.width = image.width + 'px';
      }
    }
  }

  public onMouseLeave(event: any) {
    this.zoomViewer.nativeElement.children[0].style.display = "none";
  }

  public openZoomViewer() {
    this.dialog.open(ProductZoomComponent, {
      data: this.zoomImage,
      panelClass: 'zoom-dialog'
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  public onSubmit(values: Object): void {
    if (this.form.valid) {
      //email sent
    }
  }
}