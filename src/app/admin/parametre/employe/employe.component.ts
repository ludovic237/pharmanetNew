import {Component, inject, OnInit} from '@angular/core';
import {Settings, SettingsService} from "@services/settings.service";
import {DomHandlerService} from "@services/dom-handler.service";
import {AuthService} from "@services/auth.service";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {MatDialog} from "@angular/material/dialog";
import {UsersService} from "@services/users.service";
import {NgxSpinnerService} from "ngx-spinner";
import {User} from "@models/user.model";
import {ClientDialogComponent} from "../client/client-dialog/client-dialog.component";
import {FlexLayoutModule} from "@ngbracket/ngx-layout";
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatDividerModule} from "@angular/material/divider";
import {MatIconModule} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";
import {NgxPaginationModule} from "ngx-pagination";
import {PipesModule} from "../../../theme/pipes/pipes.module";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatTableModule} from "@angular/material/table";
import {MatMenuModule} from "@angular/material/menu";
import {MatListModule} from "@angular/material/list";
import {MatChipsModule} from "@angular/material/chips";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatExpansionModule} from "@angular/material/expansion";
import {CommonModule, DatePipe} from "@angular/common";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatTabsModule} from "@angular/material/tabs";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {MatStepperModule} from "@angular/material/stepper";
import {MatRadioModule} from "@angular/material/radio";
import {MatPaginator} from "@angular/material/paginator";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {VentesService} from "@services/ventes.service";
import {EnrayonsService} from "@services/enrayons.service";
import {ProductService} from "@services/products.service";
import {PrescripteursService} from "@services/prescripteurs.service";
import {EmployesService} from "@services/employes.service";
import {EmployeDialogComponent} from "./employe-dialog/employe-dialog.component";

@Component({
  selector: 'app-employe',
  providers: [EmployesService, VentesService, EnrayonsService, ProductService, PrescripteursService],
  imports: [
    MatMenuModule,
    MatListModule,
    MatChipsModule,
    MatSlideToggleModule,
    FormsModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatExpansionModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    // Material
    MatToolbarModule,
    MatTabsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    // Material
    MatStepperModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatChipsModule,
    NgxPaginationModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    PipesModule
  ],
  templateUrl: './employe.component.html',
  styleUrl: './employe.component.scss'
})
export class EmployeComponent implements OnInit{

  displayedColumns: string[] = ['id', 'name', 'email', 'telephone', 'actions'];
  users: any[] = [];
  public totalItems: number = 0; // Default to 0 if undefined
  public searchText: string;
  public count: number = 6; // Default to 6 if undefined
  public page: any;
  public settings: Settings;
  domHandlerService = inject(DomHandlerService);

  constructor(
    public authService: AuthService,
    public snackBar: MatSnackBar, public settingsService: SettingsService,
    public dialog: MatDialog,
    public employeService: EmployesService,
    private ngxSpinnerService: NgxSpinnerService) {
    this.settings = this.settingsService.settings;
  }

  ngOnInit() {
    this.getEmployes();
  }

  public getEmployes(): void {
    this.users = null; //for show spinner each time
    this.employeService.getEmployes().subscribe({
      next: (users) => {
        this.users = users
        this.totalItems = users.length;
      },
      error: (err: any) => {
        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
          localStorage.removeItem('token');
          this.snackBar.open('Déconnexion réussie.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
          // Redirect to login page or clear session
          window.location.href = '/sign-in';
        }
        this.users = [];
        this.ngxSpinnerService.hide()
      }
    });
  }

  public addUser(user: User) {
    this.employeService.addEmploye(user).subscribe(user => this.getEmployes());
  }

  public updateUser(user: User) {
    this.employeService.updateEmploye(user).subscribe(user => this.getEmployes());
  }

  // public deleteUser(user:User){
  //   this.employeService.deleteUser(user.id).subscribe(user => this.getUsers());
  // }


  public onPageChanged(event: any) {
    this.page = event;
    this.getEmployes();
    this.domHandlerService.winScroll(0, 0);
  }

  public openEmployeDialog(user: User, type: string) {
    let dialogRef = this.dialog.open(EmployeDialogComponent, {
      data: {
        type: type,
        data: user
      }
    });
    dialogRef.afterClosed().subscribe((user: string) => {
      if (user=='add') {
        this.getEmployes();
        this.snackBar.open('Ajout reussi.', '×', {
          panelClass: 'success',
          verticalPosition: 'top',
          duration: 3000,
        });
      }
      else if (user=='update') {
        this.getEmployes();
        this.snackBar.open('Mise a jour reussi.', '×', {
          panelClass: 'success',
          verticalPosition: 'top',
          duration: 3000,
        });
      }
    });
  }


  deleteUser(userId: number): void {
    this.employeService.deleteEmploye(userId).subscribe({
      next: () => {
        this.users = this.users.filter(user => user.id !== userId);
      },
      error: (err: any) => {
        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
          localStorage.removeItem('token');
          this.snackBar.open('Déconnexion réussie.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
          // Redirect to login page or clear session
          window.location.href = '/sign-in';
        }
        console.error('Error deleting user:', err);
      }
    });
  }

}
