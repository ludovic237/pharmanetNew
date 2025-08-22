import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
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
import {Settings, SettingsService} from "@services/settings.service";
import {
  UpdateProduitDetailDialogComponent
} from "./update-produit-detail-dialog/update-produit-detail-dialog.component";
import {MatToolbarModule} from "@angular/material/toolbar";
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
    MatToolbarModule,
    MatAutocompleteModule,
    FlexLayoutModule
  ],
  templateUrl: './ajouter-vente-dialog.component.html',
  styleUrl: './ajouter-vente-dialog.component.scss'
})
export class AjouterVenteDialogComponent implements OnInit {

  type = "detail"
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
  public settings: Settings;

  constructor(
     public loaderService: LoaderService,
    public authService: AuthService,
    public snackBar: MatSnackBar, public dialogRef: MatDialogRef<AjouterVenteDialogComponent>,
    public enRayonService: EnrayonsService, // Replace with actual service
    @Inject(MAT_DIALOG_DATA) public data: any,
    public fb: FormBuilder,
    public dialog: MatDialog,
    public settingsService: SettingsService) {
    this.settings = this.settingsService.settings;
  }

  ngOnInit(): void {
    this.type = this.data.type;
    this.form = this.fb.group({
      id: 0,
      name: [null, Validators.required],
      hasSubCategory: false,
      parentId: 0
    });

    this.enRayonList = this.data.enRayonList.map((item: any) => ({
      ...item,
      quantiteRestante: 0,
      quantiteStock: item.quantiteRestante,
      prixVente: item.prixVente
    }));
  }

  public onSubmit() {
    console.log(this.form.value);
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
    console.log("this.modifiedProducts")
    console.log(this.modifiedProducts)
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

  currentDate = new Date();

  isExpired(datePeremption: Date): boolean {
    return new Date(datePeremption) < this.currentDate;
  }

  isExpiringSoon(datePeremption: Date): boolean {
    const diffInDays = (new Date(datePeremption).getTime() - this.currentDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays > 0 && diffInDays <= 90;
  }

  isValid(datePeremption: Date): boolean {
    const diffInDays = (new Date(datePeremption).getTime() - this.currentDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays > 90;
  }

  augmenterDetail() {
    const dialogRef = this.dialog.open(UpdateProduitDetailDialogComponent, {
      data: {
        id: this.data.id
      },
      maxWidth: "400px",
      // width: "80%",
      panelClass: ['theme-dialog'],
      autoFocus: false,
      direction: (this.settings.rtl) ? 'rtl' : 'ltr'
    });
    dialogRef.afterClosed().subscribe((modifiedProducts: any[]) => {

    });
  }

  getDaysToExpiration(datePeremtion: any) {
    const today = new Date();
    const expirationDate = new Date(datePeremtion)
    const diff = expirationDate.getTime() - today.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  getDaysAfterExpiration(datePeremtion: any) {
    const today = new Date();
    const expirationDate = new Date(datePeremtion)
    if (today <= expirationDate) {
      return 0
    }
    const diff = today.getTime() - expirationDate.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }
}
