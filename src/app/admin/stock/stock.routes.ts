import { Routes } from '@angular/router';
import {EntreeComponent} from "./entree/entree.component";
import {SortieComponent} from "./sortie/sortie.component";
import {InventaireComponent} from "./inventaire/inventaire.component";
import {RuptureComponent} from "./rupture/rupture.component";

export const routes: Routes = [
    { path: '', redirectTo: 'entree', pathMatch: 'full' },
    { path: 'entrees', component: EntreeComponent, data: { breadcrumb: 'Entree' } },
    { path: 'ruptures', component: RuptureComponent, data: { breadcrumb: 'Rupture' } },
    { path: 'sorties', component: SortieComponent, data: { breadcrumb: 'Sortie' } },
    { path: 'sorties/:id', component: SortieComponent, data: { breadcrumb: 'Sortie' } },
    { path: 'inventaire', component: InventaireComponent, data: { breadcrumb: 'Inventaire' } },
];
