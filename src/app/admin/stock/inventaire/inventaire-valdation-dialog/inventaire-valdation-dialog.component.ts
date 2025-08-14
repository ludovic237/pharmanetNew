import {Component, Inject, OnInit} from '@angular/core';
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
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {CategorieService} from "@services/categories.service";
import {EtageresService} from "@services/etageres.service";
import {FournisseursService} from "@services/fournisseurs.service";
import {MagasinService} from "@services/magasins.service";
import {RayonService} from "@services/rayons.service";
import {FabriquantService} from "@services/fabriquants.service";
import {FormeService} from "@services/formes.service";
import {ProductService} from "@services/products.service";
import {InventaireService} from "@services/inventaire.service";
import {AuthService} from "@services/auth.service";

@Component({
  selector: 'app-inventaire-valdation-dialog',
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
  templateUrl: './inventaire-valdation-dialog.component.html',
  styleUrl: './inventaire-valdation-dialog.component.scss'
})
export class InventaireValdationDialogComponent implements OnInit {

  recapitulatif = {
    ecartsDetectes: 23,
    impactFinancier: -245.67,
  };

  produitsManquants = {
    quantite: 15,
    impact: -180.45,
  };

  produitsExcedentaires = {
    quantite: 8,
    impact: 65.22,
  };

  commentaire: string = '';
  commentaireErreur: string = '';

   constructor(
    public authService: AuthService,
    private dialogRef: MatDialogRef<InventaireValdationDialogComponent>,
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
    public snackBar: MatSnackBar,
    private inventaireService: InventaireService,
    public dialog: MatDialog) {

  }

  ngOnInit() {
    this.getInfoProduitsInventaire();
  }

  getInfoProduitsInventaire(){
    this.inventaireService.getInfoProduitsInventaire(this.data.id).subscribe({
      next: (data: any) => {
        console.log('Produits en stock récupérés:', data);
        this.produitsManquants.quantite = data.totalProduitsManquant;
        this.produitsManquants.impact = data.totalProduitsPriceManquant;
        this.produitsExcedentaires.quantite = data.totalProduitsExcedent;
        this.produitsExcedentaires.impact = data.totalProduitsPriceExcedent;
        this.recapitulatif.ecartsDetectes = data.totalProduitsEcart;
        this.recapitulatif.impactFinancier = data.totalProduitsPriceEcart;

        // Assuming you want to display the products in stock
        // this.data.produitsEnStock = data.produitsEnStock || [];
      },
      error: (err: any) => {
        if (err.status === 401 || err.status === 403){
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
        console.error('Failed to fetch products in stock:', err);
        alert('Une erreur est survenue lors de la récupération des produits en rayon.');
      },
    });
  }

  validerInventaire(): void {
    if (!this.commentaire.trim()) {
      this.commentaireErreur = 'Le commentaire est obligatoire pour valider les écarts.';
    } else {
      this.commentaireErreur = '';
      console.log('Inventaire validé avec commentaire:', this.commentaire);
      // Add logic to save or process the validation
    }
    this.inventaireService.terminerInventaire(this.data.id,this.commentaire).subscribe({
      next: (data: any) => {
        this.snackBar.open('Inventory terminated successfully!', '×', {
          panelClass: 'success',
          verticalPosition: 'top',
          duration: 3000
        });
        this.dialogRef.close()
      },
      error: (err: any) => {
        if (err.status === 401 || err.status === 403){
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
        else
        this.snackBar.open('Failed to terminate inventory.', '×', {
          panelClass: 'error',
          verticalPosition: 'top',
          duration: 3000
        });
      },
    });
  }

  retourAuxEcarts(): void {
    console.log('Retour aux écarts');
    // Add navigation logic if needed
  }
}
