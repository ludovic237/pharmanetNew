import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
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
    MatIconModule
  ],
  templateUrl: './sortie-detail-dialog.component.html',
  styleUrl: './sortie-detail-dialog.component.scss'
})
export class SortieDetailDialogComponent implements OnInit {

  sortieForm: FormGroup;
  // DataSource pour le tableau Material
  dataSource: any[] = [];
  // Colonnes à afficher dans le tableau
  displayedColumns: string[] = ['nomProduit', 'quantite', 'action'];

  constructor(
    public authService: AuthService,
    public snackBar: MatSnackBar, public dialogRef: MatDialogRef<SortieDetailDialogComponent>,
    public enRayonService: EnrayonsService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public fb: FormBuilder) {
  }

  ngOnInit(): void {
    // Initialisation du formulaire
    this.sortieForm = this.fb.group({
      // Champs en lecture seule, pas besoin de les mettre dans le form si on les a déjà dans `data`
      quantite: [null, [Validators.required, Validators.min(1), Validators.max(this.data.stock)]],
    });
  }

  /**
   * Ajoute la ligne actuelle au tableau des sorties.
   */
  ajouterAuTableau(): void {
    if (this.sortieForm.invalid) {
      return; // Ne rien faire si le formulaire est invalide
    }

    const quantiteASortir = this.sortieForm.value.quantite;
    const lignesActuelles = this.dataSource;

    // Créer la nouvelle ligne
    const nouvelleLigne: any = {
      produitDetailId: this.data.id,
      nomProduit: this.data.name,
      quantite: quantiteASortir
    };

    lignesActuelles.push(nouvelleLigne);

    // Mettre à jour le dataSource pour rafraîchir le tableau
    this.dataSource = lignesActuelles;

    // Réinitialiser le champ de quantité
    this.sortieForm.get('quantite')?.reset();
  }

  /**
   * Supprime une ligne du tableau.
   * @param element La ligne à supprimer.
   */
  supprimerLigne(element: any): void {
    const index = this.dataSource.indexOf(element);
    if (index > -1) {
      const data = this.dataSource;
      data.splice(index, 1);
      this.dataSource = data; // Rafraîchir le tableau
    }
  }

  /**
   * Récupère les données du tableau et ferme la fenêtre modale.
   */
  enregistrer(): void {
    // On retourne les données du tableau au composant parent
    this.dialogRef.close(this.dataSource);
  }

}
