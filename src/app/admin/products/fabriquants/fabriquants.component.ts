import { Component, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Category } from '@models/category';
import { AppService } from '@services/app.service';
import { DomHandlerService } from '@services/dom-handler.service';
import { Settings, SettingsService } from '@services/settings.service';
import { FabriquantDialogComponent } from './fabriquant-dialog/fabriquant-dialog.component';
import { ConfirmDialogComponent } from '@shared-components/confirm-dialog/confirm-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { MatIconModule } from '@angular/material/icon';
import { PipesModule } from '../../../theme/pipes/pipes.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import {FabriquantService} from "@services/fabriquants.service";
import {Fabriquant} from "@models/product";

@Component({
    selector: 'app-fabriquants',
    imports: [
        FlexLayoutModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
        PipesModule,
        NgxPaginationModule
    ],
    templateUrl: './fabriquants.component.html',
    styleUrl: './fabriquants.component.scss'
})
export class FabriquantsComponent implements OnInit {
  public fabriquants: any[] = [];
  // public fabriquants: Fabriquant[] = [];
  public page: any;
  public totalItems = 0;
  public count = 6;
  domHandlerService = inject(DomHandlerService);
  public settings: Settings;
  constructor(public appService: AppService,
              public fabriquantService: FabriquantService, public dialog: MatDialog, public settingsService: SettingsService) {
    this.settings = this.settingsService.settings;
  }

  ngOnInit(): void {
    this.getFabriquants();
  }

  public getFabriquants() {
    this.fabriquantService.getFabriquants().subscribe({
      next: (data) => {
        this.fabriquants = data;
        // this.count = this.fabriquants.length;
        this.totalItems = data.length;
      },
      error: (err) => {
        console.error('Error  subscription:', err);
        if (err.status == "403") {
          // this.router.navigate(['/sign-in']); // Redirect to login if not authenticated
        }
      }
    });
  }

  public onPageChanged(event: any) {
    this.page = event;
    this.domHandlerService.winScroll(0, 0);
  }

  public openCategoryDialog(data: any) {
    const dialogRef = this.dialog.open(FabriquantDialogComponent, {
      data: {
        category: data,
        fabriquants: this.fabriquants
      },
      panelClass: ['theme-dialog'],
      autoFocus: false,
      direction: (this.settings.rtl) ? 'rtl' : 'ltr'
    });
    dialogRef.afterClosed().subscribe(category => {
      if (category) {
        const index: number = this.fabriquants.findIndex(x => x.id == category.id);
        if (index !== -1) {
          this.fabriquants[index] = category;
        }
        else {
          let last_category = this.fabriquants[this.fabriquants.length - 1];
          category.id = last_category.id + 1;
          this.fabriquants.push(category);
        }
      }
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
        const index: number = this.fabriquants.indexOf(category);
        if (index !== -1) {
          this.fabriquants.splice(index, 1);
        }
      }
    });
  }

}
