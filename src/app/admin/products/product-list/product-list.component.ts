import {Component, HostListener, OnInit} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';
import {MatDialog} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {RouterModule} from '@angular/router';
import {Product, ProductNew} from '@models/product';
import {FlexLayoutModule} from '@ngbracket/ngx-layout';
import {AppService} from '@services/app.service';
import {DomHandlerService} from '@services/dom-handler.service';
import {ConfirmDialogComponent} from '@shared-components/confirm-dialog/confirm-dialog.component';
import {RatingComponent} from '@shared-components/rating/rating.component';
import {NgxPaginationModule} from 'ngx-pagination';
import {PipesModule} from '../../../theme/pipes/pipes.module';
import {CommonModule, DecimalPipe} from '@angular/common';
import {ProductService} from "@services/products.service";
import {CategorieService} from "@services/categories.service";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatTableModule} from "@angular/material/table";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {User} from "@models/user.model";
import {UserDialogComponent} from "../../users/user-dialog/user-dialog.component";
import {DetailProduitDialogComponent} from "./detail-produit-dialog/detail-produit-dialog.component";

@Component({
  selector: 'app-product-list',
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
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  displayedColumns: string[] = ['image', 'category', 'name', 'oldPrice', 'newPrice', 'actions'];

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

  public getAllProducts() {
    this.productService.getProducts(this.page, 40).subscribe({
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
    this.getAllProducts();
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
        const index: number = this.products.indexOf(product);
        if (index !== -1) {
          this.products.splice(index, 1);
        }
      }
    });
  }

  public getCategories() {
    this.categorieService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.getAllProducts();
      },
      error: (err) => {
        console.error('Error fetching products:', err);
      }
    });
  }

  public openUserDialog(user: User) {
    /*    let dialogRef = this.dialog.open(UserDialogComponent, {
          data: user
        });
        dialogRef.afterClosed().subscribe((user: User) => {
          if (user) {
            // (user.id) ? this.updateUser(user) : this.addUser(user);
          }
        });*/
  }

  getDetailProduit(product: any) {
    this.productService.getProduitDetails(product.id).subscribe({
      next: (data) => {
        const dialogRef = this.dialog.open(DetailProduitDialogComponent, {
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
