import {Component, Inject, OnInit} from '@angular/core';
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
import {MatPaginatorModule, PageEvent} from "@angular/material/paginator";
import {AuthService} from "@services/auth.service";
import {LoaderService} from "@services/loader.service";
import autoTable from "jspdf-autotable";

@Component({
  selector: 'app-vente-dialog',
  imports: [
    MatPaginatorModule,
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
export class VenteDialogComponent implements OnInit {

  public page: number = 1; // Default to 0 if undefined
  public size = 0;  // Default to 10 if undefined
  public totalItems = 0;  // Default to 10 if undefined
  public count = 5;

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
    // this.ventes = data; // Load data passed to the dialog
  }

  ngOnInit() {
    this.getVente();
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  getVente() {

    this.venteService.listerVentesEncaissees(
      this.page - 1,
      this.count
    ).subscribe({
      next: (ventes: any) => {
        this.count = ventes.pageable.pageSize;
        this.totalItems = ventes.totalElements;
        this.ventes = ventes.content;

      },
      error: (err: any) => {
        console.error('Failed to fetch BonCaisse list:', err);

        if (err.status === 401 || err.status === 403) {

          this.authService.logout().subscribe({
            next: (data) => {
              localStorage.removeItem('token');
              localStorage.setItem("lastLink", window.location.href);
              window.location.href = '/sign-in';
              this.snackBar.open('Déconnexion réussie.', '×', {
                panelClass: 'success',
                verticalPosition: 'top',
                duration: 3000,
              });

            },
            error: (err) => {
              console.error('Error  subscription:', err);

              if (err.status === 401 || err.status === 403) {
                this.authService.logout();
                localStorage.removeItem('token');
                localStorage.setItem("lastLink", window.location.href);
                ;
                this.snackBar.open('Déconnexion, une erreur.', '×', {
                  panelClass: 'success',
                  verticalPosition: 'top',
                  duration: 3000,
                });
                window.location.href = '/sign-in';
              }
            }
          })
        } else
          this.snackBar.open('Erreur lors de la récupération des bons de caisse.', '×', {
            panelClass: 'error',
            verticalPosition: 'top',
            duration: 3000,
          });
      }
    });
  }

  public onPageChanged(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.count = event.pageSize
    this.getVente();
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
        if (err.status === 401 || err.status === 403) {

          this.authService.logout().subscribe({
            next: (data) => {
              localStorage.removeItem('token');
              localStorage.setItem("lastLink", window.location.href);
              window.location.href = '/sign-in';
              this.snackBar.open('Déconnexion réussie.', '×', {
                panelClass: 'success',
                verticalPosition: 'top',
                duration: 3000,
              });

            },
            error: (err) => {

              console.error('Error  subscription:', err);
              if (err.status === 401 || err.status === 403) {
                this.authService.logout();
                localStorage.removeItem('token');
                localStorage.setItem("lastLink", window.location.href);
                ;
                this.snackBar.open('Déconnexion, une erreur.', '×', {
                  panelClass: 'success',
                  verticalPosition: 'top',
                  duration: 3000,
                });
                window.location.href = '/sign-in';
              }
            }
          })
        } else
          this.snackBar.open('Erreur lors de la récupération des informations de la vente.', '×', {
            panelClass: 'error',
            duration: 3000,
          });
      },
    });
  }

  async generateTicket(data: any): Promise<void> {

    // const doc = new jsPDF();
    // let doc: jsPDF = new jsPDF('p', 'mm', 'a1')
    // const doc = new jsPDF({orientation: 'landscape', unit: 'cm', format: [30, 20]});
    // const doc = new jsPDF({orientation: 'landscape', unit: 'cm'});
    const doc = new jsPDF({
      orientation: 'portrait', unit: 'mm',
      // format: [data.produits.length+100,100]
      format: [10 * 10, ((data.produits.length + 14) * 10)]
      // format: [100, (data.produits.length * 30 + 150)]
    });
    const pageWidth = doc.internal.pageSize.width

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Pharmacie ALSAS', 2, 10);
    doc.text('Dr GAMWO Sandrine', 2, 15);
    doc.text('BP 38 FOUMBOT', 2, 20);
    doc.text('Tel : (+237) 233 267 487', 2, 25);
    doc.text(`Ticket N°: ${data.vente.reference}`, 2, 30);
    doc.text(`Vendu le: ${data.vente.dateVente}`, 2, 35);
    doc.text(`Encaisser le: ${data.vente.dateEncaissement}`, 2, 40);
    doc.text(`Vendeur: ${data.vente.employe.user ? data.vente.employe.user.nom : "N/A"} ${data.vente.employe.user ? data.vente.employe.user.prenom : ""}`, 2, 45);
    doc.text(`Acheteur: ${data.vente.user ? data.vente.user.nom : "N/A"} ${data.vente.user ? data.vente.user.prenom : ""}`, 2, 50);

    const columns = [
      {header: 'Libellé', dataKey: 'nom'},
      {header: 'Prix U', dataKey: 'prixUnitaire'},
      {header: 'Qte', dataKey: 'quantite'},
      {header: 'Total', dataKey: 'prixTotal'},
      {header: 'Rd(%)', dataKey: 'reduction'},
    ];

    autoTable(doc, {
      columns,
      body: data.produits,
      headStyles: {fillColor: [22, 160, 133]},
      margin: {top: 0, left: 0, right: 0},
      startY: 60,
      styles: {
        fontSize: 7
      }
    })

    const totalPrixProduits = data.produits.reduce((sum: number, produit: any) => sum + produit.prixTotal, 0);

    const prixRemise = totalPrixProduits - data.vente.prixTotal;
    const pourcentageRemise = (prixRemise / totalPrixProduits) * 100;

    // Summary
    let y = (doc as any).lastAutoTable.finalY
    y += 5;
    doc.text(`Montant: ${totalPrixProduits} FCFA`, 2, y);
    y += 5;
    doc.text(`Total: ${data.vente.prixTotal} FCFA`, 2, y);
    y += 5;
    doc.text(`Remise: ${pourcentageRemise} %`, 2, y);
    y += 5;
    doc.text(`Net à payer: ${data.vente.prixTotal} FCFA`, 2, y);

    // Payment Details
    y += 7.5;
    doc.text(`Montant Espèce: ${data.montantEspece} FCFA`, 2, y);
    y += 5;
    doc.text(`Montant Electronique: ${data.montantElectronique} FCFA`, 2, y);
    y += 5;
    doc.text(`Montant Ticket: ${data.montantTicket} FCFA`, 2, y);

    // Footer
    y += 7.5;
    doc.text(`Montant total encaissé: ${data.vente.prixPercu} FCFA`, 2, y);
    y += 5;
    doc.text(`Montant rendu: ${(data.vente.prixPercu - data.vente.prixTotal)} FCFA`, 2, y);
    y += 5;
    doc.text('Ce ticket vaut facture', 2, y);
    y += 5;
    doc.text('Merci et bonne santé', 2, y);
    y += 5;
    doc.text('NoCT / POS85127004888', 2, y);


    // QR Code
    if (data.vente.reference) {
      const qrCodeDataUrl = await QRCode.toDataURL(data.vente.id + "");
      doc.addImage(qrCodeDataUrl, 'PNG', pageWidth - 40, y - 30, 30, 30);
    } else {
      console.error('Erreur: La référence de la vente est manquante.');
      this.snackBar.open('Erreur: La référence de la vente est manquante.', '×', {
        panelClass: 'error',
        duration: 3000,
      });
    }
    const height = y + 5
    // const height = doc.getLineHeight()
    // const width = doc.getLineWidth()
    // console.log("height")
    // console.log(height)
    // console.log("width")
    // console.log(width)
    // console.log(doc.un)

    // let newdoc = new jsPDF('p', 'mm', [1000, height])
    // const temp = await html2canvas(document.body, {scale: 2})
    // const img = temp.toDataURL('image/png')
    // newdoc = doc
    // Save PDF

    // newdoc.save(`Ticket_${data.vente.reference}.pdf`);
    doc.save(`Ticket_${data.vente.reference}.pdf`);
  }

}
