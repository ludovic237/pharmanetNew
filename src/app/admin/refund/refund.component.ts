import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { DomHandlerService } from '@services/dom-handler.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { PipesModule } from '../../theme/pipes/pipes.module';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-refund',
    imports: [
        FlexLayoutModule,
        MatCardModule,
        MatDividerModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        NgxPaginationModule,
        DatePipe,
        PipesModule
    ],
    templateUrl: './refund.component.html'
})
export class RefundComponent {
  public refunds = [
    { id: 1, requestId: '#0045', orderId: '#2485', storeId: 1, amount: 20, type: 'Full refund', reason: 'Not happy', date: new Date(2020, 1, 15, 10, 45) },
    { id: 2, requestId: '#5288', orderId: '#7455', storeId: 2, amount: 45, type: 'Full refund', reason: 'Bad package', date: new Date(2020, 3, 20, 12, 15) },
    { id: 3, requestId: '#6318', orderId: '#6122', storeId: 2, amount: 30, type: 'Full refund', reason: 'Product broken', date: new Date(2020, 4, 5, 18, 25) }
  ];
  public stores = [
    { id: 1, name: 'Store 1' },
    { id: 2, name: 'Store 2' }
  ];
  public page: any;
  public count = 6;
  domHandlerService = inject(DomHandlerService);

  public onPageChanged(event: any) {
    this.page = event;
    this.domHandlerService.winScroll(0, 0);
  }
}
