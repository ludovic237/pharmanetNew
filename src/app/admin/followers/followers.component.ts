import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { DomHandlerService } from '@services/dom-handler.service';
import { ConfirmDialogComponent } from '@shared-components/confirm-dialog/confirm-dialog.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { PipesModule } from '../../theme/pipes/pipes.module';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-followers',
    imports: [
        FlexLayoutModule,
        MatCardModule,
        MatDividerModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        NgxPaginationModule,
        PipesModule
    ],
    templateUrl: './followers.component.html'
})
export class FollowersComponent {
  public followers = [
    { id: 1, image: 'images/profile/michael.jpg', name: 'Michael Blair', storeId: 1 },
    { id: 2, image: 'images/profile/tereza.jpg', name: 'Tereza Stiles', storeId: 2 },
    { id: 3, image: 'images/profile/adam.jpg', name: 'Adam Sandler', storeId: 1 },
    { id: 4, image: 'images/profile/julia.jpg', name: 'Julia Aniston', storeId: 2 },
    { id: 5, image: 'images/profile/bruno.jpg', name: 'Bruno Vespa', storeId: 2 },
    { id: 6, image: 'images/profile/ashley.jpg', name: 'Ashley Ahlberg', storeId: 1 },
    { id: 7, image: 'images/avatars/avatar-5.png', name: 'Michelle Ormond', storeId: 1 }
  ];
  public stores = [
    { id: 1, name: 'Store 1' },
    { id: 2, name: 'Store 2' }
  ];
  public page: any;
  public count = 6;
  domHandlerService = inject(DomHandlerService);

  constructor(public dialog: MatDialog) { }

  public onPageChanged(event: any) {
    this.page = event;
    this.domHandlerService.winScroll(0, 0);
  }

  public remove(follower: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: {
        title: "Confirm Action",
        message: "Are you sure you want remove this follower?"
      }
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        const index: number = this.followers.indexOf(follower);
        if (index !== -1) {
          this.followers.splice(index, 1);
        }
      }
    });
  }

}
