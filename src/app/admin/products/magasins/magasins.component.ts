import { Component, OnInit, inject } from '@angular/core';
import {AuthService} from "@services/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import { MatDialog } from '@angular/material/dialog';
// import { Magasin } from '@models/magasin';
import { AppService } from '@services/app.service';
import { DomHandlerService } from '@services/dom-handler.service';
import { Settings, SettingsService } from '@services/settings.service';
import { MagasinDialogComponent } from './magasin-dialog/magasin-dialog.component';
import { ConfirmDialogComponent } from '@shared-components/confirm-dialog/confirm-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { MatIconModule } from '@angular/material/icon';
import { PipesModule } from '../../../theme/pipes/pipes.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import {MagasinService} from "@services/magasins.service";

@Component({
    selector: 'app-magasins',
    imports: [
        FlexLayoutModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
        PipesModule,
        NgxPaginationModule
    ],
    templateUrl: './magasins.component.html',
    styleUrl: './magasins.component.scss'
})
export class MagasinsComponent implements OnInit {
  // public magasins: Magasin[] = [];
  public magasins: any[] = [];
  public page: any;
  public count = 6;
  domHandlerService = inject(DomHandlerService);
  public settings: Settings;
   constructor(
    public authService: AuthService,
    public snackBar:MatSnackBar,public appService: AppService,
              public  magasinsService: MagasinService,
              public dialog: MatDialog, public settingsService: SettingsService) {
    this.settings = this.settingsService.settings;
  }

  ngOnInit(): void {
    this.getMagasins();
  }

  public getMagasins() {
    this.magasinsService.getMagasins().subscribe( {
      next: (data) => {
        this.magasins = data;
        this.count = this.magasins.length
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

  public openMagasinDialog(data: any) {
    let newData = {}
    if (data == null) {
      newData = {
        type: "add"
      }
    } else {
      newData = {
        type: "update",
        category: data,
      }
    }
    const dialogRef = this.dialog.open(MagasinDialogComponent, {
      data: newData,
      panelClass: ['theme-dialog'],
      autoFocus: false,
      direction: (this.settings.rtl) ? 'rtl' : 'ltr'
    });
    dialogRef.afterClosed().subscribe(magasin => {
      if (magasin) {
        const index: number = this.magasins.findIndex(x => x.id == magasin.id);
        if (index !== -1) {
          this.magasins[index] = magasin;
        }
        else {
          let last_category = this.magasins[this.magasins.length - 1];
          magasin.id = last_category.id + 1;
          this.magasins.push(magasin);
        }
      }
      this.getMagasins();
    });
  }

  public remove(magasin: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: {
        title: "Confirm Action",
        message: "Are you sure you want remove this magasin?"
      }
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.magasinsService.deleteMagasin(magasin.id).subscribe({
          next: (data) => {
            const index: number = this.magasins.indexOf(magasin);
            if (index !== -1) {
              this.magasins.splice(index, 1);
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
