import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { most_viewed_products } from '../../../common/data/analytics.data';

@Component({
    selector: 'app-most-viewed-products',
    imports: [
        MatCardModule,
        FlexLayoutModule,
        NgxChartsModule
    ],
    templateUrl: './most-viewed-products.component.html'
})
export class MostViewedProductsComponent implements OnInit {
  public data: any[];
  public showLegend = false;
  public gradient = true;
  public colorScheme: any = {
    domain: ['#2F3E9E', '#D22E2E', '#378D3B', '#42A5F5', '#7E57C2', '#AFB42B']
  };
  public showLabels = true;
  public explodeSlices = true;
  public doughnut = false;
  @ViewChild('resizedDiv') resizedDiv: ElementRef;
  public previousWidthOfResizedDiv: number = 0;

  constructor() { }

  ngOnInit() {
    this.data = most_viewed_products;
  }

  public onSelect(event: any) {
    console.log(event);
  }

  ngAfterViewChecked() {
    if (this.previousWidthOfResizedDiv != this.resizedDiv.nativeElement.clientWidth) {
      setTimeout(() => this.data = [...most_viewed_products]);
    }
    this.previousWidthOfResizedDiv = this.resizedDiv.nativeElement.clientWidth;
  }

}

