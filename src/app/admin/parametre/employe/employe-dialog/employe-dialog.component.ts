import {Component, Inject, OnInit} from '@angular/core';
import {AuthService} from "@services/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatTabsModule} from '@angular/material/tabs';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatRadioModule} from '@angular/material/radio';
import {CommonModule, DatePipe} from '@angular/common';
import {MatNativeDateModule} from '@angular/material/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatInputModule} from '@angular/material/input';
import {FlexLayoutModule} from '@ngbracket/ngx-layout';
import {UserContacts, UserProfile, UserSettings, UserSocial, UserWork, User} from "@models/user.model";
import {UsersService} from "@services/users.service";
import {EmployesService} from "@services/employes.service";
import {MatCardModule} from "@angular/material/card";
import {MatSelectModule} from "@angular/material/select";
import {MatToolbarModule} from "@angular/material/toolbar";
import {InputFileModule} from "../../../../theme/components/input-file/input-file.module";


@Component({
  selector: 'app-employe-dialog',
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
    CommonModule,
    InputFileModule
  ],
  templateUrl: './employe-dialog.component.html',
  styleUrl: './employe-dialog.component.scss'
})
export class EmployeDialogComponent implements OnInit {
  public form: FormGroup;
  public passwordHide: boolean = true;
  users:any[]=[]
  title="Nouvelle employe"
  type:any[]=[
    {nom:"Administrateur"},
    {nom:"Caissier"},
    {nom:"Vendeur"},
    {nom:"Gestionnaire"},
  ]

  constructor(
    public authService: AuthService,
    public usersService: UsersService,
    public employesService: EmployesService,
    public snackBar: MatSnackBar, public dialogRef: MatDialogRef<EmployeDialogComponent>,
    public formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public user: any,
    public fb: FormBuilder) {
    this.form = this.formBuilder.group({
      identifiant: [null, Validators.compose([Validators.required, Validators.minLength(4)])],
      password: [null, Validators.maxLength(16)],
      type: ["Administrateur"],
      etat: [null, Validators.maxLength(32)],
      user: [null],
      codebarreId: [null],
      faireReductionMax: [null, Validators.min(0)],
      images: [null],
      id: [0],
    });
  }

  ngOnInit() {
    if (this.user.type=="add"){
      this.title="Nouvelle employe"
    }
    else {
      this.title="Mettre a jour employe"
      this.user.data.user =  this.user.data.user.id;
      this.form.patchValue(this.user.data);
    }
    this.getUsers();
  }

  close(): void {
    this.dialogRef.close();
  }

  public getUsers(): void {
    this.users = null; //for show spinner each time
    this.usersService.getUsers().subscribe({
      next: (users) => {
        this.users = users
        // this.totalItems = users.length;
      },
      error: (err:any) => {
        if (err.status === 401 || err.status === 403){
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
        this.users = [];
      }
    });
  }

  onSubmit(){

    if (this.user.type=="add"){
      this.employesService.updateEmploye(this.form.value).subscribe({
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
      this.employesService.updateEmploye(this.form.value).subscribe({
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
