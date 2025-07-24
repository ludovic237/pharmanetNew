import { Component, inject, OnInit } from '@angular/core';
import {AuthService} from "@services/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { DomHandlerService } from '@services/dom-handler.service';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
    selector: 'app-ventes',
    imports: [
        MatCardModule,
        MatDividerModule,
        FlexLayoutModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        NgxPaginationModule
    ],
    templateUrl: './ventes.component.html'
})
export class VentesComponent {
  ventes:any[] = [

  ]
  page: any;
  count = 6;
  domHandlerService = inject(DomHandlerService);

  public onPageChanged(event: any) {
    this.page = event;
    this.domHandlerService.winScroll(0, 0);
  }

}
