import {Component, OnInit, inject} from '@angular/core';
import {AuthService} from "@services/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDialog} from '@angular/material/dialog';
import {Category} from '@models/category';
import {AppService} from '@services/app.service';
import {DomHandlerService} from '@services/dom-handler.service';
import {Settings, SettingsService} from '@services/settings.service';
import {CategoryDialogComponent} from './category-dialog/category-dialog.component';
import {ConfirmDialogComponent} from '@shared-components/confirm-dialog/confirm-dialog.component';
import {MatCardModule} from '@angular/material/card';
import {FlexLayoutModule} from '@ngbracket/ngx-layout';
import {MatIconModule} from '@angular/material/icon';
import {PipesModule} from '../../../theme/pipes/pipes.module';
import {NgxPaginationModule} from 'ngx-pagination';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {CategorieService} from "@services/categories.service";

@Component({
  selector: 'app-categories',
  imports: [
    FlexLayoutModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    PipesModule,
    NgxPaginationModule
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit {
  public categories: any[] = [];
  public totalItems = 0;  // Default to 10 if undefined
  // public categories: Category[] = [];
  public page: any;
  public count = 6;
  domHandlerService = inject(DomHandlerService);
  public settings: Settings;

  constructor(
    public authService: AuthService,
    public snackBar: MatSnackBar, public appService: AppService, public categorieService: CategorieService, public dialog: MatDialog, public settingsService: SettingsService) {
    this.settings = this.settingsService.settings;
  }

  ngOnInit(): void {
    this.getCategories();
  }

  public getCategories() {
    this.categorieService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.totalItems = data.length;
        // this.count = this.categories.length
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
            localStorage.removeItem('token');
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
        category: data,
      }
    }
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      data: newData,
      panelClass: ['theme-dialog'],
      autoFocus: false,
      direction: (this.settings.rtl) ? 'rtl' : 'ltr'
    });
    dialogRef.afterClosed().subscribe(category => {
      if (category) {
        const index: number = this.categories.findIndex(x => x.id == category.id);
        if (index !== -1) {
          this.categories[index] = category;
        } else {
          let last_category = this.categories[this.categories.length - 1];
          category.id = last_category.id + 1;
          this.categories.push(category);
        }
      }
      this.getCategories();
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
        this.categorieService.deleteCategorie(category.id).subscribe({
          next: (data) => {
            const index: number = this.categories.indexOf(category);
            if (index !== -1) {
              this.categories.splice(index, 1);
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
