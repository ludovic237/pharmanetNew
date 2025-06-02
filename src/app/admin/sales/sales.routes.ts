import { Routes } from '@angular/router';
import { OrdersComponent } from './orders/orders.component';
import { TransactionsComponent } from './transactions/transactions.component';

export const routes: Routes = [
    { path: '', redirectTo: 'orders', pathMatch: 'full' },
    { path: 'orders', component: OrdersComponent, data: { breadcrumb: 'Orders' } },
    { path: 'transactions', component: TransactionsComponent, data: { breadcrumb: 'Transactions' } }
];