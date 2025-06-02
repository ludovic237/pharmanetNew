import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { refunds } from '../../../common/data/analytics.data';

@Component({
    selector: 'app-refunds',
    imports: [
        MatCardModule,
        FlexLayoutModule,
        NgxChartsModule
    ],
    templateUrl: './refunds.component.html'
})
export class RefundsComponent {
  public refunds: any[];
  public showLegend = true;
  public gradient = true;
  public colorScheme: any = {
    domain: ['#2F3E9E', '#D22E2E', '#378D3B', '#0096A6', '#F47B00', '#606060']
  };
  public showLabels = true;
  public explodeSlices = false;
  public doughnut = false;

  constructor() {
    Object.assign(this, { refunds });
  }

  public onSelect(event: any) {
    console.log(event);
  }
}
