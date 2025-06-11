import { Component, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Category } from '@models/category';
import { AppService } from '@services/app.service';
import { DomHandlerService } from '@services/dom-handler.service';
import { Settings, SettingsService } from '@services/settings.service';
import { CommandeDialogComponent } from './commande-dialog/commande-dialog.component';
import { ConfirmDialogComponent } from '@shared-components/confirm-dialog/confirm-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { MatIconModule } from '@angular/material/icon';
import { PipesModule } from '../../../theme/pipes/pipes.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import {CommandesService} from "@services/commandes.service";
// import {Commande} from "@models/product";

@Component({
    selector: 'app-commandes',
    imports: [
        FlexLayoutModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
        PipesModule,
        NgxPaginationModule
    ],
    templateUrl: './commandes.component.html',
    styleUrl: './commandes.component.scss'
})
export class CommandesComponent implements OnInit {
  public commandes: any[] = [];
  // public commandes: Commande[] = [];
  public page: any;
  public count = 6;
  domHandlerService = inject(DomHandlerService);
  public settings: Settings;
  constructor(public appService: AppService,
              public commandeService: CommandesService, public dialog: MatDialog, public settingsService: SettingsService) {
    this.settings = this.settingsService.settings;
  }

  ngOnInit(): void {
    this.getCommandes();
  }

  public getCommandes() {
    // this.commandeService.getCommandes().subscribe({
    //   next: (data) => {
    //     this.commandes = data;
    //     this.count = this.commandes.length
    //   },
    //   error: (err) => {
    //     console.error('Error  subscription:', err);
    //     if (err.status == "403") {
    //       // this.router.navigate(['/sign-in']); // Redirect to login if not authenticated
    //     }
    //   }
    // });
  }

  public onPageChanged(event: any) {
    this.page = event;
    this.domHandlerService.winScroll(0, 0);
  }

  public openCategoryDialog(data: any) {
    const dialogRef = this.dialog.open(CommandeDialogComponent, {
      data: {
        category: data,
        commandes: this.commandes
      },
      panelClass: ['theme-dialog'],
      autoFocus: false,
      direction: (this.settings.rtl) ? 'rtl' : 'ltr'
    });
    dialogRef.afterClosed().subscribe(category => {
      if (category) {
        const index: number = this.commandes.findIndex(x => x.id == category.id);
        if (index !== -1) {
          this.commandes[index] = category;
        }
        else {
          let last_category = this.commandes[this.commandes.length - 1];
          category.id = last_category.id + 1;
          this.commandes.push(category);
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
        const index: number = this.commandes.indexOf(category);
        if (index !== -1) {
          this.commandes.splice(index, 1);
        }
      }
    });
  }

}
