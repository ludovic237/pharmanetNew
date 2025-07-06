import {Component, Inject} from '@angular/core';
import {CommonModule, DecimalPipe} from "@angular/common";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatCardModule} from "@angular/material/card";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatTableModule} from "@angular/material/table";
import {MatTabsModule} from "@angular/material/tabs";
import {RouterModule} from "@angular/router";
import {FlexLayoutModule} from "@ngbracket/ngx-layout";
import {MatChipsModule} from "@angular/material/chips";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatSelectModule} from "@angular/material/select";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {NgxPaginationModule} from "ngx-pagination";
import {PipesModule} from "../../../../theme/pipes/pipes.module";
import {EnrayonsService} from "@services/enrayons.service";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatMenuModule} from "@angular/material/menu";
import {MatListModule} from "@angular/material/list";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatDividerModule} from "@angular/material/divider";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatNativeDateModule} from "@angular/material/core";
import {MatStepperModule} from "@angular/material/stepper";
import {MatRadioModule} from "@angular/material/radio";

@Component({
  selector: 'app-rayon-info-dialog',
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
    MatDatepickerModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatToolbarModule,
    MatTableModule,
    MatTabsModule,
    RouterModule,
    FlexLayoutModule,
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    FormsModule,
    NgxPaginationModule,
    PipesModule,
    DecimalPipe
  ],
  templateUrl: './rayon-info-dialog.component.html',
  styleUrl: './rayon-info-dialog.component.scss'
})
export class RayonInfoDialogComponent {
  detailForm: FormGroup;

  constructor(
    private enRayonService:EnrayonsService,
    private fb: FormBuilder,
    public snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<RayonInfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.detailForm = this.fb.group({
      enRayonId: data?.rayonId,
      prixAchat: [data?.prixAchat || 1172, [Validators.required, Validators.min(0)]],
      prixVente: [data?.prixVente || 1575, [Validators.required, Validators.min(0)]],
      reductionMax: [data?.reductionMax || 10, [Validators.required, Validators.min(0), Validators.max(100)]],
      quantiteRestante: [data?.quantiteStock || 1, [Validators.required, Validators.min(0)]],
      datePeremption: [data?.datePeremption || "2025-08-01", Validators.required]
  });
  }

  ngOnInit(): void {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.detailForm.valid) {
      this.enRayonService.mettreAJourProduitEnRayon(this.detailForm.value).subscribe({
        next: () => {
          this.snackBar.open('Rayon mis a jour.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
          this.dialogRef.close(this.detailForm.value);
        },
        error: (err) => {
          this.snackBar.open('Mise a jour echoue', '×', {
            panelClass: 'error',
            verticalPosition: 'top',
            duration: 3000,
          });
        },
      })

    }
  }

  onSetDefault(): void {
// Logique pour définir par défaut

// Vous pouvez ajouter ici la logique pour sauvegarder comme valeurs par défaut
  }
}

