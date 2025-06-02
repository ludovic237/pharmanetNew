import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {User, UserContacts, UserProfile, UserSettings, UserSocial, UserWork} from '../../../common/models/user.model';
import {MatTabsModule} from '@angular/material/tabs';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatRadioModule} from '@angular/material/radio';
import {DatePipe} from '@angular/common';
import {MatNativeDateModule, MatOptionModule} from '@angular/material/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatInputModule} from '@angular/material/input';
import {FlexLayoutModule} from '@ngbracket/ngx-layout';
import {AuthService} from "@services/auth.service";
import {UserNew} from "../../../model/data";
import {MatSnackBar} from "@angular/material/snack-bar";
import {UsersService} from "@services/users.service";
import {UserService} from "@services/user.service";
import {MatSelectModule} from "@angular/material/select";
import {HoustingUnitService} from "@services/housting-unit.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-user-new-dialog',
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
    MatOptionModule,
    MatSelectModule,
    DatePipe
  ],
  templateUrl: './user-new-dialog.component.html',
  styleUrl: './user-new-dialog.component.scss'
})
export class UserNewDialogComponent implements OnInit {
  public form: FormGroup;
  public passwordHide: boolean = true;

 constructor(
   public router: Router,
   public snackBar: MatSnackBar,
   public dialogRef: MatDialogRef<UserNewDialogComponent>,
   public housingUnitService: HoustingUnitService,
   public authService: AuthService,
   public userService: UserService,
   @Inject(MAT_DIALOG_DATA) public user: UserNew,
   public fb: FormBuilder) {
   this.form = this.fb.group({
     id: null,
     role: [null, Validators.compose([Validators.required])],
     username: [null, Validators.compose([Validators.required, Validators.minLength(5)])],
     password: [null, Validators.compose([Validators.required, Validators.minLength(6)])],
     profile: this.fb.group({
       name: [null, Validators.required],
       surname: [null, Validators.required],
       birthday: [new Date()],
       gender: [null, Validators.required],
       image: null
     }),
     work: this.fb.group({
       company: null,
       position: null,
       salary: [0]
     }),
     contacts: this.fb.group({
       email: [null, Validators.compose([Validators.required, Validators.email])],
       phone: null,
       address: null
     }),
     social: this.fb.group({
       facebook: null,
       twitter: null,
       google: null
     }),
     settings: this.fb.group({
       isActive: [true],
       isDeleted: [false],
       registrationDate: [new Date()],
       joinedDate: [new Date()]
     })
   });
 }

  ngOnInit() {
    console.log(this.user)
    if (this.user) {
      this.form.patchValue({
        id: this.user.id,
        role: this.user.role,
        username: this.user.username,
        password: this.user.password,
        profile: {
          name: this.user.firstName,
          surname: this.user.lastName,
          birthday: this.user.birthday,
          gender: this.user.gender,
          image: this.user.image
        },
        work: {

        },
        contacts: {
          email: this.user.email,
          phone: this.user.phone,

        },
        social: {

        },
        settings: {
          isActive: this.user.isActive,
          isDeleted: this.user.isDeleted,
          registrationDate: this.user.registrationDate,
          joinedDate: this.user.joinedDate
        }
      });
    } else {
      this.user = new UserNew();
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  public gethousingUnits() {
    this.housingUnitService.gethousingUnits().subscribe(data => {
    });
  }

  saveData(): void {
    if (this.form.valid) {
      const formData = this.form.value;

      const user: UserNew = {
        id: formData.id,
        username: formData.username,
        password: formData.password,
        firstName: formData.profile.name,
        lastName: formData.profile.surname,
        birthday: formData.profile.birthday,
        gender: formData.profile.gender,
        image: formData.profile.image,
        email: formData.contacts.email,
        phone: formData.contacts.phone,
        role: formData.role,
        isActive: formData.settings.isActive,
        isDeleted: formData.settings.isDeleted,
        registrationDate: formData.settings.registrationDate,
        joinedDate: formData.settings.joinedDate,
      };

      if (user.id) {
        // Update user
        this.userService.updateUser(user.id, user).subscribe({
          next: (data) => {
            console.log('User updated successfully:', data);
            this.snackBar.open('User updated successfully!', '×', {
              panelClass: 'success',
              verticalPosition: 'top',
              duration: 3000
            });
            this.dialogRef.close();
          },
          error: (err) => {
            console.error('Error updating user:', err);
            this.snackBar.open('Failed to update user.', '×', {
              panelClass: 'error',
              verticalPosition: 'top',
              duration: 3000
            });
            if (err.status=="403"){
              this.router.navigate(['/sign-in']); // Redirect to login if not authenticated
            }
          }
        });
      }
      else {
        // Create user
        this.userService.addUser(user).subscribe({
          next: (data) => {
            console.log('User created successfully:', data);
            this.snackBar.open('User created successfully!', '×', {
              panelClass: 'success',
              verticalPosition: 'top',
              duration: 3000
            });
            this.dialogRef.close();
          },
          error: (err) => {
            console.error('Error creating user:', err);
            this.snackBar.open('Failed to create user.', '×', {
              panelClass: 'error',
              verticalPosition: 'top',
              duration: 3000
            });
            if (err.status=="403"){
              this.router.navigate(['/sign-in']); // Redirect to login if not authenticated
            }
          }
        });
      }
    } else {
      this.snackBar.open('Please fill out the form correctly.', '×', {
        panelClass: 'error',
        verticalPosition: 'top',
        duration: 3000
      });
    }
  }

}
