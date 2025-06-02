import { Routes } from '@angular/router';
import { AccountComponent } from './account.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { InformationComponent } from './information/information.component';
import { AddressesComponent } from './addresses/addresses.component';
import { OrdersComponent } from './orders/orders.component';

export const routes: Routes = [
    {
        path: '',
        component: AccountComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: DashboardComponent, data: { breadcrumb: 'Dashboard' } },
            { path: 'information', component: InformationComponent, data: { breadcrumb: 'Information' } },
            { path: 'addresses', component: AddressesComponent, data: { breadcrumb: 'Addresses' } },
            { path: 'orders', component: OrdersComponent, data: { breadcrumb: 'Orders' } }
        ]
    }
];