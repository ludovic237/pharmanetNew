import {Component, Inject, OnInit} from '@angular/core';
import {MatCardModule} from "@angular/material/card";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatTableModule} from "@angular/material/table";
import {MatTabsModule} from "@angular/material/tabs";
import {RouterModule} from "@angular/router";
import {FlexLayoutModule} from "@ngbracket/ngx-layout";
import {MatChipsModule} from "@angular/material/chips";
import {MatButtonModule} from "@angular/material/button";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatIconModule} from "@angular/material/icon";
import {CommonModule, DecimalPipe} from "@angular/common";
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {NgxPaginationModule} from "ngx-pagination";
import {PipesModule} from "../../../../theme/pipes/pipes.module";
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {ProductService} from "@services/products.service";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {
  AjouterVenteDialogComponent
} from "../../../sales/ajouter-vente/ajouter-vente-dialog/ajouter-vente-dialog.component";
import {EnrayonsService} from "@services/enrayons.service";
import {Settings} from "@services/settings.service";
import {InputFileModule} from "../../../../theme/components/input-file/input-file.module";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {ProduitdetailsService} from "@services/produitdetails.service";
import {AuthService} from "@services/auth.service";
import {MatMenuModule} from "@angular/material/menu";
import {MatListModule} from "@angular/material/list";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatDividerModule} from "@angular/material/divider";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {MatStepperModule} from "@angular/material/stepper";
import {MatRadioModule} from "@angular/material/radio";
import {LoaderService} from "@services/loader.service";

@Component({
  selector: 'app-product-detail-info-dialog',
  imports: [
    MatDialogModule,
    MatToolbarModule,
    CommonModule,
    FormsModule,
    MatToolbarModule,
    ReactiveFormsModule,
    MatCardModule,
    InputFileModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    FlexLayoutModule,
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
  templateUrl: './product-detail-info-dialog.component.html',
  styleUrl: './product-detail-info-dialog.component.scss'
})
export class ProductDetailInfoDialogComponent implements OnInit {

  public title: string = "Ajouter un nouveau produit detail"
  public id: any;
  medOptions: { name: string }[] = [];
  medControl = new FormControl('');
  public settings: Settings;

  parentList: any[] = []

  public form: FormGroup;

  constructor(
     public loaderService: LoaderService,
    public authService: AuthService,
    public dialogRef: MatDialogRef<ProductDetailInfoDialogComponent>,
    public productService: ProductService,
    public productDetailService: ProduitdetailsService,
    public enrayonsService: EnrayonsService,
    public formBuilder: FormBuilder,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public fb: FormBuilder) {

  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      nom: [null, Validators.compose([Validators.required, Validators.minLength(4)])],
      reference: [null, Validators.maxLength(32)],
      stock: [0, [Validators.required, Validators.min(0)]],
      stockMax: [0, [Validators.required, Validators.min(0)]],
      stockMin: [0, [Validators.required, Validators.min(0)]],
      prix: [0, Validators.required],
      images: [null],
      reductionMax: [0, Validators.min(0)],
      magasinId: [null]
    });

    this.medControl.valueChanges.subscribe((searchTerm) => {
      if (searchTerm) {
        this.searchProducts(searchTerm);
      }
    });

    console.log("this.data produit detail")
    console.log(this.data)
    if (this.data != null) {
      this.title = this.data.title
      this.form.patchValue(this.data.data);
      this.parentList = this.data.data.grossisteList
    }
  }

  openMedicamentDialog(med: any): void {

    this.productService.getProductById(med.id).subscribe({
      next: (data: any) => {
        console.log("openMedicamentDialog");
        console.log(data);
        /* this.parentList = [...this.parentList, {
           ...data,
           nom:data.nom,
           contenuDetail:data.contenuDetail,
           produitId:data.id,
         }];*/
        this.parentList = [...this.parentList, {
          nom: data.nom,
          contenuDetail: data.contenuDetail,
          produitId: data.id,
        }];

      },
      error: (err: any) => {
        console.error('Failed to fetch products in stock:', err);
        alert('Une erreur est survenue lors de la récupération des produits en rayon.');

      },
    });
  }

  public onSubmit() {
    console.log("this.form.value");
    console.log(this.form.value);
    let result = {
      ...this.form.value,
      data: this.parentList
    }
    console.log("result");
    console.log(result);
    console.log("this.data");
    console.log(this.data);
    if (this.form.valid) {
      if (this.data == null) {

        this.productDetailService.createProductDetail(result).subscribe({
          // this.productService.searchProducts(this.searchTerm, this.page, this.count).subscribe({
          next: (data: any) => {
            this.snackBar.open('Product detail created successfully!', '×', {
              panelClass: 'success',
              verticalPosition: 'top',
              duration: 3000
            });
            this.dialogRef.close(this.form.value);

          },
          error: (err) => {

            console.error('Error searching products:', err);
            this.snackBar.open('Failed to create product detail.', '×', {
              panelClass: 'error',
              verticalPosition: 'top',
              duration: 3000
            });
          }
        });
      } else {
        if (this.data.id) {

          this.productDetailService.updateProductDetail(this.data.id, result).subscribe({
            // this.productService.searchProducts(this.searchTerm, this.page, this.count).subscribe({
            next: (data: any) => {
              this.snackBar.open('Product detail created successfully!', '×', {
                panelClass: 'success',
                verticalPosition: 'top',
                duration: 3000
              });
              this.form.patchValue(result);
              this.parentList = result.data

            },
            error: (err) => {

              console.error('Error searching products:', err);
              this.snackBar.open('Failed to create product detail.', '×', {
                panelClass: 'error',
                verticalPosition: 'top',
                duration: 3000
              });
            }
          });
        } else {

          this.productDetailService.createProductDetail(result).subscribe({
            // this.productService.searchProducts(this.searchTerm, this.page, this.count).subscribe({
            next: (data: any) => {
              this.snackBar.open('Product detail created successfully!', '×', {
                panelClass: 'success',
                verticalPosition: 'top',
                duration: 3000
              });
              this.dialogRef.close(this.form.value);

            },
            error: (err) => {

              console.error('Error searching products:', err);
              this.snackBar.open('Failed to create product detail.', '×', {
                panelClass: 'error',
                verticalPosition: 'top',
                duration: 3000
              });
            }
          });
        }
      }

      // this.dialogRef.close(this.form.value);
    }
  }

  public searchProducts(searchTerm: string): void {

    this.productService.searchProducts(searchTerm, 0, 40).subscribe({
      // this.productService.searchProducts(this.searchTerm, this.page, this.count).subscribe({
      next: (data: any) => {
        this.medOptions = data.content.map((product: any) => ({
          id: product.id,
          name: product.nom
        }));
        console.log("this.medOptions");
        console.log(this.medOptions);

      },
      error: (err) => {
        console.error('Error searching products:', err);

      }
    });
  }

  edit(element: any): void {
    // ... Votre code pour éditer l'élément ici ...
    console.log(`Le bouton Modifier a été cliqué pour l'élément: ${element}`);
  }

  delete(element: any) {

    this.productDetailService.removeParentDetail(element.id, this.data.id).subscribe({
      next: (data) => {

        this.productDetailService.getProduitDetailsInfo(this.data.id).subscribe({
          next: (data: any) => {

            this.form.patchValue(data);
            this.parentList = data.grossisteList
          },
          error: (err) => {

            console.error('Error fetching products:', err);
          }
        });
      },
      error: (err) => {

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
            localStorage.removeItem('token');
          window.location.href = '/sign-in';
        }
        console.error('Error fetching products:', err);
      }
    });
  }
}
