import {Component, Inject, OnInit} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
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
import {Router} from "@angular/router";

@Component({
  selector: 'app-tenant-dialog',
  imports: [
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
    MatDialogModule
  ],
  templateUrl: './tenant-dialog.component.html',
  styleUrl: './tenant-dialog.component.scss'
})
export class TenantDialogComponent implements OnInit {

  isLinear = true;
  tenantForm: FormGroup;
  subscriptionForm: FormGroup;
  billingCycleForm: FormGroup;
  paymentForm: FormGroup;
  paymentLineForm: FormGroup;

  services: any[] = []; // List to store services
  public users: any[] = [];
  public logements: any[] = [];
  public form: FormGroup;
  protected logementBasePrice: number = 0;
  protected remainingAmount: number = 0;
  public minDate: Date = new Date();

  constructor(public dialogRef: MatDialogRef<TenantDialogComponent>,
              private housingUnitService: HoustingUnitService,
              private tenantService: TenantService,
              private router: Router,
              private serviceService: ServiceService,
              private snackBar: MatSnackBar,
              private usersService: UserService,
              @Inject(MAT_DIALOG_DATA) public data: any,
              public fb: FormBuilder) {
    this.form = this.fb.group({
      userId: [data?.userId || '', Validators.required],
      housingUnitId: [data?.housingUnitId || '', Validators.required],
      moveInDate: [data?.moveInDate || '', Validators.required],
      moveOutDate: [data?.moveOutDate || ''],
      securityDeposit: [data?.securityDeposit || '', [Validators.required, Validators.min(0)]],
      status: ['Unpaid'] // Default value
    });

    this.tenantForm = this.fb.group({
      userId: ['', Validators.required],
      housingUnitId: ['', Validators.required],
    });

    this.subscriptionForm = this.fb.group({
      serviceId: ['', Validators.required],
      billingSubscription: ['', Validators.required],
      numberOfSubscription: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });

    this.billingCycleForm = this.fb.group({
      depositAmount: ['', Validators.required],
      paymentMode: ['', Validators.required],
    });

    this.paymentForm = this.fb.group({
      // amount: ['', [Validators.required, Validators.min(0)]],
      // paymentDate: ['', Validators.required],
      // paymentMethod: ['', Validators.required]
    });

    this.paymentLineForm = this.fb.group({
      description: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]]
    });



  }


  ngOnInit(): void {
    const logementBasePrice = this.logementBasePrice || 0;
    const maxDeposit = logementBasePrice * this.subscriptionForm.get('numberOfSubscription')?.value || 0;

    this.fetchhousingUnits();
    this.fetchUsers();
    this.loadServices();
    // Enable fields and set billingMode when a service is selected
    this.subscriptionForm.get('serviceId')?.valueChanges.subscribe((serviceId) => {
      const selectedService = this.services.find(service => service.id === serviceId);
      if (selectedService) {
        const billingMode = selectedService.billingMode + "";
        this.subscriptionForm.patchValue({
          billingSubscription: billingMode,
          // status: selectedService.status
        })
        // this.subscriptionForm.get('billingMode')?.setValue(billingMode);
        this.subscriptionForm.get('billingMode')?.disable();
        this.subscriptionForm.get('numberOfSubscription')?.enable();
        this.subscriptionForm.get('startDate')?.enable();
      } else {
        this.subscriptionForm.reset();
        this.subscriptionForm.get('billingSubscription')?.disable();
        this.subscriptionForm.get('numberOfSubscription')?.disable();
        this.subscriptionForm.get('startDate')?.disable();
        this.subscriptionForm.get('endDate')?.disable();
      }
    });

    // Calculate endDate when startDate or numberOfSubscription changes
    this.subscriptionForm.get('startDate')?.valueChanges.subscribe((startDate) => {
      this.calculateEndDate();
    });

    this.subscriptionForm.get('numberOfSubscription')?.valueChanges.subscribe((numberOfSubscription) => {
      this.calculateEndDate();
    });

    // Recalculate summary and payment details when relevant fields change
    this.tenantForm.valueChanges.subscribe(() => {
      this.updateSummaryAndPayment();
    });

    this.subscriptionForm.valueChanges.subscribe(() => {
      this.updateSummaryAndPayment();
    });

    this.billingCycleForm.valueChanges.subscribe(() => {
      this.updateSummaryAndPayment();
    });

    this.paymentForm.valueChanges.subscribe(() => {
      this.updateSummaryAndPayment();
    });

    this.billingCycleForm.get('depositAmount')?.setValidators([
      Validators.required,
      Validators.min(logementBasePrice),
      this.depositAmountValidator(logementBasePrice, maxDeposit)
    ]);

    this.billingCycleForm.get('depositAmount')?.updateValueAndValidity();

  }

  depositAmountValidator(logementBasePrice: number, maxDeposit: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value || logementBasePrice <= 0) {
        return null; // Skip validation if no value or invalid base price
      }

      const errors: ValidationErrors = {};

      if (value % logementBasePrice !== 0) {
        errors['notMultiple'] = { basePrice: logementBasePrice };
      }

      if (value > maxDeposit) {
        errors['exceedsMax'] = { maxDeposit };
      }

      return Object.keys(errors).length ? errors : null;
    };
  }

  private calculateEndDate(): void {
    const startDate = this.subscriptionForm.get('startDate')?.value;
    const numberOfSubscription = this.subscriptionForm.get('numberOfSubscription')?.value;
    const billingSubscription = this.subscriptionForm.get('billingSubscription')?.value;

    if (startDate && numberOfSubscription) {
      const start = new Date(startDate);
      const end = new Date(start);

      if (billingSubscription.toLowerCase() === 'Monthly'.toLowerCase() && startDate && numberOfSubscription) {
        end.setMonth(end.getMonth() + numberOfSubscription);
        // end.setDate(end.getDate()+numberOfSubscription);
      }
      else if (billingSubscription.toLowerCase() === 'Yearly'.toLowerCase() && startDate && numberOfSubscription) {
        end.setFullYear(end.getFullYear() + numberOfSubscription);
        // end.setDate(end.getDate()+numberOfSubscription);
      }
      else{

      }
      console.log('Start Date:', start);
      console.log('End Date:', end);
      this.subscriptionForm.get('endDate')?.setValue(end.toISOString().split('T')[0]);
    }

  }

  private fetchUsers(): void {
    this.usersService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        if (err.status=="403"){
          this.router.navigate(['/sign-in']); // Redirect to login if not authenticated
        }
      }
    });
  }

  fetchhousingUnits(): void {
    this.housingUnitService.getUnoccupiedHoustingUnits().subscribe({
      next: (data) => {
        this.logements = data;
      },
      error: (err) => {
        console.error('Error fetching housing units:', err);
        if (err.status=="403"){
          this.router.navigate(['/sign-in']); // Redirect to login if not authenticated
        }
      }
    });
  }

  onLogementChange(event: any): void {
    const selectedLogement = this.logements.find(logement => logement.id === event.value);
    this.logementBasePrice = selectedLogement ? selectedLogement.price : 0;

    if (this.logementBasePrice > 0) {
      // Activer le champ et mettre à jour les validations
      this.form.get('securityDeposit')?.enable();
      this.form.get('securityDeposit')?.setValidators([
        Validators.required,
        Validators.min(0),
        Validators.max(this.logementBasePrice)
      ]);
    } else {
      // Désactiver le champ et réinitialiser sa valeur
      this.form.get('securityDeposit')?.reset(0);
      this.form.get('securityDeposit')?.disable();
    }

    this.form.get('securityDeposit')?.updateValueAndValidity();
    this.updatestatus();
  }

  updatestatus(): void {
    const securityDeposit = this.form.get('securityDeposit')?.value || 0;
    const status = securityDeposit >= this.logementBasePrice ? 'Paid' : 'Unpaid';
    this.form.get('status')?.setValue(status);
  }

  onSubmit(): void {
    const tenantData = this.tenantForm.value;
    const subscriptionData = this.subscriptionForm.value;
    const billingCycleData = this.billingCycleForm.value;
    const paymentData = this.paymentForm.value;
    const paymentLineData = this.paymentLineForm.value;

    const data = {
      housingUnitId:tenantData.housingUnitId,
      userId : tenantData.userId,
      serviceId : subscriptionData.serviceId,
      logementBasePrice : this.logementBasePrice,
      startDate : subscriptionData.startDate,
      endDate : subscriptionData.endDate,
      securityDeposit : billingCycleData.depositAmount,
      paymentMode : billingCycleData.paymentMode,
      numberOfSubscription : subscriptionData.numberOfSubscription,
    }
    this.tenantService.createTenant(data).subscribe(
      (response) => {
        this.snackBar.open('Tenant created successfully', 'Close', { duration: 3000 });
        this.dialogRef.close(response);
      },
      (error) => {
        console.error('Error creating tenant:', error);
        this.snackBar.open('Error creating tenant', 'Close', { duration: 3000 });
      }
    );
  }

  loadServices(): void {
    this.serviceService.getServices().subscribe((data: any) => {
      this.services = data;
    });
  }

  private updateSummaryAndPayment(): void {
    const logementBasePrice = this.logementBasePrice || 0;
    const depositAmount = this.billingCycleForm.get('depositAmount')?.value || 0;

    // Calculate remaining amount
    this.remainingAmount = logementBasePrice - depositAmount;

    // Log or update any additional summary details if needed
    // console.log('Updated Summary and Payment Details:');
    // console.log('Logement Base Price:', logementBasePrice);
    // console.log('Deposit Amount:', depositAmount);
    // console.log('Remaining Amount:', this.remainingAmount);
  }

}
