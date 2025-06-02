import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./pages/pages.routes').then(p => p.routes)
    },
    {
        path: 'landing',
        loadComponent: () => import('./landing/landing.component').then(c => c.LandingComponent),
    },
    {
        path: 'admin',
        loadChildren: () => import('./admin/admin.routes').then(p => p.routes)
    },
    {
        path: '**',
        loadComponent: () => import('./pages/not-found/not-found.component').then(c => c.NotFoundComponent)
    }
];
