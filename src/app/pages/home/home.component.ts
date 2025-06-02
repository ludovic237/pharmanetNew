import { Component } from '@angular/core';
import { Product } from '@models/product';
import { AppService } from '@services/app.service';
import { MainCarouselComponent } from '@shared-components/main-carousel/main-carousel.component';
import { MainCarouselSlide } from '../../common/interfaces/main-carousel-slide';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Banner } from '../../common/interfaces/banner';
import { BannersComponent } from '@shared-components/banners/banners.component';
import { ProductsCarouselComponent } from '@shared-components/products-carousel/products-carousel.component';
import { BrandsCarouselComponent } from '@shared-components/brands-carousel/brands-carousel.component';

@Component({
    selector: 'app-home',
    imports: [
        MainCarouselComponent,
        FlexLayoutModule,
        MatCardModule,
        MatIconModule,
        MatTabsModule,
        BannersComponent,
        ProductsCarouselComponent,
        BrandsCarouselComponent
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {
  public slides: MainCarouselSlide[] = [
    { title: 'The biggest sale', subtitle: 'Special for today', image: 'images/carousel/banner1.jpg' },
    { title: 'Summer collection', subtitle: 'New Arrivals On Sale', image: 'images/carousel/banner2.jpg' },
    { title: 'The biggest sale', subtitle: 'Special for today', image: 'images/carousel/banner3.jpg' },
    { title: 'Summer collection', subtitle: 'New Arrivals On Sale', image: 'images/carousel/banner4.jpg' },
    { title: 'The biggest sale', subtitle: 'Special for today', image: 'images/carousel/banner5.jpg' }
  ];
  public brands: { name: string, image: string }[] = [];
  public banners: Banner[] = [];
  public featuredProducts: Array<Product>;
  public onSaleProducts: Array<Product>;
  public topRatedProducts: Array<Product>;
  public newArrivalsProducts: Array<Product>;

  constructor(public appService: AppService) { }

  ngOnInit() {
    this.getBanners();
    this.getProducts("featured");
    this.getBrands();
  }

  public onLinkClick(e: any) {
    this.getProducts(e.tab.textLabel.toLowerCase());
  }

  public getProducts(type: string) {
    if (type == "featured" && !this.featuredProducts) {
      this.appService.getProducts("featured").subscribe(data => {
        this.featuredProducts = data;
      })
    }
    if (type == "on sale" && !this.onSaleProducts) {
      this.appService.getProducts("on-sale").subscribe(data => {
        this.onSaleProducts = data;
      })
    }
    if (type == "top rated" && !this.topRatedProducts) {
      this.appService.getProducts("top-rated").subscribe(data => {
        this.topRatedProducts = data;
      })
    }
    if (type == "new arrivals" && !this.newArrivalsProducts) {
      this.appService.getProducts("new-arrivals").subscribe(data => {
        this.newArrivalsProducts = data;
      })
    }

  }

  public getBanners() {
    this.appService.getBanners().subscribe(data => {
      this.banners = data;
    })
  }

  public getBrands() {
    this.brands = this.appService.getBrands();
  }

}
