import { Routes } from '@angular/router';
import {AjouterVenteComponent} from "./ajouter-vente/ajouter-vente.component";
import {EncaisserVenteComponent} from "./encaisser-vente/encaisser-vente.component";
import {VentesComponent} from "./ventes/ventes.component";
import {RetourProduitComponent} from "./retour-produit/retour-produit.component";

export const routes: Routes = [
    { path: '', redirectTo: 'list', pathMatch: 'full' },
    { path: 'list', component: VentesComponent, data: { breadcrumb: 'Liste vente' } },
    { path: 'encaisser-vente', component: EncaisserVenteComponent, data: { breadcrumb: 'Encaisser vente' } },
    { path: 'ajouter-vente', component: AjouterVenteComponent, data: { breadcrumb: 'Ajouter vente' } },
    { path: 'retour-produit', component: RetourProduitComponent, data: { breadcrumb: 'Retour produit' } }
];
