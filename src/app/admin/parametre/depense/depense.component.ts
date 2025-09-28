import {Component} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
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
import {AuthService} from "@services/auth.service";
import {DepenseService} from "@services/depenses.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {MatPaginatorModule, PageEvent} from "@angular/material/paginator";
import {LoaderService} from "@services/loader.service";

@Component({
  selector: 'app-depense',
  imports: [
    MatDatepickerModule,
    MatNativeDateModule,
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
    FlexLayoutModule,
    MatPaginatorModule
  ],
  templateUrl: './depense.component.html',
  styleUrl: './depense.component.scss'
})
export class DepenseComponent {

  selectedTabIndex: number = 0;

  depenses: any[] = [];
  displayedColumns: string[] = ['id', 'designation', 'quantite', 'prixUnitaire', 'dateEpense', 'actions'];
  depenseForm: FormGroup;

  public pageDepense: number = 1; // Default to 0 if undefined
  public sizeDepense = 5;  // Default to 10 if undefined
  public totalItemsDepense = 0;  // Default to 10 if undefined
  public countDepense = 10;

  constructor(
    public loaderService: LoaderService,
    public authService: AuthService,
    private fb: FormBuilder, private depenseService: DepenseService, private snackBar: MatSnackBar) {
    this.depenseForm = this.fb.group({
      designation: ['', Validators.required],
      quantite: ['', Validators.required],
      dateDepense: ['', Validators.required],
      beneficiaire: ['', Validators.required],
      numeroCni: ['', Validators.required],
      dateDelivrance: ['', Validators.required],
      lieuDelivrance: ['', Validators.required],
      societe: ['', Validators.required],
      typeDepense: ['', Validators.required],
      prixUnitaire: [0, [Validators.required, Validators.min(1)]],
      // dateEpense: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadDepenses();
  }

  loadDepenses(): void {

    this.depenseService.getAllDepensesPageable(this.pageDepense - 1, this.countDepense).subscribe({
      next: (data: any) => {
        this.depenses = data.content
        this.countDepense = data.pageable.pageSize;
        this.totalItemsDepense = data.totalElements;

        this.snackBar.open("Sale refresh success", '×', {
          panelClass: 'success',
          verticalPosition: 'top',
          duration: 3000
        });
      },
      error: (err: any) => {

        this.snackBar.open('Failed to load depenses', '×', {panelClass: 'error', duration: 3000})
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

  createDepense(): void {

    if (this.depenseForm.valid) {

      this.depenseService.createDepense(this.depenseForm.value).subscribe({
        next: () => {
          this.snackBar.open('Depense created successfully', '×', {panelClass: 'success', duration: 3000});
          this.loadDepenses();
          this.depenseForm.reset();
          this.depenseForm.markAsPristine();
          this.depenseForm.markAsUntouched();
          this.depenseForm.updateValueAndValidity();

          // this.depenseForm.;
        },
        error: (err) => {

          this.snackBar.open('Failed to create depense', '×', {panelClass: 'error', duration: 3000})
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

        this.snackBar.open('Failed to delete depense', '×', {panelClass: 'error', duration: 3000})
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

  public onPageChangedDepenses(event: PageEvent) {
    this.pageDepense = event.pageIndex + 1;
    this.countDepense = event.pageSize
    this.loadDepenses();
  }

}
