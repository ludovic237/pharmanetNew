import {Component, OnInit, inject} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
// import { Rayon } from '@models/rayon';
import {AppService} from '@services/app.service';
import {DomHandlerService} from '@services/dom-handler.service';
import {Settings, SettingsService} from '@services/settings.service';
import {RayonDialogComponent} from './rayon-dialog/rayon-dialog.component';
import {ConfirmDialogComponent} from '@shared-components/confirm-dialog/confirm-dialog.component';
import {MatCardModule} from '@angular/material/card';
import {FlexLayoutModule} from '@ngbracket/ngx-layout';
import {MatIconModule} from '@angular/material/icon';
import {PipesModule} from '../../../theme/pipes/pipes.module';
import {NgxPaginationModule} from 'ngx-pagination';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {RayonService} from "@services/rayons.service";
import {Rayon} from "@models/product";

import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AuthService} from "@services/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {LoaderService} from "@services/loader.service";
import {MatPaginatorModule, PageEvent} from "@angular/material/paginator";

@Component({
  selector: 'app-rayons',
  imports: [
    MatPaginatorModule,
    ReactiveFormsModule,
    FormsModule,
    FlexLayoutModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    PipesModule,
    NgxPaginationModule
],
  templateUrl: './rayons.component.html',
  styleUrl: './rayons.component.scss'
})
export class RayonsComponent implements OnInit {
  public rayons: any[] = [];
  // public rayons: any[] = [];
  public page: number = 1;
  public totalItems: number = 0;
  public count = 10;
  domHandlerService = inject(DomHandlerService);
  public settings: Settings;

  constructor(
    public loaderService: LoaderService,
    public authService: AuthService,
    public snackBar: MatSnackBar,
    public appService: AppService,
    public rayonService: RayonService,
    public dialog: MatDialog, public settingsService: SettingsService) {
    this.settings = this.settingsService.settings;
  }

  ngOnInit(): void {
    this.getRayons();
  }

  public getRayons() {

    this.rayonService.getRayonsPage(this.page-1,this.count).subscribe({
      next: (data:any) => {
        this.rayons = data.content;
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

  public onPageChanged(event: PageEvent) {
    this.page = event.pageIndex+1;
    this.count = event.pageSize;
    this.domHandlerService.winScroll(0, 0);
    this.getRayons()
  }

  public openRayonDialog(data: any) {
    const dialogRef = this.dialog.open(RayonDialogComponent, {
      data: data,
      panelClass: ['theme-dialog'],
      autoFocus: false,
      direction: (this.settings.rtl) ? 'rtl' : 'ltr'
    });
    dialogRef.afterClosed().subscribe(rayon => {
      this.getRayons();
    });
  }

  public remove(rayon: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: {
        title: "Confirm Action",
        message: "Are you sure you want remove this rayon?"
      }
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.rayonService.deleteRayon(rayon.id).subscribe({
          next: (data) => {
            this.getRayons()

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
