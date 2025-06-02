import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatTabsModule} from '@angular/material/tabs';
import {FlexLayoutModule} from '@ngbracket/ngx-layout';
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {CommonModule} from "@angular/common";
import {HttpClient} from "@angular/common/http";
import {TenantService} from "@services/tenant.service";
import {SubscriptionService} from "@services/subscription.service";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from "@angular/material/icon";
import {PaymentService} from "@services/payment.service";
import {MatCardModule} from "@angular/material/card";
import {NgxPaginationModule} from "ngx-pagination";
import {MatDividerModule} from "@angular/material/divider";

@Component({
  selector: 'app-payment-info-dialog',
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatTabsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgxPaginationModule,
    MatDialogModule
  ],
  templateUrl: './payment-info-dialog.component.html',
  styleUrl: './payment-info-dialog.component.scss'
})
export class PaymentInfoDialogComponent implements OnInit {

  public page: number = 1;
  public count: number = 5;
  form: FormGroup;
  payments: any[] = [];
  subscriptions: any[] = [];
  remainingAmount: number | null = null;
  remainingCycles: number | null = null;
  billingMode: string | null = null;

  constructor(
    private paymentService: PaymentService,
    private tenantService: TenantService,
    private subscriptionService: SubscriptionService,
    private fb: FormBuilder,
    private http: HttpClient,
    public dialogRef: MatDialogRef<PaymentInfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      tenantId: ['', Validators.required],
      subscriptionId: ['', Validators.required],
      paymentMode: ['', Validators.required],
      paymentAmount: ['', [Validators.required, Validators.max(0)]]
    });

    this.fetchPaymentsInfo();
  }

  fetchPaymentsInfo(): void {
    this.paymentService.getPaymentById(this.data.paymentId).subscribe(
      (response) => {
        this.payments = response;
        this.count = this.payments.length;
      },
      (error) => {
        console.error('Error fetching payments:', error);
      }
    );
  }

  onTenantChange(tenantId: number): void {
    this.fetchSubscriptionsByTenantId(tenantId);
    this.form.patchValue({subscriptionId: '', paymentAmount: ''});
    this.remainingAmount = null;
    this.remainingCycles = null;
    this.billingMode = null;
  }

  fetchSubscriptionsByTenantId(tenantId: number): void {
    this.subscriptionService.getSubscriptionByITenantId(tenantId).subscribe(
      (response) => {
        this.subscriptions = response;
      },
      (error) => {
        console.error('Error fetching subscriptions:', error);
      }
    );
  }

  onSubscriptionChange(subscriptionId: number): void {
    const selectedSubscription = this.subscriptions.find(sub => sub.id === subscriptionId);
    this.remainingAmount = selectedSubscription ? selectedSubscription.remainingAmount : null;
    this.remainingCycles = selectedSubscription ? selectedSubscription.remainingCycles : null;
    this.billingMode = selectedSubscription ? selectedSubscription.billingMode : null;

    this.form.controls.paymentAmount.setValidators([
      Validators.required,
      Validators.max(this.remainingAmount || 0)
    ]);
    this.form.controls.paymentAmount.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.form.valid) {
      console.log('Payment Data:', this.form.value);
      const paymentData = this.form.value;

      this.subscriptionService.processPayment(paymentData).subscribe(
        (response) => {
          console.log('Payment processed successfully:', response);
          this.dialogRef.close(true); // Close the modal and pass a success flag
          // this.dialogRef.close(this.form.value);
        },
        (error) => {
          console.error('Error processing payment:', error);
        }
      );
    }
  }
}
