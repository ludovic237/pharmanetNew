import { Routes } from '@angular/router';
import { CategoriesComponent } from './categories/categories.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { AddProductComponent } from './add-product/add-product.component';

export const routes: Routes = [
    { path: '', redirectTo: 'product-list', pathMatch: 'full' },
    { path: 'categories', component: CategoriesComponent, data: { breadcrumb: 'Categories' } },
    { path: 'product-list', component: ProductListComponent, data: { breadcrumb: 'Product List' } },
    { path: 'product-detail', component: ProductDetailComponent, data: { breadcrumb: 'Product Detail' } },
    { path: 'product-detail/:id', component: ProductDetailComponent, data: { breadcrumb: 'Product Detail' } },
    { path: 'add-product', component: AddProductComponent, data: { breadcrumb: 'Add Product' } },
    { path: 'add-product/:id', component: AddProductComponent, data: { breadcrumb: 'Edit Product' } }
];