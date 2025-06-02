import { Routes } from '@angular/router';
import { AdminComponent } from './admin.component';

export const routes: Routes = [
    {
        path: '',
        component: AdminComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./dashboard/dashboard.component').then(c => c.DashboardComponent)
            },
            {
                path: 'products',
                loadChildren: () => import('./products/products.routes').then(p => p.routes)
            },
            {
                path: 'sales',
                loadChildren: () => import('./sales/sales.routes').then(p => p.routes)
            },
            {
                path: 'users',
                loadComponent: () => import('./users/users.component').then(c => c.UsersComponent),
                data: { breadcrumb: 'Users' }
            },
            {
                path: 'customers',
                loadComponent: () => import('./customers/customers.component').then(c => c.CustomersComponent),
                data: { breadcrumb: 'Customers' }
            },
            {
                path: 'coupons',
                loadComponent: () => import('./coupons/coupons.component').then(c => c.CouponsComponent),
                data: { breadcrumb: 'Coupons' }
            },
            {
                path: 'withdrawal',
                loadComponent: () => import('./withdrawal/withdrawal.component').then(c => c.WithdrawalComponent),
                data: { breadcrumb: 'Withdrawal' }
            },
            {
                path: 'analytics',
                loadComponent: () => import('./analytics/analytics.component').then(c => c.AnalyticsComponent),
                data: { breadcrumb: 'Analytics' }
            },
            {
                path: 'refund',
                loadComponent: () => import('./refund/refund.component').then(c => c.RefundComponent),
                data: { breadcrumb: 'Refund' }
            },
            {
                path: 'followers',
                loadComponent: () => import('./followers/followers.component').then(c => c.FollowersComponent),
                data: { breadcrumb: 'Followers' }
            },
            {
                path: 'support',
                loadComponent: () => import('./support/support.component').then(c => c.SupportComponent),
                data: { breadcrumb: 'Support' }
            },
            {
                path: 'reviews',
                loadComponent: () => import('./reviews/reviews.component').then(c => c.ReviewsComponent),
                data: { breadcrumb: 'Reviews' }
            },
          {
            path: 'users',
            loadComponent: () => import('./users/users.component').then(c => c.UsersComponent),
            data: { breadcrumb: 'Users' }
          },
          {
            path: 'tenant',
            loadComponent: () => import('./tenant/tenants.component').then(c => c.TenantsComponent),
            data: { breadcrumb: 'tenant' }
          },   {
            path: 'rent',
            loadComponent: () => import('./rent/rents.component').then(c => c.RentsComponent),
            data: { breadcrumb: 'rent' }
          },   {
            path: 'subscription',
            loadComponent: () => import('./subscription/subscriptions.component').then(c => c.SubscriptionsComponent),
            data: { breadcrumb: 'subscription' }
          },   {
            path: 'issue',
            loadComponent: () => import('./issue/issues.component').then(c => c.IssuesComponent),
            data: { breadcrumb: 'issue' }
          },   {
            path: 'users',
            loadComponent: () => import('./users/users.component').then(c => c.UsersComponent),
            data: { breadcrumb: 'Users' }
          },   {
            path: 'users-new',
            loadComponent: () => import('./users-new/users-new.component').then(c => c.UsersNewComponent),
            data: { breadcrumb: 'Users new' }
          },  {
            path: 'invoice',
            loadComponent: () => import('./invoice/invoices.component').then(c => c.InvoicesComponent),
            data: { breadcrumb: 'Invoice' }
          },  {
            path: 'housting-unit',
            loadComponent: () => import('./housting-unit/housting-units.component').then(c => c.HoustingUnitsComponent),
            data: { breadcrumb: 'Housting unit' }
          },  {
            path: 'service',
            loadComponent: () => import('./service/services.component').then(c => c.ServicesComponent),
            data: { breadcrumb: 'Service' }
          }, {
            path: 'payment-lines',
            loadComponent: () => import('./payment-line/payment-lines.component').then(c => c.PaymentLinesComponent),
            data: { breadcrumb: 'Payment lines' }
          }, {
            path: 'payment',
            loadComponent: () => import('./payment/payments.component').then(c => c.PaymentsComponent),
            data: { breadcrumb: 'Payment' }
          }, {
            path: 'billing-cycle',
            loadComponent: () => import('./billing-cycle/billing-cycles.component').then(c => c.BillingCyclesComponent),
            data: { breadcrumb: 'Billing cycle' }
          },
        ]
    }
];
