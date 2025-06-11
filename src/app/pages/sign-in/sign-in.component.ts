import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router, RouterModule} from '@angular/router';
import {emailValidator, matchingPasswords} from '../../theme/utils/app-validators';
import {MatCardModule} from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {FlexLayoutModule} from '@ngbracket/ngx-layout';
import {AuthService} from "@services/auth.service";
import {MatOptionModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";

@Component({
  selector: 'app-sign-in',
  imports: [
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatOptionModule,
    MatSelectModule,
    FlexLayoutModule
  ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent implements OnInit {

  username: string = '';
  password: string = '';

  loginForm: FormGroup;
  registerForm: FormGroup;

  constructor(public formBuilder: FormBuilder,
              public router: Router,
              private authService: AuthService,
              public snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      'email': ['', Validators.compose([Validators.required, emailValidator])],
      'password': ['', Validators.compose([Validators.required, Validators.minLength(6)])]
    });

    this.registerForm = this.formBuilder.group({
      'firstName': ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      'lastName': ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      'phone': ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      'role': ['', Validators.compose([Validators.required])],
      'email': ['', Validators.compose([Validators.required, emailValidator])],
      'password': ['', Validators.required],
      'confirmPassword': ['', Validators.required]
    }, {validator: matchingPasswords('password', 'confirmPassword')});
  }

  public onLoginFormSubmit(values: Object): void {
    this.username = this.loginForm.get('email')?.value;
    this.password = this.loginForm.get('password')?.value;
    if (this.loginForm.valid) {
      // this.router.navigate(['/']);
      this.authService.login(this.username, this.password).subscribe({
        next: (response) => {
          console.log('Login successful:', response);

          localStorage.setItem('token', response.token);

          this.snackBar.open(response.message, '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000
          });
          // Redirect after 3000 ms
          setTimeout(() => {
            this.router.navigate(['/admin']);
          }, 3000);
        },
        error: (err) => {
          console.log('Login failed:', err);
          this.snackBar.open(err.error.message, '×', {
            panelClass: 'error',
            verticalPosition: 'top',
            duration: 3000
          });
          console.error('Login failed:', err);
        },
      });
    }
  }

  public onRegisterFormSubmit(values: Object): void {
    const a = this.registerForm.get('firstName')?.value + ""
    const b = this.registerForm.get('lastName')?.value + ""
    const c = this.registerForm.get('role')?.value + ""
    const d = this.registerForm.get('phone')?.value + ""
    const e = this.registerForm.get('email')?.value + ""
    const f = this.registerForm.get('password')?.value + ""
    if (this.registerForm.valid) {
      // this.router.navigate(['/']);
      this.authService.registerUser(a, b, c, d, e, f).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.snackBar.open('You registered successfully!', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000
          });
        },
        error: (err) => {
          this.snackBar.open(err.error, '×', {
            panelClass: 'error',
            verticalPosition: 'top',
            duration: 3000
          });
          console.error('Login failed:', err);
        },
      });
    }
  }

}
