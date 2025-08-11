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

@Component({
  selector: 'app-formes',
  imports: [
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
  // public formes: Category[] = [];
  public page: any;
  public count = 6;
  domHandlerService = inject(DomHandlerService);
  public settings: Settings;

  constructor(
    public authService: AuthService,
    public snackBar: MatSnackBar, public appService: AppService, public formeService: FormeService, public dialog: MatDialog, public settingsService: SettingsService) {
    this.settings = this.settingsService.settings;
  }

  ngOnInit(): void {
    this.getFormes();
  }

  public getFormes() {
    this.formeService.getFormes().subscribe({
      next: (data) => {
        this.formes = data;
        this.count = this.formes.length
      },
      error: (err) => {
        console.error('Error  subscription:', err);
        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
           localStorage.removeItem('token');
          localStorage.setItem("lastLink",window.location.href);;
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

  public onPageChanged(event: any) {
    this.page = event;
    this.domHandlerService.winScroll(0, 0);
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
            const index: number = this.formes.indexOf(form);
            if (index !== -1) {
              this.formes.splice(index, 1);
            }
          },
          error: (err) => {
            console.error('Error  subscription:', err);
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
    });
  }

}
