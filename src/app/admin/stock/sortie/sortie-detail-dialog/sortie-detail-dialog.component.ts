import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {EnrayonsService} from "@services/enrayons.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {MatCardModule} from "@angular/material/card";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatButtonModule} from "@angular/material/button";
import {MatDividerModule} from "@angular/material/divider";
import {MatIconModule} from "@angular/material/icon";
import {MatTableModule} from "@angular/material/table";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {FlexLayoutModule} from "@ngbracket/ngx-layout";
import {MatTabsModule} from "@angular/material/tabs";
import {MatFormFieldModule} from "@angular/material/form-field";
import {AuthService} from "@services/auth.service";
import {MatToolbarModule} from "@angular/material/toolbar";
import {
  AjouterVenteDialogComponent
} from "../../../vente/ajouter-vente/ajouter-vente-dialog/ajouter-vente-dialog.component";
import {SortieDetailRayonComponent} from "../sortie-detail-rayon/sortie-detail-rayon.component";
import {SortiesService} from "@services/sorties.service";
import {TypeSortiesService} from "@services/type-sorties.service";

@Component({
  selector: 'app-sortie-detail-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
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
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatToolbarModule
  ],
  templateUrl: './sortie-detail-dialog.component.html',
  styleUrl: './sortie-detail-dialog.component.scss'
})
export class SortieDetailDialogComponent implements OnInit {

  quantiteAjouter: number = 0
  mouvelQuantite: number = 0
  produitId: number = null
  produitName: string = ""
  sortieForm: FormGroup;
  // DataSource pour le tableau Material
  dataSource: any[] = [];
  // Colonnes à afficher dans le tableau
  displayedColumns: string[] = ['nomProduit', 'quantite', 'contenu', 'dateLivraison', 'action'];

  constructor(
    public authService: AuthService,
    public typeSortiesService: TypeSortiesService,
    public snackBar: MatSnackBar, public dialogRef: MatDialogRef<SortieDetailDialogComponent>,
    public enRayonService: EnrayonsService,
    public sortiesService: SortiesService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public fb: FormBuilder) {
    this.sortieForm = this.fb.group({
      produitDetailName: [null],
      produitDetailStock: [null],
      produitDetailGrossisteList: [],
      produitDetailContenu: [null],
      produitDetailQuantie: [null]
    });
  }

  ngOnInit(): void {
    // Initialisation du formulaire
    // this.sortieForm.produitDetailGrossisteList.valueChanges.
    console.log("ngOnInit")
    console.log("this.data")
    console.log(this.data)
    this.sortieForm.patchValue({
      produitDetailName: this.data.nom,
      produitDetailStock: this.data.quantite
    })
    this.sortieForm.get('produitDetailGrossisteList').valueChanges.subscribe(selectGrossiste => {
      console.log("selectGrossiste")
      console.log(selectGrossiste)
      this.produitId = selectGrossiste.id
      this.sortieForm.patchValue({
        produitDetailContenu: selectGrossiste.contenuDetail
      })
    });

  }

