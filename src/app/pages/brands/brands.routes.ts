import { Routes } from '@angular/router'; 
import { BrandsComponent } from './brands.component';
import { BrandComponent } from './brand/brand.component';

export const routes: Routes = [
    { path: '', component: BrandsComponent, pathMatch: 'full' },
    { path: ':name', component: BrandComponent }
];