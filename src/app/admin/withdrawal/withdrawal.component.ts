import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { DomHandlerService } from '@services/dom-handler.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { PipesModule } from '../../theme/pipes/pipes.module';
import { DatePipe } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-withdrawal',
    imports: [
        FlexLayoutModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
        MatTooltipModule,
        NgxPaginationModule,
        PipesModule,
        DatePipe
    ],
    templateUrl: './withdrawal.component.html'
})
export class WithdrawalComponent {
  public withdrawal = [
    { id: 1, invoiceId: '#0045', orderIds: ['#2485', '#4152', '#8574'], storeId: 1, amount: 20, charges: 0, payment: 20, date: new Date(2020, 1, 15, 10, 45) },
    { id: 2, invoiceId: '#5288', orderIds: ['#7455'], storeId: 2, amount: 45, charges: 5, payment: 50, date: new Date(2020, 3, 20, 12, 15) },
    { id: 3, invoiceId: '#6318', orderIds: ['#6122', '#8710'], storeId: 2, amount: 30, charges: 0, payment: 30, date: new Date(2020, 4, 5, 18, 25) }
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
