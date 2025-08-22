import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {ProductNew} from "@models/product";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AppService} from "@services/app.service";
import {ProductService} from "@services/products.service";
import {CategorieService} from "@services/categories.service";
import {MatDialog} from "@angular/material/dialog";
import {DomHandlerService} from "@services/dom-handler.service";
import {ConfirmDialogComponent} from "@shared-components/confirm-dialog/confirm-dialog.component";
import {User} from "@models/user.model";
import {DetailProduitDialogComponent} from "../product-list/detail-produit-dialog/detail-produit-dialog.component";
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
import {PipesModule} from "../../../theme/pipes/pipes.module";
import {ProduitdetailsService} from "@services/produitdetails.service";
import {ProductDetailInfoDialogComponent} from "./product-detail-info-dialog/product-detail-info-dialog.component";
import {MatPaginator, MatPaginatorModule, PageEvent} from "@angular/material/paginator";
import {AuthService} from "@services/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {LoaderService} from "@services/loader.service";

@Component({
  selector: 'app-product-detail-list',
  imports: [
    MatPaginatorModule,
    MatTableModule,
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
    DecimalPipe
  ],
  templateUrl: './product-detail-list.component.html',
  styleUrl: './product-detail-list.component.scss'
})
export class ProductDetailListComponent implements OnInit {
  displayedColumns: string[] = ['nom', 'reference', 'quantiteStock', 'grossiste', 'reduction', 'actions'];

  public searchText: string;

  public products: any[] = [];
  public categories: Array<any> = [];
  public viewCol: number = 25;
  public page = 1; // Default to 0 if undefined
  public size = 100;  // Default to 10 if undefined
  public totalItems = 0;  // Default to 10 if undefined
  public totalPages = 50;  // Default to 10 if undefined
  public count = 10;
  public searchTerm: string = '';
  public form: FormGroup;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    public loaderService: LoaderService,
    public authService: AuthService,
    public snackBar: MatSnackBar,
    public appService: AppService,
    public productService: ProductService,
    public produitdetailsService: ProduitdetailsService,
    public categorieService: CategorieService,
    public dialog: MatDialog,
    public fb: FormBuilder,
    public domHandlerService: DomHandlerService) {
    this.form = this.fb.group({
      searchForm: [""],
    });
  }

  ngOnInit(): void {

    this.form.get("searchForm").valueChanges.subscribe((searchTerm) => {
      if (this.page == -1) {
        this.page = 1
      }
      this.searchText = searchTerm;
      if (searchTerm == "") {
        this.page = 0
        this.getAllProductsDetail()
      } else {
        this.paginator.firstPage();
        if (this.page > 0) {
          this.page = 0
        }

        this.produitdetailsService.searchProduitDetailsByName(searchTerm, this.page - 1, this.count).subscribe({
          // this.productService.searchProducts(this.searchTerm, this.page, this.count).subscribe({
          next: (data: any) => {
            this.count = data.pageable.pageSize;
            this.totalItems = data.totalElements;
            this.products = data.content; // Les produits pour la page actuelle

          },
          error: (err) => {
            console.error('Error searching products:', err);
          }
        });
      }
    });

    if (this.domHandlerService.window?.innerWidth < 1280) {
      this.viewCol = 33.3;
    }
    ;

    this.getCategories();
  }

  public getAllProductsDetail() {

    this.produitdetailsService.getProduitDetailsList(this.searchText, this.page - 1, this.count).subscribe({
      next: (data: any) => {
        this.count = data.pageable.pageSize;
        this.totalItems = data.totalElements;
        this.products = data.content; // Les produits pour la page actuelle

      },
      error: (err) => {

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
        console.error('Error fetching products:', err);
      }
    });
  }

  searchProduitDetail(): void {

    this.produitdetailsService.searchProduitDetailsByName(this.searchText, this.page - 1, this.count).subscribe({
      // this.productService.searchProducts(this.searchTerm, this.page, this.count).subscribe({
      next: (data: any) => {
        this.count = data.pageable.pageSize;
        this.totalItems = data.totalElements;
        this.products = data.content; // Les produits pour la page actuelle

      },
      error: (err) => {
        console.error('Error searching products:', err);

      }
    });
  }

  public onPageChanged(event: PageEvent) {
    if (this.searchText === "" || this.searchText === undefined) {
      if (this.page == 0) {
        this.page = 1
        this.paginator.firstPage(); // Ensure the paginator UI resets
        this.getAllProductsDetail();
      } else {
        this.page = event.pageIndex + 1;
        this.getAllProductsDetail();
      }

    } else {
      this.page = event.pageIndex + 1;
      this.count = event.pageSize;
      this.searchProduitDetail()
    }

    this.domHandlerService.winScroll(0, 0);
  }

  @HostListener('window:resize')
  public onWindowResize(): void {
    (this.domHandlerService.window?.innerWidth < 1280) ? this.viewCol = 33.3 : this.viewCol = 25;
  }

  public remove(product: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: {
        title: "Confirm Action",
        message: "Are you sure you want delete this product?"
      }
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {

        this.produitdetailsService.removeProduitDetail(product.id).subscribe({
          next: (data) => {
            this.getAllProductsDetail();

          },
          error: (err) => {

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
            console.error('Error fetching products:', err);
          }
        });
      }
    });
  }

  public getCategories() {

    this.categorieService.getCategories().subscribe({
      next: (data) => {
        this.getAllProductsDetail();

      },
      error: (err) => {

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
        console.error('Error fetching products:', err);
      }
    });
  }

  public addProduitDetail() {
    let dialogRef = this.dialog.open(ProductDetailInfoDialogComponent, {
      data: null
    });
    dialogRef.afterClosed().subscribe((user: User) => {
      this.getAllProductsDetail()
    });
  }

  getDetailProduit(product: any) {

    this.produitdetailsService.getProduitDetailsInfo(product.id).subscribe({
      next: (data) => {
        const dialogRef = this.dialog.open(ProductDetailInfoDialogComponent, {
          data: {
            data: data,
            title: "Mettre a jour produit detail : " + product.nom,
          },
          width: "80%",
          panelClass: ['theme-dialog'],
          autoFocus: false,
        });
        dialogRef.afterClosed().subscribe(dialogResult => {
          if (dialogResult) {
            this.getAllProductsDetail()
          }
        });

      },
      error: (err) => {

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
        console.error('Error fetching products:', err);
      }
    });
  }


}
