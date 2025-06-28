import { Routes } from '@angular/router';
import {OrdersComponent} from "../sales/orders/orders.component";
import {
  ListerReceptionnerCommandeComponent
} from "./lister-receptionner-commande/lister-receptionner-commande.component";
import {ListerAjouterCommandeComponent} from "./lister-ajouter-commande/lister-ajouter-commande.component";

export const routes: Routes = [
    { path: '', redirectTo: 'orders', pathMatch: 'full' },
    { path: 'orders', component: OrdersComponent, data: { breadcrumb: 'Orders' } },
    { path: 'lister-receptionner-commande', component: ListerReceptionnerCommandeComponent, data: { breadcrumb: 'Receptionner commande' } },
    { path: 'lister-ajouter-commande', component: ListerAjouterCommandeComponent, data: { breadcrumb: 'Ajouter commande' } },
];
