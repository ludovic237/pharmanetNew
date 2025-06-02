import {Component, OnInit, inject, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {AppService} from '@services/app.service';
import {DomHandlerService} from '@services/dom-handler.service';
import {Settings, SettingsService} from '@services/settings.service';
import {customers} from '../../common/data/customers';
import {TenantDialogComponent} from './tenant-dialog/tenant-dialog.component';
import {ConfirmDialogComponent} from '@shared-components/confirm-dialog/confirm-dialog.component';
import {MatCardModule} from '@angular/material/card';
import {FlexLayoutModule} from '@ngbracket/ngx-layout';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {NgxPaginationModule} from 'ngx-pagination';
import {MatDividerModule} from '@angular/material/divider';
import {PipesModule} from '../../theme/pipes/pipes.module';
import {MatTooltipModule} from '@angular/material/tooltip';
import {RentDialogComponent} from "../rent/rent-dialog/rent-dialog.component";
import {CommonModule} from "@angular/common";
import {TenantService} from "@services/tenant.service";
import {MatFormFieldModule} from "@angular/material/form-field";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {TenantInfoDialogComponent} from "./tenant-info-info-dialog/tenant-info-dialog.component";
import {MatChipsModule} from "@angular/material/chips";
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {MatSort, MatSortModule} from "@angular/material/sort";
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";
import {jsPDF} from "jspdf";
import autoTable from "jspdf-autotable";
import {Router} from "@angular/router";

@Component({
  selector: 'app-tenants',
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatTooltipModule,
    NgxPaginationModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    PipesModule
  ],
  templateUrl: './tenants.component.html',
  styleUrl: './tenants.component.scss'
})
export class TenantsComponent implements OnInit {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  searchQuery: string = ''; // Search query
  public customers: any[] = [];
  public stores = [
    {id: 1, name: 'Store 1'},
    {id: 2, name: 'Store 2'}
  ]
  public tenants: any[] = [];
  // public page: number = 1;
  // public count: number = 5;
  public countries: any[] = [];
  public page: any;
  public count = 6;
  domHandlerService = inject(DomHandlerService);
  public settings: Settings;

  public filteredTenants = new MatTableDataSource<any>();
  public displayedColumns: string[] = [
    'userName',
    'housingUnitName',
    'moveInDate',
    'securityDeposit',
    'paymentStatus',
    'status',
    'actions'
  ];

  constructor(
    public router: Router,
    public appService: AppService,
    public tenantService: TenantService,
    public dialog: MatDialog,
    public settingsService: SettingsService) {
    this.settings = this.settingsService.settings;
  }

  ngOnInit(): void {
    this.getTenantData();

  }

  ngOnChanges(): void {

  }

  filterTenants(): void {
    this.filteredTenants.filter = this.searchQuery.trim().toLowerCase();
  }

  private getTenantData() {
    this.tenantService.getTenants().subscribe({
      next: (tenants) => {
        this.tenants = tenants;
        // this.filteredTenants = this.tenants;
        this.filteredTenants.data = this.tenants;
      },
      error: (err) => {
        if (err.status=="403"){
          this.router.navigate(['/sign-in']); // Redirect to login if not authenticated
        }
        console.error('Failed to load tenants:', err);
      }
    })
  }

  public onPageChanged(event: any) {
    this.page = event;
    this.domHandlerService.winScroll(0, 0);
  }

