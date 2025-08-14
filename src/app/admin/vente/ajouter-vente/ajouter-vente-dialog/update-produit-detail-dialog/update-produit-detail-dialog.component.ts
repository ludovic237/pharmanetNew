import {Component, Inject} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatCardModule} from "@angular/material/card";
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatButtonModule} from "@angular/material/button";
import {MatDividerModule} from "@angular/material/divider";
import {MatIconModule} from "@angular/material/icon";
import {MatTableModule} from "@angular/material/table";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {FlexLayoutModule} from "@ngbracket/ngx-layout";
import {EnrayonsService} from "@services/enrayons.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatToolbarModule} from "@angular/material/toolbar";
import {AuthService} from "@services/auth.service";

@Component({
  selector: 'app-update-produit-detail-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatToolbarModule,
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
  templateUrl: './update-produit-detail-dialog.component.html',
  styleUrl: './update-produit-detail-dialog.component.scss'
})
export class UpdateProduitDetailDialogComponent {

  formGroup: FormGroup;

  constructor(
    public authService: AuthService,
    public snackBar: MatSnackBar, public dialogRef: MatDialogRef<UpdateProduitDetailDialogComponent>,
    public enRayonService: EnrayonsService, // Replace with actual service
    @Inject(MAT_DIALOG_DATA) public data: any,
    public fb: FormBuilder,
    public dialog: MatDialog,
    private formBuilder: FormBuilder) {
    this.formGroup = this.formBuilder.group({
      product: ['', Validators.required]
    });
  }

  onSubmit(form: FormGroup) {
    console.log('Valid?', form.valid);
    console.log('product:', form.value.product);
    this.enRayonService.decrementerStock("" + form.value.product, "" + this.data.id).subscribe({
      next: (data) => {

      },
      error: (err:any) => {
        if (err.status === 401 || err.status === 403){
          this.authService.logout();
           localStorage.removeItem('token');
          localStorage.setItem("lastLink",window.location.href);;
          this.snackBar.open('Déconnexion réussie.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
            localStorage.removeItem('token');
          window.location.href = '/sign-in';
        }
        console.error('Error loading clients:', err);
      }
    });
  }

  onReset() {
    this.formGroup.reset();
  }

  onClose() {
    // Add your own closing logic here
    this.dialogRef.close();
  }

}
