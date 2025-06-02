import { Routes } from '@angular/router';
import { PagesComponent } from './pages.component';

export const routes: Routes = [
    {
        path: '',
        component: PagesComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./home/home.component').then(c => c.HomeComponent)
            },
            {
                path: 'account',
                loadChildren: () => import('./account/account.routes').then(p => p.routes),
                data: { breadcrumb: 'Account Settings' }
            },
            {
                path: 'products',
                loadChildren: () => import('./products/products.routes').then(p => p.routes),
                data: { breadcrumb: 'All Products' }
            },
            {
                path: 'brands',
                loadChildren: () => import('./brands/brands.routes').then(p => p.routes),
                data: { breadcrumb: 'Brands' }
            },
            {
                path: 'cart',
                loadComponent: () => import('./cart/cart.component').then(c => c.CartComponent),
                data: { breadcrumb: 'Cart' }
            },
            {
                path: 'checkout',
                loadComponent: () => import('./checkout/checkout.component').then(c => c.CheckoutComponent),
                data: { breadcrumb: 'Checkout' }
            },
            {
                path: 'compare',
                loadComponent: () => import('./compare/compare.component').then(c => c.CompareComponent),
                data: { breadcrumb: 'Compare' }
            },
            {
                path: 'contact',
                loadComponent: () => import('./contact/contact.component').then(c => c.ContactComponent),
                data: { breadcrumb: 'Contact' }
            },
            {
                path: 'wishlist',
                loadComponent: () => import('./wishlist/wishlist.component').then(c => c.WishlistComponent),
                data: { breadcrumb: 'Wishlist' }
            },
            {
                path: 'sign-in',
                loadComponent: () => import('./sign-in/sign-in.component').then(c => c.SignInComponent),
                data: { breadcrumb: 'Sign In' }
            }            
        ]
    }
];