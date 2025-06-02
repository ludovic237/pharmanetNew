import { Component, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { customers } from '../../common/data/customers';
import { BillingCycleDialogComponent } from './billing-cycle-dialog/billing-cycle-dialog.component';
import { ConfirmDialogComponent } from '@shared-components/confirm-dialog/confirm-dialog.component';
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
import {BillingCycleService} from "@services/billing-cycle.service";
import {Router} from "@angular/router";

@Component({
    selector: 'app-billing-cycles',
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
  styleUrl: './billing-cycles.component.scss',
    templateUrl: './billing-cycles.component.html'
})
export class BillingCyclesComponent implements OnInit {


  public billingCycles: any[] = [];
  public locataires: any[] = [];
  public services: any[] = [];
  public page: number = 1;
  public count: number = 5;

  constructor(public dialog: MatDialog,
              public router:Router,
              public billinCycleService:BillingCycleService) {}

  ngOnInit(): void {
    this.getAllBillingCycle();

  }

  private getAllBillingCycle() {
    this.billinCycleService.getBillingCyclesDetailsFilter().subscribe({
      next: (data) => {
        this.billingCycles = data;
        this.count = this.billingCycles.length;
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

  public openBillingCycleDialog(data: any): void {
    const dialogRef = this.dialog.open(BillingCycleDialogComponent, {
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
        id: result.id || this.billingCycles.length + 1, // Génère un nouvel ID si non défini
        tenantId: result.tenantId,
        serviceId: result.serviceId,
        dateDebut: new Date(result.dateDebut).toISOString().split('T')[0], // Convert to YYYY-MM-DD
        dateFin: new Date(result.dateFin).toISOString().split('T')[0],     // Convert to YYYY-MM-DD
        status: result.status
      };
      console.log(payment);

      if (payment) {
        const index = this.billingCycles.findIndex(s => s.id === payment.id);
        if (index !== -1) {
          this.billingCycles[index] = payment; // Update existing payment
        } else {
          payment.id = this.billingCycles.length + 1; // Assign new ID
          this.billingCycles.push(payment); // Add new payment
        }
      }
      console.log("new this.billingCycles");
      console.log(this.billingCycles);
    });

  }

  public removeBillingCycle(payment: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: {
        title: 'Confirm Action',
        message: 'Are you sure you want to remove this payment?'
      }
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.billingCycles = this.billingCycles.filter(s => s.id !== payment.id);
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
