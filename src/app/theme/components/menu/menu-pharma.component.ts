import {Component, OnInit} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatDividerModule} from '@angular/material/divider';
import {MatChipsModule} from '@angular/material/chips';
import {RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {DomHandlerService} from '@services/dom-handler.service';
import {MatCardModule} from '@angular/material/card';
import {FlexLayoutModule} from '@ngbracket/ngx-layout';
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-menu-pharma',
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    MatToolbarModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule,
    MatChipsModule,
    TranslateModule
  ],
  templateUrl: './menu-pharma.component.html'
})
export class MenuPharmaComponent implements OnInit {

  hasToken: boolean = false;

   constructor(private domHandlerService: DomHandlerService) {
  }

  ngOnInit(): void {
    console.log('MenuPharmaComponent initialized');
    console.log(localStorage.getItem('token'))
    this.hasToken = !!localStorage.getItem('token');
  }

  openMegaMenu() {
    let pane = this.domHandlerService.winDocument.getElementsByClassName('cdk-overlay-pane');
    [].forEach.call(pane, function (el: any) {
      if (el.children.length > 0) {
        if (el.children[0].classList.contains('mega-menu')) {
          el.classList.add('mega-menu-pane');
        }
      }
    });
  }

}
