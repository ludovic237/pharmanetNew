import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { DomHandlerService } from '@services/dom-handler.service';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
    selector: 'app-orders',
    imports: [
        MatCardModule,
        MatDividerModule,
        FlexLayoutModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        NgxPaginationModule
    ],
    templateUrl: './orders.component.html'
})
export class OrdersComponent {
  orders = [
    { number: '#3258', date: 'March 29, 2018', status: 'Completed', total: '$140.00 for 2 items', invoice: true },
    { number: '#3145', date: 'February 14, 2018', status: 'On hold', total: '$255.99 for 1 item', invoice: false },
    { number: '#2972', date: 'January 7, 2018', status: 'Processing', total: '$255.99 for 1 item', invoice: true },
    { number: '#2971', date: 'January 5, 2018', status: 'Completed', total: '$73.00 for 1 item', invoice: true },
    { number: '#1981', date: 'December 24, 2017', status: 'Pending Payment', total: '$285.00 for 2 items', invoice: false },
    { number: '#1781', date: 'September 3, 2017', status: 'Refunded', total: '$49.00 for 2 items', invoice: false },
    { number: '#3981', date: 'December 24, 2017', status: 'Pending Payment', total: '$285.00 for 2 items', invoice: false },
    { number: '#5781', date: 'September 3, 2017', status: 'Refunded', total: '$49.00 for 2 items', invoice: false },
    { number: '#6258', date: 'March 22, 2019', status: 'Completed', total: '$140.00 for 2 items', invoice: true },
    { number: '#7145', date: 'February 14, 2020', status: 'On hold', total: '$255.99 for 1 item', invoice: false },
    { number: '#1972', date: 'January 10, 2018', status: 'Processing', total: '$255.99 for 1 item', invoice: true },
    { number: '#8971', date: 'October 3, 2019', status: 'Completed', total: '$73.00 for 1 item', invoice: true }
  ]
  page: any;
  count = 6;
  domHandlerService = inject(DomHandlerService); 

  public onPageChanged(event: any) {
    this.page = event;
    this.domHandlerService.winScroll(0, 0);
  }

}
