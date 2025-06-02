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
    selector: 'app-transactions',
    imports: [
        MatCardModule,
        MatDividerModule,
        FlexLayoutModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        NgxPaginationModule
    ],
    templateUrl: './transactions.component.html'
})
export class TransactionsComponent {
  transactions = [
    { orderId: '#2121', transactionId: '#78245214510', date: 'March 29, 2018', paymentMethod: 'Stripe', status: 'Process', amount: '$140.00' },
    { orderId: '#7255', transactionId: '#58272854525', date: 'January 7, 2018', paymentMethod: 'Paypal', status: 'Pending', amount: '$855.00' },
    { orderId: '#4122', transactionId: '#48266987452', date: 'December 24, 2017', paymentMethod: 'Paypal', status: 'Delivered', amount: '$420.00' },
    { orderId: '#4534', transactionId: '#43567578223', date: 'March 29, 2018', paymentMethod: 'Stripe', status: 'Process', amount: '$140.00' },
    { orderId: '#6512', transactionId: '#54129964355', date: 'October 7, 2018', paymentMethod: 'Paypal', status: 'Pending', amount: '$952.00' },
    { orderId: '#2345', transactionId: '#75208924544', date: 'December 24, 2017', paymentMethod: 'Stripe', status: 'Delivered', amount: '$45.00' },
    { orderId: '#1255', transactionId: '#72113456734', date: 'October 2, 2019', paymentMethod: 'Stripe', status: 'Delivered', amount: '$140.00' },
    { orderId: '#8854', transactionId: '#96455673452', date: 'January 7, 2018', paymentMethod: 'Paypal', status: 'Pending', amount: '$225.00' },
    { orderId: '#9712', transactionId: '#85643112647', date: 'December 24, 2017', paymentMethod: 'Stripe', status: 'Delivered', amount: '$540.00' },
    { orderId: '#7342', transactionId: '#95534768943', date: 'March 29, 2018', paymentMethod: 'Stripe', status: 'Pending', amount: '$140.00' },
    { orderId: '#5414', transactionId: '#34861354666', date: 'October 7, 2018', paymentMethod: 'Paypal', status: 'Pending', amount: '$475.00' },
    { orderId: '#8906', transactionId: '#23756748667', date: 'November 2, 2017', paymentMethod: 'Paypal', status: 'Delivered', amount: '$420.00' }
  ]
  page: any;
  count = 6;
  domHandlerService = inject(DomHandlerService);
 
  public onPageChanged(event: any) {
    this.page = event;
    this.domHandlerService.winScroll(0, 0);
  }

}
