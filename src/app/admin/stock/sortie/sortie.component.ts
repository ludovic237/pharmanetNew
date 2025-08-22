import {Component, OnInit} from '@angular/core';
import {Settings, SettingsService} from "@services/settings.service";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {EnrayonsService} from "@services/enrayons.service";
import {CommandesService} from "@services/commandes.service";
import {FournisseursService} from "@services/fournisseurs.service";
import {ProductService} from "@services/products.service";
import {VentesService} from "@services/ventes.service";
import {UsersService} from "@services/users.service";
import {PrescripteursService} from "@services/prescripteurs.service";
import {DomHandlerService} from "@services/dom-handler.service";
import {MatDialog} from "@angular/material/dialog";
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {SortiesService} from "@services/sorties.service";
import {MatMenuModule} from "@angular/material/menu";
import {MatListModule} from "@angular/material/list";
import {MatChipsModule} from "@angular/material/chips";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatDividerModule} from "@angular/material/divider";
import {MatExpansionModule} from "@angular/material/expansion";
import {CommonModule} from "@angular/common";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatTabsModule} from "@angular/material/tabs";
import {MatIconModule} from "@angular/material/icon";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {FlexLayoutModule} from "@ngbracket/ngx-layout";
import {MatStepperModule} from "@angular/material/stepper";
import {MatRadioModule} from "@angular/material/radio";
import {NgxPaginationModule} from "ngx-pagination";
import {MatPaginator, MatPaginatorModule, PageEvent} from "@angular/material/paginator";
import {ProduitdetailsService} from "@services/produitdetails.service";
import {
  AjouterVenteDialogComponent
} from "../../sales/ajouter-vente/ajouter-vente-dialog/ajouter-vente-dialog.component";
import {SortieDetailDialogComponent} from "./sortie-detail-dialog/sortie-detail-dialog.component";
import {AuthService} from "@services/auth.service";
import {SortieRayonDialogComponent} from "./sortie-rayon-dialog/sortie-rayon-dialog.component";
import {ActivatedRoute} from "@angular/router";
import {SortieDetailRayonComponent} from "./sortie-detail-rayon/sortie-detail-rayon.component";
import {
  SortieSimpleProductDetailRayonDialogComponent
} from "./sortie-simplet-product-detail-rayon-dialog/sortie-simple-product-detail-rayon-dialog.component";
import {LoaderService} from "@services/loader.service";

@Component({
  selector: 'app-sortie',
  providers: [UsersService,
    SettingsService,
    CommandesService,
    FournisseursService,
    EnrayonsService,
    ProductService,
    UsersService,
    VentesService,
    PrescripteursService],
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
    CommonModule,
    // Material
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
    // Material
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
    NgxPaginationModule
  ],
  templateUrl: './sortie.component.html',
  styleUrl: './sortie.component.scss'
})
export class SortieComponent implements OnInit {

  public settings: Settings;
  produitDetailOptions: any[] = [];
  produitDetailSearchControl = new FormControl('');
  nomProduit: string | null = null;
  typeSortie: string | null = null;
  enRayonId: string | null = null;
  produitDetailId: string | null = null;

  displayedColumns: string[] = ['nom', 'quantite', 'forme', 'produitDetailNom', 'dateOperation', 'operation', 'actions'];


  sorties: any[] = []
  private sub: any;

  public viewCol: number = 25;
  public page: number = 1; // Default to 0 if undefined
  public size = 100;  // Default to 10 if undefined
  public totalItems = 0;  // Default to 10 if undefined
  public count = 10;
  public id: any;

  constructor(
    public loaderService: LoaderService,
    public authService: AuthService,
    public snackBar: MatSnackBar, public appSettings: SettingsService,
    public enRayonService: EnrayonsService,
    public sortiesService: SortiesService,
    public commandesService: CommandesService,
    public fournisseursService: FournisseursService,
    public produitdetailsService: ProduitdetailsService,
    public productService: ProductService,
    public ventesService: VentesService,
    public usersService: UsersService,
    public prescripteursService: PrescripteursService,
    public domHandlerService: DomHandlerService,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog) {

  }

