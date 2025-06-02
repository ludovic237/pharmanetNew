import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';
import { FlexLayoutModule, MediaChange, MediaObserver } from '@ngbracket/ngx-layout';
import { AppService } from '@services/app.service';
import { Subscription, filter, map } from 'rxjs';
import { DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-checkout',
    imports: [
        RouterModule,
        MatStepperModule,
        ReactiveFormsModule,
        MatInputModule,
        MatSelectModule,
        MatIconModule,
        MatButtonModule,
        MatRadioModule,
        DecimalPipe,
        FlexLayoutModule
    ],
    templateUrl: './checkout.component.html',
    styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit, OnDestroy {
  @ViewChild('horizontalStepper') horizontalStepper: MatStepper;
  stepperOrientation: 'horizontal' | 'vertical' = "horizontal";
  billingForm: FormGroup;
  deliveryForm: FormGroup;
  paymentForm: FormGroup;
  countries: { name: string, code: string }[] = [];
  months: { value: string, name: string }[] = [];
  years: string[] = [];
  deliveryMethods: { value: string, name: string, desc: string }[] = [];
  grandTotal = 0;
  watcher: Subscription;

  constructor(public appService: AppService, public formBuilder: FormBuilder, public mediaObserver: MediaObserver) {
    this.watcher = mediaObserver.asObservable()
      .pipe(filter((changes: MediaChange[]) => changes.length > 0), map((changes: MediaChange[]) => changes[0]))
      .subscribe((change: MediaChange) => {
        if (change.mqAlias == 'xs') {
          this.stepperOrientation = 'vertical';
        }
        else if (change.mqAlias == 'sm') {
          this.stepperOrientation = 'vertical';
        }
        else if (change.mqAlias == 'md') {
          this.stepperOrientation = 'horizontal';
        }
        else {
          this.stepperOrientation = 'horizontal';
        }
      });
  }

  ngOnInit() {
    this.appService.Data.cartList.forEach(product => {
      this.grandTotal += product.cartCount * product.newPrice;
    });
    this.countries = this.appService.getCountries();
    this.months = this.appService.getMonths();
    this.years = this.appService.getYears();
    this.deliveryMethods = this.appService.getDeliveryMethods();
    this.billingForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      middleName: '',
      company: '',
      email: ['', Validators.required],
      phone: ['', Validators.required],
      country: ['', Validators.required],
      city: ['', Validators.required],
      state: '',
      zip: ['', Validators.required],
      address: ['', Validators.required]
    });
    this.deliveryForm = this.formBuilder.group({
      deliveryMethod: [this.deliveryMethods[0], Validators.required]
    });
    this.paymentForm = this.formBuilder.group({
      cardHolderName: ['', Validators.required],
      cardNumber: ['', Validators.required],
      expiredMonth: ['', Validators.required],
      expiredYear: ['', Validators.required],
      cvv: ['', Validators.required]
    });
  }

  ngOnDestroy() {
    this.watcher.unsubscribe();
  }

  public placeOrder() {
    this.horizontalStepper._steps.forEach(step => step.editable = false);
    this.appService.Data.cartList.length = 0;
    this.appService.Data.totalPrice = 0;
    this.appService.Data.totalCartCount = 0;
  }

}

