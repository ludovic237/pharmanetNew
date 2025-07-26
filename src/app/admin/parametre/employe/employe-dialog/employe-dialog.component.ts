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


@Component({
    selector: 'app-employe-dialog',
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
        DatePipe
    ],
    templateUrl: './employe-dialog.component.html',
    styleUrl: './employe-dialog.component.scss'
})
export class EmployeDialogComponent implements OnInit {
  public form: FormGroup;
  public passwordHide:boolean = true;
   constructor(
    public authService: AuthService,
    public snackBar:MatSnackBar,public dialogRef: MatDialogRef<EmployeDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public user: any,
              public fb: FormBuilder) {
    this.form = this.fb.group({
      id: null,
      username: [null, Validators.compose([Validators.required, Validators.minLength(5)])],
      password: [null, Validators.compose([Validators.required, Validators.minLength(6)])],
      profile: this.fb.group({
        name: null,
        surname: null,
        birthday: null,
        gender: null,
        image: null
      }),
      work: this.fb.group({
        company: null,
        position: null,
        salary: null
      }),
      contacts: this.fb.group({
        email: null,
        phone: null,
        address: null
      }),
      social: this.fb.group({
        facebook: null,
        twitter: null,
        google: null
      }),
      settings: this.fb.group({
        isActive: null,
        isDeleted: null,
        registrationDate: null,
        joinedDate: null
      })
    });
  }

  ngOnInit() {
    if(this.user){
      this.form.setValue(this.user);
    }
    else{
      this.user = new User();
      this.user.profile = new UserProfile();
      this.user.work = new UserWork();
      this.user.contacts = new UserContacts();
      this.user.social = new UserSocial();
      this.user.settings = new UserSettings();
    }
  }

  close(): void {
    this.dialogRef.close();
  }

}