  /**
   * Ajoute la ligne actuelle au tableau des sorties.
   */
  ajouterAuTableau(): void {
    if (this.sortieForm.invalid) {
      return; // Ne rien faire si le formulaire est invalide
    }

    this.enRayonService.getProduitsEnRayon(this.produitId).subscribe({
      next: (data: any) => {
        const dialogRef = this.dialog.open(SortieDetailRayonComponent, {
          data: {
            type: "detail",
            id: this.produitId,
            name: this.produitName,
            enRayonList: data,
            sourceList: this.dataSource,
          },
          // maxWidth: "400px",
          width: "80%",
          panelClass: ['theme-dialog'],
          autoFocus: false,
          // direction: (this.settings.rtl) ? 'rtl' : 'ltr'
        });
        dialogRef.afterClosed().subscribe((modifiedProducts: any[]) => {
          console.log("modifiedProducts")
          console.log(modifiedProducts)
          if (modifiedProducts && modifiedProducts.length > 0) {
            const newData = modifiedProducts.map(product => {
              const existingProductIndex = this.dataSource.findIndex(item => item.rayonId === product.rayonId);
              if (existingProductIndex !== -1) {
                // Update the existing product
                this.dataSource[existingProductIndex] = {
                  ...this.dataSource[existingProductIndex],
                  quantite: product.quantiteRestante,
                  contenuDetail: this.sortieForm.get('produitDetailContenu').value,
                  // quantite: this.dataSource[existingProductIndex].quantite + product.quantiteRestante,
                  prixTotal: (product.prixVente * product.quantiteRestante),
                  // prixTotal: this.dataSource[existingProductIndex].prixTotal + (product.prixVente * product.quantiteRestante),
                  reduction: product.reduction, // Adjust if needed
                };
                return null; // Skip adding a new entry
              }
              // Add as a new product
              return {
                id: product.id,
                nom: product.nom,
                type: product.type,
                rayonId: product.rayonId,
                prixUnitaire: product.prixVente,
                quantite: product.quantiteRestante,
                contenuDetail: this.sortieForm.get('produitDetailContenu').value,
                prixTotal: product.prixVente * product.quantiteRestante,
                reduction: product.reduction, // Adjust if needed
                dateLivraison: product.dateLivraison, // Adjust if needed
                datePeremption: product.datePeremption, // Adjust if needed
                // type: product.type,
                stockTotal: product.quantite // Adjust if needed
              };
            }).filter(item => item !== null);

            this.dataSource = [...this.dataSource, ...newData];
            console.log("this.dataSource")
            console.log(this.dataSource)
            // this.totalGrosAmount =  this.produitsAchetes.reduce((sum, item) => sum + (item.prixUnitaire*item.quantite), 0)
            this.quantiteAjouter = this.dataSource.reduce((sum, item) => sum + (item.contenuDetail * item.quantite), 0)
            this.mouvelQuantite = this.sortieForm.get("produitDetailStock").value + this.quantiteAjouter;
          }
        });
      },
      error: (err: any) => {
        console.error('Failed to fetch products in stock:', err);
        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
           localStorage.removeItem('token');
          localStorage.setItem("lastLink",window.location.href);;
          this.snackBar.open('Déconnexion réussie.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
          // Redirect to login page or clear session
          window.location.href = '/sign-in';
        } else
          alert('Une erreur est survenue lors de la récupération des produits en rayon.');
      },
    });

    // Réinitialiser le champ de quantité
    this.sortieForm.get('quantite')?.reset();
  }

  /**
   * Supprime une ligne du tableau.
   * @param element La ligne à supprimer.
   */
  supprimerLigne(element: any): void {
    this.dataSource = this.dataSource.filter(item => item.rayonId !== element.rayonId)
  }

  /**
   * Récupère les données du tableau et ferme la fenêtre modale.
   */
  enregistrer(): void {
    // On retourne les données du tableau au composant parent
    this.dialogRef.close(this.dataSource);
    let dataSave = this.dataSource.map((product: any) => ({
      contenuDetail: product.contenuDetail ?? 0,
      id: product.id ?? 0,
      quantite: product.quantite ?? 0,
      rayonId: product.rayonId ?? 0,
      stockTotal: product.stockTotal ?? 0
    }))
    let sortie = {
      enrayon:dataSave,
      produitDetailId:this.data.id,
      typeSortieId:"null"
    }
    console.log("sortie")
    console.log(sortie)
    this.sortiesService.addProduitDetail(sortie).subscribe({
      next: (response: any) => {
        this.dialogRef.close(response);
      },
      error: (err: any) => {
        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
           localStorage.removeItem('token');
          localStorage.setItem("lastLink",window.location.href);;
          this.snackBar.open('Déconnexion réussie.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
          // Redirect to login page or clear session
          window.location.href = '/sign-in';
        }
        console.error('Failed to load products:', err);
      }
    });
  }

  getTypeSortiePageable(name:string){
    this.typeSortiesService.getTypeSortiePageable(0,10,"null","desc",name).subscribe({
      next: (response: any) => {

      },
      error: (err: any) => {
        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
           localStorage.removeItem('token');
          localStorage.setItem("lastLink",window.location.href);;
          this.snackBar.open('Déconnexion réussie.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
          // Redirect to login page or clear session
          window.location.href = '/sign-in';
        }
        console.error('Failed to load products:', err);
      }
    });
  }

}
