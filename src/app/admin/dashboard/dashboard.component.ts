import { Component } from '@angular/core';
import { TilesComponent } from './tiles/tiles.component';
import { InfoCardsComponent } from './info-cards/info-cards.component';
import { MontlySalesComponent } from './montly-sales/montly-sales.component';
import { LatestOrdersComponent } from './latest-orders/latest-orders.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-dashboard',
    imports: [
        TilesComponent,
        InfoCardsComponent,
        MontlySalesComponent,
        LatestOrdersComponent,
        AnalyticsComponent,
        FlexLayoutModule,
        MatCardModule,
        MatIconModule
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
