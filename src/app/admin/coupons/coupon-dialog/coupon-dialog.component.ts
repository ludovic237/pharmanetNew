import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog'; 
import { MatTabsModule } from '@angular/material/tabs';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-coupon-dialog',
    imports: [
        ReactiveFormsModule,
        FlexLayoutModule,
        MatTabsModule,
        MatDialogModule,
        MatInputModule,
        MatSelectModule,
        MatCheckboxModule,
        MatChipsModule,
        MatButtonModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatIconModule,
        MatTooltipModule
    ],
    templateUrl: './coupon-dialog.component.html',
    styleUrl: './coupon-dialog.component.scss'
})
export class CouponDialogComponent implements OnInit {
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  public products: any[] = [];
  public form: FormGroup;
  constructor(public dialogRef: MatDialogRef<CouponDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              public fb: FormBuilder) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      id: 0,
      title: ['', Validators.required],
      code: ['', Validators.required],
      desc: null,
      discountType: null,
      amount: null,
      expiryDate: null,
      allowFreeShipping: false,
      storeId: null,
      showOnStore: false,
      restriction: this.fb.group({
        minimumSpend: null,
        maximumSpend: null,
        individualUseOnly: false,
        excludeSaleItems: false,
        products: [[]],
        categories: [[]]
      }),
      limit: this.fb.group({
        perCoupon: null,
        perItems: null,
        perUser: null
      })
    });

    if (this.data.coupon) {
      this.form.patchValue(this.data.coupon);
      this.products = this.data.coupon.restriction.products;
    };
  }

  public onSubmit() {
    console.log(this.form.value);
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  public addProduct(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    if ((value || '').trim()) {
      this.products.push(value.trim());
    }
    if (input) {
      input.value = '';
    }
    this.restrictionForm.controls.products.patchValue(this.products);
  }

  public removeProduct(fruit: any): void {
    const index = this.products.indexOf(fruit);
    if (index >= 0) {
      this.products.splice(index, 1);
    }
    this.restrictionForm.controls.products.patchValue(this.products);
  }

  get restrictionForm(): FormGroup {
    return this.form.get('restriction') as FormGroup;
  }

}
