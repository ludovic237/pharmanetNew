import { Routes } from '@angular/router';
import { OrdersComponent } from './orders/orders.component';
import { TransactionsComponent } from './transactions/transactions.component';
import {AjouterVenteComponent} from "./ajouter-vente/ajouter-vente.component";
import {EncaisserVenteComponent} from "./encaisser-vente/encaisser-vente.component";

export const routes: Routes = [
    { path: '', redirectTo: 'orders', pathMatch: 'full' },
    { path: 'orders', component: OrdersComponent, data: { breadcrumb: 'Orders' } },
    { path: 'encaisser-vente', component: EncaisserVenteComponent, data: { breadcrumb: 'Encaisser vente' } },
    { path: 'ajouter-vente', component: AjouterVenteComponent, data: { breadcrumb: 'Ajouter vente' } },
    { path: 'transactions', component: TransactionsComponent, data: { breadcrumb: 'Transactions' } }
];
