import {Component} from '@angular/core';
import {TilesComponent} from './tiles/tiles.component';
import {InfoCardsComponent} from './info-cards/info-cards.component';
import {MontlySalesComponent} from './montly-sales/montly-sales.component';
import {LatestOrdersComponent} from './latest-orders/latest-orders.component';
import {AnalyticsComponent} from './analytics/analytics.component';
import {FlexLayoutModule} from '@ngbracket/ngx-layout';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {DashboardService} from "@services/dashboard.service";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule, MatLabel} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatButtonModule} from "@angular/material/button";
import {MatNativeDateModule, MatOptionModule} from "@angular/material/core";
import {MatTabsModule} from "@angular/material/tabs";
import {MatSelectModule} from "@angular/material/select";
import {MatStepperModule} from "@angular/material/stepper";
import {MatDialogModule} from "@angular/material/dialog";

// import * as moment from 'moment';

@Component({
  selector: 'app-dashboard',
  imports: [
    // TilesComponent,
    // InfoCardsComponent,
    // MontlySalesComponent,
    // LatestOrdersComponent,
    // AnalyticsComponent,
    FlexLayoutModule,
    MatCardModule,
    MatDatepickerModule,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    MatOptionModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatTabsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatStepperModule,
    CommonModule,
    MatCardModule,
    MatDialogModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  totalHousingUnits:number=0
  occupiedHousingUnits:number=0
  activeLeases:number=0
  housingUnitsWithDebt:number=0
  totalAmountDue:number=0
  totalAmountPaid:number=0
  totalAmountToPay:number=0

  overduePayments:number=0
  pendingPayments:number=0
  totalPayments:number=0
  totalPendingPayments:number=0
  totalPartialPaidPayments:number=0
  totalPaidPayments:number=0
  totalSubscriptions:number=0
  totalActiveSubscriptions:number=0
  totalExpiredSubscriptions:number=0
  totalCanceledSubscriptions:number=0
  totalAmountSubscriptions:number=0
  totalAmountActiveSubscriptions:number=0
  totalAmountExpiredSubscriptions:number=0
  totalAmountCanceledSubscriptions:number=0
  paidBillingCycles:number=0
  partiallyPaidBillingCycles:number=0
  overdueBillingCycles:number=0
  openIssues:number=0
  resolvedIssues:number=0
  pendingIssues:number=0
  issueResolutionRate:number=0
  activeTenants:number=0
  inactiveTenants:number=0
  tenantPaymentCompliance:number=0
  totalRevenue:number=0


  dashboardData: any;
  mode: string = 'inputs'; // Default mode
  selectedRange: string = '';
  startDate: Date | null = new Date(new Date().setDate(new Date().getDate() - 7));
  endDate: Date | null = new Date();

  onModeChange(): void {
    if (this.mode === 'select') {
      this.selectedRange = '';
    } else {
      this.startDate = new Date(new Date().setDate(new Date().getDate() - 7));
      this.endDate = new Date();
    }
  }

  onRangeChange(): void {
    const now = new Date();
    switch (this.selectedRange) {
      case 'thisMonth':
        this.startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        this.endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'thisWeek':
        const firstDayOfWeek = now.getDate() - now.getDay();
        this.startDate = new Date(now.setDate(firstDayOfWeek));
        this.endDate = new Date(now.setDate(firstDayOfWeek + 6));
        break;
      case 'thisYear':
        this.startDate = new Date(now.getFullYear(), 0, 1);
        this.endDate = new Date(now.getFullYear(), 11, 31);
        break;
      case 'last2Weeks':
        this.startDate = new Date(now.setDate(now.getDate() - 14));
        this.endDate = new Date();
        break;
      default:
        break;
    }
  }

  isValid(): boolean {
    if (this.mode === 'inputs') {
      return !!this.startDate && !!this.endDate;
    }
    return !!this.selectedRange;
  }

  constructor(private dashboardService: DashboardService) {
  }

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  fetchDashboardData(): void {
    // const startDate = moment().startOf('day').format('YYYY-MM-DDTHH:mm:ss'); // Start of the day at 00:00
    // const endDate = moment().endOf('day').format('YYYY-MM-DDTHH:mm:ss'); // End of the day at 23:59

    const now = new Date();
    // const startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString(); // Début de la journée à 00:00
    // const endDate = new Date(now.setHours(23, 59, 59, 999)).toISOString(); // Fin de la journée à 23:59

    // const startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString().slice(0, -1); // Remove 'Z'
    // const endDate = new Date(now.setHours(23, 59, 59, 999)).toISOString().slice(0, -1); // Remove 'Z'

    // const startDate = new Date(now.setHours(0, 0, 0, 0))
    //   .toISOString()
    //   .slice(0, 19); // Format as 'yyyy-MM-ddTHH:mm:ss'
    // const endDate = new Date(now.setHours(23, 59, 59, 999))
    //   .toISOString()
    //   .slice(0, 19); // Format as 'yyyy-MM-ddTHH:mm:ss'

    // const startDate = new Date(now.getFullYear(), 0, 1)
    //   .toISOString()
    //   .slice(0, 19); // Format as 'yyyy-MM-ddTHH:mm:ss'
    // const endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
    //   .toISOString()
    //   .slice(0, 19); // Format as 'yyyy-MM-ddTHH:mm:ss'

    const start = this.startDate
      ? new Date(this.startDate).toISOString().slice(0, 19)
      : null;
    const end = this.endDate
      ? new Date(this.endDate).toISOString().slice(0, 19)
      : null;

    this.dashboardService.getDashboards(start, end).subscribe(
      (data) => {
        this.dashboardData = data;

        // Map API response to component properties
        const housingStats = data.housingUnitStatistics || {};
        this.totalHousingUnits = housingStats.totalHousingUnits || 0;
        this.occupiedHousingUnits = housingStats.occupiedHousingUnits || 0;
        this.activeLeases = housingStats.activeLeases || 0;
        this.housingUnitsWithDebt = housingStats.housingUnitsWithDebt || 0;
        this.totalAmountDue = housingStats.totalAmountDue || 0;
        this.totalAmountPaid = housingStats.totalAmountPaid || 0;
        this.totalAmountToPay = housingStats.totalAmountToPay || 0;

        const payments = data.payments || {};
        this.overduePayments = payments.overduePayments || 0;
        this.pendingPayments = payments.pendingPayments || 0;
        this.totalPayments = payments.totalPayments || 0;
        this.totalPendingPayments = payments.totalPendingPayments || 0;
        this.totalPartialPaidPayments = payments.totalPartialPaidPayments || 0;
        this.totalPaidPayments = payments.totalPaidPayments || 0;

        const subscriptions = data.subscriptions || {};
        this.totalSubscriptions = subscriptions.totalSubscriptions || 0;
        this.totalActiveSubscriptions = subscriptions.totalActiveSubscriptions || 0;
        this.totalExpiredSubscriptions = subscriptions.totalExpiredSubscriptions || 0;
        this.totalCanceledSubscriptions = subscriptions.totalCanceledSubscriptions || 0;
        this.totalAmountSubscriptions = subscriptions.totalAmountSubscriptions || 0;
        this.totalAmountActiveSubscriptions = subscriptions.totalAmountActiveSubscriptions || 0;
        this.totalAmountExpiredSubscriptions = subscriptions.totalAmountExpiredSubscriptions || 0;
        this.totalAmountCanceledSubscriptions = subscriptions.totalAmountCanceledSubscriptions || 0;

        const billingCycles = data.billingCycles || {};
        this.paidBillingCycles = billingCycles.paidBillingCycles || 0;
        this.partiallyPaidBillingCycles = billingCycles.partiallyPaidBillingCycles || 0;
        this.overdueBillingCycles = billingCycles.overdueBillingCycles || 0;

        const issues = data.issues || {};
        this.openIssues = issues.openIssues || 0;
        this.resolvedIssues = issues.resolvedIssues || 0;
        this.pendingIssues = issues.pendingIssues || 0;
        this.issueResolutionRate = issues.issueResolutionRate || 0;

        const tenants = data.tenants || {};
        this.activeTenants = tenants.activeTenants || 0;
        this.inactiveTenants = tenants.inactiveTenants || 0;
        this.tenantPaymentCompliance = tenants.tenantPaymentCompliance || 0;

        const financialSummary = data.financialSummary || {};
        this.totalRevenue = financialSummary.totalRevenue || 0;

        console.log('Dashboard data:', this.dashboardData);
      },
      (error) => {
        console.error('Error fetching dashboard data:', error);
      }
    );
  }
}
