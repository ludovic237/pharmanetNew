import { Component, Inject, OnInit } from '@angular/core';
import {AuthService} from "@services/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';
import { DatePipe } from '@angular/common';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import {UserContacts, UserProfile, UserSettings, UserSocial, UserWork, User} from "@models/user.model";
import {UsersService} from "@services/users.service";
import {EmployesService} from "@services/employes.service";
import {MatCardModule} from "@angular/material/card";
import {MatSelectModule} from "@angular/material/select";
import {MatToolbarModule} from "@angular/material/toolbar";
import {InputFileModule} from "../../../../theme/components/input-file/input-file.module";
import {LoaderService} from "@services/loader.service";

@Component({
    selector: 'app-client-dialog',
  providers:[UsersService,EmployesService,AuthService],
    imports: [
    ReactiveFormsModule,
    FlexLayoutModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatCardModule,
    MatSelectModule,
    MatToolbarModule,
    InputFileModule
],
    templateUrl: './client-dialog.component.html',
    styleUrl: './client-dialog.component.scss'
})
export class ClientDialogComponent implements OnInit {
  public form: FormGroup;
  public passwordHide: boolean = true;
  users:any[]=[]
  title="Nouvelle employe"

  constructor(
     public loaderService: LoaderService,
    public authService: AuthService,
    public usersService: UsersService,
    public snackBar: MatSnackBar, public dialogRef: MatDialogRef<ClientDialogComponent>,
    public formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public user: any,
    public fb: FormBuilder) {
    this.form = this.formBuilder.group({
      nom: [null, Validators.compose([Validators.required, Validators.minLength(4)])],
      prenom: [null, Validators.compose([Validators.required, Validators.minLength(4)])],
      email: [null, Validators.compose([Validators.required, Validators.minLength(4)])],
      fonction: [null, Validators.compose([Validators.required, Validators.minLength(4)])],
      reduction: [null, Validators.compose([Validators.required, Validators.minLength(4)])],
      reductionMax: [null, Validators.compose([Validators.required, Validators.minLength(4)])],
      reductionFait: [null, Validators.compose([Validators.required, Validators.minLength(4)])],
      images: [null],
      id: [0],
    });
  }

  ngOnInit() {
    if (this.user.type=="add"){
      this.title="Nouvelle utilisateur"
    }
    else {
      this.title="Mettre a jour utilisateur"
      this.form.patchValue(this.user.data);
    }
    // this.getUsers();
  }

  close(): void {
    this.dialogRef.close();
  }

  onSubmit(){

    if (this.user.type=="add"){

      this.usersService.updateUser(this.form.value).subscribe({
        next: (users) => {
          this.dialogRef.close("add");

        },
        error: (err:any) => {

          if (err.status === 401 || err.status === 403){
            this.authService.logout();
            this.snackBar.open('Déconnexion réussie.', '×', {
              panelClass: 'success',
              verticalPosition: 'top',
              duration: 3000,
            });
            // Redirect to login page or clear session
            window.location.href = '/sign-in';
          }
          this.users = [];
        }
      });
    }
    else {

      this.usersService.updateUser(this.form.value).subscribe({
        next: (users) => {
          this.dialogRef.close("update");

        },
        error: (err:any) => {

          if (err.status === 401 || err.status === 403){
            this.authService.logout();
            this.snackBar.open('Déconnexion réussie.', '×', {
              panelClass: 'success',
              verticalPosition: 'top',
              duration: 3000,
            });
            // Redirect to login page or clear session
            window.location.href = '/sign-in';
          }
          this.users = [];
        }
      });
    }
  }

}
