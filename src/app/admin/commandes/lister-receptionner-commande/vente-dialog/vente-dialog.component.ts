import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatTabsModule} from "@angular/material/tabs";
import {MatToolbarModule} from "@angular/material/toolbar";
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
import {jsPDF} from "jspdf";
import QRCode from "qrcode";
import {VentesService} from "@services/ventes.service";
import {AuthService} from "@services/auth.service";
import {LoaderService} from "@services/loader.service";

@Component({
  selector: 'app-vente-dialog',
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
  templateUrl: './vente-dialog.component.html',
  styleUrl: './vente-dialog.component.scss'
})
export class VenteDialogComponent {

  displayedColumns: string[] = ['montant', 'montantPerçu', 'dateEncaissement', 'dateVente', 'etat', 'ref', 'actions'];
  ventes: any[] = []; // Replace with actual data source

   constructor(
     public loaderService: LoaderService,
    public authService: AuthService,
    public dialogRef: MatDialogRef<VenteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any[],
    public venteService: VentesService, // Replace with actual VenteService
    private snackBar: MatSnackBar
  ) {
    this.ventes = data; // Load data passed to the dialog
  }

  closeDialog(): void {
    this.dialogRef.close();
  }


  imprimerTicket(venteId: string): void {
    this.venteService.chargerVentesEncaisser(Number(venteId)).subscribe({
      next: (vente: any) => {
        this.generateTicket(vente).then(() => {
          this.snackBar.open(`Ticket imprimé pour la référence: ${vente.vente.reference}`, '×', {
            panelClass: 'success',
            duration: 3000,
          });
        });
      },
      error: (err: any) => {
        console.error('Erreur lors de la récupération des informations de la vente:', err);
        this.snackBar.open('Erreur lors de la récupération des informations de la vente.', '×', {
          panelClass: 'error',
          duration: 3000,
        });
      },
    });
  }

  async generateTicket(vente: any): Promise<void> {
    const doc = new jsPDF();

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Pharmacie ALSAS', 10, 10);
    doc.text('Dr GAMWO Sandrine', 10, 15);
    doc.text('BP 38 FOUMBOT', 10, 20);
    doc.text('Tel : (+237) 233 267 487', 10, 25);
    doc.text(`Ticket N°: ${vente.vente.ref}`, 10, 30);
    doc.text(`Vendu le: ${vente.vente.dateVente}`, 10, 35);
    doc.text(`Encaisser le: ${vente.vente.dateEncaissement}`, 10, 40);
    doc.text(`Vendeur: ${vente.vente.vendeur}`, 10, 45);
    doc.text(`Acheteur: ${vente.vente.acheteur}`, 10, 50);

    // Table Header
    doc.setFontSize(10);
    doc.text('Libellé', 10, 60);
    doc.text('Prix U.', 60, 60);
    doc.text('Qte', 90, 60);
    doc.text('Total', 110, 60);
    doc.text('Rd(%)', 140, 60);

    // Table Content
    let y = 65;
    vente.produits.forEach((produit: any) => {
      doc.text(produit.nom, 10, y);
      doc.text(`${produit.prixUnitaire ?? 0}`, 60, y);
      doc.text(`${produit.quantite ?? 0}`, 90, y);
      doc.text(`${produit.prixTotal ?? 0}`, 110, y);
      doc.text(`${produit.reduction ?? 0}`, 140, y);
      y += 5;
    });
    const totalPrixProduits = vente.produits.reduce((sum: number, produit: any) => sum + produit.prixTotal, 0);

    const prixRemise = totalPrixProduits - vente.vente.prixTotal;
    const pourcentageRemise = (prixRemise / totalPrixProduits) * 100;
    // Summary
    y += 5;
    doc.text(`Montant: ${totalPrixProduits} FCFA`, 10, y);
    y += 5;
    doc.text(`Total: ${vente.vente.prixTotal} FCFA`, 10, y);
    y += 5;
    doc.text(`Remise: ${pourcentageRemise} %`, 10, y);
    y += 5;
    doc.text(`Net à payer: ${vente.vente.prixTotal} FCFA`, 10, y);

    // Payment Details
    y += 10;
    doc.text(`Montant Espèce: ${vente.montantEspece} FCFA`, 10, y);
    y += 5;
    doc.text(`Montant Electronique: ${vente.montantElectronique} FCFA`, 10, y);
    y += 5;
    doc.text(`Montant Ticket: ${vente.montantTicket} FCFA`, 10, y);

    // Footer
    y += 10;
    doc.text(`Montant total encaissé: ${vente.vente.prixPercu} FCFA`, 10, y);
    y += 5;
    doc.text(`Montant rendu: ${(vente.vente.prixPercu - vente.vente.prixTotal)} FCFA`, 10, y);
    y += 5;
    doc.text('Ce ticket vaut facture', 10, y);
    y += 5;
    doc.text('Merci et bonne santé', 10, y);
    y += 5;
    doc.text('NoCT / POS85127004888', 10, y);

    // QR Code
    if (vente.vente.ref) {
      const qrCodeDataUrl = await QRCode.toDataURL(vente.vente.reference);
      doc.addImage(qrCodeDataUrl, 'PNG', 10, y + 5, 30, 30);
    } else {
      console.error('Erreur: La référence de la vente est manquante.');
      this.snackBar.open('Erreur: La référence de la vente est manquante.', '×', {
        panelClass: 'error',
        duration: 3000,
      });
    }

    // Save PDF
    doc.save(`Ticket_${vente.vente.reference}.pdf`);
  }

}
