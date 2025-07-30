import {Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {EnrayonsService} from "@services/enrayons.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {MatCardModule} from "@angular/material/card";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatButtonModule} from "@angular/material/button";
import {MatDividerModule} from "@angular/material/divider";
import {MatIconModule} from "@angular/material/icon";
import {MatTableModule} from "@angular/material/table";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {FlexLayoutModule} from "@ngbracket/ngx-layout";
import {BonCaisseService} from "@services/boncaisses.service";
import {MatTabsModule} from "@angular/material/tabs";
import {MatToolbarModule} from "@angular/material/toolbar";
import {jsPDF} from "jspdf";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";
import {AuthService} from "@services/auth.service";

@Component({
  selector: 'app-bon-caisse-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatToolbarModule,
    MatCardModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatButtonModule, MatDividerModule, MatIconModule,
    MatTableModule,
    MatAutocompleteModule,
    FlexLayoutModule
  ],
  templateUrl: './bon-caisse-dialog.component.html',
  styleUrl: './bon-caisse-dialog.component.scss'
})
export class BonCaisseDialogComponent {

  @ViewChild('barcode', {static: false}) barcodeElement!: ElementRef;
  selectedTabIndex: number = 0;
  bons: any[] = []; // List of bons
  displayedColumns: string[] = ['id', 'nomClient', 'codebarreId', 'dateGenerer', 'dateEncaisser','type', 'montant', 'actions'];
  codeBon: string = ''; // For encaisser bon
  bonForm: FormGroup; // Form for creating bon

   constructor(
    public authService: AuthService,private fb: FormBuilder,
              public dialogRef: MatDialogRef<BonCaisseDialogComponent>,
              public enRayonService: EnrayonsService, // Replace with actual service
              public bonCaisseService: BonCaisseService, // Replace with actual service
              public snackBar: MatSnackBar,
              @Inject(MAT_DIALOG_DATA) public data: any[]) {
    this.bonForm = this.fb.group({
      nomClient: ['', Validators.required],
      montant: [0, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadBons();
  }

  loadBons(): void {
    // Simulate loading bons from a service
    this.bons = this.data;
  }

  encaisserBon(codebarreId: string): void {
    if (codebarreId) {
      this.bonCaisseService.updateBon(codebarreId).subscribe({
        next: () => {
          this.snackBar.open('Bon encaissé avec succès.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
          this.loadBons(); // Refresh the list of bons
          this.showBonCaisse()
        },
        error: (err) => {
          console.error('Erreur lors de l\'encaissement du bon:', err);
          this.snackBar.open('Erreur lors de l\'encaissement du bon.', '×', {
            panelClass: 'error',
            verticalPosition: 'top',
            duration: 3000,
          });
        },
      });
    } else {
      this.snackBar.open('Veuillez entrer un code de bon.', '×', {
        panelClass: 'error',
        verticalPosition: 'top',
        duration: 3000,
      });
    }
  }

  creerBon(): void {
    if (this.bonForm.valid) {
      const newBon = this.bonForm.value;
      this.bonCaisseService.createBon(newBon).subscribe({
        next: (bon: any) => {
          this.snackBar.open('Bon créé avec succès.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
          this.generateBonCaisse(bon).then(() => {
            console.log('Receipt generated successfully');
          });
          this.bonForm.reset();
          this.bonForm.markAsPristine();
          this.bonForm.markAsUntouched();
          this.bonForm.updateValueAndValidity();
          this.loadBons(); // Refresh the list of bons
          this.showBonCaisse()
          this.selectedTabIndex = 0; // Switch to "Lister Bon" tab
        },
        error: (err) => {
          console.error('Erreur lors de la création du bon:', err);
          this.snackBar.open('Erreur lors de la création du bon.', '×', {
            panelClass: 'error',
            verticalPosition: 'top',
            duration: 3000,
          });
        },
      });
    } else {
      this.snackBar.open('Veuillez remplir tous les champs.', '×', {
        panelClass: 'error',
        verticalPosition: 'top',
        duration: 3000,
      });
    }
  }

  showBonCaisse() {
    this.bonCaisseService.getAllBons().subscribe({
      next: (bons: any[]) => {
        this.bons = bons;
      },
      error: (err: any) => {
        console.error('Failed to fetch BonCaisse list:', err);
        this.snackBar.open('Erreur lors de la récupération des bons de caisse.', '×', {
          panelClass: 'error',
          verticalPosition: 'top',
          duration: 3000,
        });
      }
    });
  }

  async generateBonCaisse(bon: any): Promise<void> {
    const doc = new jsPDF();

    // const doc = new jsPDF({
    //   unit: 'mm', // Unité en millimètres
    //   format: [210, 297], // Largeur x Hauteur en millimètres
    //   orientation: 'portrait' // Orientation portrait
    // });

    // const doc = new jsPDF({
    //   orientation: 'landscape', unit: 'mm', format: [30, 20]
    // });

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Pharmacie ALSAS', 10, 10);
    doc.setFontSize(12);
    doc.text('Dr GAMWO Sandrine', 10, 15);
    doc.text('BP 38 FOUMBOT', 10, 20);
    doc.text('Tel : (+237) 233 267 487', 10, 25);

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Bon de caisse', 10, 35);

    // Bon details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Bon N° : ${bon.codebarreId}`, 10, 45);
    const formattedDate = new Date(bon.dateGenerer).toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Date : ${formattedDate}`, 10, 50);
    doc.text(`Caissier : ${bon.caissier}`, 10, 55);
    doc.text(`Client : ${bon.nomClient}`, 10, 60);
    doc.text(`Montant : ${bon.montant} FCFA`, 10, 65);

    // QR Code
    const qrCodeDataUrl = await QRCode.toDataURL(bon.codebarreId);
    doc.addImage(qrCodeDataUrl, 'PNG', 10, 70, 50, 50);

    // Footer
    doc.setFontSize(10);
    doc.text('Bon à retourner', 10, 130);
    doc.text('Merci et bonne santé', 10, 135);
    doc.text('NoCT / POS85127004888', 10, 140);

    // Save PDF
    doc.save(`Bon_${bon.codebarreId}.pdf`);
  }

}
