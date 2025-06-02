import { Component, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AppService } from '@services/app.service';
import { DomHandlerService } from '@services/dom-handler.service';
import { Settings, SettingsService } from '@services/settings.service';
import { customers } from '../../common/data/customers';
import { CustomerDialogComponent } from './customer-dialog/customer-dialog.component';
import { ConfirmDialogComponent } from '@shared-components/confirm-dialog/confirm-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatDividerModule } from '@angular/material/divider';
import { PipesModule } from '../../theme/pipes/pipes.module';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-customers',
    imports: [
        FlexLayoutModule,
        MatCardModule,
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatTooltipModule,
        NgxPaginationModule,
        PipesModule
    ],
    templateUrl: './customers.component.html'
})
export class CustomersComponent implements OnInit {
  public customers: any[] = [];
  public stores = [
    { id: 1, name: 'Store 1' },
    { id: 2, name: 'Store 2' }
  ]
  public countries: any[] = [];
  public page: any;
  public count = 6;
  domHandlerService = inject(DomHandlerService);
  public settings: Settings;

  constructor(public appService: AppService, public dialog: MatDialog, public settingsService: SettingsService) {
    this.settings = this.settingsService.settings;
  }

  ngOnInit(): void {
    this.countries = this.appService.getCountries();
    this.customers = customers;
  }

  public onPageChanged(event: any) {
    this.page = event;
    this.domHandlerService.winScroll(0, 0);
  }

  public openCustomerDialog(data: any) {
    const dialogRef = this.dialog.open(CustomerDialogComponent, {
      data: {
        customer: data,
        stores: this.stores,
        countries: this.countries
      },
      panelClass: ['theme-dialog'],
      autoFocus: false,
      direction: (this.settings.rtl) ? 'rtl' : 'ltr'
    });
    dialogRef.afterClosed().subscribe(customer => {
      if (customer) {
        const index: number = this.customers.findIndex(x => x.id == customer.id);
        if (index !== -1) {
          this.customers[index] = customer;
        }
        else {
          let last_customer = this.customers[this.customers.length - 1];
          customer.id = last_customer.id + 1;
          this.customers.push(customer);
        }
      }
    });
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
        const index: number = this.customers.indexOf(customer);
        if (index !== -1) {
          this.customers.splice(index, 1);
        }
      }
    });
  }

}
