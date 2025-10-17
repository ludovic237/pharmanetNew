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
import {AppSettingsService} from "@services/app-settings.service";
import {MatDividerModule} from "@angular/material/divider";
import {TranslateModule} from "@ngx-translate/core";

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
    MatDividerModule,
    FlexLayoutModule,
    TranslateModule
  ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent implements OnInit {

  username: string = '';
  password: string = '';
  codebarre: string = '';

  loginForm: FormGroup;
  registerForm: FormGroup;
  codebarreForm: FormGroup;

  constructor(
    public authService: AuthService,
    public appSettingsService: AppSettingsService,
    public snackBar: MatSnackBar, public formBuilder: FormBuilder,
    public router: Router) {
  }

  ngOnInit() {
    this.authService.checkSession().subscribe({
      next: (response) => {
        this.snackBar.open('You registered successfully!', '×', {
          panelClass: 'success',
          verticalPosition: 'top',
          duration: 3000
        });
      },
      error: (err) => {
        // if (err.status === 401 || err.status === 403) {
        //   this.authService.logout();
        //   this.snackBar.open('Déconnexion réussie.', '×', {
        //     panelClass: 'success',
        //     verticalPosition: 'top',
        //     duration: 3000,
        //   });
        //   // Redirect to login page or clear session
        //   window.location.href = '/sign-in';
        // }
      },
    });

    this.codebarreForm = this.formBuilder.group({
      // 'email': ['', Validators.compose([Validators.required, emailValidator])],
      'codebarre': ['', Validators.compose([Validators.required, , Validators.minLength(2)])],
    });
    this.loginForm = this.formBuilder.group({
      // 'email': ['', Validators.compose([Validators.required, emailValidator])],
      'email': ['', Validators.compose([Validators.required, , Validators.minLength(2)])],
      'password': ['', Validators.compose([Validators.required, Validators.minLength(2)])]
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
          localStorage.setItem('token', response.token);
          localStorage.setItem('nom', response.nom);
          localStorage.setItem('role', response.role);
          this.appSettingsService.loadSetting().subscribe({
            next: (data: any[]) => {
              data.forEach(item => {
                localStorage.setItem(item.keyName, item.value);
              });
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
            error: (err: any) => {
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
            },
          })
        },
        error: (err) => {
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

  public codebarreFormSubmit(values: Object): void {
    this.codebarre = this.codebarreForm.get('codebarre')?.value;
    // console.log("this.codebarre");
    // console.log(this.codebarre);
    if (this.codebarreForm.valid) {
      // this.router.navigate(['/']);
      this.authService.loginCodebarre(this.codebarre).subscribe({
        next: (response) => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('nom', response.nom);
          localStorage.setItem('role', response.role);
          this.appSettingsService.loadSetting().subscribe({
            next: (data: any[]) => {
              data.forEach(item => {
                localStorage.setItem(item.keyName, item.value);
              });
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
            error: (err: any) => {
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
            },
          })
        },
        error: (err) => {
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
