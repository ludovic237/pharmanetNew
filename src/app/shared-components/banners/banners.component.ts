import { Component, Input } from '@angular/core';
import { Banner } from '../../common/interfaces/banner';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { RouterModule } from '@angular/router';
import { NgStyle } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-banners',
    imports: [
        RouterModule,
        FlexLayoutModule,
        MatButtonModule,
        NgStyle
    ],
    templateUrl: './banners.component.html',
    styleUrl: './banners.component.scss'
})
export class BannersComponent {
  @Input('banners') banners: Array<Banner> = []; 

  public getBanner(index: number) {
    return this.banners[index];
  }

  public getBgImage(index: number) {
    let bgImage = {
      'background-image': index != null ? "url(" + this.banners[index].image + ")" : "url(https://via.placeholder.com/600x400/ff0000/fff/)"
    };
    return bgImage;
  }
}
