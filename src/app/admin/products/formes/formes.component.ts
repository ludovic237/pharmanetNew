import {Component, OnInit, inject} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
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
import {MatPaginatorModule} from "@angular/material/paginator";

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
    NgxPaginationModule
  ],
  templateUrl: './formes.component.html',
  styleUrl: './formes.component.scss'
})
export class FormesComponent implements OnInit {
  public formes: any[] = [];
  public totalItems = 0;
  // public formes: Category[] = [];
  public page: any;
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
    this.getFormes();
  }

  public getFormes() {

    this.formeService.getFormesPage(this.page-1,this.count).subscribe({
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
    this.getFormes()
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
      this.getFormes();
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
            this.getFormes()

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
