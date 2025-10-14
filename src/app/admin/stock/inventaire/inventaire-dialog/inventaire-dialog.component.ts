import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {InventaireService} from "@services/inventaire.service";
import {MatMenuModule} from "@angular/material/menu";
import {MatListModule} from "@angular/material/list";
import {MatChipsModule} from "@angular/material/chips";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatDividerModule} from "@angular/material/divider";
import {MatExpansionModule} from "@angular/material/expansion";

import {MatToolbarModule} from "@angular/material/toolbar";
import {MatTabsModule} from "@angular/material/tabs";
import {MatIconModule} from "@angular/material/icon";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatTableModule} from "@angular/material/table";
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule, provideNativeDateAdapter} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {FlexLayoutModule} from "@ngbracket/ngx-layout";
import {MatStepperModule} from "@angular/material/stepper";
import {MatRadioModule} from "@angular/material/radio";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {NgxPaginationModule} from "ngx-pagination";
import {MatPaginator} from "@angular/material/paginator";
import {ProductService} from "@services/products.service";
import {
  AjouterVenteDialogComponent
} from "../../../vente/ajouter-vente/ajouter-vente-dialog/ajouter-vente-dialog.component";
import {
  InventaireEnrayonDetailDialogComponent
} from "../inventaire-enrayon-detail-dialog/inventaire-enrayon-detail-dialog.component";
import {CategorieService} from "@services/categories.service";
import {EtageresService} from "@services/etageres.service";
import {MagasinService} from "@services/magasins.service";
import {RayonService} from "@services/rayons.service";
import {FabriquantService} from "@services/fabriquants.service";
import {FormeService} from "@services/formes.service";
import {
  DetailProduitDialogComponent
} from "../../../products/product-list/detail-produit-dialog/detail-produit-dialog.component";
import {InventaireSaisieDialogComponent} from "../inventaire-saisie-dialog/inventaire-saisie-dialog.component";
import {FournisseursService} from "@services/fournisseurs.service";
import {AuthService} from "@services/auth.service";
import {LoaderService} from "@services/loader.service";

@Component({
  selector: 'app-inventaire-dialog',
  providers: [provideNativeDateAdapter()],
  // changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
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
    NgxPaginationModule
],
  templateUrl: './inventaire-dialog.component.html',
  styleUrl: './inventaire-dialog.component.scss'
})
export class InventaireDialogComponent implements OnInit {
  public form: FormGroup;
  isEdit: boolean = false;
  searchQuery: string = '';
  products: any[] = [];
  filteredProducts: any[] = [];
  public startDate: string | null = null;
  public endDate: string | null = null;

  public page: number = 1; // Default to 0 if undefined
  public size = 100;  // Default to 10 if undefined
  public totalItems = 0;  // Default to 10 if undefined
  public count = 10;

  public categories: any[];
  public rayons: any[];
  public magasins: any[];
  public formes: any[];
  public fabriquants: any[];
  public fournisseurs: any[];
  public etagere: any[];


  medControl = new FormControl('');
  medOptions: { name: string }[] = [];

  constructor(
    public loaderService: LoaderService,
    public authService: AuthService,
    public snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<InventaireDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public categorieService: CategorieService,
    public etageresService: EtageresService,
    public fournisseurService: FournisseursService,
    public magasinService: MagasinService,
    public rayonService: RayonService,
    public fabriquantService: FabriquantService,
    public formeService: FormeService,
    private productService: ProductService,
    private inventaireService: InventaireService,
    public dialog: MatDialog) {
    this.form = this.fb.group({
      categorieId: null,
      rayonId: [null],
      fournisseurId: [null],
      magasinId: null,
      formeId: [null],
      fabriquantId: [null],
    });
  }


  ngOnInit(): void {
    // this.form = this.fb.group({
    //   productSan: ['']
    // });
    // this.myGroup = new FormGroup({
    //   firstName: new FormControl()
    // });
    this.isEdit = this.data?.type === 'edit';
    if (this.data.type === 'edit') {
      this.data.dateDebut = this.data.dateDebut || new Date(); // Default to today's date
      this.getInventaireInfo();
    }
    this.medControl.valueChanges.subscribe((searchTerm) => {
      if (searchTerm) {
        this.searchProducts(searchTerm);
      }
    });
    this.fetchProducts();

    this.getCategories();
    this.getRayon();
    this.getEtagere();
    this.getMagasin();
    this.getForme();
    this.getFabriquants();
    this.getFournisseur();
  }

  fetchProducts(): void {
    // this.inventaireService.getProducts().subscribe((products: any[]) => {
    //   this.products = products;
    //   this.filteredProducts = products;
    // });
  }