  ngOnInit(): void {

    this.fetchSortieProduitsEnRayon();

    this.produitDetailSearchControl.valueChanges.subscribe((searchTerm) => {
      if (searchTerm) {
        this.searchProducts(searchTerm);
      }
    })

    this.sub = this.activatedRoute.params.subscribe(params => {
      if (params['id']) {
        this.id = params['id'];

        this.enRayonService.getProduitsEnRayon(this.id).subscribe({
          next: (data: any) => {
            const dialogRef = this.dialog.open(SortieSimpleProductDetailRayonDialogComponent, {
              data: {
                type: "detail produit",
                id: this.id,
                name: "",
                enRayonList: data,
                sourceList: [],
              },
              // maxWidth: "400px",
              width: "80%",
              panelClass: ['theme-dialog'],
              autoFocus: false,
              // direction: (this.settings.rtl) ? 'rtl' : 'ltr'
            });
            dialogRef.afterClosed().subscribe((modifiedProducts: any[]) => {
              this.fetchSortieProduitsEnRayon();

            });

          },
          error: (err: any) => {

            console.error('Failed to fetch products in stock:', err);
            if (err.status === 401 || err.status === 403) {
              this.authService.logout();
              localStorage.removeItem('token');
              localStorage.setItem("lastLink", window.location.href);
              ;
              this.snackBar.open('Déconnexion réussie.', '×', {
                panelClass: 'success',
                verticalPosition: 'top',
                duration: 3000,
              });
              // Redirect to login page or clear session
              window.location.href = '/sign-in';
            } else
              alert('Une erreur est survenue lors de la récupération des produits en rayon.');
          },
        });
      }
    });
  }

  public searchProducts(searchTerm: string): void {

    this.produitdetailsService.searchProduitDetailsByName(searchTerm, 0, 40).subscribe({
      // this.productService.searchProducts(this.searchTerm, this.page, this.count).subscribe({
      next: (data: any) => {
        this.produitDetailOptions = data.content;

      },
      error: (err: any) => {

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
        console.error('Error searching products:', err);
      }
    });

  }

  fetchSortieProduitsEnRayon(): void {

    this.sortiesService.getSortieStockPageable(
      this.page - 1,
      this.count,
      'id',
      'asc',
      this.nomProduit,
      this.typeSortie,
      this.enRayonId,
      this.produitDetailId
    ).subscribe({
      next: (data: any) => {
        this.count = data.pageable.pageSize;
        this.totalItems = data.totalElements;
        this.sorties = data.content;
        this.snackBar.open('Products fetched successfully!', '×', {
          panelClass: 'success',
          verticalPosition: 'top',
          duration: 3000
        });

      },
      error: (err: any) => {

        console.error('Error fetching products:', err);
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
          this.snackBar.open('Failed to fetch products. Please try again later.', '×', {
            panelClass: 'error',
            verticalPosition: 'top',
            duration: 3000
          });
      }
    });
  }

  resetFilters(): void {
    this.nomProduit = null;
    this.fetchSortieProduitsEnRayon();
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    // this.sorties = filterValue.trim().toLowerCase();

  }

  onEdit(element: any) {

// Implémentez la logique d'édition ici
  }

  onDelete(element: any) {
    this.sorties = this.sorties.filter(item => item.id !== element.id);
  }

  onView(element: any) {

  }

  onProduitDetailSelected(event: any) {

  }

  openProduitDetailInfoDialog(med: any): void {

    this.enRayonService.getProduitsEnRayon(med.id).subscribe({
      next: (data: any) => {
        const dialogRef = this.dialog.open(SortieDetailDialogComponent, {
          data: data[0],
          // maxWidth: "400px",
          width: "80%",
          panelClass: ['theme-dialog'],
          autoFocus: false,
          // direction: (this.settings.rtl) ? 'rtl' : 'ltr'
        });
        dialogRef.afterClosed().subscribe((modifiedProducts: any[]) => {
          this.fetchSortieProduitsEnRayon();
        });

      },
      error: (err: any) => {

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
      },
    });
  }

  public onPageChanged(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.count = event.pageSize;
    this.domHandlerService.winScroll(0, 0);
    this.fetchSortieProduitsEnRayon();
  }

  showSortieProduit() {
    const dialogRef = this.dialog.open(SortieRayonDialogComponent, {
      data: null,
      // maxWidth: "400px",
      width: "80%",
      panelClass: ['theme-dialog'],
      autoFocus: false,
      // direction: (this.settings.rtl) ? 'rtl' : 'ltr'
    });
    dialogRef.afterClosed().subscribe((modifiedProducts: any[]) => {
      this.fetchSortieProduitsEnRayon();
    });
  }

}
