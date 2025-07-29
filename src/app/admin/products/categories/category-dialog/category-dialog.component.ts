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
import {CategorieService} from "@services/categories.service";
import {MatToolbarModule} from "@angular/material/toolbar";

@Component({
  selector: 'app-category-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatToolbarModule,
    FlexLayoutModule
  ],
  templateUrl: './category-dialog.component.html'
})
export class CategoryDialogComponent implements OnInit {

  title = "Ajouter une forme"

  public form: FormGroup;

  constructor(
    public authService: AuthService,
    public categorieService: CategorieService,
    public snackBar: MatSnackBar, public dialogRef: MatDialogRef<CategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public fb: FormBuilder) {
  }

  ngOnInit(): void {

    this.form = this.fb.group({
      id: null,
      nom: [null, Validators.required],
      // hasSubCategory: false,
      // parentId: 0
    });
    if (this.data.type == "add") {
      this.title = "Ajouter une forme"
    } else if (this.data.type == "update") {
      this.title = "Modifier forme"
    }
    if (this.data.category) {
      this.form.patchValue(this.data.category);
    };
    console.log(this.form)
    console.log(this.data)
  }

  public onSubmit() {
    console.log(this.form.value);
    if (this.form.valid) {
      if (this.data.type == "add") {

        this.categorieService.addCategorie(this.form.value).subscribe({
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
      }
      else if (this.data.type == "update") {
        this.categorieService.updateCategorie(this.form.value).subscribe({
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
      // this.dialogRef.close(this.form.value);
    }
  }

}
