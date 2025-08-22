import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatRadioModule} from "@angular/material/radio";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
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
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatButtonModule} from "@angular/material/button";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {FlexLayoutModule} from "@ngbracket/ngx-layout";
import {MatGridListModule} from "@angular/material/grid-list";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AuthService} from "@services/auth.service";
import {LoaderService} from "@services/loader.service";

@Component({
  selector: 'app-gestion-caisse-dialog',
  imports: [
    MatGridListModule,
    MatRadioModule,
    MatSlideToggleModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatExpansionModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    // Material
    MatDialogModule,
    MatToolbarModule,
    MatTabsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatTableModule,
    MatCardModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    FlexLayoutModule
  ],
  templateUrl: './gestion-caisse-dialog.component.html',
  styleUrl: './gestion-caisse-dialog.component.scss'
})
export class GestionCaisseDialogComponent {

  caisseForm: FormGroup;
  totalPieces: number = 0;
  totalBillets: number = 0;
  totalAutres: number = 0;
  totalFond: number = 0;

   constructor(
     public loaderService: LoaderService,
    public authService: AuthService,
    public snackBar:MatSnackBar,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<GestionCaisseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.caisseForm = this.fb.group({
      session: ['', Validators.required],
      pieces: this.fb.group({
        piece500: [0, [Validators.min(0)]],
        piece100: [0, [Validators.min(0)]],
        piece50: [0, [Validators.min(0)]],
        piece25: [0, [Validators.min(0)]],
        piece10: [0, [Validators.min(0)]],
      }),
      billets: this.fb.group({
        billet10000: [0, [Validators.min(0)]],
        billet5000: [0, [Validators.min(0)]],
        billet2000: [0, [Validators.min(0)]],
        billet1000: [0, [Validators.min(0)]],
        billet500: [0, [Validators.min(0)]],
      }),
      autres: this.fb.group({
        electronique: [0, [Validators.min(0)]],
        ticket: [0, [Validators.min(0)]],
      }),
    });

    this.calculateTotals();
  }

  calculateTotals(): void {
    const pieces = this.caisseForm.get('pieces')?.value || {};
    const billets = this.caisseForm.get('billets')?.value || {};
    const autres = this.caisseForm.get('autres')?.value || {};

    this.totalPieces = (pieces.piece500 * 500) +
      (pieces.piece100 * 100) +
      (pieces.piece50 * 50) +
      (pieces.piece25 * 25) +
      (pieces.piece10 * 10);

    this.totalBillets = (billets.billet10000 * 10000) +
      (billets.billet5000 * 5000) +
      (billets.billet2000 * 2000) +
      (billets.billet1000 * 1000) +
      (billets.billet500 * 500);

    this.totalAutres = (autres.electronique ) +
      (autres.ticket);

    this.totalFond = this.totalPieces + this.totalBillets+this.totalAutres;
  }

  onValidate(): void {

    const formData = this.caisseForm.value;
    const concatenatedValues = [
      formData.session,
      ...Object.values(formData.pieces),
      ...Object.values(formData.billets)
    ].join("-");
    console.log(concatenatedValues);
    const reversedValues = concatenatedValues.split("-");
    const firstFiveReversed = reversedValues.slice(0, 5).reverse();
    const lastFiveReversed = reversedValues.slice(-5).reverse();
    const middleValues = reversedValues.slice(5, -5);

    const finalResult = [...firstFiveReversed, ...middleValues, ...lastFiveReversed].join("-");
    let result = {}
    if (this.data.type === 'open') {
      result = {
        ouvertureCaisse: finalResult.replace('--', "-"),
        fondCaisse: this.totalFond
      }
      this.caisseForm.get('autres')?.reset();
    }
    else if (this.data.type === "close" || this.data.type === "") {
      const autres = this.caisseForm.get('autres')?.value || {};
      result = {
        fermetureCaisse: finalResult.replace('--', "-")+"|"+autres.electronique+"|"+autres.ticket,
        fondCaisse: this.totalFond
      }
    }

    console.log("result");
    console.log(result);
    console.log(this.data);
    this.dialogRef.close({
        type: this.data.type,
        action: 'validate',
        data: result
      }
    );

  }

  onClose(): void {
    this.dialogRef.close({action: 'close'});
  }

}
