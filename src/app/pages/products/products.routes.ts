import { Routes } from '@angular/router';
import { ProductsComponent } from './products.component';

export const routes: Routes = [
    { path: '', component: ProductsComponent, pathMatch: 'full' },
    { path: ':name', component: ProductsComponent },
    { path: ':id/:name', loadComponent: () => import('./product/product.component').then(c => c.ProductComponent) }
];