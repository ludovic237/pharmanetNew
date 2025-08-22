import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {MatTabsModule} from "@angular/material/tabs";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatCardModule} from "@angular/material/card";
import {MatDialogModule} from "@angular/material/dialog";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatButtonModule} from "@angular/material/button";
import {MatDividerModule} from "@angular/material/divider";
import {MatIconModule} from "@angular/material/icon";
import {MatTableModule} from "@angular/material/table";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {FlexLayoutModule} from "@ngbracket/ngx-layout";
import {DepenseService} from "@services/depenses.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AuthService} from "@services/auth.service";
import {LoaderService} from "@services/loader.service";

@Component({
  selector: 'app-depense-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatToolbarModule,
    MatCardModule,
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
  templateUrl: './depense-dialog.component.html',
  styleUrl: './depense-dialog.component.scss'
})

export class DepenseDialogComponent implements OnInit {
  selectedTabIndex: number = 0;
  depenses: any[] = [];
  displayedColumns: string[] = ['id', 'designation', 'quantite', 'prixUnitaire', 'dateEpense', 'actions'];
  depenseForm: FormGroup;

  constructor(
    public loaderService: LoaderService,
    public authService: AuthService,
    public snackBar: MatSnackBar, private fb: FormBuilder, private depenseService: DepenseService) {
    this.depenseForm = this.fb.group({
      designation: ['', Validators.required],
      // quantite: [0, [Validators.required, Validators.min(1)]],
      prixUnitaire: [0, [Validators.required, Validators.min(1)]],
      // dateEpense: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadDepenses();
  }

  loadDepenses(): void {

    this.depenseService.getAllDepenses().subscribe({
      next: (data) => {
        this.depenses = data

      },
      error: () => {

        this.snackBar.open('Failed to load depenses', '×', {panelClass: 'error', duration: 3000})
      }
    });
  }

  createDepense(): void {
    if (this.depenseForm.valid) {

      this.depenseService.createDepense(this.depenseForm.value).subscribe({
        next: () => {
          this.snackBar.open('Depense created successfully', '×', {panelClass: 'success', duration: 3000});
          this.loadDepenses();
          this.depenseForm.reset();

        },
        error: (err) => {

          if (err.status === 401 || err.status === 403) {
            this.authService.logout();
            this.snackBar.open('Déconnexion réussie.', '×', {
              panelClass: 'success',
              verticalPosition: 'top',
              duration: 3000,
            });
            // Redirect to login page or clear session
            window.location.href = '/sign-in';
          }

        }
      });
    }
  }

  deleteDepense(id: number): void {

    this.depenseService.deleteDepense(id).subscribe({
      next: () => {
        this.snackBar.open('Depense deleted successfully', '×', {panelClass: 'success', duration: 3000});
        this.loadDepenses();

      },
      error: (err) => {

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
        // this.snackBar.open('Failed to delete depense', '×', {panelClass: 'error', duration: 3000})
      }
    });
  }
}
