import {Component, HostListener, OnInit} from '@angular/core';
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

@Component({
  selector: 'app-product-detail-list',
  imports: [
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
export class ProductDetailListComponent  implements OnInit {
  // displayedColumns: string[] = ['image', 'category', 'name', 'oldPrice', 'newPrice', 'actions'];
  displayedColumns: string[] = ['nom', 'reference', 'quantiteStock', 'grossiste', 'reduction', 'actions'];

  public searchText: string;

  public products: Array<ProductNew> = [];
  public categories: Array<any> = [];
  public viewCol: number = 25;
  public page = 0; // Default to 0 if undefined
  public size = 100;  // Default to 10 if undefined
  public totalItems = 0;  // Default to 10 if undefined
  public totalPages = 50;  // Default to 10 if undefined
  public count = 90;
  public searchTerm: string = '';
  public form: FormGroup;

  constructor(
    public appService: AppService,
    public productService: ProductService,
    public produitdetailsService: ProduitdetailsService,
    public categorieService: CategorieService,
    public dialog: MatDialog,
    public fb: FormBuilder,
    public domHandlerService: DomHandlerService) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      searchForm: [null],
    });
    if (this.domHandlerService.window?.innerWidth < 1280) {
      this.viewCol = 33.3;
    }
    ;
    this.getCategories();
  }

  public getAllProductsDetail() {
    this.produitdetailsService.getProduitDetailsList().subscribe({
      next: (data: any) => {
        this.count = data.numberOfElements;
        this.totalItems = data.totalElements;
        this.products = data.content; // Les produits pour la page actuelle
      },
      error: (err) => {
        console.error('Error fetching products:', err);
      }
    });
  }

  searchUsers(): void {
    this.productService.searchProducts(this.searchText, this.page, 40).subscribe({
      // this.productService.searchProducts(this.searchTerm, this.page, this.count).subscribe({
      next: (data: any) => {
        this.count = data.numberOfElements;
        this.totalItems = data.totalElements;
        this.products = data.content; // Les produits pour la page actuelle
      },
      error: (err) => {
        console.error('Error searching products:', err);
      }
    });
  }

  public searchProducts(): void {
    console.log('Searching for products with term:', this.form.value);
    this.productService.searchProducts(this.form.value.searchForm, this.page, 40).subscribe({
      // this.productService.searchProducts(this.searchTerm, this.page, this.count).subscribe({
      next: (data: any) => {
        this.count = data.numberOfElements;
        this.totalItems = data.totalElements;
        this.products = data.content; // Les produits pour la page actuelle
      },
      error: (err) => {
        console.error('Error searching products:', err);
      }
    });
  }

  public onPageChanged(event: number) {
    this.page = event;
    this.getAllProductsDetail();
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
          data: data,
          width: "80%",
          panelClass: ['theme-dialog'],
          autoFocus: false,
        });
        dialogRef.afterClosed().subscribe(dialogResult => {
          if (dialogResult) {
            const index: number = this.products.indexOf(product);
            if (index !== -1) {
              this.products.splice(index, 1);
            }
          }
        });
      },
      error: (err) => {
        console.error('Error fetching products:', err);
      }
    });
  }

}
