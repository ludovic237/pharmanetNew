import { Component, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { customers } from '../../common/data/customers';import { ConfirmDialogComponent } from '@shared-components/confirm-dialog/confirm-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatDividerModule } from '@angular/material/divider';
import { PipesModule } from '../../theme/pipes/pipes.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import {CommonModule} from "@angular/common";
import {Subscription} from "../../model/data";
import {PaymentService} from "@services/payment.service";
import {PaymentDialogComponent} from "./payment-dialog/payment-dialog.component";
import {PaymentInfoDialogComponent} from "./payment-info-info-dialog/payment-info-dialog.component";
import {Router} from "@angular/router";

@Component({
    selector: 'app-payments',
    imports: [
      CommonModule,
        FlexLayoutModule,
        MatCardModule,
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatTooltipModule,
        NgxPaginationModule,
        PipesModule
    ],
    templateUrl: './payments.component.html'
})
export class PaymentsComponent implements OnInit {


  public payments: any[] = [];
  public locataires: any[] = [];
  public services: any[] = [];
  public page: number = 1;
  public count: number = 5;

  constructor(public dialog: MatDialog,
              public router:Router,
              public paymentService:PaymentService) {}

  ngOnInit(): void {
    this.getAllPayment();

  }

  private getAllPayment() {
    this.paymentService.getPayments().subscribe({
      next: (data) => {
        this.payments = data;
        this.count= this.payments.length;
        console.log('Get payment:', data);
      },
      error: (err) => {
        console.error('Error  payment:', err);
        if (err.status=="403"){
          this.router.navigate(['/sign-in']); // Redirect to login if not authenticated
        }
      }
    });
  }

  public openPaymentDialog(data: any): void {
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      data: {
        payment: data,
        locataires: this.locataires,
        services: this.services
      },
      panelClass: ['theme-dialog'],
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      console.log("payment");
      const payment = {
        id: result.id || this.payments.length + 1, // Génère un nouvel ID si non défini
        tenantId: result.tenantId,
        serviceId: result.serviceId,
        dateDebut: new Date(result.dateDebut).toISOString().split('T')[0], // Convert to YYYY-MM-DD
        dateFin: new Date(result.dateFin).toISOString().split('T')[0],     // Convert to YYYY-MM-DD
        status: result.status
      };
      console.log(payment);

      if (payment) {
        const index = this.payments.findIndex(s => s.id === payment.id);
        if (index !== -1) {
          this.payments[index] = payment; // Update existing payment
        } else {
          payment.id = this.payments.length + 1; // Assign new ID
          this.payments.push(payment); // Add new payment
        }
      }
      console.log("new this.payments");
      console.log(this.payments);
    });

  }

  public openPaymentInfoDialog(data: any): void {
    const dialogRef = this.dialog.open(PaymentInfoDialogComponent, {
      data: data,
      panelClass: ['theme-dialog'],
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      console.log("payment");
      const payment = {
        id: result.id || this.payments.length + 1, // Génère un nouvel ID si non défini
        tenantId: result.tenantId,
        serviceId: result.serviceId,
        dateDebut: new Date(result.dateDebut).toISOString().split('T')[0], // Convert to YYYY-MM-DD
        dateFin: new Date(result.dateFin).toISOString().split('T')[0],     // Convert to YYYY-MM-DD
        status: result.status
      };
      console.log(payment);

      if (payment) {
        const index = this.payments.findIndex(s => s.id === payment.id);
        if (index !== -1) {
          this.payments[index] = payment; // Update existing payment
        } else {
          payment.id = this.payments.length + 1; // Assign new ID
          this.payments.push(payment); // Add new payment
        }
      }
      console.log("new this.payments");
      console.log(this.payments);
    });

  }

  public removePayment(payment: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: {
        title: 'Confirm Action',
        message: 'Are you sure you want to remove this payment?'
      }
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.payments = this.payments.filter(s => s.id !== payment.id);
      }
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


}
