import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {MatTableModule} from "@angular/material/table";
import {RouterModule} from "@angular/router";
import {FlexLayoutModule} from "@ngbracket/ngx-layout";
import {MatCardModule} from "@angular/material/card";
import {MatChipsModule} from "@angular/material/chips";
import {MatButtonModule} from "@angular/material/button";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatIconModule} from "@angular/material/icon";
import {CommonModule, DecimalPipe} from "@angular/common";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {NgxPaginationModule} from "ngx-pagination";
import {PipesModule} from "../../../../theme/pipes/pipes.module";
import {MatTabsModule} from "@angular/material/tabs";
import {MatToolbarModule} from "@angular/material/toolbar";
import {ProductService} from "@services/products.service";
import {ProduitRayonInfoDialogComponent} from "../produit-rayon-info-dialog/produit-rayon-info-dialog.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {RayonInfoDialogComponent} from "../rayon-info-dialog/rayon-info-dialog.component";
import {AuthService} from "@services/auth.service";

@Component({
  selector: 'app-detail-produit-dialog',
  imports: [
    MatCardModule,
    MatToolbarModule,
    MatTableModule,
    MatTabsModule,
    RouterModule,
    FlexLayoutModule,
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    FormsModule,
    NgxPaginationModule,
    PipesModule
  ],
  templateUrl: './detail-produit-dialog.component.html',
  styleUrl: './detail-produit-dialog.component.scss'
})
export class DetailProduitDialogComponent implements OnInit {

  selectedTabIndex: number = 0;

  public form: FormGroup;

  constructor(
    public authService: AuthService,
    public dialogRef: MatDialogRef<DetailProduitDialogComponent>,
    public productService: ProductService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public fb: FormBuilder) {

  }

  // Vente
  ventesMoisDS: any[] = [];
  ventesTotalDS: any[] = [];
  ventesListDS: any[] = [];
  ventesMoisCols = ['nom', 'quantite', 'reduction', 'vente'];
  ventesTotalCols = ['nom', 'quantite', 'reduction', 'vente'];
  ventesListCols = ['date', 'vendeur', 'client', 'prixUnitaire', 'quantite', 'prixTotal', 'reduction', 'prixVente'];

  // Commande
  commandesMoisDS: any[] = [];
  commandesTotalDS: any[] = [];
  commandesListDS: any[] = [];
  commandesMoisCols = ['nom', 'quantite', 'cout'];
  commandesTotalCols = ['nom', 'quantite', 'cout'];
  commandesListCols = [
    'date', 'produitId', 'commandeId', 'fournisseur',
    'prixAchat', 'prixVente', 'quantiteCommandee', 'quantiteRecue',
    'totalCommandee', 'totalRecu', 'etat', 'action'
  ];

  // Stock résumé
  totalCommande = 0;
  stockTotal = 0;

  // Entrée en rayon
  stockEntryDS: any[] = [];
  stockEntryCols = [
    'nom', 'fournisseurId', 'dateLivraison', 'datePeremption',
    'prixAchat', 'prixVente', 'reduction', 'quantiteRecu', 'quantiteStock', 'action'
  ];

  // Sortie
  sortieDS: any[] = [];
  sortieCols = ['nom', 'quantite', 'detail', 'forme', 'dateOperation', 'operation'];

  ngOnInit(): void {
    // TODO: remplacer par vos services
    this.ventesMoisDS = this.data.ventesMois;
    this.ventesTotalDS = this.data.ventesTotal;
    this.ventesListDS = this.data.ventesList;

    this.commandesMoisDS = this.data.commandesMois;
    this.commandesTotalDS = this.data.commandesTotal;
    this.commandesListDS = this.data.commandesList;

    this.totalCommande = this.data.stockSummary.totalCommandeValue;
    this.stockTotal = this.data.stockSummary.stockTotalQuantity;

    this.stockEntryDS = this.data.stockEntries;
    this.sortieDS = this.data.stockSorties;
  }

  deleteProduct(productId: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(productId).subscribe(() => {
        console.log('Product deleted');
        // Refresh the product list
        this.productService.getProduitDetails(productId).subscribe({
          next: (data) => {
            this.data = data
            this.snackBar.open('Product deleted.', '×', {
              panelClass: 'success',
              verticalPosition: 'top',
              duration: 3000,
            });
          },
          error: (err) => {
            this.snackBar.open('Product deleted failed.', '×', {
              panelClass: 'error',
              verticalPosition: 'top',
              duration: 3000,
            });
          }
        });
      });
    }
  }

  printLabel(product: any): void {
    // Logic to generate and print the label
    console.log('Printing label for product:', product);
    // Example: Call a service to generate a PDF
    // this.productService.generateLabel(product.id).subscribe((labelData:any) => {
    //   // Handle label printing
    // });
    const dialogRef = this.dialog.open(ProduitRayonInfoDialogComponent, {
      width: '800px',
      data: {
        data: product,
        type: "info"
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Données du produit:', result);
      }
    });

  }

  markAsExpired(productId: number): void {
    this.productService.markStockAsExpired(productId).subscribe(() => {
      console.log('Stock marked as expired');
      // Refresh the stock list
    });
  }

  modifyProduct(product: any): void {
    const dialogRef = this.dialog.open(RayonInfoDialogComponent, {
      width: '500px',
      data: product
    });

    dialogRef.afterClosed().subscribe(result => {
      this.productService.getProduitDetails(product.id).subscribe({
        next: (data) => {
          this.data = data
          this.snackBar.open('Product deleted.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
        },
        error: (err) => {
          this.snackBar.open('Product deleted failed.', '×', {
            panelClass: 'error',
            verticalPosition: 'top',
            duration: 3000,
          });
        }
      });
      if (result) {
        // Update the product list or call the backend to save changes
        console.log('Product modified:', result);
      }
    });
  }
}
