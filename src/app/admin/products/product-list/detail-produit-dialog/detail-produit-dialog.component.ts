import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
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
import {combineLatest} from "rxjs";
import {VentesService} from "@services/ventes.service";
import {CommandesService} from "@services/commandes.service";
import {SortiesService} from "@services/sorties.service";
import {EnrayonsService} from "@services/enrayons.service";
import {AppService} from "@services/app.service";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {
  MAT_DATE_FORMATS,
  MAT_NATIVE_DATE_FORMATS,
  MatNativeDateModule,
  provideNativeDateAdapter
} from "@angular/material/core";

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
    PipesModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [
    provideNativeDateAdapter(),
    {provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS},
  ],
  templateUrl: './detail-produit-dialog.component.html',
  styleUrl: './detail-produit-dialog.component.scss'
})
export class DetailProduitDialogComponent implements OnInit {

  selectedTabIndex: number = 0;

  pageVentes: number = 1;
  countVentes = 5;
  totalItemsVentes = 0;
  startDateVentes: Date | null = new Date();
  endDateVentes: Date | null = new Date();

  pageCommandes: number = 1;
  countCommandes = 5;
  totalItemsCommandes = 0;
  startDateCommandes: Date | null = new Date();
  endDateCommandes: Date | null = new Date();

  pageEnRayons: number = 1;
  countEnRayons = 5;
  totalItemsEnRayons = 0;
  startDateEnRayons: Date | null = new Date();
  endDateEnRayons: Date | null = new Date();

  pageSorties: number = 1;
  countSorties = 5;
  totalItemsSorties = 0;
  startDateSorties: Date | null = new Date();
  endDateSorties: Date | null = new Date();

  produitId:String="0"


  public form: FormGroup;

  constructor(
    public authService: AuthService,
    public appService: AppService,
    public enrayonsService: EnrayonsService,
    public sortiesService: SortiesService,
    public ventesService: VentesService,
    public commandesService: CommandesService,
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

    this.produitId = this.data.produitId
    combineLatest([
      this.ventesService.fetchVentesPageableRangeProduct(
        this.pageSorties - 1,
        this.countSorties,
        null,
        this.produitId+"",
        this.appService.formatDate(this.startDateVentes+""),
        this.appService.formatDate(this.endDateVentes+""),
        null,
        null,
        null,
        null,
        null,
        null,
      ),
      this.commandesService.getCommandeInfoByProduct(
        this.pageSorties - 1,
        this.countSorties,
        this.produitId+"",
        this.appService.formatDate(this.startDateCommandes+""),
        this.appService.formatDate(this.endDateCommandes+""),
      ),
      this.enrayonsService.getProduitsEnRayonPageableProduitRange(
        this.pageEnRayons - 1,
        this.countEnRayons,
        null,
        this.produitId+"",
        this.appService.formatDate(this.startDateSorties+""),
        this.appService.formatDate(this.endDateSorties+""),
        null,
        null,
        null,
      ),
      this.sortiesService.getSortieStockPageableProductRange(
        this.pageSorties - 1,
        this.countSorties,
        null,
        null,
        null,
        this.produitId+"",
        this.appService.formatDate(this.startDateSorties+""),
        this.appService.formatDate(this.endDateSorties+""),
        null,
        null,
        null,
      ),

    ]).subscribe({
      next: ([dataVente, dataCommande, dataEnRayon, dataSortie]) => {

        this.ventesListDS = dataVente.content.content
        this.countVentes = dataVente.pageable.pageSize;
        this.totalItemsVentes = dataVente.totalElements;

        this.commandesListCols = dataCommande.content.content
        this.countCommandes = dataCommande.pageable.pageSize;
        this.totalItemsCommandes = dataCommande.totalElements;

        this.stockEntryDS = dataEnRayon.content.content
        this.countEnRayons = dataEnRayon.pageable.pageSize;
        this.totalItemsEnRayons = dataEnRayon.totalElements;

        this.sortieDS = dataSortie.content.content
        this.countSorties = dataSortie.pageable.pageSize;
        this.totalItemsSorties = dataSortie.totalElements;

      },
      error:(err)=>{
        console.log("error");
        console.log(err);
        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
          this.snackBar.open('Déconnexion réussie.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
            localStorage.removeItem('token');
          window.location.href = '/sign-in';
        }
      }
    })


    // TODO: remplacer par vos services
    this.ventesMoisDS = this.data.data.ventesMois;
    this.ventesTotalDS = this.data.data.ventesTotal;
    this.ventesListDS = this.data.data.ventesList;

    this.commandesMoisDS = this.data.data.commandesMois;
    this.commandesTotalDS = this.data.data.commandesTotal;
    this.commandesListDS = this.data.data.commandesList;

    this.totalCommande = this.data.data.stockSummary.totalCommandeValue;
    this.stockTotal = this.data.data.stockSummary.stockTotalQuantity;

    this.stockEntryDS = this.data.data.stockEntries;
    this.sortieDS = this.data.data.stockSorties;
  }

