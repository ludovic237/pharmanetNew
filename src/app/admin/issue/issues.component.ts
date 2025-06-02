import { Component, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AppService } from '@services/app.service';
import { DomHandlerService } from '@services/dom-handler.service';
import { Settings, SettingsService } from '@services/settings.service';
import { customers } from '../../common/data/customers';
import { IssueDialogComponent } from './issue-dialog/issue-dialog.component';
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
import {Issue} from "../../model/data";

@Component({
    selector: 'app-issues',
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
    templateUrl: './issues.component.html'
})
export class IssuesComponent implements OnInit {

  public issues: any[] = [];
  public locataires: any[] = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' }
  ];
  public page: number = 1;
  public count: number = 5;

  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {
    // Mock data for issues
    this.issues = [
      {
        id: 1,
        tenantId: 1,
        titre: 'Water Leak',
        description: 'There is a water leak in the kitchen.',
        dateDeclaration: '2023-10-01',
        status: 'ouvert'
      },
      {
        id: 2,
        tenantId: 2,
        titre: 'Broken Heater',
        description: 'The heater is not working.',
        dateDeclaration: '2023-10-05',
        status: 'en cours'
      }
    ];
  }

  public openIssueDialog(data: any): void {
    const dialogRef = this.dialog.open(IssueDialogComponent, {
      data: {
        issue: data,
        locataires: this.locataires
      },
      panelClass: ['theme-dialog'],
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe((issue: any) => {
      if (issue) {
        const index = this.issues.findIndex(i => i.id === issue.id);
        if (index !== -1) {
          this.issues[index] = issue; // Update existing issue
        } else {
          issue.id = this.issues.length + 1; // Assign new ID
          this.issues.push(issue); // Add new issue
        }
      }
    });
  }

  public removeIssue(issue: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: {
        title: 'Confirm Action',
        message: 'Are you sure you want to remove this incident?'
      }
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.issues = this.issues.filter(i => i.id !== issue.id);
      }
    });
  }

  getTenantName(tenantId: number): string {
    const tenant = this.locataires.find(l => l.id === tenantId);
    return tenant ? tenant.name : 'Unknown';
  }
}
