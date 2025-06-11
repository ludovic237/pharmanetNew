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
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-rayons',
  imports: [
    CommonModule,
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
  public rayons: Rayon[] = [];
  // public rayons: any[] = [];
  public page: any;
  public count = 6;
  domHandlerService = inject(DomHandlerService);
  public settings: Settings;

  constructor(
    public appService: AppService,
    public rayonService: RayonService,
    public dialog: MatDialog, public settingsService: SettingsService) {
    this.settings = this.settingsService.settings;
  }

  ngOnInit(): void {
    this.getRayons();
  }

  public getRayons() {
    this.rayonService.getRayons().subscribe({
      next: (data) => {
        this.rayons = data;
        this.count = this.rayons.length
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
        const index: number = this.rayons.indexOf(rayon);
        if (index !== -1) {
          this.rayons.splice(index, 1);
        }
      }
    });
  }

}