  deleteProduct(productId: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(productId).subscribe(() => {
        console.log('Product deleted');
        // Refresh the product list
        this.productService.getProduitDetails(productId).subscribe({
          next: (data) => {
            this.data.data = data
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
    window.location.href = '/admin/stock/sorties/'+productId;
  }

  modifyProduct(product: any): void {
    const dialogRef = this.dialog.open(RayonInfoDialogComponent, {
      width: '500px',
      data: product
    });

    dialogRef.afterClosed().subscribe(result => {
      this.productService.getProduitDetails(product.id).subscribe({
        next: (data) => {
          this.data.data = data
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

  fetchVentesPageableRangeProduct(): void {
    this.ventesService.fetchVentesPageableRangeProduct(
      this.pageSorties - 1,
      this.countSorties,
      null,
      this.produitId+"",
      this.appService.formatDate(this.startDateVentes+""),
      this.appService.formatDate(this.endDateVentes+""),
      null,
      null,
      null,
      null,
      null,
      null,
    ).subscribe({
      next: (dataVente: any) => {
        this.ventesListDS = dataVente.content.content
        this.countVentes = dataVente.pageable.pageSize;
        this.totalItemsVentes = dataVente.totalElements;
      },
      error: (err) => {
        console.error('Error fetching commandes:', err);
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
        }
      }
    });
  }

  getCommandeInfoByProduct(): void {
    this.commandesService.getCommandeInfoByProduct(
      this.pageSorties - 1,
      this.countSorties,
      this.produitId+"",
      this.appService.formatDate(this.startDateCommandes+""),
      this.appService.formatDate(this.endDateCommandes+""),
    ).subscribe({
      next: (dataCommande: any) => {
        this.commandesListCols = dataCommande.content.content
        this.countCommandes = dataCommande.pageable.pageSize;
        this.totalItemsCommandes = dataCommande.totalElements;
      },
      error: (err) => {
        console.error('Error fetching commandes:', err);
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
        }
      }
    });
  }

  getProduitsEnRayonPageableProduitRange(): void {
    this.enrayonsService.getProduitsEnRayonPageableProduitRange(
      this.pageEnRayons - 1,
      this.countEnRayons,
      null,
      this.produitId+"",
      this.appService.formatDate(this.startDateSorties+""),
      this.appService.formatDate(this.endDateSorties+""),
      null,
      null,
      null,
    ).subscribe({
      next: (dataEnRayon: any) => {
        this.stockEntryDS = dataEnRayon.content.content
        this.countEnRayons = dataEnRayon.pageable.pageSize;
        this.totalItemsEnRayons = dataEnRayon.totalElements;
      },
      error: (err) => {
        console.error('Error fetching commandes:', err);
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
        }
      }
    });
  }

  getSortieStockPageableProductRange(): void {
    this.sortiesService.getSortieStockPageableProductRange(
      this.pageSorties - 1,
      this.countSorties,
      null,
      null,
      null,
      this.produitId+"",
      this.appService.formatDate(this.startDateSorties+""),
      this.appService.formatDate(this.endDateSorties+""),
      null,
      null,
      null,
    ).subscribe({
      next: (dataSortie: any) => {
        this.sortieDS = dataSortie.content.content
        this.countSorties = dataSortie.pageable.pageSize;
        this.totalItemsSorties = dataSortie.totalElements;
      },
      error: (err) => {
        console.error('Error fetching commandes:', err);
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
        }
      }
    });
  }
}
