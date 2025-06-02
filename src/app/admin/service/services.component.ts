import {Component, OnInit, inject, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {AppService} from '@services/app.service';
import {DomHandlerService} from '@services/dom-handler.service';
import {Settings, SettingsService} from '@services/settings.service';
import {customers} from '../../common/data/customers';
import {ServiceDialogComponent} from './service-dialog/service-dialog.component';
import {ConfirmDialogComponent} from '@shared-components/confirm-dialog/confirm-dialog.component';
import {MatCardModule} from '@angular/material/card';
import {FlexLayoutModule} from '@ngbracket/ngx-layout';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {NgxPaginationModule} from 'ngx-pagination';
import {MatDividerModule} from '@angular/material/divider';
import {PipesModule} from '../../theme/pipes/pipes.module';
import {MatTooltipModule} from '@angular/material/tooltip';
import {CommonModule} from "@angular/common";
import {Service} from "../../model/data";
import {ServiceService} from "@services/service.service";
import {Router} from "@angular/router";
import {MatBadgeModule} from "@angular/material/badge";
import {MatSort, MatSortModule, Sort} from "@angular/material/sort";

@Component({
  selector: 'app-services',
  imports: [
    MatSortModule,
    CommonModule,
    FlexLayoutModule,
    MatCardModule,
    MatBadgeModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatTooltipModule,
    NgxPaginationModule,
    PipesModule
  ],
  templateUrl: './services.component.html'
})
export class ServicesComponent implements OnInit {
  @ViewChild(MatSort) sort!: MatSort;
  public sortedServices: any[] = [];

  public settings: Settings;
  public services: any[] = [];
  public locataires: any[] = [
    {id: 1, name: 'John Doe'},
    {id: 2, name: 'Jane Smith'}
  ];
  public page: number = 1;
  public count: number = 5;

  constructor(
    private router: Router,
    public settingsService: SettingsService,
    private serviceService: ServiceService,
    public dialog: MatDialog
  ) {
    this.settings = this.settingsService.settings;
  }

  ngOnInit(): void {
    this.loadServices();
  }

  private loadServices(): void {
    this.serviceService.getServices().subscribe({
      next: (data: Service[]) => {
        this.count = data.length;
        this.services = data;
        this.sortedServices = [...this.services]; // Initial sort
      },
      error: (err) => {
        console.error('Error fetching services:', err);
        if (err.status == "403") {
          this.router.navigate(['/sign-in']); // Redirect to login if not authenticated
        }
      }
    });
  }

  public openServiceDialog(data: any): void {
    const dialogRef = this.dialog.open(ServiceDialogComponent, {
      data: data,
      panelClass: ['theme-dialog'],
      autoFocus: false,
      direction: (this.settings.rtl) ? 'rtl' : 'ltr',
      width: '80%',
    });

    dialogRef.afterClosed().subscribe((service: any) => {
      this.loadServices();
      // if (service) {
      //   const index = this.services.findIndex(s => s.id === service.id);
      //   if (index !== -1) {
      //     this.services[index] = service; // Update existing service
      //   } else {
      //     service.id = this.services.length + 1; // Assign new ID
      //     this.services.push(service); // Add new service
      //   }
      // }
    });
  }

  public removeService(service: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: {
        id: service.id,
        title: 'Confirm Action',
        message: 'Are you sure you want to remove this service?'
      }
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      this.loadServices();
      // if (dialogResult) {
      //   this.services = this.services.filter(s => s.id !== service.id);
      // }
    });
  }

  public onSortChange(sort: Sort): void {
    const {active, direction} = sort;
    if (!direction) {
      this.sortedServices = [...this.services];
      return;
    }
    this.sortedServices = [...this.services].sort((a, b) => {
      const isAsc = direction === 'asc';
      return this.compare(a[active], b[active], isAsc);
    });
  }

  private compare(a: any, b: any, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
}
