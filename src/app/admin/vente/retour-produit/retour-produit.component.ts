import {Component, inject, OnInit} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FlexLayoutModule} from '@ngbracket/ngx-layout';
import {DomHandlerService} from '@services/dom-handler.service';
import {NgxPaginationModule} from 'ngx-pagination';
import {SettingsService} from "@services/settings.service";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {EnrayonsService} from "@services/enrayons.service";
import {CommandesService} from "@services/commandes.service";
import {FournisseursService} from "@services/fournisseurs.service";
import {ProductService} from "@services/products.service";
import {VentesService} from "@services/ventes.service";
import {UsersService} from "@services/users.service";
import {PrescripteursService} from "@services/prescripteurs.service";
import {MatDialog} from "@angular/material/dialog";
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {MatMenuModule} from "@angular/material/menu";
import {MatListModule} from "@angular/material/list";
import {MatChipsModule} from "@angular/material/chips";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatExpansionModule} from "@angular/material/expansion";

import {MatToolbarModule} from "@angular/material/toolbar";
import {MatTabsModule} from "@angular/material/tabs";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {MatStepperModule} from "@angular/material/stepper";
import {MatRadioModule} from "@angular/material/radio";
import {jsPDF} from "jspdf";
import QRCode from "qrcode";
import {debounceTime, switchMap} from "rxjs";
import {RetourProduitService} from "@services/retour-produit.service";
import autoTable from 'jspdf-autotable';
import {MatPaginatorModule, PageEvent} from "@angular/material/paginator";
import {AuthService} from "@services/auth.service";
import {LoaderService} from "@services/loader.service";
import {TranslateModule} from "@ngx-translate/core";

@Component({
  selector: 'app-retour-produit',
  providers: [UsersService, VentesService, EnrayonsService, ProductService, PrescripteursService],
  imports: [
    MatPaginatorModule,
    MatMenuModule,
    MatListModule,
    MatChipsModule,
    MatSlideToggleModule,
    FormsModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatExpansionModule,
    FormsModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatTabsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatStepperModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatChipsModule,
    NgxPaginationModule,
    TranslateModule
],
  templateUrl: './retour-produit.component.html',
  styleUrl: './retour-produit.component.scss'
})
export class RetourProduitComponent implements OnInit {

  retourProduitList: any[] = []
  page: number = 1;
  count = 5;
  totalItems = 0;

  produitsAchetes: any[] = [];
  produitsRetournes: any[] = [];
  produitsRetournesListe: any[] = [];

  searchReferenceControl = new FormControl('');
  suggestions: any[] = [];
  venteId: number;
  vente: any;

  displayedColumns: string[] = ['nom', 'prixUnitaire', 'quantite', 'reduction', 'action'];
  displayedColumnsRetournes: string[] = ['nom', 'prixUnitaire', 'quantite', 'reduction', 'action'];
  displayedColumnsListe: string[] = ['nomEmploye', 'referenceVente', 'date', 'caisse', 'produits', 'quantite', 'prixTotal', 'action'];

  totalPrix = 0;
  totalReduction = 0;
  netTotal = 0;

  totalGrosAmount = 0;
  totalReturnAmount = 0;
  totalReductionAmount = 0;

  constructor(
     public loaderService: LoaderService,
    public authService: AuthService,
    private retourProduitService: RetourProduitService,
    private ventesService: VentesService,
    private snackBar: MatSnackBar) {
  }

  ngOnInit(): void {

    this.loadProduitsRetournesListe();

    this.searchReferenceControl.valueChanges.subscribe((searchTerm) => {
      if (searchTerm && searchTerm.length >= 3) {
        this.produitsRetournes = [...[]];
        this.totalPrix = 0;
        this.totalReduction = 0;
        this.netTotal = 0;
        this.ventesService.searchVenteByReference(searchTerm).subscribe({
          next: (data: any) => {
            this.produitsAchetes = data.produits.map((produit: any) => ({
              ...produit,
              quantiteRetour: 0 // Initialize quantiteRetour to 0
            }))
            this.vente = data.vente

            this.totalReductionAmount = parseFloat(data.vente.reduction)
            this.totalGrosAmount =  this.produitsAchetes.reduce((sum, item) => sum + (item.prixUnitaire*item.quantite), 0)
            console.log("this.totalReduction");
            console.log(this.totalReduction);
            console.log("this.totalGrosAmount");
            console.log(this.totalGrosAmount);
            this.snackBar.open('Retour validé avec succès.', '×', {panelClass: 'success', duration: 3000});
          },
          error: (err: any) => {
            console.error('Error validating retour:', err);
            if (err.status === 401 || err.status === 403){
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
            }
            else
            this.snackBar.open('Erreur lors de la validation du retour.', '×', {panelClass: 'error', duration: 3000});
          }
        });
      }
    })
  }


