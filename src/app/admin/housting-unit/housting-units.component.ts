import {Component, OnInit, inject, ViewChild, AfterViewInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {AppService} from '@services/app.service';
import {DomHandlerService} from '@services/dom-handler.service';
import {Settings, SettingsService} from '@services/settings.service';
import {customers} from '../../common/data/customers';
import {HoustingUnitDialogComponent} from './housting-unit-dialog/housting-unit-dialog.component';
import {ConfirmDialogComponent} from '@shared-components/confirm-dialog/confirm-dialog.component';
import {MatCardModule} from '@angular/material/card';
import {FlexLayoutModule} from '@ngbracket/ngx-layout';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {NgxPaginationModule} from 'ngx-pagination';
import {MatDividerModule} from '@angular/material/divider';
import {PipesModule} from '../../theme/pipes/pipes.module';
import {MatTooltipModule} from '@angular/material/tooltip';
import {RentDialogComponent} from "../rent/rent-dialog/rent-dialog.component";
import {CommonModule} from "@angular/common";
import {HoustingUnit} from "../../model/data";
import {HoustingUnitService} from "@services/housting-unit.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {HoustingDetailDialogComponent} from "./housting-detail-dialog/housting-detail-dialog.component";
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {MatSort, MatSortModule} from "@angular/material/sort";
import {MatFormFieldModule, MatLabel} from "@angular/material/form-field";
import {MatSelectModule} from "@angular/material/select";
import {MatOptionModule} from "@angular/material/core";
import {FormsModule} from "@angular/forms";
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";
import {Router} from "@angular/router";

@Component({
  selector: 'app-housting-units',
  imports: [
    MatPaginatorModule,
    CommonModule,
    FlexLayoutModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatTooltipModule,
    NgxPaginationModule,
    FormsModule,
    MatTableModule, // Add this
    MatSortModule,  // Add this
    MatSelectModule, // Add this
    MatFormFieldModule, // Add this for form fields
    MatOptionModule, // Add this for mat-option
    PipesModule
  ],
  templateUrl: './housting-units.component.html'
})
export class HoustingUnitsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  public housingUnits: any[] = [];
  public selectedhousingUnit: HoustingUnit | null = null;

  // public page: number = 1;
  // public count: number = 5;
  public countries: any[] = [];
  public page: any;
  public count = 6;
  domHandlerService = inject(DomHandlerService);
  public settings: Settings;

  public filteredHousingUnits = new MatTableDataSource<any>();
  public tenantList: string[] = [];
  public housingUnitTypes: string[] = [];
  public filters = {
    occupancyStatus: '',
    tenant: '',
    type: ''
  };
  public displayedColumns: string[] = [
    'housingUnitNumber',
    'remainingAmount',
    'amountPaid',
    'leaseDates',
    'housingUnitType',
    'tenants',
    'status',
    'actions'
  ];

  constructor(
    public housingUnitService: HoustingUnitService,
    public router: Router,
    public snackBar: MatSnackBar,
    public appService: AppService,
    public dialog: MatDialog,
    public settingsService: SettingsService) {
    this.settings = this.settingsService.settings;
  }



  public length: number = 0;

  ngOnInit(): void {
    this.housingUnits = [];
    this.gethousingUnits()
  }

  public onPageChanged(event: any) {
    this.page = event;
    this.domHandlerService.winScroll(0, 0);
  }

  public remove(customer: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: {
        title: "Confirm Action",
        message: "Are you sure you want remove this customer?"
      }
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        // const index: number = this.customers.indexOf(customer);
        // if (index !== -1) {
        //   this.customers.splice(index, 1);
        // }
      }
    });
  }


  public openHoustingUnitDialog(data: any): void {
    const dialogRef = this.dialog.open(HoustingUnitDialogComponent, {
      data: {
        customer: data,
      },
      panelClass: ['theme-dialog'],
      autoFocus: false,
      direction: (this.settings.rtl) ? 'rtl' : 'ltr'
    });

    dialogRef.afterClosed().subscribe(housingUnit => {
      if (housingUnit) {
        this.housingUnitService.createhousingUnit(housingUnit).subscribe({
          next: (response) => {
            this.gethousingUnits()
            console.log('Housing unit created successfully:', response);
            this.snackBar.open('Housing unit created successfully!', '×', {
              panelClass: 'success',
              verticalPosition: 'top',
              duration: 3000
            });
          },
          error: (err) => {
            console.error('Error creating housing unit:', err);
            this.snackBar.open('Failed to create housing unit.', '×', {
              panelClass: 'error',
              verticalPosition: 'top',
              duration: 3000
            });
            if (err.status=="403"){
              this.router.navigate(['/sign-in']); // Redirect to login if not authenticated
            }
          }
        });
      }
    });
  }



  public openHoustingUnitInfoDialog(data: any): void {
    const dialogRef = this.dialog.open(HoustingDetailDialogComponent, {
      data: {
        customer: data,
      },
      panelClass: ['theme-dialog'],
      autoFocus: false,
      direction: (this.settings.rtl) ? 'rtl' : 'ltr'
    });

    dialogRef.afterClosed().subscribe(housingUnit => {
      if (housingUnit) {
        this.housingUnitService.createhousingUnit(housingUnit).subscribe({
          next: (response) => {
            console.log('Housing unit created successfully:', response);
            this.snackBar.open('Housing unit created successfully!', '×', {
              panelClass: 'success',
              verticalPosition: 'top',
              duration: 3000
            });
          },
          error: (err) => {
            console.error('Error creating housing unit:', err);
            this.snackBar.open('Failed to create housing unit.', '×', {
              panelClass: 'error',
              verticalPosition: 'top',
              duration: 3000
            });
            if (err.status=="403"){
              this.router.navigate(['/sign-in']); // Redirect to login if not authenticated
            }
          }
        });
      }
    });
  }

  public removeHoustingUnit(tenant: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: {
        title: 'Confirm Action',
        message: 'Are you sure you want to remove this tenant?'
      }
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        const index: number = this.housingUnits.indexOf(tenant);
        if (index !== -1) {
          this.housingUnits.splice(index, 1); // Suppression du locataire
        }
      }
    });
  }

  public gethousingUnits() {

    this.housingUnitService.gethousingUnitsOccupationDetails().subscribe(data => {
      console.log('Occupation details:', data);
    });
    this.housingUnitService.gethousingUnitsOccupationDetails().subscribe({
      next: (data) => {
        this.housingUnits = data;
        this.count = this.housingUnits.length;
        console.log('Get payment:', data);
        this.tenantList = [...new Set(this.housingUnits.map(unit => unit.tenantName).filter(name => name))];
        this.housingUnitTypes = [...new Set(this.housingUnits.map(unit => unit.housingUnitType))];

        this.length = this.housingUnits.length; // Set the total number of items
        this.filteredHousingUnits.data = this.housingUnits;
        this.filteredHousingUnits.sort = this.sort;
      },
      error: (err) => {
        console.error('Error  payment:', err);
        if (err.status=="403"){
          this.router.navigate(['/sign-in']); // Redirect to login if not authenticated
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.filteredHousingUnits.sort = this.sort; // Connect MatSort
    this.filteredHousingUnits.paginator = this.paginator; // Connect MatPaginator
  }


  applyFilters(): void {
    this.filteredHousingUnits.data = this.housingUnits.filter(unit => {
      const matchesOccupancy = this.filters.occupancyStatus === '' ||
        (this.filters.occupancyStatus === 'occupied' && unit.tenantId) ||
        (this.filters.occupancyStatus === 'vacant' && !unit.tenantId);

      const matchesTenant = this.filters.tenant === '' || unit.tenantName === this.filters.tenant;

      const matchesType = this.filters.type === '' || unit.housingUnitType === this.filters.type;

      return matchesOccupancy && matchesTenant && matchesType;
    });
  }

  public openHoustingUnitDialogUpdate(housingUnitId: number,tenantId: number): void {
    this.housingUnitService
      .getTenantDetailsByHousingUnit(housingUnitId,tenantId)
      .subscribe(data => {
      const dialogRef = this.dialog.open(HoustingDetailDialogComponent, {
        data: data,
        panelClass: ['theme-dialog'],
        autoFocus: false,
        direction: (this.settings.rtl) ? 'rtl' : 'ltr',
        width: '80%',
        height: '90%'
      });

      dialogRef.afterClosed().subscribe(housingUnit => {
        this.gethousingUnits()
      });
    });
  }


}
