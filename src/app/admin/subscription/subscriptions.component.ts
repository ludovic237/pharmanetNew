import {Component, OnInit, inject} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {customers} from '../../common/data/customers';
import {SubscriptionDialogComponent} from './subscription-dialog/subscription-dialog.component';
import {ConfirmDialogComponent} from '@shared-components/confirm-dialog/confirm-dialog.component';
import {MatCardModule} from '@angular/material/card';
import {FlexLayoutModule} from '@ngbracket/ngx-layout';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {NgxPaginationModule} from 'ngx-pagination';
import {MatDividerModule} from '@angular/material/divider';
import {PipesModule} from '../../theme/pipes/pipes.module';
import {MatTooltipModule} from '@angular/material/tooltip';
import {CommonModule} from "@angular/common";
import {Subscription} from "../../model/data";
import {SubscriptionService} from "@services/subscription.service";
import {Router} from "@angular/router";
import {Settings, SettingsService} from "@services/settings.service";
import {MatAccordion, MatExpansionModule} from "@angular/material/expansion";
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {InvoiceService} from "@services/invoice.service";
import {SubscriptionPaymentDialogComponent} from "./subscription-payment-dialog/subscription-payment-dialog.component";

@Component({
  selector: 'app-subscriptions',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule, // Add this
    ReactiveFormsModule,
    MatInputModule,
    FlexLayoutModule,
    MatExpansionModule,
    MatAccordion,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatTooltipModule,
    NgxPaginationModule,
    PipesModule
  ],
  templateUrl: './subscriptions.component.html',
  styleUrl: './subscriptions.component.scss'
})
export class SubscriptionsComponent implements OnInit {


  public subscriptions: any[] = [];
  filteredSubscriptions: any[] = []; // Filtered subscriptions data

  // Form controls for filters
  statusFilter = new FormControl('');
  tenantFilter = new FormControl('');
  serviceFilter = new FormControl('');
  optionFilter = new FormControl('');

  public locataires: any[] = [];
  public services: any[] = [];
  public page: number = 1;
  public count: number = 5;
  public settings: Settings;

  constructor(public dialog: MatDialog,
              public router: Router,
              public invoiceService: InvoiceService,
              public settingsService: SettingsService,
              public subscriptionService: SubscriptionService) {
    this.settings = this.settingsService.settings;
  }

  ngOnInit(): void {
    this.getAllSubscription();
    // Apply filters whenever a filter value changes
    this.statusFilter.valueChanges.subscribe(() => this.applyFilters());
    this.tenantFilter.valueChanges.subscribe(() => this.applyFilters());
    this.serviceFilter.valueChanges.subscribe(() => this.applyFilters());
    this.optionFilter.valueChanges.subscribe(() => this.applyFilters());
  }

  private getAllSubscription() {
    this.subscriptionService.getSubscriptions().subscribe({
      next: (data) => {
        this.subscriptions = data;
        this.count = this.subscriptions.length
        console.log('Get subscription:', data);
        this.filteredSubscriptions = [...this.subscriptions];
      },
      error: (err) => {
        console.error('Error  subscription:', err);
        if (err.status == "403") {
          this.router.navigate(['/sign-in']); // Redirect to login if not authenticated
        }
      }
    });
  }

  public openSubscriptionDialog(data: any): void {
    const dialogRef = this.dialog.open(SubscriptionDialogComponent, {
      data: data,
      panelClass: ['theme-dialog'],
      autoFocus: false,
      direction: (this.settings.rtl) ? 'rtl' : 'ltr',
      width: '80%',
      height: '90%'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      console.log("subscription");
      this.getAllSubscription();
    });

  }

  public removeSubscription(subscription: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: {
        title: 'Confirm Action',
        message: 'Are you sure you want to remove this subscription?'
      }
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      this.getAllSubscription();
      // if (dialogResult) {
      //   this.subscriptions = this.subscriptions.filter(s => s.id !== subscription.id);
      // }
    });
  }

  getTenantName(tenantId: number): string {
    const tenant = this.locataires.find(l => l.id === tenantId);
    return tenant ? tenant.name : 'Unknown';
  }

  getServiceName(serviceId: number): string {
    const service = this.services.find(s => s.id === serviceId);
    return service ? service.nom : 'Unknown';
  }

  applyFilters(): void {
    const status = this.statusFilter.value?.toLowerCase() || '';
    const tenant = this.tenantFilter.value?.toLowerCase() || '';
    const service = this.serviceFilter.value?.toLowerCase() || '';
    const option = this.optionFilter.value?.toLowerCase() || '';

    this.filteredSubscriptions = this.subscriptions.filter(subscription => {
      const matchesStatus = !status || subscription.status?.toLowerCase().includes(status);
      const matchesTenant = !tenant || subscription.tenantName?.toLowerCase().includes(tenant);
      const matchesService = !service || subscription.services?.some((s: any) =>
        s.serviceName?.toLowerCase().includes(service)
      );
      const matchesOption = !option || subscription.services?.some((s: any) =>
        s.options?.some((o: any) => o.optionName?.toLowerCase().includes(option))
      );

      return matchesStatus && matchesTenant && matchesService && matchesOption;
    });
  }

  downloadInvoice(subscription: any): void {
    console.log('Download invoice for subscription:', subscription);
    this.invoiceService.getInvoiceById(subscription.subscriptionId).subscribe({
      next: (data) => {
        console.log('Get downloadInvoice:', data);
      },
      error: (err) => {
        console.error('Error  subscription:', err);
        if (err.status == "403") {
          this.router.navigate(['/sign-in']); // Redirect to login if not authenticated
        }
      }
    });
  }

  makePayment(subscription:any){
    this.getSubscriptionDataAndDisplayStatus(subscription)
  }

  getSubscriptionDataAndDisplayStatus(data:any) {
    this.subscriptionService.getSubscriptionFormattedData(data.subscriptionId).subscribe({
      next: (response) => {
        const dialogRef = this.dialog.open(SubscriptionPaymentDialogComponent, {
          // maxWidth: '400px',
          width: '80%',
          data: response
        });

        dialogRef.afterClosed().subscribe(dialogResult => {
          this.getAllSubscription();
          // if (dialogResult) {
          //   this.subscriptions = this.subscriptions.filter(s => s.id !== subscription.id);
          // }
        });
      },
      error: (err) => {

        if (err.status == "403") {
          this.router.navigate(['/sign-in']); // Redirect to login if not authenticated
        }
        console.error('Error updating status:', err);
      },
    });
  }
}
