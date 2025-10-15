import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {CategorieService} from "@services/categories.service";
import {EtageresService} from "@services/etageres.service";
import {MagasinService} from "@services/magasins.service";
import {RayonService} from "@services/rayons.service";
import {FabriquantService} from "@services/fabriquants.service";
import {FormeService} from "@services/formes.service";
import {ProductService} from "@services/products.service";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {InventaireService} from "@services/inventaire.service";
import {MatMenuModule} from "@angular/material/menu";
import {MatListModule} from "@angular/material/list";
import {MatChipsModule} from "@angular/material/chips";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
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
import {MatTableModule} from "@angular/material/table";
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {FlexLayoutModule} from "@ngbracket/ngx-layout";
import {MatStepperModule} from "@angular/material/stepper";
import {MatRadioModule} from "@angular/material/radio";
import {NgxPaginationModule} from "ngx-pagination";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {
  InventaireEnrayonDetailDialogComponent
} from "../inventaire-enrayon-detail-dialog/inventaire-enrayon-detail-dialog.component";
import {MatTooltipModule} from "@angular/material/tooltip";
import {AuthService} from "@services/auth.service";
import {LoaderService} from "@services/loader.service";

@Component({
  selector: 'app-inventaire-saisie-dialog',
  imports: [
    MatTooltipModule,
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
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    // Material
    MatStepperModule,
    MatRadioModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatChipsModule,
    NgxPaginationModule,
    MatPaginator,
  ],
  templateUrl: './inventaire-saisie-dialog.component.html',
  styleUrl: './inventaire-saisie-dialog.component.scss'
})
export class InventaireSaisieDialogComponent implements OnInit {

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
  public etagere: any[];


  medControl = new FormControl('');
  medOptions: { name: string }[] = [];

  constructor(
    public loaderService: LoaderService,
    public authService: AuthService,
    public snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<InventaireSaisieDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public categorieService: CategorieService,
    public etageresService: EtageresService,
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
      etagereId: [null],
      magasinId: null,
      formeId: [null],
      fabriquantId: [null],
      productSan: ['']
    });
    if (this.data.id) {
      this.getInventaireInfo();
    }
  }

  ngOnInit() {
    this.medControl.valueChanges.subscribe((searchTerm) => {
      if (searchTerm) {
        this.searchProducts(searchTerm);
      }
    });
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
      size: 10
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
          this.filteredProducts = [
            ...uniqueProducts.map((data: any) => ({
              ...data,
              produitId: data.product.id,
              rayonId: data.product.rayonId,
              nom: data.product.nom,
              dateLivraison: data.product.dateLivraison,
              datePeremption: data.product.datePeremption,
              quantityReal: 0,
              isActive: true,
              quantitySystem: data.product.stock
            })),
            ...this.filteredProducts
          ];
          this.totalItems = this.filteredProducts.length;
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
        this.dialogRef.close({
          type: "cloture"
          , data: response
        });

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

            this.filteredProducts = [{
              ...data,
              quantityReal: 0,
              comparison: 0,
              quantitySystem: data.stock,
              isActive: data.active ?? true,
            },
              ...this.filteredProducts];
            // this.count = data.pageable.pageSize;
            this.totalItems = this.filteredProducts.length;

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
            }
            alert('Une erreur est survenue lors de la récupération des produits en rayon.');
          },
        });
      }

    }
  }

  getInventaireInfo() {

    this.inventaireService.listerProduitsParInventaireAsMap(this.data.id, this.page - 1,
      this.count,).subscribe({
      next: (data: any) => {
        this.totalItems = data.totalElements;
        this.count = data.pageSize;
        // this.filteredProducts = [
        //   ...data.content.map((product: any) => ({
        //     ...product,
        //     produitId: product.id ?? 0,
        //     rayonId: product.rayonId ?? 0,
        //     quantityReal: product.quantiteReelle ?? 0,
        //     quantitySystem: product.quantiteSysteme ?? 0
        //   })),
        //   ...this.filteredProducts];
        this.filteredProducts = [
          ...data.content.map((product: any) => ({
            ...product,
            produitId: product.id ?? 0,
            rayonId: product.rayonId ?? 0,
            quantityReal: product.quantiteReelle ?? 0,
            quantitySystem: product.quantiteSysteme ?? 0
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
        }
        alert('Une erreur est survenue lors de la récupération des produits en rayon.');
      },
    });
  }

  toggleProductState(product: any): void {
    product.isActive = !product.isActive;
  }

  toggleAllProductsState(): void {
    const allActive = this.filteredProducts.every(product => product.isActive);
    this.filteredProducts.forEach(product => product.isActive = !allActive);
  }

  addProductToInventory(product: any) {
    if (product.isActive) {
      product.isActive = !product.isActive
    } else {
      product.isActive = !product.isActive
    }
    const data = {
      id: this.data.id,
      produitId: product.produitId,
      rayonId: product.rayonId,
      quantiteReel: product.quantityReal,
      quantiteSysteme: product.quantitySystem,
      isValid: product.isActive
    }

    console.log("product")
    console.log(product)

    this.inventaireService.addProductToInventory(data).subscribe({
      next: (data: any) => {
        product.produitInventaireId = data.inventaire_id
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

  deleteRow(product: any): void {
    const data = {
      id: this.data.id,
      produitId: product.produitId,
      rayonId: product.rayonId,
      quantiteReel: product.quantityReal,
      quantiteSysteme: product.quantitySystem,
      isValid: false
    }

    this.inventaireService.invalideProductToInventory(product.produitInventaireId).subscribe({
      next: (data: any) => {
        this.snackBar.open(data.message, '×', {
          panelClass: 'success',
          verticalPosition: 'top',
          duration: 3000
        });
        this.filteredProducts = this.filteredProducts.filter(p => p.rayonId !== product.rayonId);

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

  onPageChanged(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.count = event.pageSize
    this.getInventaireInfo()
  }
}