  public searchProducts(searchTerm: string): void {

    this.productService.searchProductsParam({
      query: searchTerm,
      rayonId: this.form.value.rayonId || null,
      fabriquantId: this.form.value.fabriquantId || null,
      etagereId: this.form.value.etagereId || null,
      formeId: this.form.value.formeId || null,
      magasinId: this.form.value.magasinId || null,
      categorieId: this.form.value.categorieId || null,
      page: 0,
      size: 40
    }).subscribe({
      // this.productService.searchProducts(this.searchTerm, this.page, this.count).subscribe({
      next: (data: any) => {
        this.medOptions = data.content.map((product: any) => ({
          id: product.id,
          name: product.nom
        }));


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

  filterProducts(): void {
    this.filteredProducts = this.products.filter(product =>
      product.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      product.id.toString().includes(this.searchQuery)
    );
  }

  selectAll(checked: boolean): void {
    this.filteredProducts.forEach(product => (product.selected = checked));
  }

  addSelectedProducts(): void {
    const formatDate = (date: string | null): string | null => {
      if (!date) return null;
      const parsedDate = new Date(date);
      return `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}T${String(parsedDate.getHours()).padStart(2, '0')}:${String(parsedDate.getMinutes()).padStart(2, '0')}:${String(parsedDate.getSeconds()).padStart(2, '0')}`;
    };

    const formattedStartDate = formatDate(this.startDate);
    const formattedEndDate = formatDate(this.endDate);
    this.data.dateDebut = formattedStartDate;
    this.data.dateFin = formattedEndDate;

    const selectedProducts = this.filteredProducts.filter(product => product.selected);
    this.data = {
      dateDeDebut: new Date(),
      produitList: this.filteredProducts.map((product: any) => ({
        produitId: product.id,
        rayonId: product.rayonId,
        quantiteReel: product.quantityReal,
        quantiteSysteme: product.quantitySystem
      }))
    }

    this.inventaireService.addInventaire(this.data).subscribe({
      next: (response: any) => {
        this.snackBar.open('Inventory created successfully!', '×', {
          panelClass: 'success',
          verticalPosition: 'top',
          duration: 3000
        });
        this.dialogRef.close(response);

      },
      error: (err: any) => {

        console.error('Error creating inventory:', err);
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
          this.snackBar.open('Failed to create inventory.', '×', {
            panelClass: 'error',
            verticalPosition: 'top',
            duration: 3000
          });
      }
    });
    // this.dialogRef.close(selectedProducts);
  }

  beginInventory(): void {

    this.inventaireService.createInventaire(this.form.value).subscribe({
      next: (response: any) => {
        this.snackBar.open('Inventory created successfully!', '×', {
          panelClass: 'success',
          verticalPosition: 'top',
          duration: 3000
        });
        this.dialogRef.close(response);

      },
      error: (err: any) => {

        console.error('Error creating inventory:', err);
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
          this.snackBar.open('Failed to create inventory.', '×', {
            panelClass: 'error',
            verticalPosition: 'top',
            duration: 3000
          });
      }
    });
    // this.dialogRef.close(selectedProducts);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  // onSave(): void {
  //   this.dialogRef.close(this.data);
  // }

  openMedicamentDialog(med: any): void {
    const dialogRef = this.dialog.open(InventaireEnrayonDetailDialogComponent, {
      data: {
        med: med,
        filteredProducts: this.filteredProducts // Pass filteredProducts
      },
      width: "80%",
      panelClass: ['theme-dialog'],
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe((selectedProducts: any[]) => {
      if (selectedProducts && selectedProducts.length > 0) {
        const uniqueProducts = selectedProducts.filter(product =>
          !this.filteredProducts.some(existingProduct => existingProduct.rayonId === product.rayonId)
        );

        if (uniqueProducts.length > 0) {
          this.filteredProducts = [...this.filteredProducts, ...uniqueProducts];
        } else {
          this.snackBar.open('Products with the same rayonId already exist.', '×', {
            panelClass: 'error',
            verticalPosition: 'top',
            duration: 3000
          });
        }
      }
    });
  }

  updateComparison(product: any): void {

    product.comparison = product.quantityReal - product.quantitySystem;

    // Update the array reference to ensure change detection
    this.filteredProducts = this.filteredProducts.map(p =>
      p.id === product.id ? {...p, comparison: product.comparison} : p
    );

  }

  onSave(): void {
    if (this.isEdit) {
      const dataUpdate = {
        id: this.data.id,
        produitList: this.filteredProducts.map((product: any) => ({
          produitId: product.produitId,
          rayonId: product.rayonId,
          quantiteReel: product.quantityReal,
          quantiteSysteme: product.quantitySystem
        }))
      }
      this.inventaireService.updateInventaire(dataUpdate).subscribe({
        next: (response) => {
          this.snackBar.open('Inventory updated successfully!', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000
          });
          this.dialogRef.close(response);
        },
        error: (err) => {
          console.error('Error updating inventory:', err);
          if (err.status === 401 || err.status === 403) {
            this.authService.logout();
            this.snackBar.open('Déconnexion réussie.', '×', {
              panelClass: 'success',
              verticalPosition: 'top',
              duration: 3000,
            });
            // Redirect to login page or clear session
            window.location.href = '/sign-in';
          } else
            this.snackBar.open('Failed to update inventory.', '×', {
              panelClass: 'error',
              verticalPosition: 'top',
              duration: 3000
            });
        }
      });
    }
  }

  onCloturer(): void {
    this.inventaireService.cloturerInventaire(this.data.id).subscribe({
      next: (response) => {
        this.snackBar.open('Inventory closed successfully!', '×', {
          panelClass: 'success',
          verticalPosition: 'top',
          duration: 3000
        });
        this.dialogRef.close(response);
      },
      error: (err) => {
        console.error('Error closing inventory:', err);
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
          this.snackBar.open('Failed to close inventory.', '×', {
            panelClass: 'error',
            verticalPosition: 'top',
            duration: 3000
          });
      }
    });
  }

  onScan(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    if (input) {
      const uniqueProducts = this.filteredProducts.filter(existingProduct => existingProduct.rayonId === input);
      if (uniqueProducts.length > 0) {
        this.snackBar.open('Products with the same rayonId already exist.', '×', {
          panelClass: 'error',
          verticalPosition: 'top',
          duration: 3000
        });
      } else {
        this.productService.getEnRayonDetailById(input).subscribe({
          next: (data: any) => {

            this.filteredProducts = [...this.filteredProducts, {
              ...data,
              quantityReal: 0,
              comparison: 0,
              quantitySystem: data.stock
            }];
          },
          error: (err: any) => {
            console.error('Failed to fetch products in stock:', err);
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
              alert('Une erreur est survenue lors de la récupération des produits en rayon.');
          },
        });
      }

    }
  }

  deleteRow(product: any): void {
    this.filteredProducts = this.filteredProducts.filter(p => p.rayonId !== product.rayonId);
  }

  getInventaireInfo() {

    this.inventaireService.listerProduitsParInventaireAsMap(this.data.id, this.page - 1,
      this.count,).subscribe({
      next: (data: any) => {

        this.filteredProducts = [...this.filteredProducts,
          ...data.content.map((product: any) => ({
            ...product,
            produitId: product.id,
            rayonId: product.rayonId,
            quantityReal: product.quantiteReelle,
            quantitySystem: product.quantiteSysteme
          }))];
        this.form = this.fb.group({
          productSan: ['']
        });

      },
      error: (err: any) => {

        console.error('Failed to fetch products in stock:', err);
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
          alert('Une erreur est survenue lors de la récupération des produits en rayon.');
      },
    });
  }

  public getCategories() {

    this.categorieService.getCategories().subscribe({
      next: (data: any) => {
        this.categories = data;

      },
      error: (err) => {

        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
          this.snackBar.open('Déconnexion réussie.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
          // Redirect to login page or clear session
          window.location.href = '/sign-in';
        }
        console.error('Error fetching products:', err);
      }
    });
  }

  public getRayon() {

    this.rayonService.getRayons().subscribe({
      next: (data: any[]) => {
        this.rayons = data;

      },
      error: (err) => {

        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
          this.snackBar.open('Déconnexion réussie.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
          // Redirect to login page or clear session
          window.location.href = '/sign-in';
        }
        console.error('Error fetching products:', err);
      }
    });
  }

  public getFournisseur() {

    this.fournisseurService.getFournisseurs().subscribe({
      next: (data: any[]) => {
        this.fournisseurs = data;

      },
      error: (err) => {

        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
          this.snackBar.open('Déconnexion réussie.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
          // Redirect to login page or clear session
          window.location.href = '/sign-in';
        }
        console.error('Error fetching products:', err);
      }
    });
  }

  public getMagasin() {

    this.magasinService.getMagasins().subscribe({
      next: (data: any[]) => {
        this.magasins = data;

      },
      error: (err) => {

        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
          this.snackBar.open('Déconnexion réussie.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
          // Redirect to login page or clear session
          window.location.href = '/sign-in';
        }
        console.error('Error fetching products:', err);
      }
    });
  }

  public getForme() {

    this.formeService.getFormes().subscribe({
      next: (data: any[]) => {
        this.formes = data;

      },
      error: (err) => {

        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
          this.snackBar.open('Déconnexion réussie.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
          // Redirect to login page or clear session
          window.location.href = '/sign-in';
        }
        console.error('Error fetching products:', err);
      }
    });
  }

  public getFabriquants() {

    this.fabriquantService.getFabriquants().subscribe({
      next: (data: any[]) => {
        this.fabriquants = data;

      },
      error: (err) => {

        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
          this.snackBar.open('Déconnexion réussie.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
          // Redirect to login page or clear session
          window.location.href = '/sign-in';
        }
        console.error('Error fetching products:', err);
      }
    });
  }

  public getEtagere() {
    // this.etageresService.getEtageress().subscribe({
    //   next: (data: any[]) => {
    //     this.etagere = data;
    //   },
    //   error: (err) => {
    //     console.error('Error fetching products:', err);
    //   }
    // });
  }


}
