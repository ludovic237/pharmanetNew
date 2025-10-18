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
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {HttpClient} from "@angular/common/http";
import {ProductService} from "@services/products.service";
import {MatListModule} from "@angular/material/list";
import {CommandesService} from "@services/commandes.service";
import {FournisseursService} from "@services/fournisseurs.service";
import {MatChipListbox, MatChipsModule} from "@angular/material/chips";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatRadioButton, MatRadioModule} from "@angular/material/radio";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatTabsModule} from "@angular/material/tabs";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule, provideNativeDateAdapter} from "@angular/material/core";
import {MatStepperModule} from "@angular/material/stepper";
import {MatTooltip} from "@angular/material/tooltip";
import {AuthService} from "@services/auth.service";
import {LoaderService} from "@services/loader.service";
import {MatPaginatorModule} from "@angular/material/paginator";
import {products} from "../../../../common/data/dashboard.data";

@Component({
  selector: 'app-detail-commande-dialog',
  standalone: true,
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
    FlexLayoutModule,
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './detail-commande-dialog.component.html',
  styleUrl: './detail-commande-dialog.component.scss'
})
export class DetailCommandeDialogComponent implements OnInit {

  columnsDisplay: string[] = ['nom', 'prixAchat', 'prixVente', 'qtiteCmd', 'qtiteRecu', 'uniteGratuite', 'datePeremption'];
  commandeForm: FormGroup;
  type: string;
  reference: string;
  etat: string;
  commande: any;
  products: any[] = [];
  fournisseurs: any[] = [];
  selectedProducts: FormArray;

  typeCommande: string = '';
  fournisseurId: string = '';

  constructor(
    public loaderService: LoaderService,
    public authService: AuthService,
    public dialogRef: MatDialogRef<DetailCommandeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public snackBar: MatSnackBar,
    private fb: FormBuilder,
    private productService: ProductService,
    private fournisseursService: FournisseursService,
    private commandesService: CommandesService) {
    this.selectedProducts = this.fb.array([]);
  }

  ngOnInit(): void {
    if (this.data.type == null) {
      this.columnsDisplay = ['nom', 'prixAchat', 'prixVente', 'qtiteCmd', 'qtiteRecu', 'uniteGratuite']
    }
    this.reference = this.data.data.reference;
    this.etat = this.data.data.etat;
    // console.log("data")
    // console.log(this.data)
    this.type = this.data.type;
    this.commande = this.data.data;
    this.commande.produits = this.commande.produits.map((item: any) => {
      item.datePeremption = new Date();
      return item
    });
    // console.log("his.commande")
    // console.log(this.commande)
  }

  public getInfoCommande(commande: any): void {
    const input = event.target as HTMLInputElement;
    const searchTerm = input.value;
    this.commandesService.getCommandeInfo(commande.id).subscribe({
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
      quantite: [1, [Validators.required, Validators.min(1)]]
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
          quantite: product.quantite,
          prixAchat: product.prixAchat,
          prixVente: product.prixVente,
        })),
        type: this.typeCommande
      };

      this.commandesService.addCommande(payload).subscribe({
        next: (response) => {
          // console.log('Commande created:', response);
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

  increment(item: any, field: 'prixUnitaire' | 'qtiteCmd' | 'qtiteRecu' | 'prixVente' | 'prixAchat') {
    item[field]++;
    // this.selectedProducts.value = this.enRayonList.filter(item => item.quantiteRestante > 0);
  }

  decrement(item: any, field: 'prixUnitaire' | 'qtiteCmd' | 'qtiteRecu' | 'prixVente' | 'prixAchat') {
    if (item[field] > 0) {
      item[field]--;
    }
    // this.selectedProducts.value = this.enRayonList.filter(item => item.quantiteRestante > 0);
  }

  get canCreateCommande(): boolean {
    // console.log("canCreateCommande")
    // console.log(this.typeCommande)
    // console.log(this.fournisseurId)
    // console.log(this.selectedProducts.value.length)
    return this.typeCommande.trim() !== '' &&
      this.fournisseurId !== '' &&
      this.selectedProducts.value.length > 0;
  }

  validateQuantity(produit: any): void {
    if (produit.newQtiteRecu > produit.qtiteCmd) {
      produit.newQtiteRecu = produit.qtiteCmd;
    }
  }

  canSubmitReception(): boolean {
    // console.log("canSubmitReception")
    // console.log(this.commande.produits)
    // console.log(this.type)
    if (this.type !== 'partiel' && this.type !== 'complementaire') {
      return false;
    }
    return this.commande.produits.every((produit: any) =>
      produit.datePeremption !== undefined &&
      produit.qtiteRecu !== undefined &&
      produit.qtiteRecu > 0 &&
      produit.qtiteRecu <= produit.qtiteCmd
    );
  }

  submitReception(): void {
    // console.log("this.commande.produits");
    // console.log(this.commande.produits);

    const receptionPayload = this.commande.produits = this.commande.produits.map((item: any) => {
      item.quantite = item.qtiteRecu || 0
      return item
    });

    // const payload = this.commande.produits.map((produit: any) => ({
    //   id: produit.id,
    //   productId: produit.produit.id,
    //   // productCmdId: commande.id,
    //   quantite: produit.quantiteRecu || 0,
    //   datePeremption: produit.datePeremption || null,
    // }));

    this.commandesService.receptionComplete(this.commande.id, 'partiel', receptionPayload).subscribe({
      next: (response) => {
        this.snackBar.open('Réception enregistrée avec succès', '×', {
          panelClass: 'success',
          verticalPosition: 'top',
          duration: 3000,
        });
        this.dialogRef.close();

      },
      error: (err) => {

        this.snackBar.open('Erreur lors de l\'enregistrement de la réception', '×', {
          panelClass: 'error',
          verticalPosition: 'top',
          duration: 3000,
        });
      },
    });
  }

  submitCloture(): void {

    this.commandesService.cloturerCommande(this.commande.id).subscribe({
      next: (response: any) => {
        this.snackBar.open('Cloturation enregistrée avec succès', '×', {
          panelClass: 'success',
          verticalPosition: 'top',
          duration: 3000,
        });
        this.dialogRef.close();

      },
      error: (err) => {
        this.snackBar.open('Erreur lors de l\'enregistrement de la réception', '×', {
          panelClass: 'error',
          verticalPosition: 'top',
          duration: 3000,
        });

      },
    });
  }

  getEtatClass(etat: string): string {
    switch (etat.toLowerCase()) {
      case 'en_attente':
        return 'en-attente';
      case 'cloturee':
        return 'cloturee';
      case 'commandé':
        return 'commande';
      case 'livree':
        return 'livree';
      case 'en_cours':
        return 'en-cours';
      case 'annuler':
        return 'annuler';
      default:
        return '';
    }
  }

}
