import {Component, inject} from '@angular/core';
import {FlexLayoutModule} from "@ngbracket/ngx-layout";
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatDividerModule} from "@angular/material/divider";
import {MatIconModule} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";
import {NgxPaginationModule} from "ngx-pagination";
import {PipesModule} from "../../../theme/pipes/pipes.module";
import {Settings, SettingsService} from "@services/settings.service";
import {DomHandlerService} from "@services/dom-handler.service";
import {AuthService} from "@services/auth.service";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {MatDialog} from "@angular/material/dialog";
import {UsersService} from "@services/users.service";
import {NgxSpinnerService} from "ngx-spinner";
import {User} from "@models/user.model";
import {UserDialogComponent} from "../../users/user-dialog/user-dialog.component";
import {ClientDialogComponent} from "./client-dialog/client-dialog.component";
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
import {MatTableModule} from "@angular/material/table";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {MatStepperModule} from "@angular/material/stepper";
import {MatRadioModule} from "@angular/material/radio";
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {VentesService} from "@services/ventes.service";
import {EnrayonsService} from "@services/enrayons.service";
import {ProductService} from "@services/products.service";
import {PrescripteursService} from "@services/prescripteurs.service";
import {EmployesService} from "@services/employes.service";
import {EmployeDialogComponent} from "../employe/employe-dialog/employe-dialog.component";

@Component({
  selector: 'app-client',
  providers: [UsersService, EmployesService, VentesService, EnrayonsService, ProductService, PrescripteursService],
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
    PipesModule,
    MatPaginatorModule,
    DatePipe
  ],
  templateUrl: './client.component.html',
  styleUrl: './client.component.scss'
})
export class ClientComponent {

  displayedColumns: string[] = ['id', 'name', 'email', 'telephone', 'role', 'isActive', 'registrationDate', 'actions'];
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
    public usersService: UsersService,
    private ngxSpinnerService: NgxSpinnerService) {
    this.settings = this.settingsService.settings;
  }

  ngOnInit() {
    this.getClients();
  }

  public getClients(): void {
    this.users = null; //for show spinner each time
    this.usersService.getUsers().subscribe({
      next: (users) => {
        this.users = users
        this.totalItems = users.length;
      },
      error: (err: any) => {
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
        this.users = [];
        this.ngxSpinnerService.hide()
      }
    });
  }

  public addUser(user: User) {
    this.usersService.addUser(user).subscribe(user => this.getClients());
  }

  public updateUser(user: User) {
    this.usersService.updateUser(user).subscribe(user => this.getClients());
  }

  // public deleteUser(user:User){
  //   this.usersService.deleteUser(user.id).subscribe(user => this.getUsers());
  // }


  public onPageChanged(event: any) {
    this.page = event;
    this.getClients();
    this.domHandlerService.winScroll(0, 0);
  }

  public openUserDialog(user: User, type: string) {
    let dialogRef = this.dialog.open(ClientDialogComponent, {
      data: {
        type: type,
        data: user
      }
    });
    dialogRef.afterClosed().subscribe((user: string) => {
      if (user == 'add') {
        this.getClients();
        this.snackBar.open('Ajout reussi.', '×', {
          panelClass: 'success',
          verticalPosition: 'top',
          duration: 3000,
        });
      } else if (user == 'update') {
        this.getClients();
        this.snackBar.open('Mise a jour reussi.', '×', {
          panelClass: 'success',
          verticalPosition: 'top',
          duration: 3000,
        });
      }
    });
  }


  deleteUser(userId: number): void {
    this.usersService.deleteUser(userId).subscribe({
      next: () => {
        this.users = this.users.filter(user => user.id !== userId);
      },
      error: (err: any) => {
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
        console.error('Error deleting user:', err);
      }
    });
  }

}
