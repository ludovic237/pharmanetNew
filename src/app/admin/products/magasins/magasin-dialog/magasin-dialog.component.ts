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
import {MagasinService} from "@services/magasins.service";
import {MatToolbarModule} from "@angular/material/toolbar";
import {LoaderService} from "@services/loader.service";


@Component({
  selector: 'app-magasin-dialog',
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
  templateUrl: './magasin-dialog.component.html'
})
export class MagasinDialogComponent implements OnInit {

  title = "Ajouter une magasin"

  public form: FormGroup;

  constructor(
     public loaderService: LoaderService,
    public authService: AuthService,
    public magasinService: MagasinService,
    public snackBar: MatSnackBar, public dialogRef: MatDialogRef<MagasinDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      id: null,
      nom: [null, Validators.required],
      code: [null, Validators.required],
    });
    if (this.data.type == "add") {
      this.title = "Ajouter une magasin"
    } else if (this.data.type == "update") {
      this.title = "Modifier magasin"
    }
    if (this.data.category) {
      this.form.patchValue(this.data.category);
    }
    ;
  }

  public onSubmit() {

    if (this.form.valid) {
      if (this.data.type == "add") {

        this.magasinService.addMagasin(this.form.value).subscribe({
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
            if (err.status === 401 || err.status === 403) {

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
          }
        });
      } else if (this.data.type == "update") {

        this.magasinService.updateMagasin(this.form.value).subscribe({
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
            if (err.status === 401 || err.status === 403) {

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
          }
        });
      }
    }
  }

}
