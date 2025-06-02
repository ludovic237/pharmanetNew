import { Component, OnInit, ViewChild } from '@angular/core';
import { SwiperConfigInterface, SwiperDirective, SwiperModule } from '../../../theme/components/swiper/swiper.module';
import { Product } from '@models/product';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppService } from '@services/app.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DomHandlerService } from '@services/dom-handler.service';
import { emailValidator } from '../../../theme/utils/app-validators';
import { ProductZoomComponent } from './product-zoom/product-zoom.component';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RatingComponent } from '@shared-components/rating/rating.component';
import { ControlsComponent } from '@shared-components/controls/controls.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { PipesModule } from '../../../theme/pipes/pipes.module';
import { DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-product-detail',
    imports: [
        ReactiveFormsModule,
        FlexLayoutModule,
        MatCardModule,
        MatChipsModule,
        MatButtonModule,
        MatIconModule,
        SwiperModule,
        RatingComponent,
        ControlsComponent,
        MatTabsModule,
        MatListModule,
        MatTooltipModule,
        MatInputModule,
        PipesModule,
        DecimalPipe
    ],
    templateUrl: './product-detail.component.html',
    styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {
  @ViewChild('zoomViewer') zoomViewer: any;
  @ViewChild(SwiperDirective) directiveRef: SwiperDirective;
  public config: SwiperConfigInterface = {};
  public product: Product;
  public image: any;
  public zoomImage: any;
  private sub: any;
  public form: FormGroup;

  constructor(public appService: AppService,
              private activatedRoute: ActivatedRoute,
              public dialog: MatDialog,
              public formBuilder: FormBuilder,
              public domHandlerService: DomHandlerService) { }

  ngOnInit(): void {
    this.getCategories();
    this.sub = this.activatedRoute.params.subscribe(params => {
      if (params['id']) {
        this.getProductById(params['id']);
      }
      else {
        this.getProductById(1);
      }
    });
    this.form = this.formBuilder.group({
      'review': [null, Validators.required],
      'name': [null, Validators.compose([Validators.required, Validators.minLength(4)])],
      'email': [null, Validators.compose([Validators.required, emailValidator])]
    });
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

  public onSubmit() {
    if (this.form.valid) {
      console.log(this.form.value);
    }
  }

  public getCategories() {
    if (this.appService.Data.categories.length == 0) {
      this.appService.getCategories().subscribe(data => {
        this.appService.Data.categories = data;
      });
    }
  }

}
