import { Component, Input } from '@angular/core';
import { SwiperConfigInterface, SwiperModule, SwiperPaginationInterface } from '../../theme/components/swiper/swiper.module';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-main-carousel',
    imports: [
        FlexLayoutModule,
        SwiperModule,
        MatButtonModule,
        MatIconModule
    ],
    templateUrl: './main-carousel.component.html',
    styleUrl: './main-carousel.component.scss'
})
export class MainCarouselComponent {
  @Input('slides') slides: Array<any> = []; 
  public config: SwiperConfigInterface = {};
  private pagination: SwiperPaginationInterface = {
    el: '.swiper-pagination',
    clickable: true
  }; 

  ngAfterViewInit(){
    this.config = {
      slidesPerView: 1,
      spaceBetween: 0,         
      keyboard: true,
      navigation: true,
      pagination: this.pagination,
      grabCursor: true,        
      loop: false,
      preloadImages: false,
      lazy: true,     
      autoplay: {
        delay: 6000,
        disableOnInteraction: false
      },
      speed: 500,
      effect: "slide"
    }
  }

}