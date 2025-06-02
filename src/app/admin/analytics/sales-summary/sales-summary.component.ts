import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { sales_summary } from '../../../common/data/analytics.data';

@Component({
    selector: 'app-sales-summary',
    imports: [
        MatCardModule,
        FlexLayoutModule,
        NgxChartsModule
    ],
    templateUrl: './sales-summary.component.html'
})
export class SalesSummaryComponent { 
  public sales_summary: any[];
  public showXAxis = true;
  public showYAxis = true;
  public gradient = false;
  public showLegend = false;
  public showXAxisLabel = true;
  public xAxisLabel = 'Country';
  public showYAxisLabel = true;
  public yAxisLabel = 'Sales';
  public colorScheme: any = {
    domain: ['#2F3E9E', '#D22E2E', '#378D3B', '#0096A6', '#F47B00', '#606060']
  };  

  constructor() { 
    Object.assign(this, {sales_summary}); 
  } 

  public onSelect(event: any) {
    console.log(event);
  }

}
