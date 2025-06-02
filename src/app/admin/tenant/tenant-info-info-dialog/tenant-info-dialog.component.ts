import {Component, Inject, OnInit} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup, FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatTabsModule} from '@angular/material/tabs';
import {FlexLayoutModule} from '@ngbracket/ngx-layout';
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {UserService} from "@services/user.service";
import {HoustingUnitService} from "@services/housting-unit.service";
import {TenantService} from "@services/tenant.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatStepperModule} from "@angular/material/stepper";
import {ServiceService} from "@services/service.service";
import {CommonModule} from "@angular/common";
import {MatCardModule} from "@angular/material/card";
import {MatListModule} from "@angular/material/list";
import {MatRow, MatTableModule} from "@angular/material/table";
import {MatIconModule} from "@angular/material/icon";
import {NgxPaginationModule} from "ngx-pagination";
import {PipesModule} from "../../../theme/pipes/pipes.module";
import {MatMenuModule} from "@angular/material/menu";
import {MatDividerModule} from "@angular/material/divider";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatChipListbox, MatChipsModule} from "@angular/material/chips";
import {MatGridList, MatGridListModule} from "@angular/material/grid-list";
import {MatToolbarModule} from "@angular/material/toolbar";

@Component({
  selector: 'app-tenant-info-dialog',
  imports: [
    MatTableModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    MatChipsModule,
    MatGridListModule,
    MatToolbarModule,

    MatCardModule,
    MatExpansionModule,
    MatTableModule,
    MatIconModule,
    MatDividerModule,

    ReactiveFormsModule,
    FlexLayoutModule,
    MatTabsModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatChipsModule, // Import MatChipsModule
    MatStepperModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatTabsModule,
    MatMenuModule,
    MatDialogModule,
    MatButtonModule,
    CommonModule,
    MatTableModule,
    MatSelectModule,
    FormsModule,
    CommonModule,
    MatDialogModule,
    NgxPaginationModule,
    PipesModule
  ],
  templateUrl: './tenant-info-dialog.component.html',
  styleUrl: './tenant-info-dialog.component.scss'
})
export class TenantInfoDialogComponent implements OnInit {
  tenantForm: FormGroup;
  subscriptionForm: FormGroup;
  billingCycleForm: FormGroup;
  selectedServices: any[] = [];
  remainingAmount: number = 0;

  tenant: any = {
    housingUnit: {
      number: '',
      address: '',
      type: '',
      floor: '',
      area: 0
    }
  };

  subscriptions: any[] = [];
  payments: any[] = [];
  billingCycles: any[] = [];
  financialSummary: any;
  services: Service[] = [];

  constructor(
    public dialogRef: MatDialogRef<TenantInfoDialogComponent>,
    private fb: FormBuilder,
    private tenantService: TenantService,
    private serviceService: ServiceService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.tenantForm = this.fb.group({
      userId: [data?.userId || '', Validators.required],
      housingUnitId: [data?.housingUnitId || '', Validators.required],
    });

    this.subscriptionForm = this.fb.group({
      serviceId: ['', Validators.required],
      numberOfSubscription: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
    });

    this.billingCycleForm = this.fb.group({
      depositAmount: ['', [Validators.required, Validators.min(0)]],
      paymentMode: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadServices();
    this.loadTenantDetails();
  }

  loadServices(): void {
    this.serviceService.getServices().subscribe((data: any) => {
      this.services = data;
    });
  }

  loadTenantDetails(): void {
    this.tenantService.getTenantDetailById(this.data.id).subscribe((data: any) => {
      this.tenant = data.tenant || {};
      this.subscriptions = data.subscriptions || [];
      this.payments = data.payments || [];
      this.billingCycles = data.billingCycles || [];
      this.financialSummary = data.financialSummary || {};
      this.services = data.services || [];
      this.services = this.services.map(service => ({ ...service, grayedOut: false })) || [];
    });
  }


  subscribeToService(): void {
    const subscriptionData = this.subscriptionForm.value;
    const billingCycleData = this.billingCycleForm.value;

    const data = {
      userId: this.tenantForm.get('userId')?.value,
      housingUnitId: this.tenantForm.get('housingUnitId')?.value,
      serviceId: subscriptionData.serviceId,
      startDate: subscriptionData.startDate,
      endDate: subscriptionData.endDate,
      depositAmount: billingCycleData.depositAmount,
      paymentMode: billingCycleData.paymentMode,
      numberOfSubscription: subscriptionData.numberOfSubscription,
    };

    this.tenantService.createTenant(data).subscribe(
      (response) => {
        this.snackBar.open('Service subscribed successfully', 'Close', {duration: 3000});
        this.dialogRef.close(response);
      },
      (error) => {
        this.snackBar.open('Error subscribing to service', 'Close', {duration: 3000});
      }
    );
  }


  onServiceToggle(service: any): void {
    if (!service.subscribed) {
      service.active = false; // Ensure non-subscribed services cannot be activated
    }
  }

  toggleServiceCard(service: any): void {
    console.log("service");
    console.log(service);
    if (service.subscribed) {
      service.grayedOut = !service.grayedOut;
    }
  }

  toggleSubscription(service: any): void {
    service.isSubscribed = !service.isSubscribed;
    console.log(`${service.name} is now ${service.isSubscribed ? 'subscribed' : 'unsubscribed'}`);
  }

}


interface Service {
  id: number;
  name: string;
  price: string;
  billingMode: string;
  description: string;
  isSubscribed: boolean;
  options: any[];
  grayedOut?: boolean;
}