  public remove(customer: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: {
        title: "Confirm Action",
        message: "Are you sure you want remove this customer?"
      }
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        const index: number = this.customers.indexOf(customer);
        if (index !== -1) {
          this.customers.splice(index, 1);
        }
      }
    });
  }


  public openTenantDialog(data: any): void {
    const dialogRef = this.dialog.open(TenantDialogComponent, {
      data: data,
      panelClass: ['theme-dialog'],
      autoFocus: false,
      direction: (this.settings.rtl) ? 'rtl' : 'ltr'
    });

    dialogRef.afterClosed().subscribe(tenant => {
      this.getTenantData();
    });
  }

  public openDetailTenantDialog(data: any): void {
    const dialogRef = this.dialog.open(TenantInfoDialogComponent, {
      data: data,
      panelClass: ['theme-dialog'],
      autoFocus: false,
      // width: '600px',
      // height: 'auto',
      // width: '80%', // 80% of the window width
      // height: '70%' ,// 70% of the window height
      direction: (this.settings.rtl) ? 'rtl' : 'ltr'
    });

    dialogRef.afterClosed().subscribe(tenant => {
      this.getTenantData();
    });
  }

  public removeTenant(tenant: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: {
        title: 'Confirm Action',
        message: 'Are you sure you want to remove this tenant?'
      }
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        const index: number = this.tenants.indexOf(tenant);
        if (index !== -1) {
          this.tenants.splice(index, 1); // Suppression du locataire
        }
      }
    });
  }

  public downloadTenantData(tenant: any) {
    this.generateInvoiceTwo();
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

  generateInvoiceTwo(): void {
    const doc = new jsPDF();

    // Company Header
    doc.setFontSize(10);
    doc.text('Sevenit GmbH', 10, 10);
    doc.text('Hauptstraße 40', 10, 15);
    doc.text('77654 Offenburg', 10, 20);

    // Customer Details
    doc.text('Monsieur Jean Dupont', 150, 10, { align: 'right' });
    doc.text('Acheteur SA', 150, 15, { align: 'right' });
    doc.text('Rue du Château', 150, 20, { align: 'right' });
    doc.text('34000 MONTPELLIER', 150, 25, { align: 'right' });

    // Invoice Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURE', 105, 40, { align: 'center' });

    // Invoice Details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Numéro de facture : 1001', 10, 50);
    doc.text('Date de facture : 02/08/2018', 10, 55);
    doc.text('N° client : 321', 10, 60);

    // Table of Items
    const items = [
      ['Description', 'Quantité', 'Unité', 'Prix unitaire HT', 'Total HT', 'TVA'],
      ['Main-d\'oeuvre', '30', 'h.', '40,00 €', '1 200,00 €', '20 %'],
      ['Tracteur', '1', 'pce.', '1 800,00 €', '1 800,00 €', '20 %'],
      ['Bois de chauffage', '10', 'stère', '80,00 €', '800,00 €', '10 %']
    ];
    autoTable(doc, {
      startY: 70,
      head: [items[0]],
      body: items.slice(1),
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [200, 200, 200] }
    });

    // Summary Section
    const finalY = (doc as any).lastAutoTable.finalY || 70;
    doc.text('Total HT', 120, finalY + 10);
    doc.text('3 800,00 €', 200, finalY + 10, { align: 'right' });

    doc.text('Total TVA', 120, finalY + 15);
    doc.text('680,00 €', 200, finalY + 15, { align: 'right' });

    doc.text('Total TTC', 120, finalY + 20);
    doc.setFont('helvetica', 'bold');
    doc.text('4 480,00 €', 200, finalY + 20, { align: 'right' });

    // Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Conditions de paiement : 30 % à la commande, paiement à réception de facture', 10, finalY + 40);
    doc.text('Mode de paiement : par virement ou chèque', 10, finalY + 45);
    doc.text('Nous vous remercions de votre confiance.', 10, finalY + 55);
    doc.text('Cordialement', 10, finalY + 60);

    // Save PDF
    doc.save('invoice.pdf');
  }

  generateInvoiceThree() {
    const doc = new jsPDF();

    // Header Section
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("HV SERVICE", 10, 20);
    doc.setFontSize(12);
    doc.text("FACTURE DE SERVICES", 150, 20, { align: "right" });
    doc.text("FACTURE :", 150, 30, { align: "right" });
    doc.text("L01253552", 180, 30, { align: "right" });
    doc.text("DATE :", 150, 40, { align: "right" });
    doc.text("20-05-2021", 180, 40, { align: "right" });

    // Supplier and Client Information
    doc.setFillColor(200, 230, 200);
    doc.rect(10, 50, 90, 40, "F");
    doc.rect(110, 50, 90, 40, "F");

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("FOURNISSEUR DE SERVICES", 15, 55);
    doc.text("François Durand", 15, 60);
    doc.text("HV Service", 15, 65);
    doc.text("210 avenue des Lys", 15, 70);
    doc.text("54 000 Nancy", 15, 75);
    doc.text("Téléphone : (33) 06 65 78 21 34", 15, 80);
    doc.text("Fax : (33) 09 87 32 21", 15, 85);
    doc.text("info@hvservice.com", 15, 90);

    doc.text("CLIENT", 115, 55);
    doc.text("Jean Dupont", 115, 60);
    doc.text("Entreprise SL", 115, 65);
    doc.text("107 avenue du Port", 115, 70);
    doc.text("13 000 Marseille", 115, 75);
    doc.text("Téléphone : (33) 11 55 66 77", 115, 80);
    doc.text("Fax : (33) 22 55 65 79", 115, 85);
    doc.text("info@companylimitedinc.com", 115, 90);

    // Client Request Section
    doc.setFillColor(0, 0, 0);
    doc.setTextColor(255, 255, 255);
    doc.rect(10, 100, 190, 10, "F");
    doc.text("DEMANDES DU CLIENT", 15, 107);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(
      "Lorem ipsum dolor sit amet, in porttitor. Donec laoreet nonummy augue. Suspendisse dui purus, scelerisque at, vulputate vitae, pretium mattis, nunc.",
      15,
      115,
      { maxWidth: 180 }
    );

    // Table of Services
    const tableData = [
      ["1", "Lorem ipsum dolor sit amet", "110", "125,00 €", "13 750,00 €"],
      ["2", "Description 2", "20", "100,00 €", "2 000,00 €"],
      ["3", "Description 3", "", "", ""],
      ["4", "Description 4", "", "", ""],
      ["5", "Description 5", "", "", ""],
      ["6", "Description 6", "", "", ""],
    ];

    autoTable(doc, {
      startY: 130,
      head: [["ID", "DESCRIPTION DU SERVICE", "HEURES", "PAR HEURE", "TOTAL"]],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 10, halign: "center" },
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      bodyStyles: { fillColor: [200, 230, 200] },
    });

    // Summary Section
    const finalY = (doc as any).lastAutoTable.finalY || 130;
    doc.setFontSize(10);
    doc.text("TOTAL HORS", 150, finalY + 10);
    doc.text("15 750,00 €", 200, finalY + 10, { align: "right" });
    doc.text("TAXE", 150, finalY + 15);
    doc.text("1 575,00 €", 200, finalY + 15, { align: "right" });
    doc.text("TAUX FISCAL/TVA", 150, finalY + 20);
    doc.text("10%", 200, finalY + 20, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("TOTAL TTC :", 150, finalY + 30);
    doc.setTextColor(0, 128, 0);
    doc.text("17 325,00 €", 200, finalY + 30, { align: "right" });

    // Footer Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text("MERCI DE VOTRE CONFIANCE !", 15, finalY + 50);
    doc.text(
      "CONDITIONS GÉNÉRALES\nVeuillez effectuer le paiement par virement direct sur notre compte bancaire 10000-45856-222XX10 en indiquant le numéro de la facture.",
      15,
      finalY + 60,
      { maxWidth: 180 }
    );

    // Save PDF
    doc.save("invoice.pdf");
  }

}
