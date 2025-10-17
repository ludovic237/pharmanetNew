import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {MatMenuModule} from "@angular/material/menu";
import {MatListModule} from "@angular/material/list";
import {MatChipsModule} from "@angular/material/chips";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {FormBuilder, FormsModule, ReactiveFormsModule} from "@angular/forms";
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
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {NgxPaginationModule} from "ngx-pagination";
import {MatPaginator} from "@angular/material/paginator";
import {ProductService} from "@services/products.service";
import {InventaireService} from "@services/inventaire.service";
import {AuthService} from "@services/auth.service";
import {LoaderService} from "@services/loader.service";

@Component({
  selector: 'app-inventaire-enrayon-detail-dialog',
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
  templateUrl: './inventaire-enrayon-detail-dialog.component.html',
  styleUrl: './inventaire-enrayon-detail-dialog.component.scss'
})
export class InventaireEnrayonDetailDialogComponent implements OnInit{

  selectedProducts: any[] = [];
  filteredProducts: any[] = [];

   constructor(
     public loaderService: LoaderService,
    public authService: AuthService,
    public snackBar:MatSnackBar,
    private dialogRef: MatDialogRef<InventaireEnrayonDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private productService: ProductService,
    private inventaireService: InventaireService,
  ) {

  }

  ngOnInit() {
    this.openMedicamentDialog(this.data.med)
  }

openMedicamentDialog(med: any): void {
  const existingRayonIds = this.data.filteredProducts.map((product: any) => product.rayonId);

  this.productService.getProduitEnRayonDetailById(med.id).subscribe({
    next: (data: any[]) => {
      const filteredData = data.map((enrayon: any) => ({
        ...enrayon,
        quantityReal: 0,
        comparison: 0,
        quantitySystem: enrayon.stock,
        disabled: existingRayonIds.includes(enrayon.rayonId) // Mark as disabled if rayonId exists
      }));

      this.filteredProducts = [...this.filteredProducts, ...filteredData];

    },
    error: (err: any) => {
      console.error('Failed to fetch products in stock:', err);

      if (err.status === 401 || err.status === 403){
        this.authService.logout();
        this.snackBar.open('Déconnexion réussie.', '×', {
          panelClass: 'success',
          verticalPosition: 'top',
          duration: 3000,
        });
        // Redirect to login page or clear session
        window.location.href = '/sign-in';
      }
      else
      alert('Une erreur est survenue lors de la récupération des produits en rayon.');
    },
  });
}

  selectAll(checked: boolean): void {
    this.filteredProducts.forEach(product => (product.selected = checked));
  }

  onCancel(): void {
    this.dialogRef.close();
  }

addSelectedProducts(): void {
   this.selectedProducts = this.filteredProducts.filter(product => product.selected).map((product:any)=>({
     product,
     produitId: product.id,
   }));

  if (this.selectedProducts.length > 0) {
    // console.log('Selected Products:', this.selectedProducts);
    this.dialogRef.close(this.selectedProducts); // Pass selected products back to the parent
  } else {
    this.snackBar.open('No products selected.', '×', {
      panelClass: 'error',
      verticalPosition: 'top',
      duration: 3000
    });
  }
}

}
