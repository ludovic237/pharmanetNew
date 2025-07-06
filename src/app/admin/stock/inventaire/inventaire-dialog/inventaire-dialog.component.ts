import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {InventaireService} from "@services/inventaire.service";
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
import {
  AjouterVenteDialogComponent
} from "../../../vente/ajouter-vente/ajouter-vente-dialog/ajouter-vente-dialog.component";

@Component({
  selector: 'app-inventaire-dialog',
  imports: [
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
    NgxPaginationModule,
    MatPaginator,
    MatDividerModule
  ],
  templateUrl: './inventaire-dialog.component.html',
  styleUrl: './inventaire-dialog.component.scss'
})
export class InventaireDialogComponent implements OnInit {

  isEdit: boolean = false;
  searchQuery: string = '';
  products: any[] = [];
  filteredProducts: any[] = [];

  medControl = new FormControl('');
  medOptions: { name: string }[] = [];

  constructor(
    private dialogRef: MatDialogRef<InventaireDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private productService: ProductService,
    public snackBar: MatSnackBar,
    private inventaireService: InventaireService,
  ) {
  }

  ngOnInit(): void {
    this.isEdit = this.data?.type === 'edit';
    if (this.data.type === 'edit') {
      this.data.dateDebut = this.data.dateDebut || new Date(); // Default to today's date
    }
    this.medControl.valueChanges.subscribe((searchTerm) => {
      if (searchTerm) {
        this.searchProducts(searchTerm);
      }
    });
    this.fetchProducts();
  }

  fetchProducts(): void {
    // this.inventaireService.getProducts().subscribe((products: any[]) => {
    //   this.products = products;
    //   this.filteredProducts = products;
    // });
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
    const selectedProducts = this.filteredProducts.filter(product => product.selected);
    this.inventaireService.addInventaire(this.data).subscribe({
      next: (response:any) => {
        this.snackBar.open('Inventory created successfully!', '×', {
          panelClass: 'success',
          verticalPosition: 'top',
          duration: 3000
        });
        this.dialogRef.close(response);
      },
      error: (err:any) => {
        console.error('Error creating inventory:', err);
        this.snackBar.open('Failed to create inventory.', '×', {
          panelClass: 'error',
          verticalPosition: 'top',
          duration: 3000
        });
      }
    });
    this.dialogRef.close(selectedProducts);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  // onSave(): void {
  //   this.dialogRef.close(this.data);
  // }

  openMedicamentDialog(med: any): void {
    const exists = this.filteredProducts.some(product => product.id === med.id);
    if (!exists) {
      this.productService.getProduitDetailById(med.id).subscribe({
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
          alert('Une erreur est survenue lors de la récupération des produits en rayon.');
        },
      });
    } else {
      this.snackBar.open('Failed to create sale', '×', {
        panelClass: 'error',
        verticalPosition: 'top',
        duration: 3000
      });
    }
  }

updateComparison(product: any): void {
  console.log("1")
  console.log(product)
  product.comparison = product.quantityReal - product.quantitySystem;
  console.log("2")
  console.log(product)
  // Update the array reference to ensure change detection
  this.filteredProducts = this.filteredProducts.map(p =>
    p.id === product.id ? { ...p, comparison: product.comparison } : p
  );
  console.log("this.filteredProducts");
  console.log(this.filteredProducts);
}

  onSave(): void {
    if (this.isEdit) {
      this.inventaireService.updateInventaire(this.data).subscribe({
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
        this.snackBar.open('Failed to close inventory.', '×', {
          panelClass: 'error',
          verticalPosition: 'top',
          duration: 3000
        });
      }
    });
  }

}
