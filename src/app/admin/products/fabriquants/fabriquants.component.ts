import {Component, OnInit, inject} from '@angular/core';
import {AuthService} from "@services/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDialog, MatDialogActions} from '@angular/material/dialog';
import {Category} from '@models/category';
import {AppService} from '@services/app.service';
import {DomHandlerService} from '@services/dom-handler.service';
import {Settings, SettingsService} from '@services/settings.service';
import {FabriquantDialogComponent} from './fabriquant-dialog/fabriquant-dialog.component';
import {ConfirmDialogComponent} from '@shared-components/confirm-dialog/confirm-dialog.component';
import {MatCardModule} from '@angular/material/card';
import {FlexLayoutModule} from '@ngbracket/ngx-layout';
import {MatIconModule} from '@angular/material/icon';
import {PipesModule} from '../../../theme/pipes/pipes.module';
import {NgxPaginationModule} from 'ngx-pagination';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {FabriquantService} from "@services/fabriquants.service";
import {Fabriquant} from "@models/product";
import {LoaderService} from "@services/loader.service";
import {MatPaginator, MatPaginatorModule, PageEvent} from "@angular/material/paginator";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatRadioButton, MatRadioGroup, MatRadioModule} from "@angular/material/radio";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatAccordion, MatExpansionModule} from "@angular/material/expansion";
import {CommonModule} from "@angular/common";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatTabsModule} from "@angular/material/tabs";
import {MatTableModule} from "@angular/material/table";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";


@Component({
  selector: 'app-fabriquants',
  imports: [
    MatFormFieldModule,
    MatAutocompleteModule,
    FlexLayoutModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    PipesModule,
    NgxPaginationModule,
    MatPaginatorModule,
    MatRadioModule,
    MatSlideToggleModule,
    FormsModule,
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
    MatCheckboxModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    FlexLayoutModule,
    MatPaginator
],
  templateUrl: './fabriquants.component.html',
  styleUrl: './fabriquants.component.scss'
})
export class FabriquantsComponent implements OnInit {
  public fabriquants: any[] = [];
  public fabriquantNom: string = "";
  // public fabriquants: Fabriquant[] = [];
  public page: number = 1;
  public totalItems = 0;
  public count = 10;
  domHandlerService = inject(DomHandlerService);
  public settings: Settings;

  constructor(
    public loaderService: LoaderService,
    public authService: AuthService,
    public snackBar: MatSnackBar, public appService: AppService,
    public fabriquantService: FabriquantService, public dialog: MatDialog, public settingsService: SettingsService) {
    this.settings = this.settingsService.settings;
  }

  ngOnInit(): void {
    this.getFabriquants(null);
  }

  searchFonction(){
    if (this.fabriquantNom==""){
      this.fabriquantNom=null
    }
    this.getFabriquants(this.fabriquantNom)
  }

  public getFabriquants(search:string) {

    this.fabriquantService.getFabriquantsPage(this.page - 1, this.count, search).subscribe({
      next: (data: any) => {
        this.fabriquants = data.content;
        this.count = data.pageSize;
        this.totalItems = data.totalElements;

      },
      error: (err) => {

        console.error('Error  subscription:', err);
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

  public onPageChanged(event: PageEvent) {
    this.page = event.pageIndex+1;
    this.count = event.pageSize;
    this.domHandlerService.winScroll(0, 0);
    this.getFabriquants(this.fabriquantNom)
  }

  public openCategoryDialog(data: any) {
    let newData = {}
    if (data == null) {
      newData = {
        type: "add"
      }
    } else {
      newData = {
        type: "update",
        fabriquant: data,
      }
    }
    const dialogRef = this.dialog.open(FabriquantDialogComponent, {
      data: newData,
      panelClass: ['theme-dialog'],
      autoFocus: false,
      direction: (this.settings.rtl) ? 'rtl' : 'ltr'
    });
    dialogRef.afterClosed().subscribe(category => {
      if (category) {
        const index: number = this.fabriquants.findIndex(x => x.id == category.id);
        if (index !== -1) {
          this.fabriquants[index] = category;
        } else {
          let last_category = this.fabriquants[this.fabriquants.length - 1];
          category.id = last_category.id + 1;
          this.fabriquants.push(category);
        }
      }
      this.getFabriquants(null);
    });
  }

  public remove(category: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: {
        title: "Confirm Action",
        message: "Are you sure you want remove this category?"
      }
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {

        this.fabriquantService.deleteFabriquant(category.id).subscribe({
          next: (data) => {
            this.getFabriquants(null)

          },
          error: (err) => {

            console.error('Error  subscription:', err);
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
    });
  }

}
