import {Component, Inject, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatButtonModule} from "@angular/material/button";
import {FlexLayoutModule} from "@ngbracket/ngx-layout";
import {EnrayonsService} from "@services/enrayons.service";
import {MatCardModule} from "@angular/material/card";
import {CommonModule} from "@angular/common";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatTableModule} from "@angular/material/table";
import {MatIconModule} from "@angular/material/icon";
import {MatDividerModule} from "@angular/material/divider";
import {MatSnackBar} from "@angular/material/snack-bar";
import {HttpClient} from "@angular/common/http";
import {ProductService} from "@services/products.service";
import {MatListModule} from "@angular/material/list";
import {CommandesService} from "@services/commandes.service";
import {FournisseursService} from "@services/fournisseurs.service";
import {AuthService} from "@services/auth.service";

@Component({
  selector: 'app-ajouter-commande-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatListModule,
    MatCardModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatButtonModule, MatDividerModule, MatIconModule,
    MatTableModule,
    MatAutocompleteModule,
    FlexLayoutModule
  ],
  templateUrl: './ajouter-commande-dialog.component.html',
  styleUrl: './ajouter-commande-dialog.component.scss'
})
export class AjouterCommandeDialogComponent implements OnInit {

  commandeForm: FormGroup;
  products: any[] = [];
  fournisseurs: any[] = [];
  selectedProducts: FormArray;
  columns: string[] = ['nom', 'prixAchat', 'prixVente', 'quantite', 'total', 'actions'];

  typeCommande: string = 'en_attente';
  fournisseurId: string = '';
  defaultDateDePeremption: string;

  constructor(
    public authService: AuthService,
    public dialogRef: MatDialogRef<AjouterCommandeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public snackBar: MatSnackBar,
    private fb: FormBuilder,
    private productService: ProductService,
    private fournisseursService: FournisseursService,
    private commandesService: CommandesService) {
    this.selectedProducts = this.fb.array([]);
    const today = new Date();
    const twoMonthsLater = new Date(today.setMonth(today.getMonth() + 2));
    this.defaultDateDePeremption = twoMonthsLater.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }

  ngOnInit(): void {
    this.updateColumns();
    this.searchFournisseur();
  }

  /*  updateColumns(): void {
      if (this.typeCommande === 'livree' || this.typeCommande === 'en_cours') {
        this.columns = ['nom', 'prixAchat', 'prixVente', 'quantite', 'uniteGratuite','dateDePeremption', 'total', 'actions'];
      }
      if (this.typeCommande === 'en_cours') {
        this.columns = ['nom', 'prixAchat', 'prixVente', 'quantite', 'uniteGratuite', 'quantiteRecu', 'total', 'actions'];
      }
    }*/

  updateColumns(): void {
    this.columns = ['nom', 'prixAchat', 'prixVente', 'quantite', 'total', 'actions'];
    if (this.typeCommande === 'livree' || this.typeCommande === 'en_cours') {
      this.columns.splice(4, 0, 'uniteGratuite', 'dateDePeremption');
    }
    if (this.typeCommande === 'en_cours') {
      this.columns.splice(5, 0, 'quantiteRecu');
    }
  }

  public searchProducts(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchTerm = input.value;
    this.productService.searchProducts(searchTerm, 0, 40).subscribe({
      // this.productService.searchProducts(this.searchTerm, this.page, this.count).subscribe({
      next: (data: any) => {
        this.products = data.content;
      },
      error: (err) => {
        console.error('Error searching products:', err);
      }
    });
  }

  public searchFournisseur(): void {
    this.fournisseursService.getFournisseurs().subscribe({
      // this.productService.searchProducts(this.searchTerm, this.page, this.count).subscribe({
      next: (data: any) => {
        this.fournisseurs = data;
      },
      error: (err) => {
        console.error('Error searching products:', err);
      }
    });
  }

  addProduct(product: any): void {
    const productGroup = this.fb.group({
      id: [product.id],
      nom: [product.nom],
      prixAchat: [product.prixAchatInitial, [Validators.required, Validators.min(0)]],
      prixVente: [product.prixVenteActuel, [Validators.required, Validators.min(0)]],
      quantite: [1, [Validators.required, Validators.min(1)]],
      uniteGratuite: [0, [Validators.required, Validators.min(0)]],
      quantiteRecu: [this.typeCommande === 'en_cours' ? 0 : null, [Validators.min(0)]],
      dateDePeremption: [this.typeCommande === 'livree' || this.typeCommande === 'en_cours' ? this.defaultDateDePeremption : null]
    });

    this.selectedProducts.push(productGroup);
  }

  removeProduct(index: number): void {
    this.selectedProducts.removeAt(index);
  }

  createCommande(): void {
    if (this.canCreateCommande) {
      const payload = {
        clientId: 0,
        employeId: 1,
        fournisseurId: this.fournisseurId,
        produits: this.selectedProducts.value.map((product: any) => ({
          id: product.id,
          nom: product.nom || "",
          quantite: product.quantite ?? 0,
          uniteGratuite: product.uniteGratuite ?? 0,
          quantiteRecu: product.quantiteRecu ?? 0,
          prixAchat: product.prixAchat,
          prixVente: product.prixVente,
          dateDePeremption: product.dateDePeremption
            ? new Date(product.dateDePeremption).toISOString().replace('T', ' ').split('.')[0]
            : new Date().toISOString().replace('T', ' ').split('.')[0],
        })),
        type: this.typeCommande
      };
      this.commandesService.addCommande(payload).subscribe({
        next: (response) => {
          this.dialogRef.close();
          this.snackBar.open('Commande created', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000
          });
        },
        error: (err) => {
          this.snackBar.open(`Error creating commande.`, '×', {
            panelClass: 'error',
            verticalPosition: 'top',
            duration: 3000
          });
        }
      });
    }
  }

  increment(item: any, field: 'quantite' | 'quantiteRecu' | 'prixVente' | 'prixAchat' | 'uniteGratuite') {
    item[field]++;
    // this.selectedProducts.value = this.enRayonList.filter(item => item.quantiteRestante > 0);
  }

  decrement(item: any, field: 'quantite' | 'quantiteRecu' | 'prixVente' | 'prixAchat' | 'uniteGratuite') {
    if (item[field] > 0) {
      item[field]--;
    }
    // this.selectedProducts.value = this.enRayonList.filter(item => item.quantiteRestante > 0);
  }

  get canCreateCommande(): boolean {
    console.log("canCreateCommande")
    console.log(this.typeCommande)
    console.log(this.fournisseurId)
    console.log(this.selectedProducts.value.length)
    return this.typeCommande.trim() !== '' &&
      this.fournisseurId !== '' &&
      this.selectedProducts.value.length > 0;
  }

}