  loadProduitsRetournes(): void {
    // this.retourProduitService.getProduitsRetournes().subscribe({
    //   next: (data:any) => {
    //     this.produitsRetournes.data = data;
    //   },
    //   error: (err:any) => {
    //     console.error('Error loading produits retournés:', err);
    //   }
    // });
  }

  loadProduitsRetournesListe(): void {
    this.retourProduitService.listerRetourProduitsAvecDetails(this.page - 1, this.count).subscribe({
      next: (data: any) => {
        this.count = data.pageable.pageSize;
        this.totalItems = data.totalElements;
        this.retourProduitList = data.content;
      },
      error: (err: any) => {
        console.error('Error loading produits retournés liste:', err);
      }
    });
  }

  public onPageChanged(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.count = event.pageSize;
    this.loadProduitsRetournesListe()

  }

  calculateTotals(data: any[]): void {
    // this.totalPrix = data.reduce((sum, item) => sum + item.prixTotal, 0);
    // // this.totalReduction = data.reduce((sum, item) => sum + item.reduction, 0);
    //
    console.log("produitsRetournes");
    console.log(this.produitsRetournes);
    this.totalReturnAmount =  this.produitsRetournes.reduce((sum, item) => sum + (item.quantite*item.prixUnitaire), 0);
    console.log(" this.totalReturnAmount : "+ this.totalReturnAmount)
    console.log(" this.totalReductionAmount : "+ this.totalReductionAmount)
    this.totalReduction = Math.floor(this.totalReductionAmount*this.totalReturnAmount/this.totalGrosAmount)
    this.totalPrix = this.totalReturnAmount
    this.netTotal = this.totalReturnAmount - this.totalReduction;
  }

  validerRetour(): void {
    this.ventesService.validerRetour(this.vente.id, this.produitsRetournes).subscribe({
      next: () => {
        this.snackBar.open('Retour validé avec succès.', '×', {panelClass: 'success', duration: 3000});
        this.loadProduitsRetournesListe();


        // Clear the sources
        this.produitsAchetes = [];
        this.produitsRetournes = [];

        this.totalPrix = 0;
        this.totalReduction = 0;
        this.netTotal = 0;

        // Reset the search control
        this.searchReferenceControl.setValue('');
      },
      error: (err: any) => {
        console.error('Error validating retour:', err);
        this.snackBar.open('Erreur lors de la validation du retour.', '×', {panelClass: 'error', duration: 3000});
      }
    });
  }

  moveToRetournes(produit: any, quantiteRetour: number): void {
    if (quantiteRetour > produit.quantite) {
      this.snackBar.open('La quantité retournée ne peut pas dépasser la quantité achetée.', '×', {
        panelClass: 'error',
        duration: 3000
      });
      return;
    }

    // Update the quantity in produitsAchetes
    produit.quantite -= quantiteRetour;

    // Check if the product already exists in produitsRetournes
    const existingProduct = this.produitsRetournes.find(p => p.rayonId === produit.rayonId);
    if (existingProduct) {
      // Add the returned quantity to the existing product
      existingProduct.quantite += quantiteRetour;
      this.produitsRetournes = [...this.produitsRetournes]; // Refresh the table
    } else {
      // Add the product to produitsRetournes with the returned quantity
      const produitRetour = {...produit, quantite: quantiteRetour};
      this.produitsRetournes = [...this.produitsRetournes, produitRetour];
    }

    // Reset quantiteRetour to 0
    produit.quantiteRetour = 0;

    this.calculateTotals(this.produitsRetournes);
  }

