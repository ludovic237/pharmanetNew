import {Component, Inject, OnInit} from '@angular/core';
import {AuthService} from "@services/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {FlexLayoutModule} from '@ngbracket/ngx-layout';
import {FormeService} from "@services/formes.service";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatToolbarModule} from "@angular/material/toolbar";
import {LoaderService} from "@services/loader.service";
import {TranslateModule} from "@ngx-translate/core";

@Component({
  selector: 'app-forme-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatButtonModule,
    MatToolbarModule,
    FlexLayoutModule,
    TranslateModule
  ],
  templateUrl: './forme-dialog.component.html'
})
export class FormeDialogComponent implements OnInit {

  title = "Ajouter une forme"

  public form: FormGroup;

  constructor(
     public loaderService: LoaderService,
    public authService: AuthService,
    public formeService: FormeService,
    public snackBar: MatSnackBar, public dialogRef: MatDialogRef<FormeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      id: null,
      nom: [null, Validators.required],
    });
    if (this.data.type == "add") {
      this.title = "Ajouter une forme"
    } else if (this.data.type == "update") {
      this.title = "Modifier forme"
    }

    if (this.data.form) {
      this.form.patchValue(this.data.form);
    }
    ;

  }

  public onSubmit() {
    // console.log(this.form.value);
    if (this.form.valid) {
      if (this.data.type == "add") {

        this.formeService.addForme(this.form.value).subscribe({
          next: (data: any) => {
            // this.caisses = data.content;
            this.snackBar.open(`Ajout reussi`, '×', {
              panelClass: 'success',
              verticalPosition: 'top',
              duration: 3000,
            });
            this.dialogRef.close();

          },
          error: (err) => {
            console.error('Error applying filters:', err);
            this.snackBar.open('Déconnexion réussie.', '×', {
              panelClass: 'success',
              verticalPosition: 'top',
              duration: 3000,
            });

          }
        });
      } else if (this.data.type == "update") {

        this.formeService.updateForme(this.form.value).subscribe({
          next: (data: any) => {
            this.snackBar.open(`Mise a jour reussi`, '×', {
              panelClass: 'success',
              verticalPosition: 'top',
              duration: 3000,
            });
            this.dialogRef.close();

          },
          error: (err) => {
            console.error('Error applying filters:', err);
            this.snackBar.open('Déconnexion réussie.', '×', {
              panelClass: 'success',
              verticalPosition: 'top',
              duration: 3000,
            });

          }
        });
      }
    }
  }

}
