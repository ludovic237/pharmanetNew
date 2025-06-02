import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatTabsModule} from '@angular/material/tabs';
import {FlexLayoutModule} from '@ngbracket/ngx-layout';
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {ServiceService} from "@services/service.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Service} from "../../../model/data";
import {CommonModule} from "@angular/common";
import {MatIconModule} from "@angular/material/icon";
import {MatChipsModule} from "@angular/material/chips";
import {MatToolbarModule} from "@angular/material/toolbar";
import {Router} from "@angular/router";
import {MatCardModule} from "@angular/material/card";

@Component({
  selector: 'app-service-dialog',
  imports: [
    CommonModule,
    MatCardModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatTabsModule,
    MatIconModule,
    MatChipsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatDialogModule
  ],
  templateUrl: './service-dialog.component.html',
  styleUrl: './service-dialog.component.scss'
})

export class ServiceDialogComponent implements OnInit {
  public form: FormGroup;
  public optionForm: FormGroup;
  public billingModes: string[] = ['Monthly', 'Yearly', 'One-Time'];
  public validatedOptions: any[] = [];
  public selectedOptions: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<ServiceDialogComponent>,
    private router: Router,
    private snackBar: MatSnackBar,
    private serviceService: ServiceService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      code: [this.data?.code || '', Validators.required],
      name: [this.data?.name || '', Validators.required],
      description: [this.data?.description || '', Validators.required],
      isActive: [this.data?.isActive || true],
      type: [this.data?.type || 'PERIODIC', Validators.required],
      billingMode: [this.data?.billingMode || '', this.isBillingModeRequired() ? Validators.required : null],
      addPrice: [false],
      price: [null],
      options: this.fb.array([])
    });


    this.optionForm = this.fb.group({
      name: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      quantity: [null, Validators.min(1)]
    });

    this.form.get('type')?.valueChanges.subscribe(() => {
      this.updateValidators();
      this.clearOptions();
    });
    this.form.get('addPrice')?.valueChanges.subscribe((addPrice) => {
      if (addPrice) {
        this.form.get('price')?.setValidators([Validators.required, Validators.min(0)]);
      } else {
        this.form.get('price')?.clearValidators();
        this.form.get('price')?.setValue(null);
      }
      this.form.get('price')?.updateValueAndValidity();
    });

    if (this.data?.id) {
      this.serviceService.getServiceWithOptions(this.data.id).subscribe({
        next: (service) => {
          this.form.patchValue(service);
          service.activeOptions.forEach((option: any) => this.validatedOptions.push(option));
        },
        error: (err) => this.handleError(err, 'Failed to load service details.')
      });
    }
  }

  private updateValidators(): void {
    const type = this.form.get('type')?.value;

    if (type === 'PERIODIC' || type === 'PERIODIC_WITH_OPTIONS') {
      this.form.get('billingMode')?.setValidators(Validators.required);
    } else {
      this.form.get('billingMode')?.clearValidators();
      this.form.get('billingMode')?.setValue(null);
    }

    if (type === 'OPTIONS' || type === 'PERIODIC_WITH_OPTIONS') {
      this.form.get('options')?.setValidators(Validators.required);
    } else {
      this.form.get('options')?.clearValidators();
    }

    this.form.get('billingMode')?.updateValueAndValidity();
    this.form.get('options')?.updateValueAndValidity();
  }

  private isBillingModeRequired(): boolean {
    const typeControl = this.form?.get('type');
    if (!typeControl) {
      return false;
    }
    const type = typeControl.value;
    return type === 'PERIODIC' || type === 'PERIODIC_WITH_OPTIONS';
  }

  get options(): FormArray {
    return this.form.get('options') as FormArray;
  }

addOption(): void {
  const option = this.optionForm.value;
  const existingOptionIndex = this.validatedOptions.findIndex(
    (validatedOption) => validatedOption.name.toLowerCase() === option.name.toLowerCase()
  );

  if (existingOptionIndex !== -1) {
    const confirmUpdate = confirm(
      `An option with the name "${option.name}" already exists. Do you want to update it?`
    );

    if (confirmUpdate) {
      this.validatedOptions[existingOptionIndex] = { ...option };
      (this.options.at(existingOptionIndex) as FormGroup).patchValue(option);
      this.snackBar.open('Option updated successfully!', 'Close', { duration: 2000 });
    }
  } else {
    this.validatedOptions.push(option);
    this.options.push(this.fb.group(option));
    this.snackBar.open('Option added successfully!', 'Close', { duration: 2000 });
  }

  this.optionForm.reset();
  this.cdr.detectChanges(); // Trigger change detection
}

removeValidatedOption(index: number): void {
  if (index >= 0 && index < this.validatedOptions.length) {
    this.validatedOptions.splice(index, 1);
    this.options.removeAt(index); // Remove the corresponding FormGroup from the FormArray
    this.snackBar.open('Option removed successfully!', 'Close', { duration: 2000 });
    this.cdr.detectChanges(); // Trigger change detection
  }
}

get isSaveDisabled(): boolean {
  const isFormInvalid = this.form.invalid;
  const type = this.form.get('type')?.value;
  const isOptionsType = type === 'OPTIONS';
  const isPeriodicWithOptionsType = type === 'PERIODIC_WITH_OPTIONS';
  const hasOptions = this.options.length > 0;

  return isFormInvalid || (isOptionsType && !hasOptions) || (isPeriodicWithOptionsType && !hasOptions);
}

onSubmit(): void {
  if (this.form.valid) {
    const serviceData = {
      ...this.form.value,
      activeOptions: this.validatedOptions // Utilise validatedOptions pour les options actives
    };

    console.log('Service Data:', serviceData);
    console.log("this.data :",this.data);
    if (this.data?.id) {
      // Mise à jour du service existant
      this.serviceService.updateServiceWithOptions(this.data.id, serviceData).subscribe({
        next: (response) => this.handleSuccess('Service updated successfully!', response),
        error: (err) => this.handleError(err, 'Failed to update the service.')
      });
    }
    else {
      // Création d'un nouveau service
      this.serviceService.createServiceData(serviceData).subscribe({
        next: (response) => this.handleSuccess('Service saved successfully!', response),
        error: (err) => this.handleError(err, 'Failed to save the service.')
      });
    }
  } else {
    this.snackBar.open('Please fill in all required fields.', 'Close', { duration: 3000 });
  }
}

  private handleSuccess(message: string, response: any): void {
    this.snackBar.open(message, 'Close', {duration: 3000});
    this.dialogRef.close(response);
  }

  private handleError(err: any, message: string): void {
    this.snackBar.open(message, 'Close', {duration: 3000});
    if (err.status === 403) {
      this.router.navigate(['/sign-in']);
    }
    console.error(message, err);
  }

  private clearOptions(): void {
    this.validatedOptions = [];
    this.options.clear();
    this.cdr.detectChanges(); // Assurer la détection des changements
  }
}
