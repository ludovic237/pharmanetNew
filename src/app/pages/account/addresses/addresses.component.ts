import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { AppService } from '@services/app.service';

@Component({
    selector: 'app-addresses',
    imports: [
        MatTabsModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        FlexLayoutModule,
        ReactiveFormsModule
    ],
    templateUrl: './addresses.component.html',
    styleUrl: './addresses.component.scss'
})
export class AddressesComponent implements OnInit {
  billingForm: FormGroup;
  shippingForm: FormGroup;
  countries: any[] = [];
  constructor(public appService: AppService, public formBuilder: FormBuilder, public snackBar: MatSnackBar) { }

  ngOnInit() {
    this.countries = this.appService.getCountries();
    this.billingForm = this.formBuilder.group({
      'firstName': ['', Validators.required],
      'lastName': ['', Validators.required],
      'middleName': '',
      'company': '',
      'email': ['', Validators.required],
      'phone': ['', Validators.required],
      'country': ['', Validators.required],
      'city': ['', Validators.required],
      'state': '',
      'zip': ['', Validators.required],
      'address': ['', Validators.required]
    });
    this.shippingForm = this.formBuilder.group({
      'firstName': ['', Validators.required],
      'lastName': ['', Validators.required],
      'middleName': '',
      'company': '',
      'email': ['', Validators.required],
      'phone': ['', Validators.required],
      'country': ['', Validators.required],
      'city': ['', Validators.required],
      'state': '',
      'zip': ['', Validators.required],
      'address': ['', Validators.required]
    });
  }

  public onBillingFormSubmit(values: Object): void {
    if (this.billingForm.valid) {
      this.snackBar.open('Your billing address information updated successfully!', '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
    }
  }

  public onShippingFormSubmit(values: Object): void {
    if (this.shippingForm.valid) {
      this.snackBar.open('Your shipping address information updated successfully!', '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
    }
  }

}
