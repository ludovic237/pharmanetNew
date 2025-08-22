import {Component, Inject} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
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
import {AuthService} from "@services/auth.service";
import {LoaderService} from "@services/loader.service";

@Component({
  selector: 'app-ajouter-vente-dialog',
  imports: [
    CommonModule,
    FormsModule,
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
  templateUrl: './ajouter-vente-dialog.component.html',
  styleUrl: './ajouter-vente-dialog.component.scss'
})
export class AjouterVenteDialogComponent {

  public enRayonList: any[] = [];
  public modifiedProducts: any[] = [];
  public displayedColumns: string[] = [
    'produit',
    'quantite',
    'quantiteAdjust',
    'prixVente',
    'datePeremption',
    'dateLivraison',
    'reduction',
    'actions'
  ];
  public form: FormGroup;

  constructor(
    public loaderService: LoaderService,
    public authService: AuthService,
    public snackBar: MatSnackBar, public dialogRef: MatDialogRef<AjouterVenteDialogComponent>,
    public enRayonService: EnrayonsService, // Replace with actual service
    @Inject(MAT_DIALOG_DATA) public data: any,
    public fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      id: 0,
      name: [null, Validators.required],
      hasSubCategory: false,
      parentId: 0
    });

    this.enRayonList = this.data.enRayonList.map((item: any) => ({
      ...item,
      quantiteRestante: 0,
      prixVente: item.prixVente
    }));
  }

  public onSubmit() {

    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  saveChanges(item: any): void {
    const updatedItem = {
      id: item.id,
      quantiteRestante: item.quantiteRestante,
      prixVente: item.prixVente
    };
    // this.enRayonService.updateEnRayon(updatedItem).subscribe(() => {
    //   alert('Modifications sauvegardées avec succès.');
    // });
  }

  resetValues(item: any): void {
    item.quantiteRestante = 0; // Reset quantity to modify
    item.prixVente = item.prixVente; // Reset to default price if needed
  }

  validateModifiedQuantities(): void {
    this.modifiedProducts = this.enRayonList.filter(item => item.quantiteRestante > 0);
    this.snackBar.open(`${this.modifiedProducts.length} produits modifiés.`, '×', {
      panelClass: 'success',
      verticalPosition: 'top',
      duration: 3000
    });
    this.dialogRef.close(this.modifiedProducts);
  }

  increment(item: any, field: 'quantiteRestante' | 'prixVente') {
    item[field]++;
    this.modifiedProducts = this.enRayonList.filter(item => item.quantiteRestante > 0);
  }

  decrement(item: any, field: 'quantiteRestante' | 'prixVente') {
    if (item[field] > 0) {
      item[field]--;
    }
    this.modifiedProducts = this.enRayonList.filter(item => item.quantiteRestante > 0);
  }


}