  annulerRetour(produit: any): void {
    // Remove the product from produitsRetournes
    const index = this.produitsRetournes.indexOf(produit);
    if (index > -1) {
      this.produitsRetournes.splice(index, 1);
      this.produitsRetournes = [...this.produitsRetournes]; // Refresh the table
    }

    // Ensure produitsAchetes.data is defined
    // if (!this.produitsAchetes.data) {
    //   console.error('produitsAchetes.data is undefined');
    //   return;
    // }
    console.log('produitsAchetes.data:', this.produitsAchetes);
    // Restore the product's quantity in produitsAchetes
    const originalProduct = this.produitsAchetes.find(p => p.id === produit.id);
    if (originalProduct) {
      originalProduct.quantite += produit.quantite; // Add the returned quantity back
      this.produitsAchetes = [...this.produitsAchetes]; // Refresh the table
    }
    console.log('produitsAchetes:', this.produitsAchetes);
    // Recalculate totals
    this.calculateTotals(this.produitsRetournes);
  }

  async generateTicket(vente: any): Promise<void> {
    // const baseWidth = 10; // Width in cm
    // const baseHeight = 10; // Base height for header and footer
    // const contentHeight = vente.produitsRetournes.length * 0.5; // Each product row takes 0.5 cm
    // const totalHeight = baseHeight + contentHeight;
    //
    // const doc = new jsPDF({
    //   orientation: 'portrait',
    //   unit: 'cm'
    // });

    const doc = new jsPDF({
      orientation: 'portrait', unit: 'mm',
      // format: [data.produits.length+100,100]
      format: [10 * 10, ((vente.produitsRetournes.length + 14) * 10)]
      // format: [100, (data.produits.length * 30 + 150)]
    });

    const pageWidth = doc.internal.pageSize.width
    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9); // Fixed font size for header
    doc.text('Pharmacie ALSAS', 2, 10);
    doc.text('Dr GAMWO Sandrine', 2, 15);
    doc.text('BP 38 FOUMBOT', 2, 20);
    doc.text('Tel : (+237) 233 267 487', 2, 25);
    doc.text(`Ticket N°: ${vente.venteReference}`, 2,  30);
    doc.text(`Vendu le: ${vente.dateRetour}`, 2,  35);
    doc.text(`Caissier: ${vente.caissier}`, 2,  40);
    doc.text(`Employee: ${vente.nomEmploye}`, 2,  45);


    // Table Content
    const rows = vente.produitsRetournes.map((produit: any) => [
      produit.nomProduit,
      produit.prixUnit ?? 0,
      produit.quantiteRetournee ?? 0,
      (produit.prixUnit ?? 0) * (produit.quantiteRetournee ?? 0),
      produit.reduction ?? 0,
    ]);


    autoTable(doc, {
      head: [['Libellé', 'Prix U.', 'Quantité', 'Total', 'Réduction']],
      body: rows,
      /*startY: margin + 4.5,
      // margin: { top: 1, left: margin, right: margin },
      margin: {top: 0, left: margin, right: margin},
      styles: {
        fontSize: 8, // Reduce font size for table
        // cellPadding: 1, // Adjust cell padding
      },*/
      headStyles: {fillColor: [22, 160, 133]},
      margin: {top: 0, left: 0, right: 0},
      startY: 50,
      styles: {
        fontSize: 7
      }
    });

    let y = (doc as any).lastAutoTable.finalY ; // Get the position after the tablet the position after the table
    // doc.setFontSize(8); // Smaller font size for footer
    y += 5;
    doc.text('Ce ticket vaut facture', 2, y);
    y += 5;
    doc.text('Merci et bonne santé', 2, y);
    y += 5;
    doc.text('NoCT / POS85127004888', 2, y);

    // QR Code
    if (vente.venteReference) {
      const qrCodeDataUrl = await QRCode.toDataURL(vente.venteReference);
      doc.addImage(qrCodeDataUrl, 'PNG', pageWidth - 40, y - 15, 25, 25);
    } else {
      console.error('Erreur: La référence de la vente est manquante.');
      this.snackBar.open('Erreur: La référence de la vente est manquante.', '×', {
        panelClass: 'error',
        duration: 3000,
      });
    }

    // Save PDF
    doc.save(`Ticket_${vente.venteReference}.pdf`);
  }
}
