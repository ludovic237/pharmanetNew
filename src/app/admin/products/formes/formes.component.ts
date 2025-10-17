import {Component, OnInit, inject} from '@angular/core';
import {MatDialog, MatDialogActions} from '@angular/material/dialog';
// import { Category } from '@models/form';
import {AppService} from '@services/app.service';
import {DomHandlerService} from '@services/dom-handler.service';
import {Settings, SettingsService} from '@services/settings.service';
import {FormeDialogComponent} from './forme-dialog/forme-dialog.component';
import {ConfirmDialogComponent} from '@shared-components/confirm-dialog/confirm-dialog.component';
import {MatCardModule} from '@angular/material/card';
import {FlexLayoutModule} from '@ngbracket/ngx-layout';
import {MatIconModule} from '@angular/material/icon';
import {PipesModule} from '../../../theme/pipes/pipes.module';
import {NgxPaginationModule} from 'ngx-pagination';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {FormeService} from "@services/formes.service";
import {AuthService} from "@services/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {LoaderService} from "@services/loader.service";
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";
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
  selector: 'app-formes',
  imports: [
    MatPaginatorModule,
    FlexLayoutModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    PipesModule,
    NgxPaginationModule,
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
  templateUrl: './formes.component.html',
  styleUrl: './formes.component.scss'
})
export class FormesComponent implements OnInit {
  public formes: any[] = [];
  public formeNom: string = "";
  public totalItems = 0;
  // public formes: Category[] = [];
  public page: number = 1;
  public count = 6;
  domHandlerService = inject(DomHandlerService);
  public settings: Settings;

  constructor(
    public loaderService: LoaderService,
    public authService: AuthService,
    public snackBar: MatSnackBar, public appService: AppService, public formeService: FormeService, public dialog: MatDialog, public settingsService: SettingsService) {
    this.settings = this.settingsService.settings;
  }

  ngOnInit(): void {
    this.getFormes(this.formeNom);
  }

  searchFonction(){
    if (this.formeNom==""){
      this.formeNom=null
    }
    this.getFormes(this.formeNom)
  }

  public getFormes(search:string) {

    this.formeService.getFormesPage(this.page-1,this.count,search).subscribe({
      next: (data:any) => {
        this.formes = data.content;
        this.count = data.pageable.pageSize;
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

  public onPageChanged(event: any) {
    this.page = event.pageIndex+1;
    this.count = event.pageSize;
    this.domHandlerService.winScroll(0, 0);
    this.getFormes(this.formeNom)
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
        form: data,
      }
    }
    const dialogRef = this.dialog.open(FormeDialogComponent, {
      data: newData,
      panelClass: ['theme-dialog'],
      autoFocus: false,
      direction: (this.settings.rtl) ? 'rtl' : 'ltr'
    });
    dialogRef.afterClosed().subscribe(form => {
      if (form) {
        const index: number = this.formes.findIndex(x => x.id == form.id);
        if (index !== -1) {
          this.formes[index] = form;
        } else {
          let last_form = this.formes[this.formes.length - 1];
          form.id = last_form.id + 1;
          this.formes.push(form);
        }
      }
      this.getFormes(this.formeNom);
    });
  }

  public remove(form: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: {
        title: "Confirm Action",
        message: "Are you sure you want remove this form?"
      }
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {

        this.formeService.deleteForme(form.id).subscribe({
          next: (data) => {
            this.getFormes(this.formeNom)

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
