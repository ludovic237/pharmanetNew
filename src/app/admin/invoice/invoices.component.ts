import { Component, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AppService } from '@services/app.service';
import { DomHandlerService } from '@services/dom-handler.service';
import { Settings, SettingsService } from '@services/settings.service';
import { customers } from '../../common/data/customers';
import { jsPDF } from 'jspdf';
import { InvoiceDialogComponent } from './invoice-dialog/invoice-dialog.component';
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
import {Invoice} from "../../model/data";
import autoTable from "jspdf-autotable";

@Component({
    selector: 'app-invoices',
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
    templateUrl: './invoices.component.html'
})
export class InvoicesComponent implements OnInit {

  public invoices: any[] = [];
  public locataires: any[] = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Alice Johnson' },
    { id: 4, name: 'Bob Brown' }
  ];
  public page: number = 1;
  public count: number = 5;

  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {
    // Mock data for invoices
    this.invoices = [
      {
        id: 1,
        tenantId: 1,
        type: 'eau',
        mois: 'January',
        montant: 100,
        status: 'payée',
        datePaiement: '2023-01-15'
      },
      {
        id: 2,
        tenantId: 2,
        type: 'électricité',
        mois: 'February',
        montant: 200,
        status: 'impayée',
        datePaiement: null
      }
    ];
  }

  public onPageChanged(event: any): void {
    this.page = event;
  }

  public openInvoiceDialog(data: Invoice | null): void {
    const dialogRef = this.dialog.open(InvoiceDialogComponent, {
      data: {
        invoice: data,
        locataires: this.locataires
      },
      panelClass: ['theme-dialog'],
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe((invoice: Invoice) => {
      if (invoice) {
        const index = this.invoices.findIndex(i => i.id === invoice.id);
        if (index !== -1) {
          this.invoices[index] = invoice; // Update existing invoice
        } else {
          invoice.id = this.invoices.length + 1; // Assign new ID
          this.invoices.push(invoice); // Add new invoice
        }
      }
    });
  }

  public removeInvoice(invoice: Invoice): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: {
        title: 'Confirm Action',
        message: 'Are you sure you want to remove this invoice?'
      }
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.invoices = this.invoices.filter(i => i.id !== invoice.id);
      }
    });
  }

  getTenantName(tenantId: number): string {
    const tenant = this.locataires.find(l => l.id === tenantId);
    return tenant ? tenant.name : 'Unknown';
  }

  generateInvoice(): void {
    const doc = new jsPDF();

    // Invoice Header
    doc.setFontSize(18);
    doc.text('Invoice', 10, 10);
    doc.setFontSize(12);
    doc.text('Invoice Number: INV-001', 10, 20);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 10, 30);

    // Customer Details
    doc.text('Customer Details:', 10, 40);
    doc.text('Name: John Doe', 10, 50);
    doc.text('Address: 123 Main Street, City, Country', 10, 60);
    doc.text('Email: john.doe@example.com', 10, 70);

    // Table of Items
    const items = [
      ['Item', 'Quantity', 'Unit Price', 'Total'],
      ['Product A', '2', '$50', '$100'],
      ['Product B', '1', '$30', '$30'],
      ['Product C', '3', '$20', '$60']
    ];
    autoTable(doc, {
      startY: 80,
      head: [items[0]],
      body: items.slice(1),
    });

    // Total Amount
    const finalY = (doc as any).lastAutoTable.finalY || 80;
    doc.text('Total: $190', 10, finalY + 10);

    // Save PDF
    doc.save('invoice.pdf');
  }

}
