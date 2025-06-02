import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
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
import {MatListModule} from "@angular/material/list";
import {MatCardModule} from "@angular/material/card";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatChipsModule} from "@angular/material/chips";
import {debounceTime} from "rxjs";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from "@angular/material/icon";

@Component({
  selector: 'app-subscription-payment-dialog',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatChipsModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatTabsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule
  ],
  templateUrl: './subscription-payment-dialog.component.html',
  styleUrl: './subscription-payment-dialog.component.scss'
})
export class SubscriptionPaymentDialogComponent implements OnInit {
  form: FormGroup;
  tenants: any[] = [];
  subscriptions: any[] = [];
  remainingAmount: number | null = null;
  remainingCycles: number | null = null;
  billingMode: string | null = null;
  totalPrice: number = 0;

  constructor(
    private tenantService: TenantService,
    private subscriptionService: SubscriptionService,
    private fb: FormBuilder,
    private http: HttpClient,
    public dialogRef: MatDialogRef<SubscriptionPaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      tenantId: ['', Validators.required],
      paymentMode: ['', Validators.required],
      paymentAmount: ['', [Validators.required, Validators.min(0)]]
    });

    this.fetchTenants();
    this.initializeFormControls();

    // Subscribe to the entire form's valueChanges
    this.form.valueChanges.pipe(debounceTime(100)).subscribe(() => {
      this.updateTotalPrice();
    });
  }

  initializeFormControls(): void {
    this.subscriptions.forEach(subscription => {
      const subscriptionControl = new FormControl(false);
      this.form.addControl(`subscription_${subscription.subscriptionId}`, subscriptionControl);

      subscriptionControl.valueChanges.subscribe(() => {
        this.updateTotalPrice();
      });

      subscription.services?.forEach((service:any) => {
        const serviceControl = new FormControl(false);
        this.form.addControl(`service_${service.subscriptionServiceId}`, serviceControl);

        serviceControl.valueChanges.subscribe(() => {
          this.updateTotalPrice();
        });

        service.options?.forEach((option:any) => {
          const optionControl = new FormControl(false);
          this.form.addControl(`option_${option.id}`, optionControl);

          optionControl.valueChanges.subscribe(() => {
            this.updateTotalPrice();
          });
        });
      });
    });
  }

  fetchTenants(): void {
    this.tenantService.getTenants().subscribe(
      (response) => {
        this.tenants = response;

        if (this.data) {
          this.subscriptions.push(this.data);
          if (this.data.tenantId) {
            this.form.patchValue({tenantId: this.data.tenantId});
          }
          console.log("this.subscriptions");
          console.log(this.subscriptions);
          this.subscriptions.forEach(subscription => {
            const subscriptionControl = new FormControl(false);
            this.form.addControl(`subscription_${subscription.subscriptionId}`, this.fb.control(false));

            subscriptionControl.valueChanges.subscribe(() => {
              this.updateTotalPrice();
            });

            subscription.services?.forEach((service:any) => {
              this.form.addControl(`service_${service.subscriptionServiceId}`, this.fb.control(false));

              service.options?.forEach((option:any) => {
                this.form.addControl(`option_${option.id}`, this.fb.control(false));
              });
            });
          });
        }
      },
      (error) => {
        console.error('Error fetching tenants:', error);
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

        // Dynamically add controls for subscriptions, services, and options
        this.subscriptions.forEach(subscription => {
          const subscriptionControl = new FormControl(false);
          this.form.addControl(`subscription_${subscription.subscriptionId}`, this.fb.control(false));

          subscriptionControl.valueChanges.subscribe(() => {
            this.updateTotalPrice();
          });

          subscription.services?.forEach((service:any) => {
            this.form.addControl(`service_${service.subscriptionServiceId}`, this.fb.control(false));

            service.options?.forEach((option:any) => {
              this.form.addControl(`option_${option.id}`, this.fb.control(false));
            });
          });
        });
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
      // Retrieve all form values
      const formData = this.form.value;

      // Get the list of subscriptions with checked checkboxes
      const selectedSubscriptions = this.subscriptions.filter(subscription =>
        this.form.get(`subscription_${subscription.subscriptionId}`)?.value
      );

      console.log('Form Data:', formData);
      console.log('Selected Subscriptions:', selectedSubscriptions);

      const paymentData = {
        ...formData,
        selectedSubscriptions
      };

      console.log('Payment Data:', paymentData);

      this.subscriptionService.processMultiplePayment(paymentData).subscribe(
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

  protected readonly FormControl = FormControl;

  getFormControl(controlName: string): FormControl {
    return this.form.get(controlName) as FormControl;
  }


  updateTotalPrice(): void {
    this.totalPrice = 0;

    this.subscriptions.forEach(subscription => {
      if (this.form.get(`subscription_${subscription.subscriptionId}`)?.value) {
        this.totalPrice += subscription.remainingAmountToPay || 0;
      }

      // subscription.services?.forEach(service => {
      //   if (this.form.get(`service_${service.subscriptionServiceId}`)?.value) {
      //     this.totalPrice += service.price || 0;
      //   }
      //
      //   service.options?.forEach(option => {
      //     if (this.form.get(`option_${option.id}`)?.value) {
      //       this.totalPrice += option.price || 0;
      //     }
      //   });
      // });
    });
  }

isFormValid(): boolean {

  // Check if the form is valid
  if (!this.form.valid) {
    // console.log('Form is invalid:', this.form.errors);
    return false;
  }

  // Check if at least one subscription checkbox is checked
  const isAnySubscriptionChecked = this.subscriptions.some(subscription =>
    this.form.get(`subscription_${subscription.subscriptionId}`)?.value
  );

  if (!isAnySubscriptionChecked) {
    // console.log('No subscription checkbox is checked');
  }

  return isAnySubscriptionChecked;
}

}
