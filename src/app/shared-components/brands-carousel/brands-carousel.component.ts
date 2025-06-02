import { Component, Input } from '@angular/core';
import { SwiperConfigInterface, SwiperModule } from '../../theme/components/swiper/swiper.module';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-brands-carousel',
    imports: [
        RouterModule,
        SwiperModule,
        MatButtonModule,
        MatIconModule
    ],
    templateUrl: './brands-carousel.component.html',
    styleUrl: './brands-carousel.component.scss'
})
export class BrandsCarouselComponent {
  @Input('brands') brands: Array<{ name: string, image: string }> = [];
  public config: SwiperConfigInterface = {}; 

  ngAfterViewInit() {
    this.config = {
      slidesPerView: 7,
      spaceBetween: 16,
      keyboard: true,
      navigation: true,
      pagination: false,
      grabCursor: true,
      loop: true,
      preloadImages: false,
      lazy: true,
      autoplay: {
        delay: 6000,
        disableOnInteraction: false
      },
      speed: 500,
      effect: "slide",
      breakpoints: {
        240: {
          slidesPerView: 1
        },
        480: {
          slidesPerView: 2
        },
        600: {
          slidesPerView: 3
        },
        960: {
          slidesPerView: 4
        },
        1280: {
          slidesPerView: 5
        },
        1500: {
          slidesPerView: 6
        }
      }
    }
  }
}
