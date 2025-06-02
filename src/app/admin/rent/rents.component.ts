import { Component, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AppService } from '@services/app.service';
import { DomHandlerService } from '@services/dom-handler.service';
import { Settings, SettingsService } from '@services/settings.service';
import { customers } from '../../common/data/customers';
import { RentDialogComponent } from './rent-dialog/rent-dialog.component';
import { ConfirmDialogComponent } from '@shared-components/confirm-dialog/confirm-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatDividerModule } from '@angular/material/divider';
import { PipesModule } from '../../theme/pipes/pipes.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import {CommonModule} from "@angular/common";
import {Rent} from "../../model/data";
import {TenantService} from "@services/tenant.service";
import {RentService} from "@services/rent.service";

@Component({
    selector: 'app-rents',
    imports: [
      CommonModule,
        FlexLayoutModule,
        MatCardModule,
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatTooltipModule,
        NgxPaginationModule,
        PipesModule
    ],
    templateUrl: './rents.component.html'
})
export class RentsComponent implements OnInit {

  public rents: any[] = [];
  domHandlerService = inject(DomHandlerService);
  public locataires: any[] = [
    { id: 1, name: 'John Doe' }, // Matches tenantId: 1 in rents
    { id: 2, name: 'Jane Smith' }, // Matches tenantId: 2 in rents
    { id: 3, name: 'Alice Johnson' },
    { id: 4, name: 'Bob Brown' }
  ];
  public logements = [
    { id: 101, name: 'Apartment A' }, // Matches housingUnitId: 101 in rents
    { id: 102, name: 'Apartment B' }, // Matches housingUnitId: 102 in rents
    { id: 103, name: 'Apartment C' },
    { id: 104, name: 'Apartment D' }
  ];
  public page: number = 1;
  public count: number = 5;


  constructor(
    public tenantService: TenantService,
    public rentService: RentService,
    public appService: AppService,
              public dialog: MatDialog,
              public settingsService: SettingsService) {

  }

  ngOnInit(): void {
    // Mock data for rents
    this.getTenantData();
  }

  private getTenantData() {
    console.log("getTenantData");
    console.log(localStorage.getItem('token'))
    this.rentService.getRents().subscribe({
      next: (data) => {
        this.rents = data;
      },
      error: (err) => {
        console.error('Failed to load tenants:', err);
      }
    })
  }

  public onPageChanged(event: any) {
    this.page = event;
    this.domHandlerService.winScroll(0, 0);
  }

  public openRentDialog(data: Rent | null): void {
    const dialogRef = this.dialog.open(RentDialogComponent, {
      data: {
        rent: data,
        locataires: this.locataires,
        logements: this.logements
      },
      panelClass: ['theme-dialog'],
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe((rent: Rent) => {
      if (rent) {
        const index = this.rents.findIndex(r => r.id === rent.id);
        if (index !== -1) {
          this.rents[index] = rent; // Update existing rent
        } else {
          rent.id = this.rents.length + 1; // Assign new ID
          this.rents.push(rent); // Add new rent
        }
      }
    });
  }

  public removeRent(rent: Rent): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: {
        title: 'Confirm Action',
        message: 'Are you sure you want to remove this rent?'
      }
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.rents = this.rents.filter(r => r.id !== rent.id);
      }
    });
  }

  getTenantName(tenantId: number): string {
    const tenant = this.locataires.find(l => l.id === tenantId);
    return tenant ? tenant.name : 'Unknown';
  }

  gethousingUnitName(housingUnitId: number): string {
    const logement = this.logements.find(l => l.id === housingUnitId);
    return logement ? logement.name : 'Unknown';
  }
}
