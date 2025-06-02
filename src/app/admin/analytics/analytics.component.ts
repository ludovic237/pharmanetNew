import { Component } from '@angular/core';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { SalesSummaryComponent } from './sales-summary/sales-summary.component';
import { MontlySalesComponent } from './montly-sales/montly-sales.component';
import { DailyViewsStatsComponent } from './daily-views-stats/daily-views-stats.component';
import { MostViewedProductsComponent } from './most-viewed-products/most-viewed-products.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { RefundsComponent } from './refunds/refunds.component';

@Component({
    selector: 'app-analytics',
    imports: [
        FlexLayoutModule,
        SalesSummaryComponent,
        MontlySalesComponent,
        DailyViewsStatsComponent,
        MostViewedProductsComponent,
        TransactionsComponent,
        RefundsComponent
    ],
    templateUrl: './analytics.component.html',
    styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent {

}
